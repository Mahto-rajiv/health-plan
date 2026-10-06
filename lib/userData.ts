import { UserProfile, MacroTargets } from './types';

// ─── User Profile ─────────────────────────────────────────────────────────────
// Evidence basis:
// BMR: Mifflin-St Jeor (most accurate for adults, 2005 meta-analysis by Frankenfield)
// TDEE: sedentary multiplier 1.375 (lightly active - includes 4x gym)
// Surplus: 200-300 kcal conservative lean bulk (Barakat et al. 2020, JSCR)
// Target 75 kg: BMI 23.1, well within healthy range (18.5-24.9, WHO)

export const USER_PROFILE: UserProfile = {
  name: 'Rajiv',
  age: 24,
  heightCm: 180,
  currentWeightKg: 66,
  targetWeightKg: 75,
  startWeightKg: 66,
  startDate: '2026-10-06',
  bmi: 20.4, // 66 / (1.80^2)
  bmr: 1726, // Mifflin-St Jeor: (10×66) + (6.25×180) − (5×24) + 5 = 1726
  tdee: 2175, // BMR × 1.26 (sedentary+gym 4×wk approx 1.26 blended)
  dailyCalorieTarget: 2400, // TDEE + ~225 kcal surplus → safe lean bulk
  surplusKcal: 225,
};

// ─── Macro Targets ────────────────────────────────────────────────────────────
// Evidence basis:
// Protein: 1.6–2.2 g/kg for hypertrophy (Morton et al. 2018 meta-analysis)
//          Target 160g = ~2.4 g/kg (upper range, accounts for veg digestibility)
// Fat: ≥0.7 g/kg minimum for hormonal health; target 20-25% of calories
// Carbs: remainder after P & F — primary fuel for performance
// Fiber: 25-38g (AHA/AND guidelines), important for gut health

export const MACRO_TARGETS: MacroTargets = {
  calories: 2400,
  proteinG: 160,
  carbsG: 290,
  fatG: 65,
  fiberG: 30,
  waterMl: 3000,
};

export const MACRO_TARGETS_TRAINING_DAY: MacroTargets = {
  calories: 2500,
  proteinG: 160,
  carbsG: 320,
  fatG: 65,
  fiberG: 30,
  waterMl: 3500,
};

// ─── Notes ────────────────────────────────────────────────────────────────────
export const NUTRITION_RATIONALE = {
  calorieTarget: '2400 kcal/day (TDEE ~2175 + ~225 kcal surplus). This conservative surplus minimises fat gain while supporting ~0.25–0.5 kg/month weight gain — appropriate for a beginner lean bulk.',
  proteinTarget: '160g protein/day (~2.4 g/kg). Slightly above the evidence-supported 1.6–2.2 g/kg range to account for plant protein digestibility (PDCAAS typically lower). This is safe and well within kidney health limits for healthy individuals.',
  carbTarget: '290g carbs/day (training days 320g). Carbohydrates are the primary fuel for resistance training and are NOT optional for performance. Prioritise whole-food carbs.',
  fatTarget: '65g fat/day (~24% of calories). Adequate for testosterone production and fat-soluble vitamin absorption. Do not drop below 0.7 g/kg.',
  fiberTarget: '30g fiber/day. Supports gut microbiome, satiety, and cardiometabolic health. Introduce gradually over 2-3 weeks if digestive issues occur.',
  waterTarget: '3L/day (3.5L on training days). Adequate hydration supports performance, digestion, and kidney function (relevant given your creatinine/eGFR).',
  weightTarget: '75 kg target is appropriate (BMI 23.1, healthy range). Expected timeline: 9–18 months at 0.25–0.5 kg/month. Reassess at 72 kg.',
};

// ─── Supplement Recommendations ───────────────────────────────────────────────
export const SUPPLEMENT_RECOMMENDATIONS = [
  {
    name: 'Vitamin D3',
    dose: '1000–2000 IU/day with a meal containing fat',
    rationale: 'Your blood level is 22.3 ng/mL. The Endocrine Society considers <30 ng/mL insufficient. Sun exposure is unpredictable; supplementation is evidence-supported (Holick 2011). Discuss with your doctor.',
    priority: 'high' as const,
    cost: '₹200–400/month',
    evidence: 'Strong',
    caution: 'Do not self-supplement high doses (>4000 IU/day) without medical guidance. Retest in 3-4 months.',
  },
  {
    name: 'Creatine Monohydrate',
    dose: '3–5g/day, any time',
    rationale: 'The most evidence-supported sports supplement for strength and muscle (Lanhers et al. 2017 meta-analysis). Safe for healthy kidneys (your eGFR is 123 — excellent). No loading needed.',
    priority: 'high' as const,
    cost: '₹400–700/month',
    evidence: 'Very Strong',
    caution: 'Increase water intake by ~500 ml/day. May cause initial 1-2 kg scale increase (water retention in muscle) — this is NOT fat.',
  },
  {
    name: 'Whey Protein',
    dose: '25–30g per serving as needed',
    rationale: 'Optional — only if consistently struggling to reach 160g protein from food. At ₹4000-5000/month budget, food-first is more cost-effective. One scoop can replace some food protein when convenience is needed.',
    priority: 'low' as const,
    cost: '₹800–1500/month (half-kg)',
    evidence: 'Strong (as protein source)',
    caution: 'Not necessary if food protein targets are met. Check for sucralose/artificial sweeteners if gut-sensitive.',
  },
  {
    name: 'Vitamin B12',
    dose: '500 mcg/day or 1000 mcg every other day (methylcobalamin preferred)',
    rationale: 'Your B12 is 299 pg/mL — within normal range (>200 pg/mL) but on the lower side. Vegetarians are at risk of depletion over time as B12 is found almost exclusively in animal products. Prevention is inexpensive.',
    priority: 'medium' as const,
    cost: '₹100–250/month',
    evidence: 'Strong for vegetarians',
    caution: 'Well tolerated and water-soluble. Discuss with doctor if considering injectable forms.',
  },
];
