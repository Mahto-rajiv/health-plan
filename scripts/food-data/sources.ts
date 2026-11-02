// Where every food's nutrient values come from. `npm run food-data` reads this
// file, downloads the two public datasets below, and writes
// lib/data/composition.generated.ts. Nothing in that file is typed by hand.
//
// 1. IFCT 2017: Indian Food Composition Tables (Longvah et al., ICMR-NIN).
//    Read from the machine-readable copy in the `ifct2017` npm package
//    (v2.1.2, pinned by hash in build.ts). Rows were spot-checked against the
//    ICMR-NIN PDF (groundnut protein 23.65 g, guava vitamin C 214 mg, spinach
//    folate 142 µg per 100 g all match).
// 2. USDA SR28: National Nutrient Database for Standard Reference, Release 28
//    (the same data as FoodData Central "SR Legacy"). Used for foods IFCT
//    doesn't have (oats, curd, toned milk, oils, soya chunks, some seeds), for
//    vitamin B12 (IFCT doesn't report it), and for edible share (the "refuse"
//    field: peel, seeds, pods, cores).
//
// Rules:
// • IFCT first, because it measures Indian foods. USDA only where IFCT has no
//   matching food or no value.
// • Several IFCT codes in a list are averaged (e.g. the seven mango varieties).
// • `b12: 0` marks plant foods: B12 is not found in plants, so 0 is a fact, not
//   a gap. Any other missing value stays `null` and the app shows it as a gap.
// • Vitamin D is not taken from either table: IFCT reports vitamin D in plant
//   foods (e.g. 13 µg/100 g in atta) at levels other tables don't show, and
//   food is a minor source anyway. The plan covers it with sunlight and the
//   1,000 IU supplement on the Health page.
// • Iodine is in neither table; it comes from iodised salt.

export interface FoodSource {
  /** IFCT 2017 food code(s). A list is averaged. */
  ifct?: string | string[];
  /** USDA SR28 NDB number, used when there is no IFCT food. */
  usda?: string;
  /** USDA NDB number for vitamin B12 when the main source is IFCT; 0 for plant foods. */
  b12?: string | 0;
  /** USDA NDB number whose "refuse" gives the edible share of the food as bought. */
  refuse?: string;
  /** Edible share when no USDA refuse value fits (marked as an approximation in the app). */
  edibleApprox?: number;
  /** Single nutrients filled from an IFCT food when the main (USDA) source has none. */
  fillFromIfct?: Partial<Record<'biotin', string>>;
  /** Why this match was chosen, and its limits. */
  note: string;
}

export const SOURCES: Record<string, FoodSource> = {
  // Dairy
  milk: { usda: '01211', fillFromIfct: { biotin: 'L002' }, note: 'USDA whole milk, 3.25% fat, no added vitamins A or D. Toned milk is 3.0% fat (FSSAI), so fat is ~8% high. IFCT has only whole cow and buffalo milk; biotin (missing in USDA) is from IFCT cow milk.' },
  curd: { usda: '01116', fillFromIfct: { biotin: 'L002' }, note: 'USDA plain whole-milk yogurt. IFCT has no curd; biotin (missing in USDA) is from IFCT cow milk, the milk it is set from.' },
  paneer: { ifct: 'L003', b12: '01036', note: 'IFCT paneer. B12 from USDA whole-milk ricotta (a similar fresh acid-set cheese).' },
  ghee: { usda: '01003', note: 'USDA anhydrous butter oil (ghee). IFCT has no ghee.' },
  oil: { usda: '04037', note: 'USDA rice-bran oil. Chosen over groundnut oil (USDA 04042) because it has twice the vitamin E (32 vs 16 mg/100 g) and some omega-3.' },
  // Pulses & soya
  sattu: { ifct: 'B001', b12: 0, note: 'IFCT Bengal gram dal. IFCT has no roasted chana flour; roasting mainly removes water, so values per 100 g are close but not exact.' },
  roastedChana: { ifct: 'B001', b12: 0, note: 'IFCT Bengal gram dal (unroasted).' },
  moongWhole: { ifct: 'B011', b12: 0, note: 'IFCT green gram, whole.' },
  moongDal: { ifct: 'B010', b12: 0, note: 'IFCT green gram, dal.' },
  toorDal: { ifct: 'B021', b12: 0, note: 'IFCT red gram, dal.' },
  kalaChana: { ifct: 'B002', b12: 0, note: 'IFCT Bengal gram, whole.' },
  kabuliChana: { usda: '16056', note: 'USDA chickpeas, raw. IFCT has no kabuli chana.' },
  rajma: { ifct: 'B020', b12: 0, note: 'IFCT rajmah, red.' },
  soyaChunks: { usda: '16117', note: 'USDA defatted soy flour, which soya chunks are extruded from. Pack labels (≈ 52 g protein, 13 g fibre) differ by a few grams.' },
  besan: { ifct: 'B001', b12: 0, note: 'IFCT Bengal gram dal; besan is ground chana dal.' },
  // Grains & flours
  oats: { usda: '08120', note: 'USDA rolled oats, not fortified. IFCT has no oats.' },
  atta: { ifct: 'A019', b12: 0, note: 'IFCT wheat flour, atta.' },
  daliya: { ifct: 'A021', b12: 0, note: 'IFCT wheat, bulgur.' },
  rice: { ifct: 'A015', b12: 0, note: 'IFCT rice, raw, milled.' },
  poha: { ifct: 'A011', b12: 0, note: 'IFCT rice flakes.' },
  // Nuts & seeds
  peanuts: { ifct: 'H012', b12: 0, note: 'IFCT groundnut.' },
  pumpkinSeeds: { usda: '12014', note: 'USDA pumpkin seed kernels, dried.' },
  flax: { ifct: 'H014', b12: 0, note: 'IFCT linseeds.' },
  sunflowerSeeds: { ifct: 'H020', b12: 0, note: 'IFCT sunflower seeds (kernels).' },
  almonds: { ifct: 'H001', b12: 0, note: 'IFCT almond.' },
  walnuts: { ifct: 'H021', b12: 0, note: 'IFCT walnut.' },
  cashews: { ifct: 'H005', b12: 0, note: 'IFCT cashew nut.' },
  // Fruit
  raisins: { ifct: 'E057', b12: 0, note: 'IFCT raisins, black.' },
  dates: { ifct: 'E018', b12: 0, refuse: '09087', note: 'IFCT dates, dry, dark brown. Edible share from USDA (pits 10%).' },
  banana: { ifct: 'E012', b12: 0, refuse: '09040', note: 'IFCT banana, robusta. Peel from USDA (36%).' },
  papaya: { ifct: 'E049', b12: 0, refuse: '09226', note: 'IFCT papaya, ripe. Seeds and skin from USDA (38%).' },
  guava: { ifct: 'E028', b12: 0, refuse: '09139', note: 'IFCT guava, white flesh. Refuse from USDA (22%).' },
  orange: { ifct: 'E047', b12: 0, refuse: '09200', note: 'IFCT orange pulp. Peel and seeds from USDA (27%).' },
  muskmelon: { ifct: 'E045', b12: 0, refuse: '09181', note: 'IFCT musk melon, orange flesh. Rind and seeds from USDA cantaloupe (49%).' },
  mango: { ifct: ['E036', 'E037', 'E038', 'E039', 'E040', 'E041', 'E042'], b12: 0, refuse: '09176', note: 'Average of the 7 ripe mango varieties in IFCT. Seed and skin from USDA (29%).' },
  apple: { ifct: 'E001', b12: 0, refuse: '09003', note: 'IFCT apple, big. Core and stem from USDA (10%).' },
  lemon: { ifct: 'E033', b12: 0, edibleApprox: 0.4, note: 'IFCT lemon juice. Juice share of a whole lemon (~40%) is an approximation.' },
  // Vegetables
  spinach: { ifct: 'C033', b12: 0, refuse: '11457', note: 'IFCT spinach. Stems and roots from USDA (28%).' },
  amaranth: { ifct: 'C002', b12: 0, refuse: '11003', note: 'IFCT amaranth leaves, green (chaulai). Stems from USDA (6%).' },
  potato: { ifct: 'F006', b12: 0, refuse: '11352', note: 'IFCT potato, brown skin. Peel from USDA (25%).' },
  sweetPotato: { ifct: 'F013', b12: 0, refuse: '11507', note: 'IFCT sweet potato. Peel from USDA (28%).' },
  beetroot: { ifct: 'F001', b12: 0, refuse: '11080', note: 'IFCT beetroot. Peel and tops from USDA (33%).' },
  peas: { ifct: 'D061', b12: 0, refuse: '11304', note: 'IFCT peas, fresh. Bought in the pod: pods are 62% of the weight (USDA).' },
  cauliflower: { ifct: 'D036', b12: 0, refuse: '11135', note: 'IFCT cauliflower. Leaves, stalk and core from USDA (61%).' },
  carrot: { ifct: 'F002', b12: 0, refuse: '11124', note: 'IFCT carrot, orange. Trimmings from USDA (11%).' },
  radish: { ifct: 'F010', b12: 0, refuse: '11429', note: 'IFCT radish, white. Trimmings from USDA (10%).' },
  bottleGourd: { ifct: 'D007', b12: 0, refuse: '11218', note: 'IFCT bottle gourd (lauki). Skin and seeds from USDA calabash (30%).' },
  okra: { ifct: 'D056', b12: 0, refuse: '11278', note: 'IFCT ladies finger (bhindi). Crown and tips from USDA (14%).' },
  pumpkin: { ifct: 'D066', b12: 0, refuse: '11422', note: 'IFCT pumpkin, orange (kaddu). Rind and seeds from USDA (30%).' },
  brinjal: { ifct: 'D031', b12: 0, refuse: '11209', note: 'IFCT brinjal, all varieties. Trimmings from USDA (19%).' },
  frenchBeans: { ifct: 'D049', b12: 0, refuse: '11052', note: 'IFCT French beans. Ends and strings from USDA (12%).' },
  cucumber: { ifct: 'D043', b12: 0, refuse: '11205', note: 'IFCT cucumber. Ends from USDA (3%).' },
  onion: { ifct: 'G017', b12: 0, refuse: '11282', note: 'IFCT onion, big. Skin and ends from USDA (10%).' },
  tomato: { ifct: 'D076', b12: 0, refuse: '11529', note: 'IFCT tomato, ripe, local. Core from USDA (9%).' },
  capsicum: { ifct: 'D033', b12: 0, refuse: '11333', note: 'IFCT capsicum, green. Seeds and core from USDA (18%).' },
  // Eggs, meat & fish
  egg: { ifct: 'M001', b12: '01123', note: 'IFCT egg, whole, raw. B12 from USDA whole egg. Bought by count; grams are without the shell.' },
  chicken: { ifct: 'N001', b12: '05043', note: 'IFCT chicken leg, skinless (curry cut). B12 from USDA dark meat.' },
  fish: { ifct: 'S006', b12: '15008', note: 'IFCT rohu. B12 from USDA carp (same family).' },
};
