// Picks the gram amount of every meal item for every phase and season, and
// writes lib/data/plan-quantities.generated.ts. Run: npm run solve
//
// It is a mixed-integer linear programme solved with HiGHS (npm `highs`, MIT;
// a dev-only dependency, not shipped to the browser). Inputs are all in the
// repo: meals and their allowed ranges (lib/data/meal-plans.ts), seasons
// (lib/data/seasons.ts), food composition (lib/data/composition.generated.ts),
// reference intakes (lib/data/nutrients.ts), phases and budget (lib/config.ts),
// and default prices (lib/data/prices.ts).
//
// HARD rules (every plan × season × day):
//   • kcal and protein inside the phase band; fibre ≤ the phase cap; fat 25–30% of kcal.
//   • Phase 0: soya chunks ≤ 20 g and sattu ≤ 25 g a day.
//   • The three plans' kcal and protein on the same day within 5% of each other.
//   • Upper limits (iron, zinc, calcium, phosphorus, copper, selenium, manganese).
//   • Monthly cost ≤ BUDGET.planningMax at default prices; eggs ≤ 21 a week.
//   • Items that aren't seasonal have the same amount in every season.
// GOAL (minimised, in this priority):
//   1. weekly-average shortfall below the EAR, for every nutrient with an EAR;
//   2. shortfall below the RDA (or adequate intake);
//   3. change from the starting amounts written in the meal data (so portions stay familiar).
// Cost is not in the goal: the budget is a ceiling only (owner, Round 2).
//
// Any EAR still missed is reported here and in the app; nothing is hidden.
import { writeFileSync } from 'node:fs';
import highsLoader from 'highs';
import { MEAL_PLAN_DEFINITIONS, DAYS, itemKey, gramsFor, mealsForDay, type Meal, type PlanItem, type MealPlanDefinition } from '../lib/data/meal-plans';
import { SEASONS, SEASON_IDS, type SeasonId } from '../lib/data/seasons';
import { FOODS, type FoodId } from '../lib/data/foods';
import { NUTRIENTS } from '../lib/data/nutrients';
import type { NutrientKey } from '../lib/data/nutrient-keys';
import { BUDGET, DAILY, PHASES, PHASE_IDS, ATWATER, type PhaseId } from '../lib/config';
import { DEFAULT_PRICE_TABLE } from '../lib/data/prices';
import { PANTRY_MONTHLY } from '../lib/data/nutrition-guide';

// Debugging: OFF=spread,fat,... switches hard-rule groups off to find a conflict.
const OFF = new Set((process.env.OFF ?? '').split(',').filter(Boolean));
const MARGIN = 0.004; // stay 0.4% inside the kcal/protein bands so rounding can't push a day out
const SPREAD = 0.024; // all plans within ±2.4% of a shared centre ⇒ max/min ≤ 1.05
const EGGS_PER_WEEK = 21;
const UPPER: Partial<Record<NutrientKey, number>> = Object.fromEntries(NUTRIENTS.filter((n) => n.ul).map((n) => [n.key, n.ul!]));
// Optimised toward (not counted when the source table has gaps for common foods).
const TARGETS = NUTRIENTS.filter((n) => !n.infoOnly && n.key !== 'biotin');

type Coefs = Map<string, number>;
const add = (e: Coefs, v: string, c: number) => c && e.set(v, (e.get(v) ?? 0) + c);
const fmt = (n: number) => (Math.abs(n) < 1e-12 ? '0' : Number(n.toPrecision(10)).toString());
const expr = (e: Coefs) => {
  const parts = [...e].filter(([, c]) => Math.abs(c) > 1e-12).map(([v, c]) => `${c < 0 ? '-' : '+'} ${fmt(Math.abs(c))} ${v}`);
  return parts.length ? parts.join(' ') : '0 dummy';
};

// Unique meals across all plans.
const meals = new Map<string, Meal>();
for (const p of MEAL_PLAN_DEFINITIONS) for (const d of DAYS) for (const m of mealsForDay(p, d)) meals.set(m.id, m);

/** Per gram of an item in a season: nutrient amounts and ₹ (bought weight). */
function perGram(it: PlanItem, season: SeasonId): { n: Record<NutrientKey, number>; kcal: number; cost: number; foods: [FoodId, number][] } {
  const foods: [FoodId, number][] = it.slot ? SEASONS[season].slots[it.slot].foods : [[it.food!, 1]];
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
  seasons: SeasonId[]; // one entry = shared across all seasons
  step: number;
  lo: number;
  hi: number;
  anchor: number;
}

function stepOf(it: PlanItem): number {
  if (it.step) return it.step;
  if (it.slot) return SEASONS.winter.slots[it.slot].foods.length > 1 || it.slot === 'salad' ? 20 : 10;
  const g = typeof it.g === 'number' ? it.g : Math.max(...it.g);
  return g < 20 ? 1 : 5;
}

async function solvePhase(highs: Awaited<ReturnType<typeof highsLoader>>, ph: PhaseId, floor: Map<string, number>) {
  const P = PHASES[ph];
  const vars: Var[] = [];
  const varOf = new Map<string, Var>(); // `${mealId}|${key}|${season}`
  let i = 0;
  for (const m of meals.values()) {
    for (const it of m.items) {
      const key = itemKey(it);
      const anchors = [0, 1, 2].map((p) => gramsFor(it.g, p as PhaseId));
      const [rLo, rHi] = it.range ?? [Math.round(0.6 * Math.min(...anchors)), Math.round(1.4 * Math.max(...anchors))];
      const step = stepOf(it);
      const groups: SeasonId[][] = it.slot ? SEASON_IDS.map((s) => [s]) : [SEASON_IDS];
      for (const g of groups) {
        const prev = floor.get(`${m.id}|${key}|${g[0]}`) ?? 0;
        const v: Var = { name: `x${i++}`, meal: m, item: it, key, seasons: g, step, lo: Math.max(rLo, prev), hi: Math.max(rHi, prev), anchor: anchors[ph] };
        vars.push(v);
        for (const s of g) varOf.set(`${m.id}|${key}|${s}`, v);
      }
    }
  }

  const cons: string[] = [];
  const obj: Coefs = new Map();
  const extraBounds: string[] = [];
  const free: string[] = [];
  let c = 0;
  const con = (e: Coefs, op: '>=' | '<=' | '=', rhs: number) => cons.push(` c${c++}: ${expr(e)} ${op} ${fmt(rhs)}`);

  // Day expressions per plan × season × day.
  type DayExpr = { kcal: Coefs; n: Record<NutrientKey, Coefs>; cost: Coefs; grams: Map<FoodId, Coefs> };
  const dayExpr = (p: MealPlanDefinition, s: SeasonId, d: (typeof DAYS)[number]): DayExpr => {
    const out: DayExpr = { kcal: new Map(), n: {} as Record<NutrientKey, Coefs>, cost: new Map(), grams: new Map() };
    for (const m of mealsForDay(p, d)) {
      for (const it of m.items) {
        const v = varOf.get(`${m.id}|${itemKey(it)}|${s}`)!;
        const pg = perGram(it, s);
        const k = v.step; // grams per unit of the integer variable
        add(out.kcal, v.name, pg.kcal * k);
        add(out.cost, v.name, pg.cost * k);
        for (const [key, val] of Object.entries(pg.n)) add((out.n[key as NutrientKey] ??= new Map()), v.name, val * k);
        for (const [food, share] of pg.foods) add(out.grams.get(food) ?? (out.grams.set(food, new Map()), out.grams.get(food)!), v.name, share * k);
      }
    }
    return out;
  };

  for (const s of SEASON_IDS.filter((x) => !process.env.ONLY || process.env.ONLY === x)) {
    const plansDays = MEAL_PLAN_DEFINITIONS.map((p) => DAYS.map((d) => dayExpr(p, s, d)));
    // Cross-plan spread, per day.
    if (!OFF.has('spread')) DAYS.forEach((d, di) => {
      for (const what of ['kcal', 'protein'] as const) {
        const centre = `m_${what}_${s}_${di}`;
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
      const weekEggs: Coefs = new Map();
      const weekly: Partial<Record<NutrientKey, Coefs>> = {};
      for (const day of days) {
        if (!OFF.has('kcal')) con(day.kcal, '>=', P.kcal[0] * (1 + MARGIN));
        if (!OFF.has('kcal')) con(day.kcal, '<=', P.kcal[1] * (1 - MARGIN));
        if (!OFF.has('protein')) con(day.n.protein, '>=', P.protein[0] * (1 + MARGIN));
        if (!OFF.has('protein')) con(day.n.protein, '<=', P.protein[1] * (1 - MARGIN));
        if (!OFF.has('fibre')) con(day.n.fiber, '<=', P.fibreMax - 0.3);
        // fat 25–30% of kcal: 9·fat − share·kcal within bounds
        const fatMinusLo: Coefs = new Map(), fatMinusHi: Coefs = new Map();
        for (const [v, k] of day.n.fat) {
          add(fatMinusLo, v, 9 * k);
          add(fatMinusHi, v, 9 * k);
        }
        for (const [v, k] of day.kcal) {
          add(fatMinusLo, v, -(DAILY.fatEnergy[0] + 0.003) * k);
          add(fatMinusHi, v, -(DAILY.fatEnergy[1] - 0.003) * k);
        }
        if (!OFF.has('fat')) con(fatMinusLo, '>=', 0);
        if (!OFF.has('fat')) con(fatMinusHi, '<=', 0);
        if (!OFF.has('caps')) for (const [food, cap] of Object.entries(P.caps)) if (day.grams.get(food as FoodId)) con(day.grams.get(food as FoodId)!, '<=', cap!);
        if (!OFF.has('ul')) for (const [key, ul] of Object.entries(UPPER)) con(day.n[key as NutrientKey], '<=', ul!);
        for (const [v, k] of day.cost) add(weekCost, v, k);
        for (const [v, k] of day.grams.get('egg') ?? []) add(weekEggs, v, k);
        for (const t of TARGETS) for (const [v, k] of day.n[t.key]) add((weekly[t.key] ??= new Map()), v, k / 7);
      }
      // Monthly cost = weekly × 30/7 + pantry.
      if (!OFF.has('cost')) con(new Map([...weekCost].map(([v, k]) => [v, (k * 30) / 7])), '<=', BUDGET.planningMax - PANTRY_MONTHLY);
      if (weekEggs.size && !OFF.has('eggs')) con(weekEggs, '<=', EGGS_PER_WEEK * 50);
      // Shortfalls below the EAR (heavy) and RDA/AI (light), relative to the reference.
      for (const t of TARGETS) {
        const avg = weekly[t.key]!;
        if (t.ear) {
          const sv = `se_${t.key}_${p.id}_${s}`;
          con(new Map([...avg, [sv, 1]]), '>=', t.ear);
          add(obj, sv, 1000 / t.ear);
        }
        if (t.rda) {
          const sv = `sr_${t.key}_${p.id}_${s}`;
          con(new Map([...avg, [sv, 1]]), '>=', t.rda);
          add(obj, sv, (t.adequateIntake ? 10 : 30) / t.rda);
        }
      }
    });
  }

  // Stay near the starting amounts: |grams − anchor| via two non-negative parts.
  for (const v of vars) {
    const dp = `dp_${v.name}`, dn = `dn_${v.name}`;
    con(new Map([[v.name, v.step], [dp, -1], [dn, 1]]), '=', v.anchor);
    const w = (1 / Math.max(v.anchor, 10)) * (v.seasons.length === 1 ? 0.25 : 1);
    add(obj, dp, w);
    add(obj, dn, w);
  }

  const bounds = vars.map((v) => ` ${Math.ceil(v.lo / v.step - 1e-9)} <= ${v.name} <= ${Math.floor(v.hi / v.step + 1e-9)}`);
  for (const f of free) extraBounds.push(` ${f} free`);
  const lp = ['Minimize', ` obj: ${expr(obj)}`, 'Subject To', ...cons, 'Bounds', ...bounds, ...extraBounds, 'General', ...vars.map((v) => ` ${v.name}`), 'End'].join('\n');

  const t0 = Date.now();
  const res = highs.solve(lp, { time_limit: Number(process.env.TL ?? 900), mip_rel_gap: Number(process.env.GAP ?? 0.02), presolve: 'on' });
  console.log(`  solved in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  if (res.Status !== 'Optimal' && !(res.Status === 'Time limit reached' && Object.keys(res.Columns).length)) {
    throw new Error(`Phase ${ph}: ${res.Status}`);
  }
  const value = (name: string) => (res.Columns as Record<string, { Primal: number }>)[name]?.Primal ?? 0;
  const out = new Map<string, number>();
  for (const v of vars) for (const s of v.seasons) out.set(`${v.meal.id}|${v.key}|${s}`, Math.round(value(v.name)) * v.step);
  const short: string[] = [];
  for (const [name] of Object.entries(res.Columns)) if (name.startsWith('se_') && value(name) > 1e-6) short.push(`${name.slice(3)} short ${value(name).toFixed(2)}`);
  console.log(`Phase ${ph}: ${res.Status}, objective ${res.ObjectiveValue.toFixed(2)}; ${vars.length} amounts, ${cons.length} constraints.`);
  if (short.length) console.log(`  EAR not reached (weekly average): ${short.join('; ')}`);
  return out;
}

async function main() {
  const highs = await highsLoader();
  const result: Record<string, Record<string, number[][]>> = {};
  const floor = new Map<string, number>(); // phases are solved independently; the starting amounts keep them in step
  for (const ph of PHASE_IDS) {
    const sol = await solvePhase(highs, ph, floor);
    for (const [k, g] of sol) {
      const [mealId, key, season] = k.split('|');
      const q = ((result[mealId] ??= {})[key] ??= [0, 1, 2].map(() => [0, 0, 0, 0]));
      q[ph][SEASON_IDS.indexOf(season as SeasonId)] = g;
    }
  }
  const header = `// GENERATED by scripts/solve-plans.ts — do not edit by hand. Run \`npm run solve\`.
// Grams per meal item: [phase 0, 1, 2] × [winter, summer, monsoon, autumn].
`;
  writeFileSync('lib/data/plan-quantities.generated.ts', `${header}export const QUANTITIES: Record<string, Record<string, number[][]>> = ${JSON.stringify(result, null, 2)};\n`);
  console.log(`Wrote lib/data/plan-quantities.generated.ts (${Object.keys(result).length} meals).`);
}

main();
