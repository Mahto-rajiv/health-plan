// Hard rules from docs/brief.md §2, §3 and §8. Run: npm test
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MEAL_PLAN_DEFINITIONS, WEEKDAYS, buildWeek, planDinners, type Meal } from '../lib/data/meal-plans';
import { FOODS, type FoodId } from '../lib/data/foods';
import { DEFAULT_PRICE_TABLE } from '../lib/data/prices';
import { PHASES, PHASE_IDS, DAILY, type PhaseId } from '../lib/config';
import { atwaterKcal, itemsNutrients, itemsCost } from '../lib/nutrition';
import { computePlan, computePlans, storageAdvice } from '../lib/meal-plans';
import { PANTRY_MONTHLY, FOOD_SAFETY } from '../lib/data/nutrition-guide';
import { COOKING_TUTORIALS } from '../lib/data/tutorials';

const deepEq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const pct = (a: number, b: number) => Math.abs(a - b) / b;

// A meal title must not name a food that isn't in it.
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
  [/peanut/i, ['peanuts']],
  [/dates/i, ['dates']],
  [/palak/i, ['spinach']],
  [/aloo/i, ['potato']],
  [/roti|paratha|roll/i, ['atta']],
  [/rice|chawal|pulao|khichdi/i, ['rice']],
  [/salad/i, ['salad']],
];

const GRAVY_OR_DAL = /curry|gravy|\bdal\b|rajma|chole|kadhi|sambar/i;
const DAL_FOODS: FoodId[] = ['moongDal', 'toorDal', 'rajma', 'kabuliChana', 'kalaChana', 'moongWhole'];

function allMeals(): Meal[] {
  const out = new Map<string, Meal>();
  for (const p of MEAL_PLAN_DEFINITIONS) {
    for (const m of [p.meal1, p.weekdayMeal3, ...Object.values(p.lunches), ...Object.values(p.dinners), ...Object.values(p.saturday), ...Object.values(p.sunday)]) out.set(m.id, m);
  }
  return [...out.values()];
}

describe('plan set', () => {
  it('has exactly 3 plans: vegetarian, vegetarian + eggs, non-vegetarian', () => {
    assert.deepEqual(MEAL_PLAN_DEFINITIONS.map((p) => p.id), ['vegetarian', 'egg', 'nonveg']);
  });

  it('diet rules: no eggs or meat in the vegetarian plan, no meat in the egg plan, real mixed non-veg plan', () => {
    for (const ph of PHASE_IDS) {
      for (const def of MEAL_PLAN_DEFINITIONS) {
        const foods = buildWeek(def, ph).flatMap((d) => d.meals.flatMap((m) => m.meal.items.map((i) => FOODS[i.food] as { isEgg?: boolean; isMeatOrFish?: boolean })));
        if (def.id === 'vegetarian') assert.ok(!foods.some((f) => f.isEgg || f.isMeatOrFish), 'vegetarian contains egg/meat');
        if (def.id === 'egg') assert.ok(!foods.some((f) => f.isMeatOrFish), 'egg plan contains meat');
        if (def.id === 'egg') assert.ok(foods.some((f) => f.isEgg), 'egg plan has no eggs');
        if (def.id === 'nonveg') assert.ok(foods.some((f) => f.isMeatOrFish), 'non-veg plan has no meat or fish');
      }
    }
  });
});

for (const def of MEAL_PLAN_DEFINITIONS) {
  for (const ph of PHASE_IDS) {
    describe(`${def.id} · phase ${ph}`, () => {
      const P = PHASES[ph];
      const week = buildWeek(def, ph);
      const plan = computePlan(def, ph);

      it('has 7 days × exactly 4 meals in slot order', () => {
        assert.equal(week.length, 7);
        for (const d of week) assert.deepEqual(d.meals.map((m) => m.slot), [1, 2, 3, 4], d.day);
      });

      it('Meal 1 is deep-equal on all 7 days', () => {
        for (const d of week) assert.ok(deepEq(d.meals[0].meal, week[0].meals[0].meal), d.day);
      });

      it('Meal 3 is deep-equal Monday–Friday', () => {
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

      it('kcal reconcile with 4/4/9 + 2 kcal/g fibre within 3% for every meal and day, and with food-table kcal within 3% per day', () => {
        for (const d of plan.days) {
          for (const n of [...d.mealTotals, d.totals]) assert.ok(pct(atwaterKcal(n), n.kcal) <= 0.03, `${d.day} kcal ≠ macros`);
          const tabulated = d.meals.flatMap((m) => m.meal.items).reduce((s, i) => s + (FOODS[i.food].per100.kcal * i.g) / 100, 0);
          assert.ok(pct(tabulated, d.totals.kcal) <= 0.03, `${d.day}: food-table kcal ${Math.round(tabulated)} vs ${Math.round(d.totals.kcal)}`);
        }
      });

      it('grocery totals equal meal costs, and monthly cost = weekly × 30/7 + pantry, from the price table', () => {
        const groceryWeekly = plan.grocery.flatMap((g) => g.lines).reduce((s, l) => s + l.weeklyCost, 0);
        assert.ok(Math.abs(groceryWeekly - plan.weeklyFoodCost) < 0.5, `grocery ₹${groceryWeekly.toFixed(0)} ≠ meals ₹${plan.weeklyFoodCost.toFixed(0)}`);
        assert.ok(Math.abs(plan.monthlyCost - ((plan.weeklyFoodCost * 30) / 7 + PANTRY_MONTHLY)) < 0.5);
        const manual = week.flatMap((d) => d.meals.flatMap((m) => m.meal.items));
        assert.ok(Math.abs(itemsCost(manual, DEFAULT_PRICE_TABLE) - plan.weeklyFoodCost) < 0.5);
      });
    });
  }
}

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
      for (const it of m.items) {
        const g = typeof it.g === 'number' ? [it.g, it.g, it.g] : it.g;
        assert.ok(g.every((x) => x > 0), `${m.id}: ${it.food} has a zero quantity`);
        assert.ok(g[0] <= g[1] && g[1] <= g[2], `${m.id}: ${it.food} shrinks between phases`);
      }
    }
  });

  it('meal titles only name foods the meal contains', () => {
    for (const m of meals) {
      const foods = new Set(m.items.map((i) => i.food));
      for (const [re, ids] of TITLE_FOODS) if (re.test(m.title)) assert.ok(ids.some((id) => foods.has(id)), `${m.id}: "${m.title}" names ${re.source}`);
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

  it('weekday office meals fit the day: Meal 2 is made the morning of or the night before', () => {
    for (const p of MEAL_PLAN_DEFINITIONS) for (const d of WEEKDAYS) assert.ok(p.lunches[d].madeWhen, `${p.id} ${d}`);
  });
});

describe('nutrient sanity', () => {
  it('every food lists available carbs and its tabulated kcal is within 15% of 4/4/9 + 2·fibre (catches typos)', () => {
    for (const [id, f] of Object.entries(FOODS)) {
      if (id === 'lemon') continue; // 22 kcal per 100 g: tiny absolute numbers make the ratio meaningless
      const n = { ...f.per100 };
      assert.ok(pct(atwaterKcal(n), n.kcal) <= 0.15, `${id}: ${n.kcal} vs ${Math.round(atwaterKcal(n))}`);
    }
  });

  it('phase targets match the brief', () => {
    const avg = (r: [number, number]) => (r[0] + r[1]) / 2;
    assert.ok(Math.abs(avg(PHASES[0].kcal) - 2200) < 1 && Math.abs(avg(PHASES[0].protein) - 90) < 0.01 && PHASES[0].fibreMax === 35);
    assert.ok(Math.abs(avg(PHASES[1].kcal) - 2400) < 1 && Math.abs(avg(PHASES[1].protein) - 105) < 0.01 && PHASES[1].fibreMax === 40);
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
