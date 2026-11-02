import type { NutrientKey } from './nutrient-keys';
import type { RefId } from './references';

// Reference intakes for a man aged 24 (per day).
//
// • ICMR-NIN 2020 first (Table 3, adult men). ICMR says the EAR, not the RDA,
//   is the value for planning an individual's diet, so the plans must reach the
//   EAR every week and get as close to the RDA as the other rules allow.
// • Nutrients ICMR's summary doesn't list use the US/Canadian DRIs (National
//   Academies), as published by Health Canada: males 19–30.
// • Upper limits (UL) are the National Academies values. Where a UL applies only
//   to supplements or synthetic forms, it is not checked against food.
//
// What a "hair" flag means: the nutrient is one whose deficiency is linked to
// hair loss in the dermatology reviews cited (Almohanna 2019; Guo & Katta 2017).
// Getting enough prevents a deficiency; it does not make hair grow faster, and
// extra above the requirement has no shown benefit.

export type NutrientGroup = 'Minerals' | 'Vitamins' | 'Fats';

export interface NutrientInfo {
  key: NutrientKey;
  label: string;
  unit: 'g' | 'mg' | 'µg';
  group: NutrientGroup;
  /** Estimated average requirement: the planning floor. */
  ear?: number;
  /** RDA, or AI when `adequateIntake` is set. */
  rda?: number;
  adequateIntake?: boolean;
  /** Tolerable upper intake from food + supplements; omitted when it applies to supplements only. */
  ul?: number;
  source: RefId[];
  hair?: boolean;
  /** Shown next to the number. */
  note?: string;
  /** Only shown, never a target (e.g. sodium from food alone). */
  infoOnly?: boolean;
}

export const NUTRIENTS: NutrientInfo[] = [
  // Minerals
  { key: 'iron', label: 'Iron', unit: 'mg', group: 'Minerals', ear: 11, rda: 19, ul: 45, source: ['icmr2020', 'driElements'], hair: true, note: 'ICMR’s values already allow for the lower absorption of iron from plant foods.' },
  { key: 'zinc', label: 'Zinc', unit: 'mg', group: 'Minerals', ear: 14, rda: 17, ul: 40, source: ['icmr2020', 'driElements'], hair: true, note: 'ICMR’s values assume a high-phytate Indian diet.' },
  { key: 'calcium', label: 'Calcium', unit: 'mg', group: 'Minerals', ear: 800, rda: 1000, ul: 2500, source: ['icmr2020', 'driElements'] },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg', group: 'Minerals', ear: 370, rda: 440, source: ['icmr2020'], note: 'The upper limit (350 mg) applies to supplements only.' },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg', group: 'Minerals', ear: 580, rda: 700, ul: 4000, source: ['driElements'] },
  { key: 'potassium', label: 'Potassium', unit: 'mg', group: 'Minerals', rda: 3400, adequateIntake: true, source: ['driElements'] },
  { key: 'copper', label: 'Copper', unit: 'mg', group: 'Minerals', ear: 0.7, rda: 0.9, ul: 10, source: ['driElements'] },
  { key: 'selenium', label: 'Selenium', unit: 'µg', group: 'Minerals', ear: 45, rda: 55, ul: 400, source: ['driElements'], hair: true, note: 'Too much selenium causes hair loss; food alone rarely gets near the limit.' },
  { key: 'manganese', label: 'Manganese', unit: 'mg', group: 'Minerals', rda: 2.3, adequateIntake: true, ul: 11, source: ['driElements'] },
  { key: 'sodium', label: 'Sodium (from food only)', unit: 'mg', group: 'Minerals', source: ['whoSalt'], infoOnly: true, note: 'Salt is not counted. Keep salt to about 5 g a day (WHO), iodised.' },
  // Vitamins
  { key: 'vitA', label: 'Vitamin A', unit: 'µg', group: 'Vitamins', ear: 460, rda: 1000, source: ['icmr2020'], hair: true, note: 'µg retinol activity equivalents; plant β-carotene counted at 12:1 (US IOM). The upper limit applies to retinol only, which food here gives little of. Too much retinol (supplements) causes hair loss.' },
  { key: 'thiamin', label: 'Thiamine (B1)', unit: 'mg', group: 'Vitamins', ear: 1.5, rda: 1.8, source: ['icmr2020'] },
  { key: 'riboflavin', label: 'Riboflavin (B2)', unit: 'mg', group: 'Vitamins', ear: 2.1, rda: 2.5, source: ['icmr2020'], hair: true },
  { key: 'niacin', label: 'Niacin (B3)', unit: 'mg', group: 'Vitamins', ear: 15, rda: 18, source: ['icmr2020', 'driVitamins'], note: 'Niacin equivalents: niacin in food plus what the body makes from tryptophan in protein (1 mg per 60 mg tryptophan, US IOM).' },
  { key: 'b6', label: 'Vitamin B6', unit: 'mg', group: 'Vitamins', ear: 2.1, rda: 2.4, source: ['icmr2020'] },
  { key: 'folate', label: 'Folate (B9)', unit: 'µg', group: 'Vitamins', ear: 250, rda: 300, source: ['icmr2020'], hair: true, note: 'Food folate. Cooking destroys some of it; the numbers are for raw food.' },
  { key: 'b12', label: 'Vitamin B12', unit: 'µg', group: 'Vitamins', ear: 2, rda: 2.2, source: ['icmr2020', 'usdaSr28'], hair: true, note: 'Only animal foods contain it. Boiling milk destroys some, so treat the total as an upper estimate.' },
  { key: 'vitC', label: 'Vitamin C', unit: 'mg', group: 'Vitamins', ear: 65, rda: 80, ul: 2000, source: ['icmr2020', 'driVitamins'], note: 'Helps the body absorb plant iron when eaten in the same meal. Raw-food values; cooking destroys some.' },
  { key: 'vitE', label: 'Vitamin E', unit: 'mg', group: 'Vitamins', ear: 12, rda: 15, source: ['driVitamins'], hair: true, note: 'α-tocopherol. The upper limit applies to synthetic vitamin E only.' },
  { key: 'vitK', label: 'Vitamin K', unit: 'µg', group: 'Vitamins', rda: 120, adequateIntake: true, source: ['driVitamins'] },
  { key: 'biotin', label: 'Biotin (B7)', unit: 'µg', group: 'Vitamins', rda: 30, adequateIntake: true, source: ['driVitamins'], hair: true, note: 'Deficiency is rare. Biotin supplements don’t help hair unless you are deficient, and they distort many blood tests.' },
  // Fats
  { key: 'ala', label: 'Omega-3 (ALA)', unit: 'g', group: 'Fats', rda: 2.2, adequateIntake: true, source: ['icmr2020', 'driMacros'], note: 'ICMR 2020 gives 2.2 g of n-3 fat a day; the US adequate intake is 1.6 g.' },
  { key: 'la', label: 'Omega-6 (linoleic acid)', unit: 'g', group: 'Fats', rda: 6.6, adequateIntake: true, source: ['icmr2020'], note: 'ICMR 2020 minimum. Rice-bran oil and peanuts give plenty.' },
];

export const NUTRIENT_BY_KEY = Object.fromEntries(NUTRIENTS.map((n) => [n.key, n])) as Record<NutrientKey, NutrientInfo | undefined>;

/** Not computed from food, and why. Shown in the audit so the gap is visible. */
export const NOT_COMPUTED: { label: string; why: string; source: RefId[] }[] = [
  {
    label: 'Vitamin D',
    why: 'Food is a minor source. IFCT reports vitamin D in plant foods at levels other tables don’t show, so the app doesn’t count it. Covered by sunlight and the 1,000 IU vitamin D3 on the Health page; ICMR’s EAR is 400 IU.',
    source: ['icmr2020'],
  },
  {
    label: 'Iodine',
    why: 'Neither food table has it. Use iodised salt (about 5 g a day). ICMR’s EAR is 95 µg.',
    source: ['icmr2020'],
  },
];
