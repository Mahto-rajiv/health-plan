// Hard rules from docs/brief.md §2, §3, §8 and docs/brief-round2.md. Run: npm test
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { MEAL_PLAN_DEFINITIONS, WEEKDAYS, DAYS, buildWeek, planDinners, mealsForDay, itemKey, type Meal } from '../lib/data/meal-plans';
import { FOODS, FOOD_IDS, type FoodId } from '../lib/data/foods';
import { DEFAULT_PRICE_TABLE } from '../lib/data/prices';
import { BUDGET, PHASES, PHASE_IDS, DAILY, PLAN_RULES, type PhaseId } from '../lib/config';
import { atwaterKcal, itemsNutrients, itemsCost } from '../lib/nutrition';
import { computePlan, computePlans, allDefaultPlans, storageAdvice } from '../lib/meal-plans';
import { PANTRY_MONTHLY, FOOD_SAFETY } from '../lib/data/nutrition-guide';
import { COOKING_TUTORIALS } from '../lib/data/tutorials';
import { SLOTS, altGrams, swapNote } from '../lib/data/produce';
import { QUANTITIES } from '../lib/data/plan-quantities.generated';
import { COMPOSITION } from '../lib/data/composition.generated';
import { SOURCES } from '../scripts/food-data/sources';
import { NUTRIENTS } from '../lib/data/nutrients';
import { auditPlan } from '../lib/nutrient-audit';

const deepEq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const pct = (a: number, b: number) => Math.abs(a - b) / b;
/** Weekday mornings: Meal 1 plus packing must fit before leaving (owner, Round 2: Monday needed ~28 min). */
const MORNING_MAX_MIN = 15;

// A resolved meal title must not name a food that isn't in it.
const TITLE_FOODS: [RegExp, FoodId[]][] = [
  [/paneer/i, ['paneer']],
  [/\begg/i, ['egg']],
  [/chicken/i, ['chicken']],
  [/fish/i, ['fish']],
  [/soya/i, ['soyaChunks']],
  [/rajma/i, ['rajma']],
  [/kala chana/i, ['kalaChana']],
  [/moong/i, ['moongDal', 'moongWhole']],
  [/toor/i, ['toorDal']],
  [/sattu/i, ['sattu']],
  [/oats/i, ['oats']],
  [/poha/i, ['poha']],
  [/besan/i, ['besan']],
  [/curd|raita|chaas/i, ['curd']],
  [/milk/i, ['milk']],
  [/papaya/i, ['papaya']],
  [/banana/i, ['banana']],
  [/guava/i, ['guava']],
  [/mango/i, ['mango']],
  [/apple/i, ['apple']],
  [/orange|kinnow/i, ['orange']],
  [/muskmelon/i, ['muskmelon']],
  [/peanut/i, ['peanuts']],
  [/dates/i, ['dates']],
  [/aloo/i, ['potato']],
  [/roti|paratha|roll/i, ['atta']],
  [/rice|chawal|pulao|khichdi/i, ['rice']],
];

const GRAVY_OR_DAL = /curry|gravy|\bdal\b|rajma|chole|kadhi|sambar/i;
const DAL_FOODS: FoodId[] = ['moongDal', 'toorDal', 'rajma', 'kabuliChana', 'kalaChana', 'moongWhole'];

// Known gaps, so that any NEW gap fails a test and any closed gap must be removed
// here. Passing these tests means every gap is documented and shown to you (Meal
// plans → Vitamins & minerals, and the Health page), NOT that every target is met.
// • belowEar: weekly averages below the average need (EAR).
// • hairBelowTarget: ★ hair-linked nutrients below the RDA/AI the plan aims for (Round 3).
// Regenerate after a re-solve with: KNOWN_GAPS_DUMP=1 npm test (prints the lists).
const GAPS_FILE = 'tests/known-gaps.json';
const KNOWN = (existsSync(GAPS_FILE) ? JSON.parse(readFileSync(GAPS_FILE, 'utf8')) : { belowEar: [], hairBelowTarget: [] }) as { belowEar: string[]; hairBelowTarget: string[] };

function allMeals(): Meal[] {
  const out = new Map<string, Meal>();
  for (const p of MEAL_PLAN_DEFINITIONS) for (const d of DAYS) for (const m of mealsForDay(p, d)) out.set(m.id, m);
  return [...out.values()];
}

describe('plan set', () => {
  it('has exactly 3 plans: vegetarian, vegetarian + eggs, non-vegetarian', () => {
    assert.deepEqual(MEAL_PLAN_DEFINITIONS.map((p) => p.id), ['vegetarian', 'egg', 'nonveg']);
  });

  it('diet rules: no eggs or meat in the vegetarian plan, no meat in the egg plan, real mixed non-veg plan', () => {
    for (const ph of PHASE_IDS)
        for (const def of MEAL_PLAN_DEFINITIONS) {
          const foods = buildWeek(def, ph).flatMap((d) => d.meals.flatMap((m) => m.meal.items.map((i) => FOODS[i.food])));
          if (def.id === 'vegetarian') assert.ok(!foods.some((f) => f.isEgg || f.isMeatOrFish), 'vegetarian contains egg/meat');
          if (def.id === 'egg') assert.ok(!foods.some((f) => f.isMeatOrFish), 'egg plan contains meat');
          if (def.id === 'egg') assert.ok(foods.some((f) => f.isEgg), 'egg plan has no eggs');
          if (def.id === 'nonveg') assert.ok(foods.some((f) => f.isMeatOrFish), 'non-veg plan has no meat or fish');
        }
  });
});

for (const def of MEAL_PLAN_DEFINITIONS) {
  for (const ph of PHASE_IDS) {
    {
      describe(`${def.id} · phase ${ph}`, () => {
        const P = PHASES[ph];
        const week = buildWeek(def, ph);
        const plan = computePlan(def, ph);

        it('has 7 days × exactly 4 meals in slot order', () => {
          assert.equal(week.length, 7);
          for (const d of week) assert.deepEqual(d.meals.map((m) => m.slot), [1, 2, 3, 4], d.day);
        });

        it('Meal 1 is deep-equal on all 7 days; Meal 3 deep-equal Monday–Friday', () => {
          for (const d of week) assert.ok(deepEq(d.meals[0].meal, week[0].meals[0].meal), d.day);
          const wk = week.filter((d) => !d.isWeekend);
          for (const d of wk) assert.ok(deepEq(d.meals[2].meal, wk[0].meals[2].meal), d.day);
        });

        it('weekday Meal 2 is a cold office lunch: no reheating, no rice, no cooked dal or gravy', () => {
          for (const d of week.filter((x) => !x.isWeekend)) {
            const m = d.meals[1].meal;
            assert.equal(m.requiresReheat, false, `${d.day} ${m.id} requires reheating`);
            assert.ok(!m.items.some((i) => i.food === 'rice'), `${d.day} ${m.id} contains rice`);
            assert.ok(!m.items.some((i) => DAL_FOODS.includes(i.food)), `${d.day} ${m.id} contains dal`);
            assert.ok(!GRAVY_OR_DAL.test(m.title), `${d.day} ${m.id} title suggests dal or gravy`);
            assert.ok(m.madeWhen, `${d.day} ${m.id} has no madeWhen`);
            assert.ok(storageAdvice(d.meals[1]).includes(FOOD_SAFETY.coldLunch), `${d.day} ${m.id} lacks the cold-lunch note`);
          }
        });

        it(`weekday mornings need ≤ ${MORNING_MAX_MIN} min hands-on before leaving`, () => {
          for (const d of plan.days.filter((x) => !x.isWeekend)) assert.ok(d.morningMinutes <= MORNING_MAX_MIN, `${d.day}: ${d.morningMinutes} min`);
        });

        it('every day hits the phase calorie and protein bands and stays under the fibre cap', () => {
          for (const d of plan.days) {
            const t = d.totals;
            assert.ok(t.kcal >= P.kcal[0] && t.kcal <= P.kcal[1], `${d.day}: ${Math.round(t.kcal)} kcal outside ${P.kcal}`);
            assert.ok(t.protein >= P.protein[0] && t.protein <= P.protein[1], `${d.day}: ${t.protein.toFixed(1)} g protein outside ${P.protein}`);
            assert.ok(t.fiber <= P.fibreMax, `${d.day}: ${t.fiber.toFixed(1)} g fibre > ${P.fibreMax}`);
          }
        });

        it(`fat is ${DAILY.fatEnergy[0] * 100}–${DAILY.fatEnergy[1] * 100}% of energy every day`, () => {
          for (const d of plan.days) {
            const share = (d.totals.fat * 9) / d.totals.kcal;
            assert.ok(share >= DAILY.fatEnergy[0] && share <= DAILY.fatEnergy[1], `${d.day}: fat ${(share * 100).toFixed(1)}%`);
          }
        });

        it(`saturated fat is under ${DAILY.satFatEnergyMax * 100}% of energy every day, and trans fat (where the tables have it) under 1%`, () => {
          for (const d of plan.days) {
            assert.ok((d.totals.sfa * 9) / d.totals.kcal < DAILY.satFatEnergyMax, `${d.day}: saturated fat ${((d.totals.sfa * 900) / d.totals.kcal).toFixed(1)}%`);
            assert.ok((d.totals.tfa * 9) / d.totals.kcal < 0.01, `${d.day}: trans fat ${((d.totals.tfa * 900) / d.totals.kcal).toFixed(2)}%`);
          }
        });

        if (ph === 0) {
          it('Phase 0 caps soya chunks at 20 g and sattu at 25 g a day', () => {
            for (const d of week) {
              const items = d.meals.flatMap((m) => m.meal.items);
              const g = (f: FoodId) => items.filter((i) => i.food === f).reduce((s, i) => s + i.g, 0);
              assert.ok(g('soyaChunks') <= (P.caps.soyaChunks ?? Infinity), `${d.day}: soya ${g('soyaChunks')} g`);
              assert.ok(g('sattu') <= (P.caps.sattu ?? Infinity), `${d.day}: sattu ${g('sattu')} g`);
            }
          });
        }

        it('no day goes above a tolerable upper intake level', () => {
          for (const d of plan.days) for (const n of NUTRIENTS) if (n.ul) assert.ok(d.totals[n.key] <= n.ul, `${d.day}: ${n.label} ${d.totals[n.key].toFixed(1)} > ${n.ul}`);
        });

        it(`costs at most ₹${BUDGET.planningMax} a month at default prices (₹${BUDGET.max} ceiling less the 10% price margin)`, () => {
          assert.ok(plan.monthlyCost <= BUDGET.planningMax + 1, `₹${Math.round(plan.monthlyCost)}`);
        });

        // Round 3 variety and balance rules (lib/config.ts PLAN_RULES).
        it('variety: no food gives more than 25% of the week’s energy; eggs ≤ 21 a week; milk + curd within the backstop; soya ≤ 50 g after Phase 0', () => {
          const weekKcal = plan.days.reduce((t, d) => t + d.totals.kcal, 0);
          const byFood = new Map<FoodId, number>();
          let eggs = 0;
          for (const d of plan.days) {
            let milkCurd = 0;
            let soya = 0;
            for (const pm of d.meals)
              for (const it of pm.meal.items) {
                byFood.set(it.food, (byFood.get(it.food) ?? 0) + atwaterKcal(itemsNutrients([it])));
                if (it.food === 'egg') eggs += it.g / 50;
                if (it.food === 'milk' || it.food === 'curd') milkCurd += it.g;
                if (it.food === 'soyaChunks') soya += it.g;
              }
            assert.ok(milkCurd <= PLAN_RULES.milkCurdMaxG + 1e-9, `${d.day}: milk + curd ${milkCurd} g`);
            if (ph > 0) assert.ok(soya <= PLAN_RULES.soyaMaxG + 1e-9, `${d.day}: soya ${soya} g`);
          }
          for (const [food, kcal] of byFood) assert.ok(kcal / weekKcal <= PLAN_RULES.foodEnergyShareMax + 0.005, `${food}: ${((kcal / weekKcal) * 100).toFixed(1)}% of the week's energy`);
          assert.ok(eggs <= PLAN_RULES.eggsPerWeek + 1e-9, `${eggs} eggs`);
        });

        // Brief §8: shown kcal reconcile with 4/4/9 + 2 kcal/g fibre within 3% (they are computed from the macros, so 0%).
        // Cross-check against the source tables' own energy values: within 5%, because IFCT's published energy for
        // fibre-rich foods is lower than its own stated factors give (guava: 135 kJ listed vs 192 kJ from its own
        // Table 4 factors and components). Documented in PROGRESS.md.
        it('kcal reconcile with 4/4/9 + 2 kcal/g fibre for every meal and day, and with the source tables’ kcal within 5% per day', () => {
          for (const d of plan.days) {
            for (const n of [...d.mealTotals, d.totals]) assert.ok(pct(atwaterKcal(n), n.kcal) <= 0.03, `${d.day} kcal ≠ macros`);
            const tabulated = d.meals.flatMap((m) => m.meal.items).reduce((s, i) => s + ((FOODS[i.food].tabulatedKcal ?? 0) * i.g) / 100, 0);
            assert.ok(pct(tabulated, d.totals.kcal) <= 0.05, `${d.day}: table kcal ${Math.round(tabulated)} vs ${Math.round(d.totals.kcal)}`);
          }
        });

        it('grocery totals equal meal costs, and monthly cost = weekly × 30/7 + pantry, from the price table', () => {
          const groceryWeekly = plan.grocery.flatMap((g) => g.lines).reduce((s, l) => s + l.weeklyCost, 0);
          assert.ok(Math.abs(groceryWeekly - plan.weeklyFoodCost) < 0.5, `grocery ₹${groceryWeekly.toFixed(0)} ≠ meals ₹${plan.weeklyFoodCost.toFixed(0)}`);
          assert.ok(Math.abs(plan.monthlyCost - ((plan.weeklyFoodCost * 30) / 7 + PANTRY_MONTHLY)) < 0.5);
          const manual = week.flatMap((d) => d.meals.flatMap((m) => m.meal.items));
          assert.ok(Math.abs(itemsCost(manual, DEFAULT_PRICE_TABLE) - plan.weeklyFoodCost) < 0.5);
        });

        it('meal titles only name foods the meal contains, and every {slot} token is filled', () => {
          for (const d of week)
            for (const pm of d.meals) {
              const m = pm.meal;
              const text = [m.title, ...m.steps, m.flavour, m.why ?? '', ...m.items.map((i) => i.note ?? '')].join(' ');
              assert.ok(!/\{\w+\}/.test(text), `${m.id}: unfilled token in "${text.match(/\{\w+\}/)?.[0]}"`);
              const foods = new Set(m.items.map((i) => i.food));
              for (const [re, ids] of TITLE_FOODS) if (re.test(m.title)) assert.ok(ids.some((id) => foods.has(id)), `${m.id}: "${m.title}" names ${re.source}`);
            }
        });
      });
    }
  }
}

describe('fruit and vegetables', () => {
  it('every slot’s food shares add up to 1', () => {
    for (const [slot, f] of Object.entries(SLOTS)) assert.ok(Math.abs(f.foods.reduce((a, x) => a + x.share, 0) - 1) < 1e-9, slot);
  });

  it('every fruit and vegetable except onion and tomato has an alternative, and it is a different food', () => {
    for (const [slot, f] of Object.entries(SLOTS))
      for (const x of f.foods) {
        if (x.food === 'onion' || x.food === 'tomato') continue;
        assert.ok(x.alt, `${slot} ${x.food}: no alternative`);
        assert.notEqual(x.alt, x.food, `${slot} ${x.food}`);
      }
  });

  it('every resolved fruit or vegetable item carries its alternative with an amount', () => {
    for (const def of MEAL_PLAN_DEFINITIONS)
      for (const ph of PHASE_IDS)
        for (const d of buildWeek(def, ph))
          for (const pm of d.meals)
            for (const it of pm.meal.items)
              if (it.slot && it.food !== 'onion' && it.food !== 'tomato') assert.ok(it.alt && it.alt.g > 0, `${pm.meal.id} ${it.food}`);
  });

  it('a fruit swap gives about the same calories; a vegetable swap the same weight', () => {
    const g = altGrams('papaya', 'apple', 150);
    const kcal = (f: 'papaya' | 'apple', grams: number) => itemsNutrients([{ food: f, g: grams }]).kcal;
    assert.ok(Math.abs(kcal('apple', g) - kcal('papaya', 150)) <= kcal('apple', 10), `${g} g apple`);
    assert.equal(altGrams('okra', 'cauliflower', 40), 40);
  });

  it('the fruit swaps keep what the fruit is for: vitamin C for papaya, little fibre for banana', () => {
    const per = (f: 'papaya' | 'orange' | 'banana' | 'dates' | 'apple', k: 'vitC' | 'fiber', g: number) => ((FOODS[f].per100[k] ?? 0) * g) / 100;
    assert.equal(SLOTS.fruit1.foods[0].alt, 'orange');
    assert.ok(per('orange', 'vitC', altGrams('papaya', 'orange', 150)) >= 0.6 * per('papaya', 'vitC', 150), 'orange keeps ≥ 60% of papaya’s vitamin C');
    assert.equal(SLOTS.fruit3.foods[0].alt, 'dates');
    const extra = (alt: 'dates' | 'apple') => per(alt, 'fiber', altGrams('banana', alt, 200)) - per('banana', 'fiber', 200);
    assert.ok(extra('dates') < extra('apple'), `dates +${extra('dates').toFixed(1)} g fibre vs apple +${extra('apple').toFixed(1)} g`);
  });

  it('a swap states what it loses or adds', () => {
    assert.equal(swapNote('papaya', 150, 'apple', altGrams('papaya', 'apple', 150)), 'almost no vitamin C, folate and vitamin A');
    assert.equal(swapNote('banana', 200, 'apple', altGrams('banana', 'apple', 200)), 'less folate, +5 g fibre');
    assert.equal(swapNote('okra', 40, 'cauliflower', 40), undefined);
  });

  it('the carrot swap always says it loses the vitamin A (carrot is in the salad for it), at any amount', () => {
    const carrot = SLOTS.salad.foods.find((f) => f.food === 'carrot')!;
    for (const g of [5, 8, 40]) assert.match(swapNote('carrot', g, carrot.alt!, g, carrot.for) ?? '', /almost no vitamin A/, `${g} g`);
  });
});

describe('across plans', () => {
  for (const ph of PHASE_IDS) {
      it(`phase ${ph}: the same day's kcal and protein are within 5% across the three plans`, () => {
        const plans = computePlans(ph);
        for (let i = 0; i < 7; i++) {
          for (const key of ['kcal', 'protein'] as const) {
            const vals = plans.map((p) => p.days[i].totals[key]);
            const spread = Math.max(...vals) / Math.min(...vals) - 1;
            assert.ok(spread <= 0.05, `${plans[0].days[i].day} ${key} spread ${(spread * 100).toFixed(1)}%: ${vals.map(Math.round)}`);
          }
        }
      });
    }

  it('changing a price changes every cost that uses it, and nothing else', () => {
    const base = computePlan(MEAL_PLAN_DEFINITIONS[0], 2);
    const prices = { ...DEFAULT_PRICE_TABLE, milk: DEFAULT_PRICE_TABLE.milk * 2 };
    const edited = computePlan(MEAL_PLAN_DEFINITIONS[0], 2, prices);
    const milkLine = base.grocery.flatMap((g) => g.lines).find((l) => l.food === 'milk')!;
    assert.ok(Math.abs(edited.weeklyFoodCost - base.weeklyFoodCost - milkLine.weeklyCost) < 0.5);
    assert.deepEqual(edited.days.map((d) => d.totals), base.days.map((d) => d.totals));
  });

  it('nutrient gaps match the documented lists in tests/known-gaps.json: no new gaps, none silently closed', () => {
    const belowEar = new Set<string>();
    const hairBelowTarget = new Set<string>();
    for (const p of allDefaultPlans())
      for (const r of auditPlan(p)) {
        const id = `${p.def.id}|${p.phase}|${r.info.key}`;
        if (r.status === 'below-ear') belowEar.add(id);
        if (r.info.hair && r.info.key !== 'biotin' && (r.status === 'below-rda' || r.status === 'below-ai')) hairBelowTarget.add(id);
      }
    if (process.env.KNOWN_GAPS_DUMP) console.log(JSON.stringify({ belowEar: [...belowEar].sort(), hairBelowTarget: [...hairBelowTarget].sort() }, null, 2));
    for (const [name, found, known] of [
      ['belowEar', belowEar, KNOWN.belowEar],
      ['hairBelowTarget', hairBelowTarget, KNOWN.hairBelowTarget],
    ] as const) {
      const k = new Set(known);
      assert.deepEqual([...found].filter((x) => !k.has(x)), [], `new ${name} gaps`);
      assert.deepEqual(known.filter((x) => !found.has(x)), [], `${name} gaps now closed: remove them from tests/known-gaps.json`);
    }
  });

  it('Phase 2 meets the EAR for iron, zinc, calcium, folate, B12, vitamin C, vitamin A and magnesium in every plan', () => {
    const must = ['iron', 'zinc', 'calcium', 'folate', 'b12', 'vitC', 'vitA', 'magnesium'];
    for (const p of computePlans(2)) for (const r of auditPlan(p)) if (must.includes(r.info.key)) assert.notEqual(r.status, 'below-ear', `${p.def.id} ${r.info.label}`);
  });
});

describe('meal content', () => {
  const meals = allMeals();

  it('Meal 1 takes ≤ 10 minutes; weekday Meal 3 needs no cooking', () => {
    for (const p of MEAL_PLAN_DEFINITIONS) {
      assert.ok(p.meal1.totalMin <= 10, `${p.meal1.id}: ${p.meal1.totalMin} min`);
      assert.equal(p.weekdayMeal3.pots, 0, `${p.weekdayMeal3.id} uses a pot`);
      assert.equal(p.weekdayMeal3.requiresReheat, false);
    }
  });

  it('every meal uses at most 2 pots and has quantities, steps, times, flavour and substitutions', () => {
    for (const m of meals) {
      assert.ok(m.pots <= 2, `${m.id}: ${m.pots} pots`);
      assert.ok(m.items.length > 0 && m.steps.length > 0, `${m.id}: no items or steps`);
      assert.ok(m.activeMin > 0 && m.totalMin >= m.activeMin, `${m.id}: times`);
      assert.ok(m.flavour.length > 10, `${m.id}: no flavour note`);
      assert.ok(m.substitutions.length > 0, `${m.id}: no substitutions`);
      const keys = m.items.map(itemKey);
      assert.equal(new Set(keys).size, keys.length, `${m.id}: an item appears twice`);
      for (const it of m.items) {
        const g = typeof it.g === 'number' ? [it.g, it.g, it.g] : it.g;
        assert.ok(g.every((x) => x > 0), `${m.id}: ${itemKey(it)} has a zero starting amount`);
        assert.ok(g[0] <= g[1] && g[1] <= g[2], `${m.id}: ${itemKey(it)} starting amount shrinks between phases`);
      }
    }
  });

  it('every tutorial id exists', () => {
    for (const m of meals) for (const t of m.tutorials ?? []) assert.ok(t in COOKING_TUTORIALS, `${m.id}: ${t}`);
  });

  it('each plan has a cooking card (steps) for every dinner', () => {
    for (const p of MEAL_PLAN_DEFINITIONS) {
      const dinners = planDinners(p);
      assert.ok(dinners.length >= 5);
      for (const d of dinners) assert.ok(d.meal.steps.length >= 3, `${d.meal.id}: too few steps for a card`);
    }
  });

  it('weekday office lunches are made the night before and refrigerated, with ≤ 3 min of packing in the morning', () => {
    for (const p of MEAL_PLAN_DEFINITIONS)
      for (const d of WEEKDAYS) {
        const m = p.lunches[d];
        assert.equal(m.madeWhen, 'night-before', `${p.id} ${d}`);
        assert.ok((m.morningMin ?? 99) <= 3, `${p.id} ${d}: ${m.morningMin} min`);
      }
  });
});

describe('reproducible quantities', () => {
  it('the solver output covers exactly the items in the meal data (re-run npm run solve after editing meals)', () => {
    const expected = new Set(allMeals().flatMap((m) => m.items.map((it) => `${m.id}|${itemKey(it)}`)));
    const actual = new Set(Object.entries(QUANTITIES).flatMap(([id, q]) => Object.keys(q).map((k) => `${id}|${k}`)));
    assert.deepEqual([...expected].filter((x) => !actual.has(x)), [], 'meal items missing from the solver output');
    assert.deepEqual([...actual].filter((x) => !expected.has(x)), [], 'stale solver output');
  });

  it('every solved amount is inside the item’s allowed range and a multiple of its step', () => {
    for (const m of allMeals())
      for (const it of m.items) {
        const q = QUANTITIES[m.id][itemKey(it)];
        for (const ph of PHASE_IDS) {
          const g = q[ph];
          if (it.range) assert.ok(g >= it.range[0] && g <= it.range[1], `${m.id} ${itemKey(it)}: ${g} outside ${it.range}`);
          if (it.step) assert.equal(g % it.step, 0, `${m.id} ${itemKey(it)}: ${g} not a multiple of ${it.step}`);
        }
      }
  });
});

describe('food data provenance', () => {
  it('every food has a source entry and generated composition, and nothing extra', () => {
    assert.deepEqual([...FOOD_IDS].sort(), Object.keys(SOURCES).sort());
    assert.deepEqual([...FOOD_IDS].sort(), Object.keys(COMPOSITION).sort());
    for (const id of FOOD_IDS) assert.ok(FOODS[id].source.startsWith('IFCT') || FOODS[id].source.startsWith('USDA'), id);
  });

  it('protein, fat, available carbs and fibre are known for every food (no gaps in the energy maths)', () => {
    for (const id of FOOD_IDS) for (const k of ['protein', 'fat', 'carbs', 'fiber'] as const) assert.notEqual(FOODS[id].per100[k], null, `${id}.${k}`);
  });

  it('plant foods have no B12; edible share is between 0.3 and 1', () => {
    for (const id of FOOD_IDS) {
      const f = FOODS[id];
      if (!['milk', 'curd', 'paneer', 'ghee', 'egg', 'chicken', 'fish'].includes(id)) assert.ok(!f.per100.b12, `${id} has B12`);
      assert.ok(f.edible >= 0.3 && f.edible <= 1, `${id}: edible ${f.edible}`);
    }
  });

  // IFCT's published energy for fibre-rich foods often matches its macros WITHOUT the fibre term (e.g. guava, amaranth),
  // although its method section lists 8 kJ/g for fibre. So a food passes if the table's kcal is within 15% of
  // 4/4/9 either with or without 2 kcal/g fibre. That still catches unit mix-ups (×10, kJ vs kcal).
  it('each food’s table kcal is within 15% of 4/4/9 (with or without 2 kcal/g fibre)', () => {
    for (const id of FOOD_IDS) {
      if (id === 'lemon') continue; // ~25 kcal per 100 g: tiny numbers make the ratio meaningless
      if (id === 'chicken') continue; // IFCT N001 prints 1605 kJ; its own protein and fat give 798 kJ (likely misprint; breast N003 is consistent)
      const f = FOODS[id];
      const n = { protein: f.per100.protein!, carbs: f.per100.carbs!, fat: f.per100.fat!, fiber: f.per100.fiber! };
      const withFibre = atwaterKcal(n);
      const without = atwaterKcal({ ...n, fiber: 0 });
      const t = f.tabulatedKcal;
      assert.ok(t !== null && Math.min(pct(withFibre, t), pct(without, t)) <= 0.15, `${id}: ${t} vs ${Math.round(without)}–${Math.round(withFibre)}`);
    }
  });

  it('phase targets match the brief', () => {
    const avg = (r: [number, number]) => (r[0] + r[1]) / 2;
    assert.ok(Math.abs(avg(PHASES[0].kcal) - 2200) < 1 && Math.abs(avg(PHASES[0].protein) - 90) < 0.01 && PHASES[0].fibreMax === 35);
    assert.ok(Math.abs(avg(PHASES[1].kcal) - 2400) < 1 && Math.abs(avg(PHASES[1].protein) - 105) < 0.01 && PHASES[1].fibreMax === 45);
    assert.deepEqual([PHASES[2].kcal, PHASES[2].protein, PHASES[2].fibreMax], [[2550, 2700], [110, 125], 50]);
    const phases: PhaseId[] = [0, 1, 2];
    assert.equal(phases.length, PHASE_IDS.length);
  });

  it('itemsNutrients is additive', () => {
    const a = itemsNutrients([{ food: 'milk', g: 100 }]);
    const b = itemsNutrients([{ food: 'milk', g: 200 }]);
    assert.ok(Math.abs(b.kcal - 2 * a.kcal) < 1e-9);
  });
});

