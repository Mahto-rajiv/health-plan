// ─── References ───────────────────────────────────────────────────────────────
// Every entry was checked against PubMed or the publisher/organisation page in
// October 2026 (re-checked 21 Oct 2026: all resolve except the NIH ODS fact
// sheets and the EFSA DOI target, which block automated checks). `note` flags limitations that matter for how much weight a
// recommendation should carry.

export interface Reference {
  label: string;
  url: string;
  note?: string;
}

export const REFS = {
  mifflin: { label: 'Mifflin MD et al. (1990). A new predictive equation for resting energy expenditure. Am J Clin Nutr.', url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/' },
  frankenfield: { label: 'Frankenfield D et al. (2005). Comparison of predictive equations for resting metabolic rate. J Am Diet Assoc.', url: 'https://pubmed.ncbi.nlm.nih.gov/15883556/', note: 'Individual errors above 10% are common; South Asians were under-represented.' },
  faoEnergy: { label: 'FAO/WHO/UNU (2004). Human energy requirements — physical activity levels.', url: 'https://www.fao.org/4/y5686e/y5686e07.htm' },
  icmr2020: { label: 'ICMR-NIN (2020). Nutrient Requirements for Indians — brief note.', url: 'https://www.nin.res.in/rdabook/brief_note.pdf' },
  iomPlanning2003: {
    label: 'Institute of Medicine (2003). Dietary Reference Intakes: Applications in Dietary Planning. National Academies Press.',
    url: 'https://www.nationalacademies.org/read/10609',
    note: 'The planning goal for an individual is intake at the RDA or AI. Checked against the publisher’s summary only: the online chapters are page images that could not be read automatically.',
  },
  icmr2024: { label: 'ICMR-NIN (2024). Dietary Guidelines for Indians — summary by Nutrition Connect (GAIN).', url: 'https://nutritionconnect.org/resource-center/dietary-guidelines-indians-2024-edition-icmr-nin', note: 'The official ICMR PDF link stopped resolving in Oct 2026; this page summarises the same guidelines.' },
  iraki: { label: 'Iraki J et al. (2019). Nutrition recommendations for bodybuilders in the off-season. Sports.', url: 'https://pubmed.ncbi.nlm.nih.gov/31247944/' },
  helms2023: { label: 'Helms ER et al. (2023). Effect of small and large energy surpluses on strength, muscle and fat. Sports Med Open.', url: 'https://pubmed.ncbi.nlm.nih.gov/37914977/', note: 'Trained lifters, not beginners; small sample (17 completers), 8 weeks.' },
  garthe: { label: 'Garthe I et al. (2013). Effect of nutritional intervention on body composition in elite athletes. Eur J Sport Sci.', url: 'https://pubmed.ncbi.nlm.nih.gov/23679146/' },
  benito: { label: 'Benito PJ et al. (2020). Effect of resistance training on whole-body muscle growth in healthy adult males: meta-analysis. IJERPH.', url: 'https://pubmed.ncbi.nlm.nih.gov/32079265/' },
  slater: { label: 'Slater GJ et al. (2019). Is an energy surplus required to maximize skeletal muscle hypertrophy? Front Nutr.', url: 'https://pubmed.ncbi.nlm.nih.gov/31482093/' },
  whoAsianBmi: { label: 'WHO Expert Consultation (2004). Appropriate BMI for Asian populations. Lancet.', url: 'https://pubmed.ncbi.nlm.nih.gov/14726171/' },
  misra: { label: 'Misra A et al. (2009). Consensus statement for diagnosis of obesity in Asian Indians. J Assoc Physicians India.', url: 'https://pubmed.ncbi.nlm.nih.gov/19582986/' },
  morton: { label: 'Morton RW et al. (2018). Protein supplementation and resistance-training gains: meta-analysis. Br J Sports Med.', url: 'https://pubmed.ncbi.nlm.nih.gov/28698222/' },
  schoenfeldAragon: { label: 'Schoenfeld BJ, Aragon AA (2018). How much protein can the body use in a single meal? JISSN.', url: 'https://pubmed.ncbi.nlm.nih.gov/29497353/' },
  heviaLarrain: { label: 'Hevia-Larraín V et al. (2021). High-protein plant-based vs omnivorous diet for muscle gains. Sports Med.', url: 'https://pubmed.ncbi.nlm.nih.gov/33599941/' },
  devries: { label: 'Devries MC et al. (2018). Protein intake and kidney function in healthy adults: meta-analysis. J Nutr.', url: 'https://pubmed.ncbi.nlm.nih.gov/30383278/' },
  whoFats: { label: 'WHO (2023). Updated guidelines on fats and carbohydrates.', url: 'https://www.who.int/news/item/17-07-2023-who-updates-guidelines-on-fats-and-carbohydrates' },
  efsaWater: { label: 'EFSA NDA Panel (2010). Dietary reference values for water. EFSA Journal.', url: 'https://doi.org/10.2903/j.efsa.2010.1459' },
  namWater: { label: 'National Academies (2004). Dietary reference intakes for water, potassium, sodium.', url: 'https://www.nationalacademies.org/news/report-sets-dietary-intake-levels-for-water-salt-and-potassium-to-maintain-health-and-reduce-chronic-disease-risk' },
  acsm2009: { label: 'ACSM (2009). Progression models in resistance training for healthy adults. Med Sci Sports Exerc.', url: 'https://pubmed.ncbi.nlm.nih.gov/19204579/' },
  acsm2026: { label: 'Currier BS et al. (2026). ACSM position stand: resistance training prescription. Med Sci Sports Exerc.', url: 'https://pubmed.ncbi.nlm.nih.gov/41843416/' },
  schoenfeldVolume: { label: 'Schoenfeld BJ et al. (2017). Dose–response of weekly training volume and muscle growth. J Sports Sci.', url: 'https://pubmed.ncbi.nlm.nih.gov/27433992/' },
  pelland: { label: 'Pelland JC et al. (2026). Resistance-training dose–response meta-regressions. Sports Med.', url: 'https://pubmed.ncbi.nlm.nih.gov/41343037/' },
  schoenfeldFrequency: { label: 'Schoenfeld BJ et al. (2016). Effects of training frequency on hypertrophy. Sports Med.', url: 'https://pubmed.ncbi.nlm.nih.gov/27102172/' },
  zourdos: { label: 'Zourdos MC et al. (2016). Novel RPE scale measuring repetitions in reserve. J Strength Cond Res.', url: 'https://pubmed.ncbi.nlm.nih.gov/26049792/' },
  singer: { label: 'Singer A et al. (2024). Inter-set rest and muscle hypertrophy: Bayesian meta-analysis. Front Sports Act Living.', url: 'https://pubmed.ncbi.nlm.nih.gov/39205815/' },
  schoenfeldRest: { label: 'Schoenfeld BJ et al. (2016). Longer inter-set rest periods enhance muscle strength and hypertrophy. J Strength Cond Res.', url: 'https://pubmed.ncbi.nlm.nih.gov/26605807/' },
  bellDeload: { label: 'Bell L et al. (2023). Integrating deloading into strength and physique sports training programmes: an international Delphi consensus. Sports Med Open.', url: 'https://pubmed.ncbi.nlm.nih.gov/37730925/', note: 'Expert opinion.' },
  colemanDeload: { label: 'Coleman M et al. (2024). A one-week deload during resistance training. PeerJ.', url: 'https://pubmed.ncbi.nlm.nih.gov/38274324/' },
  who2020: { label: 'Bull FC et al. (2020). WHO 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med.', url: 'https://pubmed.ncbi.nlm.nih.gov/33239350/' },
  schumann: { label: 'Schumann M et al. (2022). Compatibility of concurrent aerobic and strength training: meta-analysis. Sports Med.', url: 'https://pubmed.ncbi.nlm.nih.gov/34757594/' },
  paluch: { label: 'Paluch AE et al. (2022). Daily steps and all-cause mortality: meta-analysis of 15 cohorts. Lancet Public Health.', url: 'https://pubmed.ncbi.nlm.nih.gov/35247352/', note: 'Observational.' },
  dunstan: { label: 'Dunstan DW et al. (2012). Breaking up prolonged sitting reduces postprandial glucose and insulin. Diabetes Care.', url: 'https://pubmed.ncbi.nlm.nih.gov/22374636/' },
  konrad: { label: 'Konrad A et al. (2024). Chronic effects of stretching on range of motion: meta-analysis. J Sport Health Sci.', url: 'https://pubmed.ncbi.nlm.nih.gov/37301370/' },
  alizadeh: { label: 'Alizadeh S et al. (2023). Resistance training induces improvements in range of motion: meta-analysis. Sports Med.', url: 'https://pubmed.ncbi.nlm.nih.gov/36622555/' },
  behm: { label: 'Behm DG et al. (2016). Acute effects of muscle stretching on physical performance. Appl Physiol Nutr Metab.', url: 'https://pubmed.ncbi.nlm.nih.gov/26642915/' },
  aasmSleep: { label: 'Watson NF et al. (2015). Recommended amount of sleep for a healthy adult (AASM/SRS). Sleep.', url: 'https://pubmed.ncbi.nlm.nih.gov/26039963/' },
  nedeltcheva: { label: 'Nedeltcheva AV et al. (2010). Insufficient sleep undermines dietary efforts to reduce adiposity. Ann Intern Med.', url: 'https://pubmed.ncbi.nlm.nih.gov/20921542/', note: 'Small study in dieting adults; indirect for muscle gain.' },
  windred: { label: 'Windred DP et al. (2024). Sleep regularity is a stronger predictor of mortality than sleep duration. Sleep.', url: 'https://pubmed.ncbi.nlm.nih.gov/37738616/', note: 'Observational.' },
  issnCreatine: { label: 'Kreider RB et al. (2017). ISSN position stand: safety and efficacy of creatine supplementation. JISSN.', url: 'https://pubmed.ncbi.nlm.nih.gov/28615996/' },
  antonioCreatine: { label: 'Antonio J et al. (2021). Common questions and misconceptions about creatine supplementation. JISSN.', url: 'https://pubmed.ncbi.nlm.nih.gov/33557850/' },
  niddkGas: { label: 'NIDDK. Eating, diet and nutrition for gas in the digestive tract.', url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/gas-digestive-tract/eating-diet-nutrition' },
  girigowda: { label: 'Girigowda K et al. (2005). Effect of processing on oligosaccharides in black gram. Plant Foods Hum Nutr.', url: 'https://pubmed.ncbi.nlm.nih.gov/16395628/' },
  nhsIndigestion: { label: 'NHS. Indigestion.', url: 'https://www.nhs.uk/conditions/indigestion/' },
  nhsBloating: { label: 'NHS. Bloating.', url: 'https://www.nhs.uk/symptoms/bloating/' },
  odsIodine: { label: 'NIH Office of Dietary Supplements. Iodine — fact sheet.', url: 'https://ods.od.nih.gov/factsheets/Iodine-HealthProfessional/' },
  fssRice: { label: 'Food Standards Scotland. Food storage (cooked rice, hard-boiled eggs, leftovers).', url: 'https://www.foodstandards.gov.scot/consumer-advice/food-safety/food-safety-in-the-kitchen/food-storage', note: 'Cooked rice: chill within 1 hour, eat within 24 hours. Hard-boiled eggs: up to 2 days in the fridge.' },
  fsisLeftovers: { label: 'USDA FSIS. Leftovers and food safety.', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/leftovers-and-food-safety', note: 'Blocks automated checks; wording confirmed from FSIS material reproduced by US extension services.' },
  whoMycotoxins: { label: 'WHO (2023). Mycotoxins — fact sheet.', url: 'https://www.who.int/news-room/fact-sheets/detail/mycotoxins' },
  faoFoodEnergy: { label: 'FAO (2003). Food energy — methods of analysis and conversion factors. Chapter 3: energy conversion factors.', url: 'https://www.fao.org/4/y5022e/y5022e04.htm', note: 'Uses 8 kJ (2 kcal) per g of dietary fibre for typical diets.' },
  purdueBagLunch: { label: 'Purdue University Extension (2022). Keeping “bagged” lunches safe.', url: 'https://extension.purdue.edu/news/county/putnam/2022/09/keeping-bagged-lunches-safe.html', note: 'Restates USDA FSIS guidance; the FSIS page itself blocks automated checks.' },
  ifct: { label: 'Longvah T et al. (2017). Indian Food Composition Tables. ICMR-NIN.', url: 'https://www.nin.res.in/ebooks/IFCT2017.pdf' },
  efsaErucic: { label: 'EFSA CONTAM Panel (2016). Erucic acid in feed and food. EFSA Journal 14(11):4593.', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4593', note: 'TDI 7 mg/kg body weight a day, based on heart-muscle fat deposits in young animals; no human data.' },
  gill2021: { label: 'Gill KS et al. (2021). Assays for erucic acid content in Indian mustard (Brassica juncea). Front Plant Sci.', url: 'https://pubmed.ncbi.nlm.nih.gov/34975937/', note: 'Indian lines measured at up to ~52% erucic acid; low-erucic varieties exist but are not what most shops sell.' },
  gray2016: { label: 'Gray PJ et al. (2016). Cooking rice in excess water reduces both arsenic and enriched vitamins in the cooked grain. Food Addit Contam A.', url: 'https://pubmed.ncbi.nlm.nih.gov/26515534/' },
  nciCookedMeat: { label: 'US National Cancer Institute. Chemicals in meat cooked at high temperatures and cancer risk.', url: 'https://www.cancer.gov/about-cancer/causes-prevention/risk/diet/cooked-meats-fact-sheet' },
  whoSalt: { label: 'WHO. Sodium reduction — fact sheet (less than 5 g of salt a day for adults; salt should be iodised).', url: 'https://www.who.int/news-room/fact-sheets/detail/sodium-reduction' },
  philips2024: { label: 'Philips CA et al. (2024). Citizens protein project: analysis of popular protein supplements sold in India. Medicine (Baltimore).', url: 'https://pubmed.ncbi.nlm.nih.gov/38579036/' },
  usdaSr28: { label: 'USDA ARS (2016). National Nutrient Database for Standard Reference, Release 28 (nutrient values and edible share for foods IFCT lacks).', url: 'https://www.ars.usda.gov/northeast-area/beltsville-md-bhnrc/beltsville-human-nutrition-research-center/methods-and-application-of-food-composition-laboratory/mafcl-site-pages/sr11-sr28/' },
  ifct2017pkg: { label: 'ifct2017 (npm, v2.1.2): machine-readable copy of IFCT 2017 used to build the food table; spot-checked against the ICMR-NIN PDF.', url: 'https://www.npmjs.com/package/ifct2017' },
  driElements: { label: 'Health Canada. Dietary Reference Intakes tables: reference values for elements (US/Canadian DRIs, National Academies).', url: 'https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/dietary-reference-intakes/tables/reference-values-elements.html' },
  driVitamins: { label: 'Health Canada. Dietary Reference Intakes tables: reference values for vitamins.', url: 'https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/dietary-reference-intakes/tables/reference-values-vitamins.html' },
  driMacros: { label: 'Health Canada. Dietary Reference Intakes tables: reference values for macronutrients.', url: 'https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/dietary-reference-intakes/tables/reference-values-macronutrients.html' },
} satisfies Record<string, Reference>;

export type RefId = keyof typeof REFS;
