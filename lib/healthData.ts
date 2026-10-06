import { BloodResult, RecoveryTip, ProgressEntry, StrengthEntry, NutritionLog, SleepEntry } from './types';

// ─── BLOOD TEST DATA ──────────────────────────────────────────────────────────
// Date: 3 October 2026
// IMPORTANT: This is educational context, not medical diagnosis.

export const BLOOD_RESULTS: BloodResult[] = [
  {
    name: 'Vitamin D (25-OH)',
    value: 22.3,
    unit: 'ng/mL',
    refRangeLow: 30,
    refRangeHigh: 100,
    refRangeStr: '30–100 ng/mL (Endocrine Society)',
    status: 'borderline',
    interpretation: 'Below the 30 ng/mL threshold that the Endocrine Society considers "sufficient." Not severely deficient (that\'s typically <10 ng/mL), but insufficient for optimal bone health, immune function, and muscle performance.',
    relevance: 'Vitamin D supports muscle protein synthesis, testosterone production, and immune health — all relevant to your training goals. Some research links low Vit D to hair cycling disruption, though evidence is not definitive.',
    discussWithDoctor: true,
  },
  {
    name: 'Vitamin B12',
    value: 299,
    unit: 'pg/mL',
    refRangeLow: 200,
    refRangeHigh: 900,
    refRangeStr: '200–900 pg/mL',
    status: 'acceptable',
    interpretation: 'Technically within the normal laboratory reference range. However, some researchers and clinicians consider values below 300–400 pg/mL as "low normal" for vegetarians, as functional deficiency can occur before serum levels fall below 200. Trend monitoring is important.',
    relevance: 'B12 is found almost exclusively in animal products. As a vegetarian, you have no reliable food source unless consuming dairy and eggs regularly. B12 is essential for red blood cell formation, neurological function, and DNA synthesis. Deficiency develops slowly and silently.',
    discussWithDoctor: true,
  },
  {
    name: 'Serum Iron',
    value: 119,
    unit: 'µg/dL',
    refRangeLow: 60,
    refRangeHigh: 170,
    refRangeStr: '60–170 µg/dL',
    status: 'optimal',
    interpretation: 'Normal. Iron levels are within the healthy reference range.',
    relevance: 'Iron is essential for oxygen transport and energy production. For athletes, adequate iron is critical for endurance and recovery. Your diet includes good iron sources (sattu, kala chana, moong dal, roasted chana) — continue pairing with vitamin C.',
    discussWithDoctor: false,
  },
  {
    name: 'Transferrin Saturation',
    value: 27,
    unit: '%',
    refRangeLow: 20,
    refRangeHigh: 50,
    refRangeStr: '20–50%',
    status: 'acceptable',
    interpretation: 'Within normal range. Transferrin saturation reflects the percentage of iron-binding capacity that is occupied by iron. 27% is normal-low — not concerning on its own, but worth watching alongside other iron markers.',
    relevance: 'Adequate iron stores support training, oxygen delivery, and energy. Combined with normal serum iron and hemoglobin, iron status appears adequate. Continue dietary iron sources.',
    discussWithDoctor: false,
  },
  {
    name: 'Hemoglobin',
    value: 14.8,
    unit: 'g/dL',
    refRangeLow: 13.5,
    refRangeHigh: 17.5,
    refRangeStr: '13.5–17.5 g/dL (male)',
    status: 'optimal',
    interpretation: 'Normal. You are not anaemic. Good hemoglobin for a 24-year-old male.',
    relevance: 'Good hemoglobin ensures oxygen delivery to muscles during training — important for performance and recovery.',
    discussWithDoctor: false,
  },
  {
    name: 'MCV (Mean Corpuscular Volume)',
    value: 87.9,
    unit: 'fL',
    refRangeLow: 80,
    refRangeHigh: 100,
    refRangeStr: '80–100 fL',
    status: 'optimal',
    interpretation: 'Normal. MCV is a red blood cell size marker. Normal MCV with normal hemoglobin rules out macrocytic anaemia (seen in B12/folate deficiency) and microcytic anaemia (seen in iron deficiency).',
    relevance: 'Reassuring: no signs of nutritional anaemia from iron, B12, or folate deficiency in red blood cell morphology.',
    discussWithDoctor: false,
  },
  {
    name: 'TSH (Thyroid Stimulating Hormone)',
    value: 1.263,
    unit: 'µIU/mL',
    refRangeLow: 0.4,
    refRangeHigh: 4.0,
    refRangeStr: '0.4–4.0 µIU/mL',
    status: 'optimal',
    interpretation: 'Excellent thyroid function. TSH in the 1–2 range is generally considered the most optimal zone.',
    relevance: 'Normal thyroid function rules out hypothyroidism as a cause of your hair loss. Hypothyroidism is a common cause of diffuse hair loss, so this is important negative finding.',
    discussWithDoctor: false,
  },
  {
    name: 'HbA1c',
    value: 5.3,
    unit: '%',
    refRangeLow: null,
    refRangeHigh: 5.7,
    refRangeStr: '<5.7% (Normal)',
    status: 'optimal',
    interpretation: 'Normal. No signs of prediabetes or diabetes. HbA1c reflects average blood glucose over 2–3 months.',
    relevance: 'Good metabolic health. Blood sugar management supports consistent energy, recovery, and long-term health. Continue whole-food carbohydrate approach.',
    discussWithDoctor: false,
  },
  {
    name: 'Fasting Glucose',
    value: 87.84,
    unit: 'mg/dL',
    refRangeLow: 70,
    refRangeHigh: 99,
    refRangeStr: '70–99 mg/dL',
    status: 'optimal',
    interpretation: 'Normal fasting glucose. Well within healthy range.',
    relevance: 'Consistent with the HbA1c result. Good insulin sensitivity at your current weight and activity level.',
    discussWithDoctor: false,
  },
  {
    name: 'Creatinine',
    value: 0.9,
    unit: 'mg/dL',
    refRangeLow: 0.7,
    refRangeHigh: 1.2,
    refRangeStr: '0.7–1.2 mg/dL',
    status: 'optimal',
    interpretation: 'Normal kidney function marker.',
    relevance: 'Important context for protein intake and creatine supplementation. Normal creatinine confirms healthy kidney function — you can safely consume 160g protein/day and creatine monohydrate at 3–5g/day.',
    discussWithDoctor: false,
  },
  {
    name: 'eGFR',
    value: 123,
    unit: 'mL/min/1.73m²',
    refRangeLow: 60,
    refRangeHigh: null,
    refRangeStr: '>60 mL/min/1.73m² (Normal: ≥90 excellent)',
    status: 'optimal',
    interpretation: 'Excellent kidney filtration rate for your age. >90 is normal; >120 in a healthy young adult is expected.',
    relevance: 'Confirms that high-protein intake (160g/day) and creatine supplementation are appropriate and safe for you.',
    discussWithDoctor: false,
  },
  {
    name: 'hs-CRP (High-Sensitivity C-Reactive Protein)',
    value: 0.58,
    unit: 'mg/L',
    refRangeLow: null,
    refRangeHigh: 1.0,
    refRangeStr: '<1.0 mg/L (Low risk)',
    status: 'optimal',
    interpretation: 'Low inflammation marker. hs-CRP below 1 mg/L indicates low cardiovascular and systemic inflammatory risk.',
    relevance: 'Low systemic inflammation is ideal for training adaptation, recovery, and long-term health. Maintain anti-inflammatory diet (omega-3, colourful vegetables, minimal processed food).',
    discussWithDoctor: false,
  },
];

export const HAIR_HEALTH_CONTEXT = {
  disclaimer: 'The following is educational context based on your blood results and nutritional status. It does NOT constitute a medical diagnosis. Hair loss has many causes — androgenetic alopecia (genetic pattern hair loss), telogen effluvium (stress/nutritional), scalp conditions, and others. Only a dermatologist can determine the cause of your specific hair loss.',
  nutritionalConsiderations: [
    {
      factor: 'Vitamin D (22.3 ng/mL — Insufficient)',
      relevance: 'Some research links vitamin D receptor dysfunction to hair follicle cycling. Evidence is not strong enough to confirm causality, but supplementing to achieve sufficiency (30-50 ng/mL) is reasonable and has multiple other benefits.',
      action: 'Supplement 1000–2000 IU/day with fat-containing meal. Discuss with doctor.',
      evidenceLevel: 'Moderate',
    },
    {
      factor: 'B12 (299 pg/mL — Low Normal for Vegetarian)',
      relevance: 'Adequate B12 is required for rapidly dividing cells, including hair follicle cells. Vegetarians are at risk for gradual depletion.',
      action: 'Consider methylcobalamin 500mcg/day supplement. Discuss with doctor.',
      evidenceLevel: 'Moderate',
    },
    {
      factor: 'Iron Status (Normal)',
      relevance: 'Serum ferritin (not tested) is actually a more sensitive marker for hair loss than serum iron. Some dermatologists recommend ferritin >40–70 ng/mL for hair health (Rushton 2002). Consider requesting ferritin test.',
      action: 'Ask doctor to add serum ferritin to next blood test. Continue high-iron vegetarian foods + vitamin C pairing.',
      evidenceLevel: 'Moderate',
    },
    {
      factor: 'Protein Intake',
      relevance: 'Hair is made of keratin (protein). Inadequate protein intake can cause telogen effluvium. Your target of 160g/day is more than sufficient.',
      action: 'Maintain protein targets. Ensure amino acid diversity through food combination.',
      evidenceLevel: 'Strong',
    },
    {
      factor: 'Zinc',
      relevance: 'Zinc deficiency is associated with hair loss. Vegetarian diets often have lower zinc bioavailability due to phytic acid in legumes. Your diet includes pumpkin seeds, watermelon seeds, and legumes — good sources.',
      action: 'Soaking/sprouting legumes reduces phytic acid. Pumpkin seeds are your best dietary zinc source. No supplement needed unless serum zinc is tested and found low.',
      evidenceLevel: 'Moderate',
    },
    {
      factor: 'Biotin',
      relevance: 'Biotin is heavily marketed for hair. Evidence only supports benefit in those with actual biotin deficiency (rare). Eggs are the best food source. High-dose biotin supplements can interfere with thyroid and cardiac blood tests.',
      action: 'No biotin supplement recommended unless deficiency is confirmed. Eat eggs if open to it.',
      evidenceLevel: 'Weak (supplementation without deficiency)',
    },
  ],
  doctorDiscussion: [
    'Serum ferritin test — more sensitive iron marker for hair loss than serum iron',
    'Serum zinc level if hair loss persists',
    'Dermatologist referral for proper diagnosis (to distinguish androgenetic vs. telogen effluvium vs. other)',
    'Vitamin D supplementation plan and retesting in 3-4 months',
    'Consider DHT-related hair loss testing if family history suggests androgenetic alopecia',
  ],
};

// ─── PROGRESS DATA (Sample/Mock) ─────────────────────────────────────────────

export const SAMPLE_WEIGHT_DATA: ProgressEntry[] = [
  { date: '2026-10-06', weightKg: 66.0, waistCm: 75.5 },
  { date: '2026-10-13', weightKg: 66.3, waistCm: 75.5 },
  { date: '2026-10-20', weightKg: 66.7, waistCm: 75.8 },
  { date: '2026-10-27', weightKg: 67.1, waistCm: 76 },
  { date: '2026-11-03', weightKg: 67.4, waistCm: 76 },
  { date: '2026-11-10', weightKg: 67.8, waistCm: 76.2 },
  { date: '2026-11-17', weightKg: 68.1, waistCm: 76.5 },
  { date: '2026-11-24', weightKg: 68.4, waistCm: 76.5 },
];

export const SAMPLE_STRENGTH_DATA: StrengthEntry[] = [
  // Squat
  { date: '2026-10-06', exercise: 'squat', weightKg: 40, reps: 8, estimatedOneRM: 53 },
  { date: '2026-10-20', exercise: 'squat', weightKg: 45, reps: 8, estimatedOneRM: 60 },
  { date: '2026-11-03', exercise: 'squat', weightKg: 50, reps: 8, estimatedOneRM: 67 },
  { date: '2026-11-17', exercise: 'squat', weightKg: 55, reps: 8, estimatedOneRM: 73 },
  // Bench
  { date: '2026-10-06', exercise: 'bench', weightKg: 30, reps: 8, estimatedOneRM: 40 },
  { date: '2026-10-20', exercise: 'bench', weightKg: 35, reps: 8, estimatedOneRM: 47 },
  { date: '2026-11-03', exercise: 'bench', weightKg: 37.5, reps: 8, estimatedOneRM: 50 },
  { date: '2026-11-17', exercise: 'bench', weightKg: 40, reps: 8, estimatedOneRM: 53 },
  // Deadlift
  { date: '2026-10-06', exercise: 'deadlift', weightKg: 50, reps: 5, estimatedOneRM: 58 },
  { date: '2026-10-20', exercise: 'deadlift', weightKg: 60, reps: 5, estimatedOneRM: 70 },
  { date: '2026-11-03', exercise: 'deadlift', weightKg: 70, reps: 5, estimatedOneRM: 81 },
  { date: '2026-11-17', exercise: 'deadlift', weightKg: 80, reps: 5, estimatedOneRM: 93 },
  // OHP
  { date: '2026-10-06', exercise: 'ohp', weightKg: 20, reps: 8, estimatedOneRM: 27 },
  { date: '2026-10-20', exercise: 'ohp', weightKg: 22.5, reps: 8, estimatedOneRM: 30 },
  { date: '2026-11-03', exercise: 'ohp', weightKg: 25, reps: 8, estimatedOneRM: 33 },
  { date: '2026-11-17', exercise: 'ohp', weightKg: 27.5, reps: 8, estimatedOneRM: 37 },
];

export const SAMPLE_NUTRITION_LOG: NutritionLog[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date('2026-10-06');
  date.setDate(date.getDate() + i);
  const adherence = 75 + Math.floor(Math.random() * 25);
  return {
    date: date.toISOString().split('T')[0],
    calories: Math.round(2200 + Math.random() * 400),
    proteinG: Math.round(130 + Math.random() * 40),
    carbsG: Math.round(250 + Math.random() * 80),
    fatG: Math.round(55 + Math.random() * 20),
    fiberG: Math.round(22 + Math.random() * 12),
    waterMl: Math.round(2200 + Math.random() * 1000),
    adherencePercent: adherence,
  };
});

export const SAMPLE_SLEEP_DATA: SleepEntry[] = Array.from({ length: 14 }, (_, i) => {
  const date = new Date('2026-10-06');
  date.setDate(date.getDate() + i);
  const hour = Math.random() > 0.5 ? 0 : 1;
  const bedMinute = Math.floor(Math.random() * 60);
  const wakeHour = 7 + Math.floor(Math.random() * 2);
  const wakeMins = Math.floor(Math.random() * 60);
  const duration = (wakeHour + 24 - hour) + (wakeMins - bedMinute) / 60;
  return {
    date: date.toISOString().split('T')[0],
    bedtime: `${hour.toString().padStart(2, '0')}:${bedMinute.toString().padStart(2, '0')}`,
    wakeTime: `${wakeHour.toString().padStart(2, '0')}:${wakeMins.toString().padStart(2, '0')}`,
    durationHours: Math.round(duration * 10) / 10,
    qualityRating: 2 + Math.floor(Math.random() * 4),
  };
});

// ─── RECOVERY & TIPS ─────────────────────────────────────────────────────────

export const RECOVERY_TIPS: RecoveryTip[] = [
  {
    category: 'Sleep',
    title: 'Consistent sleep timing matters more than duration',
    description: 'Going to bed after midnight regularly disrupts circadian rhythm. Try to shift bedtime 30 min earlier each week. Even at 66 kg, growth hormone is primarily released in deep sleep stages (especially the first 90-min cycle). Consistent timing improves deep sleep quality.',
    priority: 'high',
  },
  {
    category: 'Sleep',
    title: 'Aim for 7.5–8 hours',
    description: 'Van Cauter (2011) showed that restricting sleep to 5.5h reduced muscle gain and increased fat gain even with adequate nutrition. As a beginner, you are in your highest-adaptation phase — protect your sleep.',
    priority: 'high',
  },
  {
    category: 'Desk Job',
    title: '5-minute break every hour',
    description: 'Set a phone alarm. Stand, walk to refill water, do 10 calf raises, or walk to a colleague. Prolonged unbroken sitting is independently associated with metabolic risk regardless of total exercise (Biswas et al. 2015, Annals of Internal Medicine).',
    priority: 'high',
  },
  {
    category: 'Desk Job',
    title: 'Posture awareness at desk',
    description: 'Chronic desk posture creates tight hip flexors and pec minor — directly hampering squat depth and shoulder health. Set screen at eye level, feet flat, use lumbar support. Consider a standing desk interval.',
    priority: 'medium',
  },
  {
    category: 'Stress',
    title: 'Manage cortisol — it directly competes with recovery',
    description: 'Elevated cortisol from work stress increases muscle protein breakdown and impairs testosterone. Practical: 5-minute diaphragmatic breathing during lunch, brief walk, limiting doom-scrolling before bed.',
    priority: 'medium',
  },
  {
    category: 'Active Recovery',
    title: 'Wednesday: light walk + mobility (not another workout)',
    description: 'Wednesday is your rest day. A 20–30 min walk and 15 min of mobility work improves blood flow and recovery without adding fatigue. Resist the urge to train on rest days.',
    priority: 'medium',
  },
  {
    category: 'Nutrition',
    title: 'Post-workout protein within 2 hours',
    description: 'The "anabolic window" is wider than once believed, but consuming 30–40g protein within 2 hours post-training is still practical and beneficial. Your Meal 4 (dinner) serves this role on training days.',
    priority: 'medium',
  },
  {
    category: 'Hydration',
    title: 'Dehydration impairs strength by 5–8%',
    description: 'Even mild dehydration (1–2% body weight) measurably reduces strength and power output. Drink 500ml water before training, 200-300ml per 20 min during, and 500ml post-workout.',
    priority: 'high',
  },
  {
    category: 'Deload',
    title: 'Planned deload every 6–8 weeks',
    description: 'A deload week reduces weight by 40% with same sets and reps. This allows cumulative fatigue to dissipate. Supercompensation (strength rebound) typically occurs 1–2 weeks after a well-executed deload.',
    priority: 'medium',
  },
  {
    category: 'General',
    title: 'Soreness ≠ progress',
    description: 'Delayed Onset Muscle Soreness (DOMS) is not a reliable indicator of workout quality. Beginners will experience significant DOMS initially — it diminishes as you adapt. Focus on progressive overload, not chasing soreness.',
    priority: 'low',
  },
];

export const DESK_JOB_TIPS = [
  { time: 'Every 60 min', action: 'Stand for 5 min, walk to water cooler, do 10 calf raises at desk' },
  { time: 'Lunch break (13:00)', action: '10-15 min walk outside — counts toward step goal, improves mood and afternoon focus' },
  { time: 'Afternoon (15:00)', action: 'Shoulder rolls, chest opener, wrist circles — 2-3 min desk stretch' },
  { time: 'End of work (18:00)', action: 'Walk for commute if possible; if driving, park further away' },
  { time: 'Evening', action: 'Hip flexor stretch (3 min) before or after dinner — undoes 8 hours of sitting' },
];

