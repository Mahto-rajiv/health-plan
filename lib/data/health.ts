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
      'Guidelines disagree on this number. By the US National Academies (IOM) standard, ≥ 20 ng/mL is adequate for most people. The 2011 Endocrine Society guideline called 21–29 “insufficient”. Its 2024 update no longer defines a target level and advises against routine testing in healthy adults. A 2025 Indian expert consensus calls 20–30 “insufficient”. So this is borderline, not a deficiency. A modest daily dose plus sunlight is a reasonable, low-risk step.',
    refs: ['odsVitD', 'holick2011', 'demay2024', 'kalra2025'],
  },
  {
    name: 'Vitamin B12',
    value: '299',
    unit: 'pg/mL',
    labRange: '≈ 200–900 pg/mL',
    status: 'low-normal',
    group: 'Vitamins',
    meaning:
      'Within the lab range but near the lower edge. NICE (2024) calls 180–350 “indeterminate”: deficiency is possible, and an active B12 (holotranscobalamin), MMA or homocysteine test can clarify it. Indian vegetarians are at high risk of slowly falling B12. Your normal haemoglobin and MCV are reassuring.',
    refs: ['niceB12', 'bshB12', 'pawlak', 'yajnik2006'],
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
    'Active B12 (holotranscobalamin) or homocysteine to clarify the borderline B12, before the first B12 tablet if you want a firm diagnosis',
    'Whether your vitamin D level needs anything beyond a standard daily dose',
  ],
  nutrition: [
    { title: 'Weight loss and low intake', body: 'Losing weight and eating too little — especially too little protein — over the past 6 months is a recognised trigger for diffuse shedding (telogen effluvium), which typically starts 2–4 months after the trigger. That fits your timeline. It is plausible, not certain: the AAD gives “lost 20 pounds (~9 kg) or more” as a typical trigger, and your loss is smaller (see the to-do above). A dermatologist must confirm the cause. Eating enough is right for your health anyway, but nutrition cannot be shown to cure hair loss.', level: 'Reasonable' },
    { title: 'Iron stores', body: 'Your blood iron markers are normal. Ferritin hasn’t been measured. Evidence linking low-normal ferritin to hair loss is mixed, but it’s cheap to check. The plans include iron foods (dals, soya, atta, greens, pumpkin seeds) with vitamin C from the fruit and vegetables. The diet table below shows how much.', level: 'Mixed' },
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
    why: 'Food gives you almost none. Guidelines read 22.3 ng/mL differently: adequate by the US standard (≥ 20), “insufficient” by the 2025 Indian expert consensus (20–30). The Endocrine Society (2024) advises only the normal daily intake (600 IU) for healthy adults under 50. 1,000 IU a day sits between them: above the ICMR need of 600 IU and a quarter of the 4,000 IU upper limit.',
    cautions: 'The Indian consensus suggests 60,000 IU weekly for 8 weeks at this level. Take that only if a doctor prescribes it, and then not on top of the daily tablet. Avoid single doses of 100,000 IU or more: very large yearly doses increased falls and fractures in older women. Expect modest benefits: a 2025 meta-analysis of 40 trials found only a small drop in respiratory infections. A retest is optional; if you do one, wait at least 3 months.',
    buy: 'A pharmacy cholecalciferol 1,000 IU tablet or capsule (often sold as “D3 1K”), e.g. Uprise-D3 1000 IU (Alkem). We found no vitamin D product sold in India with independent testing, so this is an example, not an endorsement.',
    cost: '≈ ₹160/month',
    refs: ['odsVitD', 'demay2024', 'kalra2025', 'icmr2020', 'efsaVitD2023', 'sanders2010', 'jolliffe2025'],
  },
  {
    name: 'Vitamin B12',
    verdict: 'Recommended',
    dose: 'If your doctor agrees: a 3-month course of 500 µg a day, after the test below.',
    why: 'Your level (299 pg/mL) is in NICE’s “indeterminate” range (180–350), and Indian vegetarians are a high-risk group for low B12. The plans’ B12 comes from milk, curd and eggs (the “What your diet covers” table shows how much; the RDA is 2.2 µg), but boiling losses and variable absorption make food alone uncertain at a borderline level.',
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
    why: 'Your iron markers are normal, zinc hasn’t been tested, and the diet table above shows what the plans give of both. Extra zinc can cause copper deficiency (anaemia, nerve problems). Biotin helps only if you are deficient, which is rare, and at hair-supplement doses (5–10 mg) it distorts many blood tests, including thyroid, vitamin D and ferritin. If a test shows a deficiency, treat that one nutrient.',
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
