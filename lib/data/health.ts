import type { RefId } from './references';

// ─── Blood work, 3 October 2026 ───────────────────────────────────────────────
// Context, not diagnosis. "Lab range" is the typical reference range; your
// laboratory's printed range is what counts.

export type ResultStatus = 'normal' | 'low-normal' | 'discuss';

export interface BloodResult {
  name: string;
  value: string;
  unit: string;
  labRange: string;
  status: ResultStatus;
  group: 'Vitamins' | 'Iron & blood' | 'Thyroid & metabolism' | 'Kidney, liver & inflammation';
  meaning: string;
  refs?: RefId[];
}

export const BLOOD_DATE = '3 October 2026';

export const BLOOD_RESULTS: BloodResult[] = [
  {
    name: 'Vitamin D (25-OH)',
    value: '22.3',
    unit: 'ng/mL',
    labRange: 'Varies by guideline (see note)',
    status: 'discuss',
    group: 'Vitamins',
    meaning:
      'Guidelines disagree on this number. By the US National Academies (IOM) standard, ≥ 20 ng/mL is adequate for most people. The 2011 Endocrine Society guideline called 21–29 “insufficient”. Its 2024 update no longer defines a target level and advises against routine testing in healthy adults. So this is borderline, not a deficiency. A modest daily dose plus sunlight is a reasonable, low-risk step.',
    refs: ['odsVitD', 'holick2011', 'demay2024'],
  },
  {
    name: 'Vitamin B12',
    value: '299',
    unit: 'pg/mL',
    labRange: '≈ 200–900 pg/mL',
    status: 'low-normal',
    group: 'Vitamins',
    meaning:
      'Within the lab range but near the lower edge. Below ~200–250 is generally considered low, and many clinicians treat 200–300 as a grey zone in which a follow-up test (MMA or homocysteine) can clarify things. Vegetarians are at higher risk of slowly falling B12. Your normal haemoglobin and MCV are reassuring.',
    refs: ['odsB12', 'bshB12', 'pawlak'],
  },
  {
    name: 'Serum iron',
    value: '119',
    unit: 'µg/dL',
    labRange: '≈ 60–170 µg/dL',
    status: 'normal',
    group: 'Iron & blood',
    meaning: 'Normal. Serum iron changes from day to day and with meals, so it doesn’t show iron stores — that is what ferritin measures (not tested).',
  },
  {
    name: 'Transferrin saturation',
    value: '27',
    unit: '%',
    labRange: '≈ 20–50%',
    status: 'normal',
    group: 'Iron & blood',
    meaning: 'Normal. Together with haemoglobin and MCV, it gives no sign of iron deficiency affecting your blood.',
  },
  {
    name: 'Haemoglobin',
    value: '14.8',
    unit: 'g/dL',
    labRange: '≈ 13–17 g/dL (men)',
    status: 'normal',
    group: 'Iron & blood',
    meaning: 'Normal — no anaemia.',
  },
  {
    name: 'MCV',
    value: '87.9',
    unit: 'fL',
    labRange: '≈ 80–100 fL',
    status: 'normal',
    group: 'Iron & blood',
    meaning: 'Normal red-cell size. Very small cells can point to iron deficiency, and large cells to B12 or folate deficiency; yours are neither.',
  },
  {
    name: 'TSH',
    value: '1.263',
    unit: 'µIU/mL',
    labRange: '≈ 0.4–4.0 µIU/mL',
    status: 'normal',
    group: 'Thyroid & metabolism',
    meaning: 'Normal thyroid signal. Thyroid problems are a common, testable cause of diffuse hair shedding, and this result makes one unlikely.',
  },
  {
    name: 'HbA1c',
    value: '5.3',
    unit: '%',
    labRange: '< 5.7%',
    status: 'normal',
    group: 'Thyroid & metabolism',
    meaning: 'Normal 3-month average blood sugar.',
  },
  {
    name: 'Fasting glucose',
    value: '87.8',
    unit: 'mg/dL',
    labRange: '70–99 mg/dL',
    status: 'normal',
    group: 'Thyroid & metabolism',
    meaning: 'Normal.',
  },
  {
    name: 'Creatinine',
    value: '0.9',
    unit: 'mg/dL',
    labRange: '≈ 0.7–1.3 mg/dL',
    status: 'normal',
    group: 'Kidney, liver & inflammation',
    meaning: 'Normal. Note: creatine supplements and more muscle can raise creatinine slightly without any kidney problem — tell your doctor if you take creatine before a blood test.',
    refs: ['antonioCreatine'],
  },
  {
    name: 'eGFR',
    value: '123',
    unit: 'mL/min/1.73 m²',
    labRange: '≥ 90 normal',
    status: 'normal',
    group: 'Kidney, liver & inflammation',
    meaning: 'Normal kidney filtration. A protein intake of 1.6–2.0 g/kg has not been shown to affect kidney function in healthy adults.',
    refs: ['devries'],
  },
  {
    name: 'Liver markers',
    value: 'In range',
    unit: '',
    labRange: 'Lab ranges',
    status: 'normal',
    group: 'Kidney, liver & inflammation',
    meaning: 'Within the laboratory’s ranges.',
  },
  {
    name: 'Lipid profile',
    value: 'In range',
    unit: '',
    labRange: 'Lab ranges',
    status: 'normal',
    group: 'Kidney, liver & inflammation',
    meaning: 'Within the laboratory’s ranges.',
  },
  {
    name: 'hs-CRP',
    value: '0.58',
    unit: 'mg/L',
    labRange: '< 1 mg/L low',
    status: 'normal',
    group: 'Kidney, liver & inflammation',
    meaning: 'Low — no sign of systemic inflammation. Low CRP also means a ferritin test, if done, would be easy to interpret.',
  },
];

// ─── Hair ─────────────────────────────────────────────────────────────────────

export const HAIR = {
  summary:
    'Six months of noticeable shedding and thinning deserves a proper diagnosis. In men in their twenties, the two most common causes are androgenetic (pattern) hair loss and telogen effluvium (diffuse shedding a few months after a trigger such as illness, stress, rapid weight change or crash dieting). These need different approaches, and only an examination can tell them apart. Your blood work rules out several common contributors (thyroid, anaemia, blood sugar) but cannot identify the cause.',
  seeDermatologist: [
    'Book a dermatologist appointment now. Thinning lasting 6 months is the threshold where an assessment is worth it, and if the cause is pattern hair loss, treatment works better when started early.',
    'Seek care sooner for patchy bald spots, scalp pain, redness, scaling or itching, or for sudden heavy shedding.',
    'If it is pattern hair loss, the evidence-based treatments (e.g. minoxidil, finasteride) are prescription decisions to make with the dermatologist, not supplements.',
  ],
  askAbout: [
    'Serum ferritin (iron stores; not in your panel)',
    'Zinc and folate',
    'MMA or homocysteine to clarify the borderline B12, ideally before starting B12 supplements',
    'Whether your vitamin D level needs anything beyond a standard daily dose',
  ],
  nutrition: [
    { title: 'Enough protein and energy', body: 'Hair follicles are sensitive to low protein and crash dieting. The plan provides ~125 g of protein and a small calorie surplus, which removes these as possible causes.', level: 'Reasonable' },
    { title: 'Iron stores', body: 'Your blood iron markers are normal. Ferritin hasn’t been measured. Evidence linking low-normal ferritin to hair loss is mixed, but it’s cheap to check. The plans add iron foods (sattu, chana, dals, greens) with vitamin C from lemon and fruit.', level: 'Mixed' },
    { title: 'Zinc', body: 'Vegetarians absorb less zinc because of phytates in grains and legumes. Soaking and sprouting help. The plans provide roughly 15–19 mg/day before absorption losses. Don’t supplement unless a test shows it’s low — too much zinc can cause problems too.', level: 'Mixed' },
    { title: 'Vitamin D', body: 'Low vitamin D is common in some hair conditions, but the link is clearest for alopecia areata, not male pattern hair loss. Correcting a low level is sensible for general health; it is not a proven hair treatment.', level: 'Weak' },
    { title: 'Biotin and “hair” supplements', body: 'No benefit without a proven deficiency, which is rare. High-dose biotin can falsify blood tests, including thyroid and heart tests. Some multi-ingredient hair products contain amounts of vitamin A or selenium that can themselves cause shedding.', level: 'Avoid' },
  ],
  refs: ['aadCauses', 'aadShedding', 'almohanna', 'guoKatta', 'trost', 'yongpisarn', 'fdaBiotin', 'nhsHairLoss'] as RefId[],
};

// ─── Supplements ──────────────────────────────────────────────────────────────

export interface Supplement {
  name: string;
  verdict: 'Recommended' | 'Discuss first' | 'Optional' | 'Not recommended';
  dose?: string;
  why: string;
  cautions?: string;
  cost?: string;
  refs: RefId[];
}

export const SUPPLEMENTS: Supplement[] = [
  {
    name: 'Vitamin D3',
    verdict: 'Recommended',
    dose: '600–1,000 IU daily with a meal containing fat, plus ~15–30 min of midday sun on arms and face on most days',
    why: 'Your level (22.3 ng/mL) is borderline by some guidelines. A modest daily dose is safe (well below the 4,000 IU upper limit) and costs little.',
    cautions: 'Avoid taking weekly 60,000 IU sachets on your own. They are a treatment dose, so use them only if a doctor prescribes them for a set period. A retest after ~3 months is optional, since guidelines don’t require it.',
    cost: '≈ ₹100–200/month',
    refs: ['odsVitD', 'demay2024', 'icmr2024'],
  },
  {
    name: 'Vitamin B12',
    verdict: 'Discuss first',
    dose: 'Typically 250–500 µg/day oral (or 1,000 µg a few times a week)',
    why: 'Low-normal level, plus a mostly vegetarian diet. Supplementing is cheap and low-risk. Ask your doctor whether to check MMA/homocysteine first, because starting B12 makes those tests harder to interpret.',
    cautions: 'No known upper limit. Recheck after ~3 months if supplementing. Plans 3 and 4 (eggs/fish) supply more B12 from food.',
    cost: '≈ ₹100–200/month',
    refs: ['odsB12', 'bshB12', 'pawlak'],
  },
  {
    name: 'Creatine monohydrate',
    verdict: 'Optional',
    dose: '3–5 g/day, any time; no loading phase',
    why: 'The best-supported supplement for strength and muscle gain, and safe in healthy adults. Useful but not necessary: the plan works without it.',
    cautions: 'A 2009 study found a rise in DHT; a 2025 trial found no change in DHT or hair. Given your current hair loss, it’s reasonable to wait until after the dermatologist visit. It can raise blood creatinine slightly, so mention it before blood tests.',
    cost: '≈ ₹350–450/month',
    refs: ['issnCreatine', 'antonioCreatine', 'vanDerMerwe', 'lak2025'],
  },
  {
    name: 'Whey or soy protein powder',
    verdict: 'Optional',
    dose: '1 scoop (~25 g protein) only if you regularly miss your protein target',
    why: 'Convenience only. All four plans reach ~115–135 g of protein from food, and ICMR advises against routine protein powders. Food alternative to 1 scoop: 300 ml milk + 20 g soya chunks, or 100 g paneer.',
    cost: '≈ ₹1,000–1,300/month at 1 scoop/day',
    refs: ['morton', 'icmr2024'],
  },
  {
    name: 'Omega-3 (algal or fish oil)',
    verdict: 'Optional',
    why: 'The vegetarian plans provide plant omega-3 (ALA) from flaxseed and walnuts. Conversion to EPA/DHA is low, but there is no clear benefit for your goals from supplements. Plan 4 includes fish.',
    refs: ['odsOmega3'],
  },
  {
    name: 'Iron, zinc, biotin, “hair growth” blends, multivitamins',
    verdict: 'Not recommended',
    why: 'Your iron markers are normal and zinc hasn’t been tested. Supplementing without a deficiency is unsupported, some ingredients can worsen shedding, and biotin interferes with lab tests.',
    refs: ['guoKatta', 'fdaBiotin', 'odsZinc'],
  },
];

export const HEALTH_DISCLAIMER =
  'This page explains your results in plain language and suggests questions for your doctor. It does not diagnose anything or replace a consultation. Reference ranges vary between laboratories.';
