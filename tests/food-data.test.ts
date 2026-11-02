// Plausibility checks on the food table and on whole days. Added in Round 3 after the
// ifct2017 npm package was found to carry fish B6 1,000× too high, folate in the biotin
// column, paneer's fat mistyped (14.78 for 24.78 g) and "not analysed" blanks as 0.
// The build (scripts/food-data/build.ts) fixes those at the source; these tests make
// sure nothing like them can reach the app again. Run: npm test
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { COMPOSITION, SR28_MAX } from '../lib/data/composition.generated';
import { NUTRIENT_KEYS, type NutrientKey } from '../lib/data/nutrient-keys';
import { NUTRIENT_BY_KEY } from '../lib/data/nutrients';
import { FOODS, FOOD_IDS } from '../lib/data/foods';
import { SOURCES } from '../scripts/food-data/sources';
import { allDefaultPlans } from '../lib/meal-plans';

const MACROS: NutrientKey[] = ['protein', 'fat', 'carbs', 'fiber'];
/** Same threshold as build.ts: beyond this, IFCT and USDA disagree and the lower value is used. */
const DISAGREE = 4;
/** No SR28 biotin. The richest common food is egg yolk (IFCT M003: 65 µg/100 g). */
const BIOTIN_CEILING = 100;
/** Carbohydrate can't exceed 100 g per 100 g. */
const CARB_CEILING = 100;

describe('food rows are physically plausible', () => {
  it('no value is negative, and none is above the highest value of that nutrient in any of the 8,789 USDA SR28 foods', () => {
    for (const [id, c] of Object.entries(COMPOSITION)) {
      for (const k of NUTRIENT_KEYS) {
        const v = c.values[k];
        if (v === null) continue;
        assert.ok(v >= 0, `${id}.${k} = ${v}`);
        const ceiling = k === 'biotin' ? BIOTIN_CEILING : k === 'carbs' ? CARB_CEILING : SR28_MAX[k]?.value;
        assert.ok(ceiling !== undefined, `no ceiling for ${k}`);
        assert.ok(v <= ceiling, `${id}.${k} = ${v} is above every SR28 food (max ${ceiling}, ${SR28_MAX[k]?.name ?? 'biotin ceiling'})`);
      }
    }
  });

  it('the parts of each row add up to about 100 g (water + ash + protein + fat + carbs + fibre)', () => {
    for (const [id, c] of Object.entries(COMPOSITION)) {
      if (c.waterAsh === null) continue;
      const v = c.values;
      const sum = c.waterAsh + v.protein! + v.fat! + v.carbs! + v.fiber!;
      // Lemon juice also has ~5 g citric acid, which neither carbs nor fibre count.
      assert.ok(sum >= 92 && sum <= 106, `${id}: parts add up to ${sum.toFixed(1)} g`);
    }
  });

  it('no IFCT vitamin or mineral is more than 4× the closest USDA food (where they disagree, the lower value is used)', () => {
    for (const [id, c] of Object.entries(COMPOSITION)) {
      if (!c.check) continue;
      for (const k of NUTRIENT_KEYS) {
        if (MACROS.includes(k)) continue;
        const v = c.values[k];
        const u = (c.check.values as Partial<Record<NutrientKey, number | null>>)[k];
        if (v == null || u == null || v <= 0 || u <= 0) continue;
        assert.ok(v / u <= DISAGREE + 1e-9, `${id}.${k}: ${v} vs USDA ${c.check.ndb} ${u}`);
      }
    }
  });

  it('an IFCT zero is never kept where the USDA food has a meaningful amount, unless it was checked against the PDF', () => {
    for (const [id, c] of Object.entries(COMPOSITION)) {
      if (!c.check) continue;
      for (const k of NUTRIENT_KEYS) {
        if (k === 'b12' || k === 'biotin' || SOURCES[id].zeroConfirmed?.includes(k)) continue;
        const u = (c.check.values as Partial<Record<NutrientKey, number | null>>)[k];
        const ref = NUTRIENT_BY_KEY[k]?.rda ?? NUTRIENT_BY_KEY[k]?.ear;
        const meaningful = u != null && (ref ? u >= 0.05 * ref : u >= 0.5);
        assert.ok(!(c.values[k] === 0 && meaningful), `${id}.${k} is 0 but USDA ${c.check.ndb} has ${u}`);
      }
    }
  });

  it('the known package defects stay fixed', () => {
    // Fish table: B6 is mg (rohu 0.24 mg), folate µg (12.63), biotin not analysed.
    assert.ok(FOODS.fish.per100.b6! < 1, `fish B6 ${FOODS.fish.per100.b6}`);
    assert.ok(FOODS.fish.per100.folate! > 5 && FOODS.fish.per100.folate! < 30, `fish folate ${FOODS.fish.per100.folate}`);
    assert.equal(FOODS.fish.per100.biotin, null);
    // Paneer: fat 24.78 g and carbs 2.41 g as printed in IFCT Table 1.
    assert.equal(FOODS.paneer.per100.fat, 24.78);
    assert.equal(FOODS.paneer.per100.carbs, 2.41);
    // Lemon juice carbohydrate 6.97 g.
    assert.equal(FOODS.lemon.per100.carbs, 6.97);
  });

  it('every food is used through the same table', () => {
    for (const id of FOOD_IDS) assert.ok(COMPOSITION[id], id);
  });
});

describe('whole days are physically plausible', () => {
  // A day of ordinary food can't plausibly give more than ~5× the RDA/AI of a vitamin or
  // mineral (the richest foods here give 2–4×). Fish at 240 mg B6 per 100 g would have
  // failed this at once. Above-UL days are a separate, stricter check in plans.test.ts.
  const plans = allDefaultPlans();
  it('no day has more of any nutrient than its upper limit or 5× its RDA/AI, whichever is higher (vitamins A and K: 10×, from leafy greens)', () => {
    for (const p of plans)
      for (const d of p.days)
        for (const k of NUTRIENT_KEYS) {
          const ref = NUTRIENT_BY_KEY[k]?.rda;
          if (!ref) continue;
          const factor = k === 'vitA' || k === 'vitK' ? 10 : 5;
          const bound = Math.max(factor * ref, NUTRIENT_BY_KEY[k]?.ul ?? 0);
          assert.ok(d.totals[k] <= bound, `${p.def.id} P${p.phase} ${p.season} ${d.day}: ${k} ${d.totals[k].toFixed(1)} > ${bound}`);
        }
  });
});
