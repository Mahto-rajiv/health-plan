// Picks the gram amount of every meal item for every phase, and
// writes lib/data/plan-quantities.generated.ts. Run: npm run solve
//
// A mixed-integer linear programme solved with HiGHS (npm `highs`, MIT; a
// dev-only dependency, not shipped to the browser). Inputs are all in the repo:
// meals and their allowed ranges (lib/data/meal-plans.ts), fruit and vegetables
// (lib/data/produce.ts), food composition (lib/data/composition.generated.ts),
// reference intakes (lib/data/nutrients.ts), phases, budget and variety rules
// (lib/config.ts), and default prices (lib/data/prices.ts).
//
// Round 3 (owner): (a) hard limits, then (b) nutrient adequacy, then (c) the
// lowest cost; and dairy must not carry the diet. Hard limits are constraints; the
// rest is one objective whose weights are exchange rates in ₹ a month (per plan):
//   • each 1% of an EAR still short       = ₹1,000  (more than any plan costs, so cost
//                                                    can never trade an EAR away)
//   • each 1% of a ★ RDA/AI still short   = ₹300    (★ = planned to the RDA: iron, zinc,
//                                                    riboflavin, folate, B12, A, E, selenium)
//   • each 1% of another RDA/AI short     = ₹30
//   • each 1 g/day of milk + curd         = ₹10     (owner: dairy must not carry the diet)
//   • each ₹1 of food                     = ₹1
//
// HARD rules (every plan × day):
//   • kcal and protein inside the phase band; fibre ≤ the phase cap; fat 25–30% of kcal.
//   • Phase 0: soya chunks ≤ 20 g and sattu ≤ 25 g a day; later phases soya ≤ 50 g.
//   • Upper limits (iron, zinc, calcium, phosphorus, copper, selenium, manganese, vitamin C).
//   • Variety: no food > 25% of the week's energy; eggs ≤ 21 a week; every item
//     inside its range; milk + curd ≤ 1,100 g a day (backstop).
//   • The three plans' kcal and protein on the same day within 5% of each other.
//   • Items marked `rising` (Meal 1 oats and milk) are never less than in the phase before.
//   • Monthly cost ≤ CAP (default BUDGET.planningMax) at default prices.
// A hard dairy cap was tried first: Phases 0–1 are infeasible below ~1,100 g/day in the
// vegetarian plan, because the calories then have to come from atta, rice and pulses,
// which break the 35/40 g fibre caps. So dairy is priced instead.
//
// Env: CAP=₹ (cost ceiling), DAIRY_G / DAIRY_SHARE (exploration overrides), TL=seconds per phase (default 300), GAP (default 0.005),
// NOWRITE=1 (don't write the quantities file), OFF=group,... (debugging).
// Any EAR still missed is reported here and in the app; nothing is hidden.
import { writeFileSync } from 'node:fs';
import highsLoader from 'highs';
import { MEAL_PLAN_DEFINITIONS, DAYS, itemKey, gramsFor, mealsForDay, type Meal, type PlanItem, type MealPlanDefinition, type PlanId } from '../lib/data/meal-plans';
import { SLOTS } from '../lib/data/produce';
import { FOODS, type FoodId } from '../lib/data/foods';
import { NUTRIENTS, type NutrientInfo } from '../lib/data/nutrients';
import type { NutrientKey } from '../lib/data/nutrient-keys';
import { BUDGET, DAILY, PHASES, PHASE_IDS, ATWATER, PLAN_RULES, type PhaseId } from '../lib/config';
import { DEFAULT_PRICE_TABLE } from '../lib/data/prices';
import { PANTRY_MONTHLY } from '../lib/data/nutrition-guide';

const OFF = new Set((process.env.OFF ?? '').split(',').filter(Boolean));
const MARGIN = 0.004; // stay 0.4% inside the kcal/protein bands so rounding can't push a day out
const SPREAD = 0.024; // all plans within ±2.4% of a shared centre ⇒ max/min ≤ 1.05
const UPPER: Partial<Record<NutrientKey, number>> = Object.fromEntries(NUTRIENTS.filter((n) => n.ul).map((n) => [n.key, n.ul!]));
/** Planned toward. Biotin is left out: 7 foods have no biotin value, so its total is unreliable (shown in the app). */
export const TARGETS = NUTRIENTS.filter((n) => !n.infoOnly && n.key !== 'biotin');
export const W_EAR = 1000;
export const W_RDA_STAR = 300;
export const W_RDA = 30;
/** Exchange rates (₹/month per plan): 1% of an EAR short = ₹1,000; 1% of a ★ RDA/AI = ₹300;
 *  1% of another RDA/AI = ₹30; 1 g/day of milk + curd = ₹10. Shortfall units are 1000/EAR,
 *  300/RDA and 30/RDA per unit (10, 3 and 0.3 per 1%), hence the ×100. */
const W_ADEQUACY = 100;
const W_DAIRY = 10 / 7; // dairyObj sums 7 days, so 1 g/day = 7 units
const DAIRY: FoodId[] = ['milk', 'curd', 'paneer'];
// Exploration only (e.g. to find how low dairy can go): DAIRY_G=…, DAIRY_SHARE=…
const MILK_CURD_MAX = Number(process.env.DAIRY_G ?? PLAN_RULES.milkCurdMaxG);
const DAIRY_SHARE = Number(process.env.DAIRY_SHARE ?? 1);

type Coefs = Map<string, number>;
const add = (e: Coefs, v: string, c: number) => c && e.set(v, (e.get(v) ?? 0) + c);
const fmt = (n: number) => (Math.abs(n) < 1e-12 ? '0' : Number(n.toPrecision(10)).toString());
const expr = (e: Coefs) => {
  const parts = [...e].filter(([, c]) => Math.abs(c) > 1e-12).map(([v, c]) => `${c < 0 ? '-' : '+'} ${fmt(Math.abs(c))} ${v}`);
  return parts.length ? parts.join(' ') : '0 dummy';
};

const meals = new Map<string, Meal>();
for (const p of MEAL_PLAN_DEFINITIONS) for (const d of DAYS) for (const m of mealsForDay(p, d)) meals.set(m.id, m);

const foodKcal = (f: FoodId) => {
  const n = FOODS[f].per100;
  return ((n.protein ?? 0) * ATWATER.protein + (n.carbs ?? 0) * ATWATER.carbs + (n.fat ?? 0) * ATWATER.fat + (n.fiber ?? 0) * ATWATER.fiber) / 100;
};

/** Per gram of an item: nutrient amounts and ₹ (bought weight). Slots count their main foods, not the alternatives. */
function perGram(it: PlanItem): { n: Record<NutrientKey, number>; kcal: number; cost: number; foods: [FoodId, number][] } {
  const foods: [FoodId, number][] = it.slot ? SLOTS[it.slot].foods.map((f) => [f.food, f.share]) : [[it.food!, 1]];
  const n = {} as Record<NutrientKey, number>;
  let cost = 0;
  for (const [food, share] of foods) {
    const f = FOODS[food];
    for (const [k, v] of Object.entries(f.per100)) n[k as NutrientKey] = (n[k as NutrientKey] ?? 0) + ((v ?? 0) * share) / 100;
    cost += (DEFAULT_PRICE_TABLE[food] * share) / 1000 / f.edible;
  }
  const kcal = n.protein * ATWATER.protein + n.carbs * ATWATER.carbs + n.fat * ATWATER.fat + n.fiber * ATWATER.fiber;
  return { n, kcal, cost, foods };
}

interface Var {
  name: string;
  meal: Meal;
  item: PlanItem;
  key: string;
  step: number;
  lo: number;
  hi: number;
  anchor: number;
}

function stepOf(it: PlanItem): number {
  if (it.step) return it.step;
  if (it.slot) return SLOTS[it.slot].foods.length > 1 ? 20 : 10;
  const g = typeof it.g === 'number' ? it.g : Math.max(...it.g);
  return g < 20 ? 1 : 5;
}

export const isRdaTarget = (t: NutrientInfo) => !!t.rdaTarget;
/** The RDA-level target: the RDA, or the AI where there is no RDA. */
const upperTarget = (t: NutrientInfo) => t.rda;

/** Result of one phase: grams per item, and per plan the cost and weekly averages. */
export interface PhaseResult {
  grams: Map<string, number>;
  status: string;
  plans: { plan: PlanId; monthlyCost: number; weekly: Partial<Record<NutrientKey, number>> }[];
}

async function solvePhase(highs: Awaited<ReturnType<typeof highsLoader>>, ph: PhaseId, cap: number, prev?: Map<string, number>): Promise<PhaseResult> {
  const P = PHASES[ph];
  const vars: Var[] = [];
  const varOf = new Map<string, Var>();
  let i = 0;
  for (const m of meals.values()) {
    for (const it of m.items) {
      const key = itemKey(it);
      const anchors = [0, 1, 2].map((p) => gramsFor(it.g, p as PhaseId));
      const [rLo, rHi] = it.range ?? [Math.round(0.6 * Math.min(...anchors)), Math.round(1.4 * Math.max(...anchors))];
      const step = stepOf(it);
      const lo = it.rising && prev?.has(`${m.id}|${key}`) ? Math.max(rLo, prev.get(`${m.id}|${key}`)!) : rLo;
      const v: Var = { name: `x${i++}`, meal: m, item: it, key, step, lo, hi: rHi, anchor: anchors[ph] };
      vars.push(v);
      varOf.set(`${m.id}|${key}`, v);
    }
  }

  const cons: string[] = [];
  const free: string[] = [];
  let c = 0;
  const con = (e: Coefs, op: '>=' | '<=' | '=', rhs: number) => cons.push(` c${c++}: ${expr(e)} ${op} ${fmt(rhs)}`);
  const adequacy: Coefs = new Map();
  const costObj: Coefs = new Map();
  const tidy: Coefs = new Map();
  const dairyObj: Coefs = new Map(); // milk + curd grams, all plans and days
  const weeklyExprs: { plan: PlanId; cost: Coefs; weekly: Partial<Record<NutrientKey, Coefs>> }[] = [];

  type DayExpr = { kcal: Coefs; n: Record<NutrientKey, Coefs>; cost: Coefs; grams: Map<FoodId, Coefs> };
  const dayExpr = (p: MealPlanDefinition, d: (typeof DAYS)[number]): DayExpr => {
    const out: DayExpr = { kcal: new Map(), n: {} as Record<NutrientKey, Coefs>, cost: new Map(), grams: new Map() };
    for (const m of mealsForDay(p, d)) {
      for (const it of m.items) {
        const v = varOf.get(`${m.id}|${itemKey(it)}`)!;
        const pg = perGram(it);
        const k = v.step;
        add(out.kcal, v.name, pg.kcal * k);
        add(out.cost, v.name, pg.cost * k);
        for (const [key, val] of Object.entries(pg.n)) add((out.n[key as NutrientKey] ??= new Map()), v.name, val * k);
        for (const [food, share] of pg.foods) add(out.grams.get(food) ?? (out.grams.set(food, new Map()), out.grams.get(food)!), v.name, share * k);
      }
    }
    return out;
  };
  const sum = (...es: (Coefs | undefined)[]) => {
    const out: Coefs = new Map();
    for (const e of es) for (const [v, k] of e ?? []) add(out, v, k);
    return out;
  };
  const scale = (e: Coefs, f: number) => new Map([...e].map(([v, k]) => [v, k * f]));

  {
    const plansDays = MEAL_PLAN_DEFINITIONS.map((p) => DAYS.map((d) => dayExpr(p, d)));
    if (!OFF.has('spread'))
      DAYS.forEach((d, di) => {
        for (const what of ['kcal', 'protein'] as const) {
          const centre = `m_${what}_${di}`;
          free.push(centre);
          for (const pd of plansDays) {
            const e = new Map(what === 'kcal' ? pd[di].kcal : pd[di].n.protein);
            con(new Map([...e, [centre, -(1 + SPREAD)]]), '<=', 0);
            con(new Map([...e, [centre, -(1 - SPREAD)]]), '>=', 0);
          }
        }
      });
    MEAL_PLAN_DEFINITIONS.forEach((p, pi) => {
      const days = plansDays[pi];
      const weekCost: Coefs = new Map();
      const weekKcal: Coefs = new Map();
      const weekFood = new Map<FoodId, Coefs>();
      const weekly: Partial<Record<NutrientKey, Coefs>> = {};
      for (const day of days) {
        if (!OFF.has('kcal')) con(day.kcal, '>=', P.kcal[0] * (1 + MARGIN));
        if (!OFF.has('kcal')) con(day.kcal, '<=', P.kcal[1] * (1 - MARGIN));
        if (!OFF.has('protein')) con(day.n.protein, '>=', P.protein[0] * (1 + MARGIN));
        if (!OFF.has('protein')) con(day.n.protein, '<=', P.protein[1] * (1 - MARGIN));
        if (!OFF.has('fibre')) con(day.n.fiber, '<=', P.fibreMax - 0.3);
        // fat within DAILY.fatEnergy of kcal: 9·fat − share·kcal within bounds
        const fatLo = sum(scale(day.n.fat, 9), scale(day.kcal, -(DAILY.fatEnergy[0] + 0.003)));
        const fatHi = sum(scale(day.n.fat, 9), scale(day.kcal, -(DAILY.fatEnergy[1] - 0.003)));
        if (!OFF.has('fat')) con(fatLo, '>=', 0);
        if (!OFF.has('fat')) con(fatHi, '<=', 0);
        // saturated fat < 10% of kcal (Round 5)
        if (!OFF.has('sfa')) con(sum(scale(day.n.sfa, 9), scale(day.kcal, -(DAILY.satFatEnergyMax - 0.003))), '<=', 0);
        if (!OFF.has('caps')) for (const [food, capG] of Object.entries(P.caps)) if (day.grams.get(food as FoodId)) con(day.grams.get(food as FoodId)!, '<=', capG!);
        if (!OFF.has('caps') && ph > 0 && day.grams.get('soyaChunks')) con(day.grams.get('soyaChunks')!, '<=', PLAN_RULES.soyaMaxG);
        if (!OFF.has('ul')) for (const [key, ul] of Object.entries(UPPER)) con(day.n[key as NutrientKey], '<=', ul!);
        if (!OFF.has('dairy')) {
          const milkCurd = sum(day.grams.get('milk'), day.grams.get('curd'));
          if (milkCurd.size && (!process.env.DAIRY_PLAN || process.env.DAIRY_PLAN === p.id)) con(milkCurd, '<=', MILK_CURD_MAX);
          for (const [v, k] of milkCurd) add(dairyObj, v, k);
          // Optional (exploration): dairy protein ≤ share × day protein.
          if (DAIRY_SHARE < 1) {
            const dairyProt: Coefs = new Map();
            for (const f of DAIRY) for (const [v, k] of day.grams.get(f) ?? []) add(dairyProt, v, (k * (FOODS[f].per100.protein ?? 0)) / 100);
            if (dairyProt.size) con(sum(dairyProt, scale(day.n.protein, -DAIRY_SHARE)), '<=', 0);
          }
        }
        for (const [v, k] of day.cost) add(weekCost, v, k);
        for (const [v, k] of day.kcal) add(weekKcal, v, k);
        for (const [f, e] of day.grams) for (const [v, k] of e) add(weekFood.get(f) ?? (weekFood.set(f, new Map()), weekFood.get(f)!), v, k * foodKcal(f));
        for (const t of TARGETS) for (const [v, k] of day.n[t.key]) add((weekly[t.key] ??= new Map()), v, k / 7);
      }
      // Variety: no food > 25% of the week's energy.
      if (!OFF.has('variety')) for (const [, e] of weekFood) con(sum(e, scale(weekKcal, -PLAN_RULES.foodEnergyShareMax)), '<=', 0);
      const monthly = scale(weekCost, 30 / 7);
      if (!OFF.has('cost')) con(monthly, '<=', cap - PANTRY_MONTHLY);
      const eggs = sum(...days.map((d) => d.grams.get('egg')));
      if (eggs.size && !OFF.has('eggs')) con(eggs, '<=', PLAN_RULES.eggsPerWeek * 50);
      for (const [v, k] of monthly) add(costObj, v, k);
      weeklyExprs.push({ plan: p.id, cost: monthly, weekly });
      // Shortfalls (relative): below the EAR, and below the RDA/AI.
      for (const t of TARGETS) {
        const avg = weekly[t.key]!;
        if (t.ear) {
          const sv = `se_${t.key}_${p.id}`;
          con(new Map([...avg, [sv, 1]]), '>=', t.ear);
          add(adequacy, sv, W_EAR / t.ear);
        }
        const top = upperTarget(t);
        if (top) {
          const sv = `sr_${t.key}_${p.id}`;
          con(new Map([...avg, [sv, 1]]), '>=', top);
          add(adequacy, sv, (isRdaTarget(t) ? W_RDA_STAR : W_RDA) / top);
        }
      }
    });
  }

  // Tie-breaker: stay near the starting amounts (|grams − anchor| / anchor), tiny weight.
  for (const v of vars) {
    const dp = `dp_${v.name}`, dn = `dn_${v.name}`;
    con(new Map([[v.name, v.step], [dp, -1], [dn, 1]]), '=', v.anchor);
    const w = 1 / Math.max(v.anchor, 10);
    add(tidy, dp, w);
    add(tidy, dn, w);
  }

  const bounds = vars.map((v) => ` ${Math.ceil(v.lo / v.step - 1e-9)} <= ${v.name} <= ${Math.floor(v.hi / v.step + 1e-9)}`);
  const lpFor = (obj: Coefs, extra: string[]) =>
    ['Minimize', ` obj: ${expr(obj)}`, 'Subject To', ...cons, ...extra, 'Bounds', ...bounds, ...free.map((f) => ` ${f} free`), 'General', ...vars.map((v) => ` ${v.name}`), 'End'].join('\n');
  const opts = { time_limit: Number(process.env.TL ?? 300), mip_rel_gap: Number(process.env.GAP ?? 0.005), presolve: 'on' as const };
  // A time-limited run counts only if it found a feasible solution (finite objective).
  const ok = (r: { Status: string; ObjectiveValue: number }) => (r.Status === 'Optimal' || r.Status === 'Time limit reached') && Number.isFinite(r.ObjectiveValue);

  // One run, priorities set by explicit exchange rates (see the header). Two-stage
  // versions (adequacy, then "keep it and minimise dairy/cost") were tried first: with a
  // time limit, the second run often found no feasible point at all, because highs-js
  // can't be given a starting solution. A single weighted run is as easy to solve as the
  // adequacy run alone.
  const t0 = Date.now();
  const r = highs.solve(lpFor(sum(scale(adequacy, W_ADEQUACY), scale(dairyObj, W_DAIRY), costObj, scale(tidy, 2)), []), opts);
  if (!ok(r)) throw new Error(`Phase ${ph}, cap ₹${cap}: ${r.Status}`);
  const use = r;
  const days = MEAL_PLAN_DEFINITIONS.length * DAYS.length;
  const value = (name: string) => (use.Columns as Record<string, { Primal: number }>)[name]?.Primal ?? 0;
  const grams = new Map<string, number>();
  for (const v of vars) grams.set(`${v.meal.id}|${v.key}`, Math.round(value(v.name)) * v.step);
  const evalE = (e: Coefs) => [...e].reduce((t, [v, k]) => t + k * Math.round(value(v)), 0);
  const plans = weeklyExprs.map((w) => ({
    plan: w.plan,
    monthlyCost: evalE(w.cost) + PANTRY_MONTHLY,
    weekly: Object.fromEntries(Object.entries(w.weekly).map(([k, e]) => [k, evalE(e!)])) as Partial<Record<NutrientKey, number>>,
  }));
  const total = plans.reduce((t, p) => t + p.monthlyCost, 0);
  console.log(
    `Phase ${ph}: ${r.Status} in ${((Date.now() - t0) / 1000).toFixed(0)} s; shortfall score ${evalE(adequacy).toFixed(1)}, milk + curd ${Math.round(evalE(dairyObj) / days)} g/day, average ₹${Math.round(total / plans.length)}/month`,
  );
  return { grams, status: r.Status, plans };
}

export async function solveAll(cap: number): Promise<{ results: Record<PhaseId, PhaseResult>; quantities: Record<string, Record<string, number[]>> }> {
  const highs = await highsLoader();
  const quantities: Record<string, Record<string, number[]>> = {};
  const results = {} as Record<PhaseId, PhaseResult>;
  const only = process.env.PHASE ? [Number(process.env.PHASE) as PhaseId] : PHASE_IDS;
  for (const ph of only) {
    const r = await solvePhase(highs, ph, cap, results[(ph - 1) as PhaseId]?.grams);
    results[ph] = r;
    for (const [k, g] of r.grams) {
      const [mealId, key] = k.split('|');
      const q = ((quantities[mealId] ??= {})[key] ??= [0, 0, 0]);
      q[ph] = g;
    }
  }
  return { results, quantities };
}

/** Weekly-average shortfalls below the EAR and the RDA/AI for one solved plan. */
export function shortfalls(weekly: Partial<Record<NutrientKey, number>>) {
  return TARGETS.map((t) => ({
    key: t.key,
    label: t.label,
    unit: t.unit,
    rdaTarget: isRdaTarget(t),
    value: weekly[t.key] ?? 0,
    belowEar: !!t.ear && (weekly[t.key] ?? 0) < t.ear - 1e-9,
    belowTop: !!t.rda && (weekly[t.key] ?? 0) < t.rda - 1e-9,
  }));
}

async function main() {
  const cap = Number(process.env.CAP ?? BUDGET.planningMax);
  console.log(`Cost ceiling ₹${cap}/month at default prices.`);
  const { results, quantities } = await solveAll(cap);
  for (const ph of PHASE_IDS.filter((x) => results[x]))
    for (const p of results[ph].plans) {
      const s = shortfalls(p.weekly);
      const ear = s.filter((x) => x.belowEar).map((x) => x.label);
      const top = s.filter((x) => x.belowTop && !x.belowEar).map((x) => x.label);
      console.log(`  P${ph} ${p.plan.padEnd(10)} ₹${Math.round(p.monthlyCost)}  below EAR: ${ear.join(', ') || '—'} · below RDA/AI: ${top.join(', ') || '—'}`);
    }
  if (process.env.NOWRITE || process.env.PHASE) return;
  const header = `// GENERATED by scripts/solve-plans.ts — do not edit by hand. Run \`npm run solve\`.
// Grams per meal item: [phase 0, 1, 2].
// Cost ceiling at solve time: ₹${cap}/month at default prices.
`;
  writeFileSync('lib/data/plan-quantities.generated.ts', `${header}export const QUANTITIES: Record<string, Record<string, number[]>> = ${JSON.stringify(quantities, null, 2)};\n`);
  console.log(`Wrote lib/data/plan-quantities.generated.ts (${Object.keys(quantities).length} meals).`);
}

if (process.argv[1]?.endsWith('solve-plans.ts')) main();
