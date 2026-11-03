import type { RefId } from './references';

// ─── Blood tests ──────────────────────────────────────────────────────────────
// What each test means and how to read it. Your own results are NOT in the code
// (the repo and site are public): you type them on the Health page and they stay
// in this browser (lib/storage.ts, `blood`). Context, not diagnosis: "Range" is a
// typical reference range; your laboratory's printed range is what counts.

export type ResultStatus = 'normal' | 'low-normal' | 'discuss' | 'outside';

/** Status bands for a numeric result, checked in order: the first `below` that the value is under wins. */
type Band = { below: number; status: ResultStatus };

export interface BloodTest {
  id: string;
  name: string;
  unit: string;
  labRange: string;
  group: 'Vitamins' | 'Iron & blood' | 'Thyroid & metabolism' | 'Kidney, liver & inflammation';
  /** Numeric tests have bands; the rest are entered as "in range" / "outside range". */
  bands?: Band[];
  /** Status at or above the last band. */
  top?: ResultStatus;
  about: string;
  refs?: RefId[];
}

export const BLOOD_TESTS: BloodTest[] = [
  {
    id: 'vitD',
    name: 'Vitamin D (25-OH)',
    unit: 'ng/mL',
    labRange: 'Varies by guideline (see note)',
    group: 'Vitamins',
    bands: [{ below: 12, status: 'outside' }, { below: 20, status: 'discuss' }, { below: 30, status: 'low-normal' }, { below: 100, status: 'normal' }],
    top: 'outside',
    about:
      'Guidelines disagree on this number. By the US National Academies (IOM) standard, ≥ 20 ng/mL is adequate for most people and < 12 is deficient. The 2011 Endocrine Society guideline called 21–29 “insufficient”. Its 2024 update no longer defines a target level and advises against routine testing in healthy adults. A 2025 Indian expert consensus calls 20–30 “insufficient”. So 20–30 is borderline, not a deficiency: a modest daily dose plus sunlight is a reasonable, low-risk step.',
    refs: ['odsVitD', 'holick2011', 'demay2024', 'kalra2025'],
  },
  {
    id: 'b12',
    name: 'Vitamin B12',
    unit: 'pg/mL',
    labRange: '≈ 200–900 pg/mL',
    group: 'Vitamins',
    bands: [{ below: 180, status: 'outside' }, { below: 350, status: 'low-normal' }],
    top: 'normal',
    about:
      'NICE (2024) calls 180–350 pg/mL “indeterminate”: deficiency is possible, and an active B12 (holotranscobalamin), MMA or homocysteine test can clarify it. Indian vegetarians are at high risk of slowly falling B12. A normal haemoglobin and MCV are reassuring but don’t rule it out.',
    refs: ['niceB12', 'bshB12', 'pawlak', 'yajnik2006'],
  },
  {
    id: 'iron',
    name: 'Serum iron',
    unit: 'µg/dL',
    labRange: '≈ 60–170 µg/dL',
    group: 'Iron & blood',
    bands: [{ below: 60, status: 'outside' }, { below: 170.01, status: 'normal' }],
    top: 'outside',
    about: 'Serum iron changes from day to day and with meals, so it doesn’t show iron stores — that is what ferritin measures.',
  },
  {
    id: 'tsat',
    name: 'Transferrin saturation',
    unit: '%',
    labRange: '≈ 20–50%',
    group: 'Iron & blood',
    bands: [{ below: 20, status: 'outside' }, { below: 50.01, status: 'normal' }],
    top: 'outside',
    about: 'The share of the iron carrier that holds iron. Low values point to iron deficiency; together with haemoglobin and MCV it shows whether iron is short for making blood.',
  },
  {
    id: 'hb',
    name: 'Haemoglobin',
    unit: 'g/dL',
    labRange: '≈ 13–17 g/dL (men)',
    group: 'Iron & blood',
    bands: [{ below: 13, status: 'outside' }, { below: 17.01, status: 'normal' }],
    top: 'outside',
    about: 'Below the range means anaemia, which needs a doctor to find the cause.',
  },
  {
    id: 'mcv',
    name: 'MCV',
    unit: 'fL',
    labRange: '≈ 80–100 fL',
    group: 'Iron & blood',
    bands: [{ below: 80, status: 'outside' }, { below: 100.01, status: 'normal' }],
    top: 'outside',
    about: 'Red-cell size. Very small cells can point to iron deficiency, and large cells to B12 or folate deficiency.',
  },
  {
    id: 'tsh',
    name: 'TSH',
    unit: 'µIU/mL',
    labRange: '≈ 0.4–4.0 µIU/mL',
    group: 'Thyroid & metabolism',
    bands: [{ below: 0.4, status: 'outside' }, { below: 4.01, status: 'normal' }],
    top: 'outside',
    about: 'The thyroid signal. Thyroid problems are a common, testable cause of diffuse hair shedding; a normal TSH makes one unlikely.',
  },
  {
    id: 'hba1c',
    name: 'HbA1c',
    unit: '%',
    labRange: '< 5.7%',
    group: 'Thyroid & metabolism',
    bands: [{ below: 5.7, status: 'normal' }, { below: 6.5, status: 'discuss' }],
    top: 'outside',
    about: '3-month average blood sugar. 5.7–6.4% is the prediabetes range; 6.5% or more needs a doctor.',
  },
  {
    id: 'glucose',
    name: 'Fasting glucose',
    unit: 'mg/dL',
    labRange: '70–99 mg/dL',
    group: 'Thyroid & metabolism',
    bands: [{ below: 70, status: 'outside' }, { below: 100, status: 'normal' }, { below: 126, status: 'discuss' }],
    top: 'outside',
    about: '100–125 mg/dL is the prediabetes range; 126 or more needs a doctor.',
  },
  {
    id: 'creatinine',
    name: 'Creatinine',
    unit: 'mg/dL',
    labRange: '≈ 0.7–1.3 mg/dL',
    group: 'Kidney, liver & inflammation',
    bands: [{ below: 0.7, status: 'outside' }, { below: 1.31, status: 'normal' }],
    top: 'outside',
    about: 'Creatine supplements and more muscle can raise creatinine slightly without any kidney problem — tell your doctor if you take creatine before a blood test.',
    refs: ['antonioCreatine'],
  },
  {
    id: 'egfr',
    name: 'eGFR',
    unit: 'mL/min/1.73 m²',
    labRange: '≥ 90 normal',
    group: 'Kidney, liver & inflammation',
    bands: [{ below: 60, status: 'outside' }, { below: 90, status: 'discuss' }],
    top: 'normal',
    about: 'Kidney filtration. A protein intake of 1.6–2.0 g/kg has not been shown to affect kidney function in healthy adults.',
    refs: ['devries'],
  },
  {
    id: 'liver',
    name: 'Liver markers',
    unit: '',
    labRange: 'Lab ranges',
    group: 'Kidney, liver & inflammation',
    about: 'Compare each value with the laboratory’s printed range.',
  },
  {
    id: 'lipids',
    name: 'Lipid profile',
    unit: '',
    labRange: 'Lab ranges',
    group: 'Kidney, liver & inflammation',
    about: 'Compare each value with the laboratory’s printed range.',
  },
  {
    id: 'crp',
    name: 'hs-CRP',
    unit: 'mg/L',
    labRange: '< 1 mg/L low',
    group: 'Kidney, liver & inflammation',
    bands: [{ below: 1, status: 'normal' }, { below: 3.01, status: 'discuss' }],
    top: 'outside',
    about: 'Inflammation. Below 1 mg/L is low; a low CRP also makes a ferritin result easy to interpret (inflammation raises ferritin).',
  },
];

/** A result as typed: a number for tests with bands, 'in' / 'out' for the others. */
export function bloodStatus(test: BloodTest, value: string | undefined): ResultStatus | null {
  if (value === undefined || value.trim() === '') return null;
  if (!test.bands) return value === 'in' ? 'normal' : value === 'out' ? 'outside' : null;
  const v = Number(value);
  if (!Number.isFinite(v)) return null;
  return test.bands.find((b) => v < b.below)?.status ?? test.top ?? 'normal';
}

// ─── Hair ─────────────────────────────────────────────────────────────────────

export const HAIR = {
  summary:
    'Six months of noticeable shedding and thinning deserves a proper diagnosis. In men in their twenties, the two most common causes are androgenetic (pattern) hair loss and telogen effluvium (diffuse shedding a few months after a trigger such as illness, stress, rapid weight change or crash dieting). These need different approaches, and only an examination can tell them apart. Blood work can rule out several common contributors (thyroid, anaemia, blood sugar) but cannot identify the cause.',
  seeDermatologist: [
    'Book a dermatologist appointment now. Thinning lasting 6 months is the threshold where an assessment is worth it, and if the cause is pattern hair loss, treatment works better when started early.',
    'Seek care sooner for patchy bald spots, scalp pain, redness, scaling or itching, or for sudden heavy shedding.',
    'If it is pattern hair loss, the evidence-based treatments (e.g. minoxidil, finasteride) are prescription decisions to make with the dermatologist, not supplements.',
  ],
  askAbout: [
    'Serum ferritin (iron stores; not in your panel)',
    'Zinc and folate',
    'Active B12 (holotranscobalamin) or homocysteine to clarify the borderline B12, before the first B12 tablet if you want a firm diagnosis',
    'Whether your vitamin D level needs anything beyond a standard daily dose',
  ],
  nutrition: [
    { title: 'Weight loss and low intake', body: 'Losing weight and eating too little — especially too little protein — over the past 6 months is a recognised trigger for diffuse shedding (telogen effluvium), which typically starts 2–4 months after the trigger. That fits your timeline. It is plausible, not certain: the AAD gives “lost 20 pounds (~9 kg) or more” as a typical trigger, and your loss is smaller (see the to-do above). A dermatologist must confirm the cause. Eating enough is right for your health anyway, but nutrition cannot be shown to cure hair loss.', level: 'Reasonable' },
    { title: 'Iron stores', body: 'Serum iron, haemoglobin and MCV don’t show iron stores; ferritin does. Evidence linking low-normal ferritin to hair loss is mixed, but it’s cheap to check. The plans include iron foods (dals, soya, atta, greens, pumpkin seeds) with vitamin C from the fruit and vegetables. The diet table below shows how much.', level: 'Mixed' },
    { title: 'Zinc', body: 'Vegetarians absorb less zinc because of phytates in grains and legumes. Soaking and sprouting help. The diet table below shows how much each plan gives, before absorption losses. Don’t supplement unless a test shows it’s low — too much zinc can cause problems too.', level: 'Mixed' },
    { title: 'Vitamin D', body: 'Low vitamin D is common in some hair conditions, but the link is clearest for alopecia areata, not male pattern hair loss. Correcting a low level is sensible for general health; it is not a proven hair treatment.', level: 'Weak' },
    { title: 'Biotin and “hair” supplements', body: 'No benefit without a proven deficiency, which is rare. High-dose biotin can falsify blood tests, including thyroid and heart tests. Some multi-ingredient hair products contain amounts of vitamin A or selenium that can themselves cause shedding.', level: 'Avoid' },
  ],
  refs: ['aadCauses', 'aadShedding', 'malkud2015', 'almohanna', 'guoKatta', 'trost', 'yongpisarn', 'fdaBiotin', 'biotinThyroid', 'nhsHairLoss'] as RefId[],
};

// ─── To-do ────────────────────────────────────────────────────────────────────
/** Shown at the top of the Health page. 'weight' is worded from your own log (app/health/WeightTodo.tsx). */
export const HEALTH_TODO: (string | 'weight')[] = [
  'Book a dermatologist appointment for the 6 months of hair shedding and thinning.',
  'weight',
  'Ask about these blood tests: ferritin (iron stores), zinc, folate, and active B12 (holotranscobalamin) — the B12 test before any B12 tablet.',
];

// The diet coverage table is computed on the page from every plan and phase
// (lib/nutrient-audit.ts), so no amounts are typed here.

// ─── Supplements ──────────────────────────────────────────────────────────────

export interface Supplement {
  name: string;
  verdict: 'Recommended' | 'Discuss first' | 'Optional' | 'Not recommended';
  dose?: string;
  why: string;
  cautions?: string;
  /** What to look for when buying; product names are examples, not endorsements. */
  buy?: string;
  cost?: string;
  refs: RefId[];
}

export const SUPPLEMENTS: Supplement[] = [
  {
    name: 'Vitamin D3',
    verdict: 'Recommended',
    dose: '1,000 IU (25 µg) once a day with a meal, plus 15–30 minutes of midday sun on arms and face when you can, never to the point of redness',
    why: 'Food gives you almost none. Guidelines read a level of 20–30 ng/mL differently: adequate by the US standard (≥ 20), “insufficient” by the 2025 Indian expert consensus. The Endocrine Society (2024) advises only the normal daily intake (600 IU) for healthy adults under 50. 1,000 IU a day sits between them: above the ICMR need of 600 IU and a quarter of the 4,000 IU upper limit.',
    cautions: 'The Indian consensus suggests 60,000 IU weekly for 8 weeks at 20–30 ng/mL. Take that only if a doctor prescribes it, and then not on top of the daily tablet. Avoid single doses of 100,000 IU or more: very large yearly doses increased falls and fractures in older women. Expect modest benefits: a 2025 meta-analysis of 40 trials found only a small drop in respiratory infections. A retest is optional; if you do one, wait at least 3 months.',
    buy: 'A pharmacy cholecalciferol 1,000 IU tablet or capsule (often sold as “D3 1K”), e.g. Uprise-D3 1000 IU (Alkem). We found no vitamin D product sold in India with independent testing, so this is an example, not an endorsement.',
    cost: '≈ ₹160/month',
    refs: ['odsVitD', 'demay2024', 'kalra2025', 'icmr2020', 'efsaVitD2023', 'sanders2010', 'jolliffe2025'],
  },
  {
    name: 'Vitamin B12',
    verdict: 'Recommended',
    dose: 'If your doctor agrees: a 3-month course of 500 µg a day, after the test below.',
    why: 'If your level is in NICE’s “indeterminate” range (180–350 pg/mL; see Blood results). Indian vegetarians are a high-risk group for low B12. The plans’ B12 comes from milk, curd and eggs (the “What your diet covers” table shows how much; the RDA is 2.2 µg), but boiling losses and variable absorption make food alone uncertain at a borderline level.',
    cautions: 'Order: (1) test active B12 (holotranscobalamin) before the first tablet — once you start, it stops being informative; (2) take the 3-month course; (3) retest at the end; (4) your doctor decides whether you need more, and how much. Take B12 alone, not with B6.',
    buy: 'B12 alone, not a “neuro” combination with B6, folic acid or alpha-lipoic acid, so you know each dose. Methylcobalamin (common in India, e.g. Mecobal 500) is not better or worse than cyanocobalamin. We found no independently tested B12 product in India.',
    cost: '≈ ₹315/month for the 3-month course',
    refs: ['niceB12', 'bshB12', 'yajnik2006', 'pawlak', 'refsum2001', 'odsB12'],
  },
  {
    name: 'Creatine monohydrate',
    verdict: 'Optional',
    dose: '3–5 g a day, any time; no loading phase',
    why: 'The best-supported supplement for strength and muscle gain, and safe in healthy adults. Useful but not necessary: the plan works without it.',
    cautions: 'A 2009 study (25 g/day loading, hair not measured) found a rise in DHT. A 2025 trial (5 g/day for 12 weeks) found no change in DHT, hair density or hair thickness. So the evidence does not support a hair effect, but if you would rather not change anything before the dermatologist sees your hair, start after the visit. It raises blood creatinine without harming the kidneys, so mention it before blood tests.',
    buy: 'Plain creatine monohydrate, no blends. Optimum Nutrition Micronized Creatine sold in India is Informed Choice certified, which tests for banned substances (not label accuracy).',
    cost: '≈ ₹400–600/month',
    refs: ['issnCreatine', 'antonioCreatine', 'vanDerMerwe', 'lak2025', 'informedChoice'],
  },
  {
    name: 'Multivitamin',
    verdict: 'Not recommended',
    why: 'The diet table above shows your plan already covers calcium, iron, vitamin C, folate and iodine. The two real gaps (vitamin D and B12) are better covered by single products whose dose you control. FSSAI caps supplements at about one RDA per nutrient, so an Indian multivitamin contains about 2.2 µg of B12 — too little to raise a low-normal level, given how little of each dose is absorbed. In healthy adults, multivitamins have not been shown to prevent disease or lower mortality.',
    refs: ['uspstf2022', 'loftfield2024', 'kashyap2024'],
  },
  {
    name: 'Whey or soy protein powder',
    verdict: 'Not recommended',
    dose: 'Only if you regularly miss your protein target: 1 scoop (~25 g protein)',
    why: 'Not needed: all three plans reach the phase protein targets (~90 g rising to 110–125 g) from food, and ICMR advises against routine protein powders. A 2024 Indian study found many popular protein powders short of their labelled protein, and some contained fungal toxins or pesticide residues. The food equivalent of 1 scoop is 300 ml milk + 20 g soya chunks, or 100 g paneer, at a fraction of the cost.',
    buy: 'If you ever buy one: a product listed on a certifier’s own website (e.g. GNC Pro Performance 100% Whey is Informed Choice certified), not one that only claims “lab tested”.',
    cost: '≈ ₹1,000–3,800/month at 1 scoop a day, depending on brand',
    refs: ['morton', 'icmr2024', 'philips2024', 'informedChoice'],
  },
  {
    name: 'Omega-3 (fish or algal oil)',
    verdict: 'Not recommended',
    why: 'No clear benefit for your goals or your hair. The non-veg plan includes fish once a week; plant omega-3 (ALA) from flaxseed and rice-bran oil is in the diet table above. High-dose EPA/DHA (> 1.5 g a day) raised atrial fibrillation risk in trials of people at high heart risk.',
    refs: ['odsOmega3', 'abuknesha2026'],
  },
  {
    name: 'Iron, zinc, biotin, “hair growth” blends',
    verdict: 'Not recommended',
    why: 'Take these only for a deficiency a test has shown (ferritin and zinc are on the to-do list), and the diet table above shows what the plans give of both. Extra zinc can cause copper deficiency (anaemia, nerve problems). Biotin helps only if you are deficient, which is rare, and at hair-supplement doses (5–10 mg) it distorts many blood tests, including thyroid, vitamin D and ferritin. If a test shows a deficiency, treat that one nutrient.',
    refs: ['guoKatta', 'trost', 'duncan2015', 'li2017', 'fdaBiotin', 'biotinThyroid', 'odsZinc'],
  },
];

/** Shown under the supplement list. Supplement costs are kept out of the food budget. */
export const SUPPLEMENT_NOTES = [
  'Following the recommendations costs ≈ ₹480 a month for the 3-month B12 course (with vitamin D), then ≈ ₹160 a month for vitamin D, unless your doctor continues B12. Supplements are costed separately from the food budget. Creatine would add ≈ ₹400–600.',
  'Quality in India: we found no vitamin D or B12 product with independent third-party testing. Pharmacy products are regulated as medicines, but CDSCO’s monthly “Not of Standard Quality” alerts have included vitamin D3 sachets and B12 products, and a 2013 study found Indian vitamin D products containing 9–165% of the labelled dose. Buy from a pharmacy, prefer large manufacturers, check the expiry date, and treat a retest as the real check.',
  'Certifications mean different things. Informed Choice tests only for banned substances. NSF Certified for Sport also checks label claims and contaminants, but lists no products sold in India. Trustified (India) buys products from shops and blind-tests them for contaminants. “Lab tested” on a pack, without a named tester, means little.',
  'Read the dose per tablet: vitamin D is often sold as 60,000 IU, which is a weekly treatment dose. No supplement is free of side effects; the doses above are the lowest that do the job, and stay well below the levels where harm has been seen or suspected.',
  'Tell your doctor about any supplement before a blood test, and if you start a prescription medicine.',
];

/** Sources for the notes above. */
export const SUPPLEMENT_NOTE_REFS: RefId[] = ['cdscoNsq', 'khadgawat2013', 'informedChoice', 'nsfSport', 'trustified'];

export const HEALTH_DISCLAIMER =
  'This page explains your results in plain language and suggests questions for your doctor. It does not diagnose anything or replace a consultation. Reference ranges vary between laboratories.';
