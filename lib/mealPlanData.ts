import { MealPlan, DayMealPlan, Meal, FoodItem } from './types';

// ─── MEAL STRUCTURE RULES ─────────────────────────────────────────────────────
// • Exactly 4 meals/day
// • Meal 1: IDENTICAL every day (all 7 days, all 4 plans)
// • Mon–Fri: Meal 3 IDENTICAL; Meals 2 & 4 may vary
// • Sat–Sun: Meals 2–4 can be more flexible (home-based)
// • Work constraints: Meal 2 (lunch pack) and Meal 4 must be prep-able
// • Budget target: ₹4000–5000/month

// ─── TIMING TEMPLATE ─────────────────────────────────────────────────────────
// Meal 1: 7:30–8:00 AM (before work/after workout)
// Meal 2: 1:00 PM (office lunch)
// Meal 3: 5:30–6:00 PM (pre-workout OR late afternoon snack at office)
// Meal 4: 8:00–9:00 PM (post-workout dinner or evening meal)

// ─────────────────────────────────────────────────────────────────────────────
// PLAN 1 — PREFERRED FOODS
// Built around: Sattu, Oats, Paneer, Curd, Green Moong, Kala Chana,
//              Roasted Chana, Sweet Potato, Milk, Ghee, Seeds, Nuts,
//              Seasonal Fruits, Vegetables
// ─────────────────────────────────────────────────────────────────────────────

const plan1Meal1: Meal = {
  id: 'p1-m1',
  name: 'Morning Sattu + Oat Bowl',
  time: '07:30',
  timeLabel: '7:30 AM',
  isFixed: true,
  foods: [
    { name: 'Roasted Sattu (bengal gram flour)', quantityStr: '40g (4 tbsp)', calories: 148, proteinG: 8, carbsG: 25, fatG: 2, fiberG: 3, notes: 'Outstanding protein, iron & fiber source. Cooling effect in digestion.' },
    { name: 'Rolled Oats (raw, soaked overnight)', quantityStr: '50g', calories: 190, proteinG: 6.5, carbsG: 33, fatG: 3.5, fiberG: 4, notes: 'Soaking improves beta-glucan digestibility.' },
    { name: 'Full-fat milk', quantityStr: '200ml', calories: 130, proteinG: 6.4, carbsG: 9.6, fatG: 7, fiberG: 0, notes: 'High-quality protein, calcium, B12 (partial).' },
    { name: 'Pumpkin seeds', quantityStr: '15g', calories: 85, proteinG: 4.5, carbsG: 2, fatG: 7, fiberG: 0.5, notes: 'Zinc, magnesium — both relevant to hair and testosterone.' },
    { name: 'Almonds (soaked, peeled)', quantityStr: '15g (10-12 almonds)', calories: 87, proteinG: 3, carbsG: 3, fatG: 7.5, fiberG: 1.5, notes: 'Soaking removes phytic acid — better absorption.' },
    { name: 'Raisins', quantityStr: '20g', calories: 60, proteinG: 0.5, carbsG: 15.5, fatG: 0, fiberG: 0.5, notes: 'Iron, quick carbs, natural sweetness.' },
    { name: 'Ghee', quantityStr: '1 tsp (5g)', calories: 45, proteinG: 0, carbsG: 0, fatG: 5, fiberG: 0, notes: 'Butyrate — beneficial for gut lining. Use small amount.' },
  ],
  totalCalories: 745,
  totalProteinG: 28.9,
  totalCarbsG: 88.1,
  totalFatG: 32,
  totalFiberG: 9.5,
  prepNote: 'Soak oats and almonds the night before. Mix sattu with warm milk + ghee. Add oats, seeds, raisins on top. Ready in 5 min.',
};

const plan1Meal3Weekday: Meal = {
  id: 'p1-m3-weekday',
  name: 'Office Pre-Workout Snack (Roasted Chana + Fruit)',
  time: '17:30',
  timeLabel: '5:30 PM',
  isFixed: true,
  foods: [
    { name: 'Roasted Chana (Bengal gram)', quantityStr: '60g', calories: 216, proteinG: 12, carbsG: 35, fatG: 3, fiberG: 7, notes: 'High protein, high fiber, excellent pre-workout fuel. Very budget-friendly.' },
    { name: 'Seasonal fruit (banana/papaya/apple)', quantityStr: '150g', calories: 95, proteinG: 1, carbsG: 22, fatG: 0.5, fiberG: 2, notes: 'Quick carbs for workout energy.' },
    { name: 'Walnuts', quantityStr: '15g (7-8 halves)', calories: 98, proteinG: 2.3, carbsG: 2, fatG: 9.7, fiberG: 1, notes: 'Omega-3 ALA — anti-inflammatory. Hair supportive.' },
  ],
  totalCalories: 409,
  totalProteinG: 15.3,
  totalCarbsG: 59,
  totalFatG: 13.2,
  totalFiberG: 10,
  prepNote: 'Pre-portioned in a small container. Carry to office. Zero preparation needed.',
};

// Plan 1 Weekday Meal 2 options (vary Mon-Fri)
const p1_m2_paneerBowl: Meal = {
  id: 'p1-m2-paneer',
  name: 'Paneer + Moong Dal Bowl (Office Lunch)',
  time: '13:00',
  timeLabel: '1:00 PM',
  foods: [
    { name: 'Low-fat paneer (homemade/store)', quantityStr: '100g', calories: 265, proteinG: 18.3, carbsG: 3.4, fatG: 20.8, fiberG: 0, notes: 'Best vegetarian complete protein. Cook in minimal oil.' },
    { name: 'Green moong dal (cooked, sprouted)', quantityStr: '150g cooked', calories: 120, proteinG: 8, carbsG: 20, fatG: 0.5, fiberG: 5, notes: 'Sprouting enhances iron absorption and reduces antinutrients.' },
    { name: 'Sweet potato (boiled/baked)', quantityStr: '120g', calories: 103, proteinG: 2, carbsG: 24, fatG: 0.1, fiberG: 3.8, notes: 'Beta-carotene (pro-vitamin A), potassium. Better GI profile than white rice.' },
    { name: 'Cucumber + tomato salad', quantityStr: '100g', calories: 20, proteinG: 1, carbsG: 4, fatG: 0.1, fiberG: 1.2 },
    { name: 'Lemon juice', quantityStr: '1 tbsp', calories: 4, proteinG: 0, carbsG: 1, fatG: 0, notes: 'Vitamin C enhances non-heme iron absorption from dal.' },
  ],
  totalCalories: 512,
  totalProteinG: 29.3,
  totalCarbsG: 52.4,
  totalFatG: 21.5,
  totalFiberG: 10,
  prepNote: 'Prepare paneer bhurji and moong dal the night before. Pack with sweet potato. Reheat in kettle-steamed container or eat at room temperature.',
};

const p1_m2_kalaChana: Meal = {
  id: 'p1-m2-kala-chana',
  name: 'Kala Chana Salad Bowl (Office Lunch)',
  time: '13:00',
  timeLabel: '1:00 PM',
  foods: [
    { name: 'Kala chana (cooked/boiled)', quantityStr: '200g cooked', calories: 268, proteinG: 16, carbsG: 45, fatG: 4, fiberG: 12, notes: 'High iron, zinc, fiber. Soak 8+ hours and pressure cook for better digestibility.' },
    { name: 'Sweet potato', quantityStr: '100g', calories: 86, proteinG: 1.6, carbsG: 20, fatG: 0.1, fiberG: 3 },
    { name: 'Curd (homemade, full-fat)', quantityStr: '100g', calories: 98, proteinG: 3.5, carbsG: 4, fatG: 8, fiberG: 0, notes: 'Probiotics for gut health. Lactic acid enhances mineral absorption.' },
    { name: 'Onion, tomato, cucumber', quantityStr: '100g', calories: 30, proteinG: 1, carbsG: 6, fatG: 0.1, fiberG: 1.5 },
    { name: 'Roasted cumin powder + lemon', quantityStr: 'seasoning', calories: 10, proteinG: 0.3, carbsG: 1, fatG: 0.3, notes: 'Cumin aids digestion.' },
  ],
  totalCalories: 492,
  totalProteinG: 22.4,
  totalCarbsG: 76,
  totalFatG: 12.5,
  totalFiberG: 16.5,
  prepNote: 'Boil kala chana (or use canned). Toss everything together cold. Great make-ahead office bowl.',
};

// Plan 1 Weekday Meal 4 (dinner, vary)
const p1_m4_paneerVeg: Meal = {
  id: 'p1-m4-paneer-veg',
  name: 'Paneer Sabzi + Roti + Curd (Dinner)',
  time: '20:00',
  timeLabel: '8:00 PM',
  foods: [
    { name: 'Paneer (cubed, cooked)', quantityStr: '80g', calories: 212, proteinG: 14.6, carbsG: 2.7, fatG: 16.6, fiberG: 0 },
    { name: 'Mixed vegetables (spinach/beans/capsicum)', quantityStr: '150g', calories: 60, proteinG: 3, carbsG: 10, fatG: 0.5, fiberG: 4 },
    { name: 'Whole wheat roti', quantityStr: '2 rotis (~120g)', calories: 300, proteinG: 10, carbsG: 58, fatG: 3, fiberG: 6 },
    { name: 'Curd', quantityStr: '150g', calories: 147, proteinG: 5.3, carbsG: 6, fatG: 12, fiberG: 0, notes: 'Evening probiotics.' },
    { name: 'Ghee (on roti)', quantityStr: '1 tsp', calories: 45, proteinG: 0, carbsG: 0, fatG: 5, fiberG: 0 },
  ],
  totalCalories: 764,
  totalProteinG: 32.9,
  totalCarbsG: 76.7,
  totalFatG: 37.1,
  totalFiberG: 10,
  prepNote: 'Standard Indian dinner. Fast to prepare — 20-25 minutes.',
};

const p1_m4_moongDalKhichdi: Meal = {
  id: 'p1-m4-khichdi',
  name: 'Moong Dal Khichdi + Curd (Dinner)',
  time: '20:00',
  timeLabel: '8:00 PM',
  foods: [
    { name: 'Green moong dal khichdi (dal + rice/millets)', quantityStr: '300g cooked', calories: 360, proteinG: 16, carbsG: 65, fatG: 3, fiberG: 8 },
    { name: 'Ghee', quantityStr: '1 tsp', calories: 45, proteinG: 0, carbsG: 0, fatG: 5, fiberG: 0 },
    { name: 'Curd', quantityStr: '200g', calories: 196, proteinG: 7, carbsG: 8, fatG: 16, fiberG: 0, notes: 'Probiotic benefit. Pairs perfectly with khichdi.' },
    { name: 'Beetroot (roasted/salad)', quantityStr: '100g', calories: 43, proteinG: 1.6, carbsG: 10, fatG: 0.2, fiberG: 2.8, notes: 'Nitrate content supports blood flow and exercise performance.' },
  ],
  totalCalories: 644,
  totalProteinG: 24.6,
  totalCarbsG: 83,
  totalFatG: 24.2,
  totalFiberG: 10.8,
  prepNote: 'Khichdi is the perfect easy recovery dinner — 25-30 min. Easy on digestion.',
};

// Weekend Meals Plan 1
const p1_sat_m2: Meal = {
  id: 'p1-sat-m2',
  name: 'Weekend Brunch — Sattu Cheela + Curd',
  time: '10:30',
  timeLabel: '10:30 AM',
  foods: [
    { name: 'Sattu cheela (2-3 medium)', quantityStr: '80g sattu + veg', calories: 340, proteinG: 16, carbsG: 52, fatG: 6, fiberG: 7 },
    { name: 'Curd (full-fat)', quantityStr: '200g', calories: 196, proteinG: 7, carbsG: 8, fatG: 16, fiberG: 0 },
    { name: 'Seasonal fruit plate', quantityStr: '200g', calories: 120, proteinG: 1.5, carbsG: 28, fatG: 0.5, fiberG: 3 },
    { name: 'Watermelon seeds', quantityStr: '15g', calories: 85, proteinG: 4.5, carbsG: 2.5, fatG: 6, fiberG: 0.5, notes: 'Zinc, magnesium. Hair-supportive micronutrients.' },
  ],
  totalCalories: 741,
  totalProteinG: 29,
  totalCarbsG: 90.5,
  totalFatG: 28.5,
  totalFiberG: 10.5,
  prepNote: 'Cheela takes 20 min. Enjoy at home with leisure.',
};

const p1_sat_m3: Meal = {
  id: 'p1-sat-m3',
  name: 'Weekend — Buttermilk + Roasted Chana + Nuts',
  time: '15:00',
  timeLabel: '3:00 PM',
  foods: [
    { name: 'Buttermilk (chaas, spiced)', quantityStr: '300ml', calories: 98, proteinG: 5, carbsG: 8, fatG: 5, fiberG: 0, notes: 'Probiotic. Cooling. Great for digestion. Cumin + mint enhances benefits.' },
    { name: 'Roasted chana', quantityStr: '60g', calories: 216, proteinG: 12, carbsG: 35, fatG: 3, fiberG: 7 },
    { name: 'Mixed nuts (almonds + cashews + walnuts)', quantityStr: '25g', calories: 155, proteinG: 4, carbsG: 6, fatG: 13, fiberG: 1.5 },
    { name: 'Dates', quantityStr: '2 dates (20g)', calories: 56, proteinG: 0.4, carbsG: 15, fatG: 0.1, fiberG: 1.5, notes: 'Iron and quick energy. Natural sweetener.' },
  ],
  totalCalories: 525,
  totalProteinG: 21.4,
  totalCarbsG: 64,
  totalFatG: 21.1,
  totalFiberG: 10,
};

const p1_sat_m4: Meal = {
  id: 'p1-sat-m4',
  name: 'Weekend Dinner — Paneer Tikka + Sweet Potato + Dal',
  time: '19:30',
  timeLabel: '7:30 PM',
  foods: [
    { name: 'Paneer (marinated, grilled/pan-cooked)', quantityStr: '120g', calories: 318, proteinG: 21.9, carbsG: 4, fatG: 24.9, fiberG: 0 },
    { name: 'Sweet potato (baked)', quantityStr: '150g', calories: 129, proteinG: 3, carbsG: 30, fatG: 0.1, fiberG: 4.5 },
    { name: 'Green moong dal (thin soup)', quantityStr: '200g cooked', calories: 160, proteinG: 10.7, carbsG: 26.7, fatG: 0.7, fiberG: 6.7 },
    { name: 'Mixed salad + lemon', quantityStr: '100g', calories: 25, proteinG: 1, carbsG: 5, fatG: 0.1, fiberG: 1.5 },
  ],
  totalCalories: 632,
  totalProteinG: 36.6,
  totalCarbsG: 65.7,
  totalFatG: 25.8,
  totalFiberG: 12.7,
  prepNote: 'Marinate paneer in curd + spices for 30 min. Bake or grill. Simple and delicious.',
};

const p1_sun_m2: Meal = {
  id: 'p1-sun-m2',
  name: 'Sunday — Oats Upma + Papaya',
  time: '10:00',
  timeLabel: '10:00 AM',
  foods: [
    { name: 'Oats upma (savoury oats)', quantityStr: '80g dry oats + veg', calories: 380, proteinG: 13, carbsG: 62, fatG: 7, fiberG: 8 },
    { name: 'Boiled egg (optional — Veg plan uses paneer)', quantityStr: 'OR 50g paneer', calories: 132, proteinG: 9, carbsG: 1, fatG: 10, fiberG: 0 },
    { name: 'Papaya', quantityStr: '200g', calories: 78, proteinG: 1.2, carbsG: 20, fatG: 0.3, fiberG: 2.5, notes: 'Excellent digestive enzyme (papain). Vitamin C for iron absorption. Carotenoids for hair.' },
    { name: 'Milk', quantityStr: '150ml', calories: 98, proteinG: 4.8, carbsG: 7.2, fatG: 5.3, fiberG: 0 },
  ],
  totalCalories: 688,
  totalProteinG: 28,
  totalCarbsG: 90.2,
  totalFatG: 22.6,
  totalFiberG: 10.5,
};

const p1_sun_m3: Meal = {
  id: 'p1-sun-m3',
  name: 'Sunday — Curd Bowl + Trail Mix',
  time: '14:30',
  timeLabel: '2:30 PM',
  foods: [
    { name: 'Full-fat curd', quantityStr: '250g', calories: 245, proteinG: 8.8, carbsG: 10, fatG: 20, fiberG: 0 },
    { name: 'Pumpkin + watermelon seeds mix', quantityStr: '20g', calories: 110, proteinG: 5.5, carbsG: 3, fatG: 9, fiberG: 0.5 },
    { name: 'Almonds + cashews', quantityStr: '20g', calories: 120, proteinG: 3.5, carbsG: 5, fatG: 10, fiberG: 1.5 },
    { name: 'Banana', quantityStr: '1 medium (100g)', calories: 89, proteinG: 1.1, carbsG: 23, fatG: 0.3, fiberG: 2.6 },
    { name: 'Dates', quantityStr: '2 (20g)', calories: 56, proteinG: 0.4, carbsG: 15, fatG: 0.1, fiberG: 1.5 },
  ],
  totalCalories: 620,
  totalProteinG: 19.3,
  totalCarbsG: 56,
  totalFatG: 39.4,
  totalFiberG: 6.1,
};

const p1_sun_m4: Meal = {
  id: 'p1-sun-m4',
  name: 'Sunday Dinner — Kala Chana Curry + Roti + Salad',
  time: '19:30',
  timeLabel: '7:30 PM',
  foods: [
    { name: 'Kala chana curry', quantityStr: '250g cooked', calories: 335, proteinG: 20, carbsG: 56, fatG: 5, fiberG: 15, notes: 'Prep the night before or Sunday morning. Pressure cook.' },
    { name: 'Whole wheat roti', quantityStr: '2 rotis', calories: 300, proteinG: 10, carbsG: 58, fatG: 3, fiberG: 6 },
    { name: 'Onion tomato salad + lemon', quantityStr: '100g', calories: 30, proteinG: 1, carbsG: 6, fatG: 0.1, fiberG: 1.5 },
    { name: 'Ghee (on roti)', quantityStr: '1 tsp', calories: 45, proteinG: 0, carbsG: 0, fatG: 5, fiberG: 0 },
  ],
  totalCalories: 710,
  totalProteinG: 31,
  totalCarbsG: 120,
  totalFatG: 13.1,
  totalFiberG: 22.5,
};

function makePlan1Day(day: DayMealPlan['day'], isWeekend: boolean, m2: Meal, m3: Meal, m4: Meal): DayMealPlan {
  const meals: [Meal, Meal, Meal, Meal] = [plan1Meal1, m2, m3, m4];
  return {
    day,
    isWeekend,
    meals,
    totalCalories: meals.reduce((s, m) => s + m.totalCalories, 0),
    totalProteinG: meals.reduce((s, m) => s + m.totalProteinG, 0),
    totalCarbsG: meals.reduce((s, m) => s + m.totalCarbsG, 0),
    totalFatG: meals.reduce((s, m) => s + m.totalFatG, 0),
    totalFiberG: meals.reduce((s, m) => s + m.totalFiberG, 0),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAN 2 — RESEARCH-BASED VEGETARIAN (no eggs)
// Focus: Optimal amino acid complementation, gut health, micronutrient density
// ─────────────────────────────────────────────────────────────────────────────

const plan2Meal1: Meal = {
  id: 'p2-m1',
  name: 'High-Protein Smoothie Bowl + Sprout Toast',
  time: '07:30',
  timeLabel: '7:30 AM',
  isFixed: true,
  foods: [
    { name: 'Full-fat milk', quantityStr: '250ml', calories: 163, proteinG: 8, carbsG: 12, fatG: 9, fiberG: 0, notes: 'Most digestible protein source in vegetarian diet.' },
    { name: 'Paneer (crumbled)', quantityStr: '60g', calories: 159, proteinG: 10.9, carbsG: 2, fatG: 12.5, fiberG: 0, notes: 'Complete protein, calcium, phosphorus.' },
    { name: 'Banana', quantityStr: '1 medium', calories: 89, proteinG: 1.1, carbsG: 23, fatG: 0.3, fiberG: 2.6, notes: 'Potassium, fast carbs, pre-workout energy.' },
    { name: 'Rolled oats', quantityStr: '50g', calories: 190, proteinG: 6.5, carbsG: 33, fatG: 3.5, fiberG: 4, notes: 'Beta-glucan for gut health, slow-release energy.' },
    { name: 'Flaxseeds (ground)', quantityStr: '10g', calories: 55, proteinG: 1.9, carbsG: 3, fatG: 4.3, fiberG: 2.8, notes: 'ALA omega-3, lignans — anti-inflammatory, relevant to hair health.' },
    { name: 'Whole wheat bread (toasted)', quantityStr: '2 slices (70g)', calories: 175, proteinG: 7, carbsG: 33, fatG: 2, fiberG: 4 },
    { name: 'Sprouted moong (topping)', quantityStr: '30g', calories: 30, proteinG: 2.5, carbsG: 5, fatG: 0.2, fiberG: 1, notes: 'Sprouting increases folate and reduces antinutrients.' },
  ],
  totalCalories: 861,
  totalProteinG: 37.9,
  totalCarbsG: 111,
  totalFatG: 31.8,
  totalFiberG: 14.4,
  prepNote: 'Blend milk + paneer + banana. Pour over oats. Add flaxseeds. Toast bread with sprouts on top.',
};

const plan2Meal3Weekday: Meal = {
  id: 'p2-m3-weekday',
  name: 'Office Snack — Edamame/Rajma + Nuts',
  time: '17:30',
  timeLabel: '5:30 PM',
  isFixed: true,
  foods: [
    { name: 'Boiled rajma (kidney beans) or edamame', quantityStr: '80g cooked', calories: 120, proteinG: 8, carbsG: 20, fatG: 0.5, fiberG: 6, notes: 'Rajma has best amino acid profile among legumes. Pair with any grain for complete protein.' },
    { name: 'Walnuts', quantityStr: '20g', calories: 131, proteinG: 3, carbsG: 2.7, fatG: 13, fiberG: 1.4, notes: 'ALA omega-3. Superior to other nuts for anti-inflammatory profile.' },
    { name: 'Apple or orange', quantityStr: '1 medium', calories: 80, proteinG: 0.4, carbsG: 20, fatG: 0.2, fiberG: 3, notes: 'Vitamin C for iron absorption from legumes.' },
    { name: 'Roasted pumpkin seeds', quantityStr: '10g', calories: 57, proteinG: 3, carbsG: 1.3, fatG: 4.7, fiberG: 0.3, notes: 'Zinc, magnesium.' },
  ],
  totalCalories: 388,
  totalProteinG: 14.4,
  totalCarbsG: 44,
  totalFatG: 18.4,
  totalFiberG: 10.7,
  prepNote: 'Boil rajma ahead (or buy canned). Carry in small container.',
};

const p2_m2_tofu_bowl: Meal = {
  id: 'p2-m2-tofu',
  name: 'Tofu Stir-Fry with Quinoa (Office Lunch)',
  time: '13:00',
  timeLabel: '1:00 PM',
  foods: [
    { name: 'Firm tofu (extra-firm, pressed)', quantityStr: '150g', calories: 122, proteinG: 13.2, carbsG: 3, fatG: 6.5, fiberG: 0.5, notes: 'Complete protein. Contains phytoestrogens — research does NOT support negative effects on men at typical food doses.' },
    { name: 'Quinoa (cooked)', quantityStr: '150g', calories: 180, proteinG: 6.6, carbsG: 32, fatG: 2.9, fiberG: 2.6, notes: 'One of few complete plant proteins. Higher in methionine than most grains.' },
    { name: 'Mixed vegetables', quantityStr: '150g', calories: 60, proteinG: 3, carbsG: 10, fatG: 0.5, fiberG: 4 },
    { name: 'Sesame oil + soy sauce (light)', quantityStr: '1 tsp + 1 tbsp', calories: 55, proteinG: 1, carbsG: 2, fatG: 4.5, fiberG: 0 },
    { name: 'Lemon juice', quantityStr: '1 tbsp', calories: 4, proteinG: 0, carbsG: 1, fatG: 0 },
  ],
  totalCalories: 421,
  totalProteinG: 23.8,
  totalCarbsG: 48,
  totalFatG: 14.4,
  totalFiberG: 7.1,
  prepNote: 'Prep tofu and quinoa night before. Pack cold — works as a salad bowl.',
};

const p2_m2_chana_wrap: Meal = {
  id: 'p2-m2-chana-wrap',
  name: 'Chana Masala Wrap (Office Lunch)',
  time: '13:00',
  timeLabel: '1:00 PM',
  foods: [
    { name: 'Boiled chickpeas (kala chana)', quantityStr: '150g cooked', calories: 201, proteinG: 12, carbsG: 34, fatG: 3, fiberG: 9, notes: 'Chickpeas: best PDCAAS among legumes. High iron.' },
    { name: 'Whole wheat roti/wrap', quantityStr: '2 medium', calories: 240, proteinG: 8, carbsG: 46, fatG: 2.4, fiberG: 5 },
    { name: 'Curd (hanging curd / Greek-style)', quantityStr: '80g', calories: 78, proteinG: 2.8, carbsG: 3.2, fatG: 6.4, fiberG: 0 },
    { name: 'Onion, tomato, coriander', quantityStr: '80g', calories: 25, proteinG: 0.8, carbsG: 5, fatG: 0.1, fiberG: 1.2 },
    { name: 'Green chutney', quantityStr: '2 tbsp', calories: 20, proteinG: 0.5, carbsG: 3, fatG: 0.5, fiberG: 0.5 },
  ],
  totalCalories: 564,
  totalProteinG: 24.1,
  totalCarbsG: 91.2,
  totalFatG: 12.4,
  totalFiberG: 15.7,
};

const p2_m4_paneer_masala: Meal = {
  id: 'p2-m4-paneer-masala',
  name: 'Paneer Masala + Brown Rice + Sabzi (Dinner)',
  time: '20:00',
  timeLabel: '8:00 PM',
  foods: [
    { name: 'Paneer', quantityStr: '100g', calories: 265, proteinG: 18.3, carbsG: 3.4, fatG: 20.8, fiberG: 0 },
    { name: 'Brown rice (cooked)', quantityStr: '180g', calories: 232, proteinG: 5, carbsG: 48.6, fatG: 1.8, fiberG: 3.6, notes: 'More fiber and micronutrients than white rice.' },
    { name: 'Spinach (palak) dal', quantityStr: '150g cooked', calories: 120, proteinG: 7, carbsG: 18, fatG: 1.5, fiberG: 5, notes: 'Iron + folate. Pair with lemon for absorption.' },
    { name: 'Lemon juice', quantityStr: '1 tbsp', calories: 4, proteinG: 0, carbsG: 1, fatG: 0 },
  ],
  totalCalories: 621,
  totalProteinG: 30.3,
  totalCarbsG: 71,
  totalFatG: 24.1,
  totalFiberG: 8.6,
};

const p2_m4_soup_bowl: Meal = {
  id: 'p2-m4-soup',
  name: 'Lentil Soup + Roti + Curd (Dinner)',
  time: '20:00',
  timeLabel: '8:00 PM',
  foods: [
    { name: 'Masoor dal / toor dal (cooked)', quantityStr: '250g', calories: 260, proteinG: 18, carbsG: 45, fatG: 1, fiberG: 10, notes: 'Masoor dal: highest iron content among common dals.' },
    { name: 'Whole wheat roti', quantityStr: '2 rotis', calories: 300, proteinG: 10, carbsG: 58, fatG: 3, fiberG: 6 },
    { name: 'Curd', quantityStr: '150g', calories: 147, proteinG: 5.3, carbsG: 6, fatG: 12, fiberG: 0 },
    { name: 'Ghee in dal', quantityStr: '1 tsp', calories: 45, proteinG: 0, carbsG: 0, fatG: 5, fiberG: 0 },
  ],
  totalCalories: 752,
  totalProteinG: 33.3,
  totalCarbsG: 109,
  totalFatG: 21,
  totalFiberG: 16,
};

// Helper function for building plan day totals
function buildDayPlan(day: DayMealPlan['day'], isWeekend: boolean, meals: [Meal, Meal, Meal, Meal]): DayMealPlan {
  return {
    day, isWeekend, meals,
    totalCalories: meals.reduce((s, m) => s + m.totalCalories, 0),
    totalProteinG: meals.reduce((s, m) => s + m.totalProteinG, 0),
    totalCarbsG: meals.reduce((s, m) => s + m.totalCarbsG, 0),
    totalFatG: meals.reduce((s, m) => s + m.totalFatG, 0),
    totalFiberG: meals.reduce((s, m) => s + m.totalFiberG, 0),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAN 3 — VEGETARIAN + EGGS
// ─────────────────────────────────────────────────────────────────────────────

const plan3Meal1: Meal = {
  id: 'p3-m1',
  name: 'Egg + Oat Breakfast Power Bowl',
  time: '07:30',
  timeLabel: '7:30 AM',
  isFixed: true,
  foods: [
    { name: 'Whole eggs (boiled/scrambled)', quantityStr: '3 eggs', calories: 231, proteinG: 18.9, carbsG: 1.5, fatG: 15.9, fiberG: 0, notes: 'Most bioavailable protein (DIAAS 1.13). Rich in choline, B12, biotin — all relevant to hair health.' },
    { name: 'Rolled oats (cooked)', quantityStr: '60g', calories: 228, proteinG: 7.8, carbsG: 40, fatG: 4.2, fiberG: 4.8, notes: 'Beta-glucan fiber — excellent gut prebiotic.' },
    { name: 'Full-fat milk', quantityStr: '200ml', calories: 130, proteinG: 6.4, carbsG: 9.6, fatG: 7, fiberG: 0 },
    { name: 'Flaxseeds (ground)', quantityStr: '10g', calories: 55, proteinG: 1.9, carbsG: 3, fatG: 4.3, fiberG: 2.8 },
    { name: 'Banana', quantityStr: '1 medium', calories: 89, proteinG: 1.1, carbsG: 23, fatG: 0.3, fiberG: 2.6 },
    { name: 'Pumpkin seeds', quantityStr: '10g', calories: 57, proteinG: 3, carbsG: 1.3, fatG: 4.7, fiberG: 0.3 },
  ],
  totalCalories: 790,
  totalProteinG: 39.1,
  totalCarbsG: 78.4,
  totalFatG: 36.4,
  totalFiberG: 10.5,
  prepNote: 'Boil eggs night before for quick morning. Or scramble in 5 min. Oats can soak overnight.',
};

const plan3Meal3Weekday: Meal = {
  id: 'p3-m3-weekday',
  name: 'Office Snack — Hard-Boiled Egg + Fruit + Nuts',
  time: '17:30',
  timeLabel: '5:30 PM',
  isFixed: true,
  foods: [
    { name: 'Hard-boiled eggs', quantityStr: '2 eggs', calories: 154, proteinG: 12.6, carbsG: 1, fatG: 10.6, fiberG: 0, notes: 'Boil the night before. Most portable high-protein food.' },
    { name: 'Roasted chana', quantityStr: '40g', calories: 144, proteinG: 8, carbsG: 23, fatG: 2, fiberG: 4.7 },
    { name: 'Orange or apple', quantityStr: '1 medium', calories: 80, proteinG: 0.4, carbsG: 20, fatG: 0.2, fiberG: 3, notes: 'Vitamin C + iron absorption.' },
    { name: 'Walnuts', quantityStr: '15g', calories: 98, proteinG: 2.3, carbsG: 2, fatG: 9.7, fiberG: 1 },
  ],
  totalCalories: 476,
  totalProteinG: 23.3,
  totalCarbsG: 46,
  totalFatG: 22.5,
  totalFiberG: 8.7,
  prepNote: 'Eggs pre-boiled. Everything packed the night before.',
};

const p3_m2_egg_salad: Meal = {
  id: 'p3-m2-egg-salad',
  name: 'Egg + Paneer Grain Bowl (Office Lunch)',
  time: '13:00',
  timeLabel: '1:00 PM',
  foods: [
    { name: 'Hard-boiled eggs (sliced)', quantityStr: '2 eggs', calories: 154, proteinG: 12.6, carbsG: 1, fatG: 10.6, fiberG: 0 },
    { name: 'Paneer', quantityStr: '60g', calories: 159, proteinG: 10.9, carbsG: 2, fatG: 12.5, fiberG: 0 },
    { name: 'Brown rice or quinoa', quantityStr: '150g cooked', calories: 193, proteinG: 5, carbsG: 41, fatG: 1.7, fiberG: 3.2 },
    { name: 'Broccoli/spinach/salad mix', quantityStr: '150g', calories: 55, proteinG: 4, carbsG: 8, fatG: 0.7, fiberG: 4, notes: 'Sulforaphane in broccoli — anti-inflammatory. Iron in spinach.' },
    { name: 'Olive oil + lemon dressing', quantityStr: '1 tsp oil + lemon', calories: 45, proteinG: 0, carbsG: 1, fatG: 4.5, fiberG: 0 },
  ],
  totalCalories: 606,
  totalProteinG: 32.5,
  totalCarbsG: 53,
  totalFatG: 30,
  totalFiberG: 7.2,
  prepNote: 'Excellent cold/room temperature bowl. Prep all ingredients night before.',
};

const p3_m4_egg_curry: Meal = {
  id: 'p3-m4-egg-curry',
  name: 'Egg Curry + Dal + Roti (Dinner)',
  time: '20:00',
  timeLabel: '8:00 PM',
  foods: [
    { name: 'Whole eggs (boiled, in curry)', quantityStr: '2 eggs', calories: 154, proteinG: 12.6, carbsG: 1, fatG: 10.6, fiberG: 0 },
    { name: 'Toor/masoor dal', quantityStr: '150g cooked', calories: 156, proteinG: 10.8, carbsG: 27, fatG: 0.6, fiberG: 6 },
    { name: 'Whole wheat roti', quantityStr: '2 rotis', calories: 300, proteinG: 10, carbsG: 58, fatG: 3, fiberG: 6 },
    { name: 'Ghee', quantityStr: '1 tsp', calories: 45, proteinG: 0, carbsG: 0, fatG: 5, fiberG: 0 },
    { name: 'Mixed salad', quantityStr: '100g', calories: 30, proteinG: 1, carbsG: 6, fatG: 0.1, fiberG: 1.5 },
  ],
  totalCalories: 685,
  totalProteinG: 34.4,
  totalCarbsG: 92,
  totalFatG: 19.3,
  totalFiberG: 13.5,
};

// ─────────────────────────────────────────────────────────────────────────────
// PLAN 4 — NON-VEGETARIAN
// Includes eggs + chicken/fish strategically placed
// ─────────────────────────────────────────────────────────────────────────────

const plan4Meal1: Meal = {
  id: 'p4-m1',
  name: 'Egg White + Whole Egg Breakfast Scramble',
  time: '07:30',
  timeLabel: '7:30 AM',
  isFixed: true,
  foods: [
    { name: 'Whole eggs + egg whites (3W + 2W)', quantityStr: '3 whole + 2 whites', calories: 265, proteinG: 30.5, carbsG: 2, fatG: 15, fiberG: 0, notes: 'Optimal protein quality. Egg white adds protein without extra fat. Biotin in yolk — hair supportive.' },
    { name: 'Rolled oats (cooked)', quantityStr: '60g', calories: 228, proteinG: 7.8, carbsG: 40, fatG: 4.2, fiberG: 4.8 },
    { name: 'Full-fat milk', quantityStr: '200ml', calories: 130, proteinG: 6.4, carbsG: 9.6, fatG: 7, fiberG: 0 },
    { name: 'Mixed berries or banana', quantityStr: '100g', calories: 60, proteinG: 0.8, carbsG: 14, fatG: 0.3, fiberG: 2 },
    { name: 'Flaxseeds + pumpkin seeds', quantityStr: '15g mix', calories: 80, proteinG: 3, carbsG: 2.5, fatG: 6.5, fiberG: 1.5 },
  ],
  totalCalories: 763,
  totalProteinG: 48.5,
  totalCarbsG: 68.1,
  totalFatG: 33,
  totalFiberG: 8.3,
  prepNote: 'Scramble eggs while oats cook. Fast — 10 min total.',
};

const plan4Meal3Weekday: Meal = {
  id: 'p4-m3-weekday',
  name: 'Office Snack — Greek Yogurt + Eggs + Nuts',
  time: '17:30',
  timeLabel: '5:30 PM',
  isFixed: true,
  foods: [
    { name: 'Hard-boiled eggs', quantityStr: '2 eggs', calories: 154, proteinG: 12.6, carbsG: 1, fatG: 10.6, fiberG: 0 },
    { name: 'Greek-style hung curd', quantityStr: '150g', calories: 135, proteinG: 10, carbsG: 6, fatG: 8, fiberG: 0, notes: 'Higher protein than regular curd.' },
    { name: 'Almonds + walnuts', quantityStr: '20g', calories: 125, proteinG: 3.5, carbsG: 3, fatG: 11, fiberG: 1.5 },
    { name: 'Banana or orange', quantityStr: '1 medium', calories: 85, proteinG: 1, carbsG: 21, fatG: 0.3, fiberG: 2.5 },
  ],
  totalCalories: 499,
  totalProteinG: 27.1,
  totalCarbsG: 31,
  totalFatG: 29.9,
  totalFiberG: 4,
};

const p4_m2_chicken: Meal = {
  id: 'p4-m2-chicken',
  name: 'Grilled Chicken Breast + Quinoa + Salad',
  time: '13:00',
  timeLabel: '1:00 PM',
  foods: [
    { name: 'Chicken breast (skinless, grilled)', quantityStr: '150g', calories: 248, proteinG: 46.5, carbsG: 0, fatG: 5.4, fiberG: 0, notes: 'Highest protein density among common meats. Very lean. DIAAS ~1.0.' },
    { name: 'Quinoa or brown rice (cooked)', quantityStr: '150g', calories: 180, proteinG: 5, carbsG: 36, fatG: 2, fiberG: 3 },
    { name: 'Mixed salad (cucumber, tomato, spinach)', quantityStr: '200g', calories: 45, proteinG: 3, carbsG: 8, fatG: 0.5, fiberG: 3.5 },
    { name: 'Olive oil dressing', quantityStr: '1 tsp', calories: 40, proteinG: 0, carbsG: 0, fatG: 4.5, fiberG: 0 },
    { name: 'Lemon + herbs', quantityStr: 'seasoning', calories: 5, proteinG: 0, carbsG: 1, fatG: 0 },
  ],
  totalCalories: 518,
  totalProteinG: 54.5,
  totalCarbsG: 45,
  totalFatG: 12.4,
  totalFiberG: 6.5,
  prepNote: 'Grill/bake chicken night before. Pack cold with salad. High-protein workhorse meal.',
};

const p4_m2_fish: Meal = {
  id: 'p4-m2-fish',
  name: 'Rohu/Tuna + Sweet Potato + Veg Bowl',
  time: '13:00',
  timeLabel: '1:00 PM',
  foods: [
    { name: 'Rohu fish or canned tuna (in water)', quantityStr: '150g', calories: 205, proteinG: 32, carbsG: 0, fatG: 8, fiberG: 0, notes: 'Omega-3 EPA/DHA from oily fish — anti-inflammatory, supports scalp health.' },
    { name: 'Sweet potato (boiled)', quantityStr: '150g', calories: 129, proteinG: 3, carbsG: 30, fatG: 0.1, fiberG: 4.5 },
    { name: 'Stir-fried vegetables', quantityStr: '150g', calories: 70, proteinG: 3, carbsG: 12, fatG: 1, fiberG: 4 },
    { name: 'Lemon + spices', quantityStr: 'seasoning', calories: 10, proteinG: 0, carbsG: 2, fatG: 0 },
  ],
  totalCalories: 414,
  totalProteinG: 38,
  totalCarbsG: 44,
  totalFatG: 9.1,
  totalFiberG: 8.5,
  prepNote: 'Canned tuna needs zero prep. Rohu can be steamed night before.',
};

const p4_m4_chicken_dal: Meal = {
  id: 'p4-m4-chicken-dal',
  name: 'Chicken Curry + Dal + Roti (Dinner)',
  time: '20:00',
  timeLabel: '8:00 PM',
  foods: [
    { name: 'Chicken breast (in curry)', quantityStr: '120g', calories: 198, proteinG: 37.2, carbsG: 0, fatG: 4.3, fiberG: 0 },
    { name: 'Masoor dal', quantityStr: '150g cooked', calories: 156, proteinG: 10.8, carbsG: 27, fatG: 0.6, fiberG: 6 },
    { name: 'Whole wheat roti', quantityStr: '2 rotis', calories: 300, proteinG: 10, carbsG: 58, fatG: 3, fiberG: 6 },
    { name: 'Curd', quantityStr: '100g', calories: 98, proteinG: 3.5, carbsG: 4, fatG: 8, fiberG: 0 },
    { name: 'Salad', quantityStr: '100g', calories: 25, proteinG: 1, carbsG: 5, fatG: 0.1, fiberG: 1.5 },
  ],
  totalCalories: 777,
  totalProteinG: 62.5,
  totalCarbsG: 94,
  totalFatG: 16,
  totalFiberG: 13.5,
};

const p4_m4_egg_rice: Meal = {
  id: 'p4-m4-egg-rice',
  name: 'Egg Bhurji + Brown Rice + Sabzi (Dinner)',
  time: '20:00',
  timeLabel: '8:00 PM',
  foods: [
    { name: 'Eggs (whole)', quantityStr: '3 eggs', calories: 231, proteinG: 18.9, carbsG: 1.5, fatG: 15.9, fiberG: 0 },
    { name: 'Brown rice (cooked)', quantityStr: '180g', calories: 232, proteinG: 5, carbsG: 48.6, fatG: 1.8, fiberG: 3.6 },
    { name: 'Stir-fried vegetables (spinach, bell pepper)', quantityStr: '150g', calories: 60, proteinG: 3, carbsG: 10, fatG: 0.7, fiberG: 4 },
    { name: 'Ghee', quantityStr: '1 tsp', calories: 45, proteinG: 0, carbsG: 0, fatG: 5, fiberG: 0 },
  ],
  totalCalories: 568,
  totalProteinG: 26.9,
  totalCarbsG: 60.1,
  totalFatG: 23.4,
  totalFiberG: 7.6,
};

// Weekend shared meals (simplified for plans 2-4)
const p2_sat_m2: Meal = {
  id: 'p2-sat-m2',
  name: 'Weekend Brunch — Tofu Scramble + Toast',
  time: '10:30',
  timeLabel: '10:30 AM',
  foods: [
    { name: 'Firm tofu (scrambled)', quantityStr: '200g', calories: 163, proteinG: 17.6, carbsG: 4, fatG: 8.6, fiberG: 0.7 },
    { name: 'Whole wheat toast', quantityStr: '2 slices', calories: 175, proteinG: 7, carbsG: 33, fatG: 2, fiberG: 4 },
    { name: 'Paneer (side)', quantityStr: '60g', calories: 159, proteinG: 10.9, carbsG: 2, fatG: 12.5, fiberG: 0 },
    { name: 'Papaya + seasonal fruit', quantityStr: '200g', calories: 90, proteinG: 1.5, carbsG: 22, fatG: 0.3, fiberG: 3 },
    { name: 'Milk (glass)', quantityStr: '200ml', calories: 130, proteinG: 6.4, carbsG: 9.6, fatG: 7, fiberG: 0 },
  ],
  totalCalories: 717,
  totalProteinG: 43.4,
  totalCarbsG: 70.6,
  totalFatG: 30.4,
  totalFiberG: 7.7,
};

const p3_sat_m2: Meal = {
  id: 'p3-sat-m2',
  name: 'Weekend Brunch — 4-Egg Omelette + Oats',
  time: '10:30',
  timeLabel: '10:30 AM',
  foods: [
    { name: 'Eggs (whole, omelette)', quantityStr: '4 eggs', calories: 308, proteinG: 25.2, carbsG: 2, fatG: 21.2, fiberG: 0 },
    { name: 'Rolled oats (cooked)', quantityStr: '60g', calories: 228, proteinG: 7.8, carbsG: 40, fatG: 4.2, fiberG: 4.8 },
    { name: 'Milk', quantityStr: '200ml', calories: 130, proteinG: 6.4, carbsG: 9.6, fatG: 7, fiberG: 0 },
    { name: 'Papaya or mango', quantityStr: '200g', calories: 100, proteinG: 1.5, carbsG: 25, fatG: 0.3, fiberG: 2.5 },
  ],
  totalCalories: 766,
  totalProteinG: 40.9,
  totalCarbsG: 76.6,
  totalFatG: 32.7,
  totalFiberG: 7.3,
};

const p4_sat_m2: Meal = {
  id: 'p4-sat-m2',
  name: 'Weekend Brunch — Egg + Chicken Sandwich',
  time: '10:30',
  timeLabel: '10:30 AM',
  foods: [
    { name: 'Whole eggs', quantityStr: '3 eggs', calories: 231, proteinG: 18.9, carbsG: 1.5, fatG: 15.9, fiberG: 0 },
    { name: 'Chicken breast (shredded)', quantityStr: '80g', calories: 133, proteinG: 24.8, carbsG: 0, fatG: 2.9, fiberG: 0 },
    { name: 'Whole wheat bread', quantityStr: '3 slices', calories: 263, proteinG: 10.5, carbsG: 49.5, fatG: 3, fiberG: 6 },
    { name: 'Milk or buttermilk', quantityStr: '200ml', calories: 130, proteinG: 6.4, carbsG: 9.6, fatG: 7, fiberG: 0 },
    { name: 'Banana', quantityStr: '1', calories: 89, proteinG: 1.1, carbsG: 23, fatG: 0.3, fiberG: 2.6 },
  ],
  totalCalories: 846,
  totalProteinG: 61.7,
  totalCarbsG: 83.6,
  totalFatG: 29.1,
  totalFiberG: 8.6,
};

// Generic weekend Meal 3 and Meal 4 (similar across plans with slight variation)
const sharedSat_m3: Meal = {
  id: 'shared-sat-m3',
  name: 'Weekend Afternoon — Curd + Nuts + Fruit',
  time: '15:00',
  timeLabel: '3:00 PM',
  foods: [
    { name: 'Full-fat curd', quantityStr: '200g', calories: 196, proteinG: 7, carbsG: 8, fatG: 16, fiberG: 0 },
    { name: 'Mixed nuts (almonds, cashews, walnuts)', quantityStr: '25g', calories: 155, proteinG: 4, carbsG: 6, fatG: 13, fiberG: 1.5 },
    { name: 'Seasonal fruit', quantityStr: '150g', calories: 90, proteinG: 1, carbsG: 22, fatG: 0.3, fiberG: 2.5 },
    { name: 'Dates', quantityStr: '2', calories: 56, proteinG: 0.4, carbsG: 15, fatG: 0.1, fiberG: 1.5 },
  ],
  totalCalories: 497,
  totalProteinG: 12.4,
  totalCarbsG: 51,
  totalFatG: 29.4,
  totalFiberG: 5.5,
};

const p2_sat_m4: Meal = {
  id: 'p2-sat-m4',
  name: 'Weekend Dinner — Rajma + Brown Rice + Raita',
  time: '19:30',
  timeLabel: '7:30 PM',
  foods: [
    { name: 'Rajma (kidney beans, cooked)', quantityStr: '200g', calories: 248, proteinG: 16, carbsG: 44, fatG: 0.8, fiberG: 12 },
    { name: 'Brown rice', quantityStr: '180g cooked', calories: 232, proteinG: 5, carbsG: 48.6, fatG: 1.8, fiberG: 3.6 },
    { name: 'Cucumber raita (curd + cucumber)', quantityStr: '150g', calories: 120, proteinG: 4, carbsG: 8, fatG: 9, fiberG: 0.5 },
    { name: 'Ghee', quantityStr: '1 tsp', calories: 45, proteinG: 0, carbsG: 0, fatG: 5, fiberG: 0 },
  ],
  totalCalories: 645,
  totalProteinG: 25,
  totalCarbsG: 100.6,
  totalFatG: 16.6,
  totalFiberG: 16.1,
};

const p3_sat_m4: Meal = {
  id: 'p3-sat-m4',
  name: 'Weekend Dinner — Egg Fried Rice + Dal',
  time: '19:30',
  timeLabel: '7:30 PM',
  foods: [
    { name: 'Eggs', quantityStr: '3 eggs', calories: 231, proteinG: 18.9, carbsG: 1.5, fatG: 15.9, fiberG: 0 },
    { name: 'Brown rice (cooked)', quantityStr: '200g', calories: 258, proteinG: 5.6, carbsG: 54, fatG: 2, fiberG: 4 },
    { name: 'Mixed vegetables (stir-fried)', quantityStr: '150g', calories: 70, proteinG: 3, carbsG: 12, fatG: 1, fiberG: 4 },
    { name: 'Toor dal (soup)', quantityStr: '100g cooked', calories: 104, proteinG: 7.2, carbsG: 18, fatG: 0.4, fiberG: 4 },
  ],
  totalCalories: 663,
  totalProteinG: 34.7,
  totalCarbsG: 85.5,
  totalFatG: 19.3,
  totalFiberG: 12,
};

const p4_sat_m4: Meal = {
  id: 'p4-sat-m4',
  name: 'Weekend Dinner — Grilled Chicken + Sweet Potato + Dal',
  time: '19:30',
  timeLabel: '7:30 PM',
  foods: [
    { name: 'Chicken breast (grilled)', quantityStr: '180g', calories: 298, proteinG: 55.8, carbsG: 0, fatG: 6.5, fiberG: 0 },
    { name: 'Sweet potato (baked)', quantityStr: '200g', calories: 172, proteinG: 4, carbsG: 40, fatG: 0.1, fiberG: 6 },
    { name: 'Toor dal', quantityStr: '150g cooked', calories: 156, proteinG: 10.8, carbsG: 27, fatG: 0.6, fiberG: 6 },
    { name: 'Salad + lemon', quantityStr: '100g', calories: 25, proteinG: 1, carbsG: 5, fatG: 0.1, fiberG: 1.5 },
  ],
  totalCalories: 651,
  totalProteinG: 71.6,
  totalCarbsG: 72,
  totalFatG: 7.3,
  totalFiberG: 13.5,
};

const p2_sun_m2: Meal = { ...p1_sun_m2, id: 'p2-sun-m2' };
const p3_sun_m2: Meal = { ...p3_sat_m2, id: 'p3-sun-m2', name: 'Sunday Brunch — 4-Egg Omelette + Oats' };
const p4_sun_m2: Meal = { ...p4_sat_m2, id: 'p4-sun-m2', name: 'Sunday Brunch — Eggs + Oats + Fruit' };
const p2_sun_m3: Meal = { ...sharedSat_m3, id: 'p2-sun-m3' };
const p3_sun_m3: Meal = { ...sharedSat_m3, id: 'p3-sun-m3' };
const p4_sun_m3: Meal = { ...sharedSat_m3, id: 'p4-sun-m3' };
const p2_sun_m4: Meal = { ...p2_sat_m4, id: 'p2-sun-m4', name: 'Sunday Dinner — Dal Makhani + Roti' };
const p3_sun_m4: Meal = { ...p3_sat_m4, id: 'p3-sun-m4', name: 'Sunday Dinner — Egg Curry + Roti' };
const p4_sun_m4: Meal = { ...p4_sat_m4, id: 'p4-sun-m4', name: 'Sunday Dinner — Chicken + Dal + Rice' };
const p1_sun_m2b: Meal = { ...p1_sun_m2 };

// ─── BUILD WEEKLY PLANS ───────────────────────────────────────────────────────

const plan1WeeklyPlan: DayMealPlan[] = [
  makePlan1Day('Monday', false, p1_m2_paneerBowl, plan1Meal3Weekday, p1_m4_paneerVeg),
  makePlan1Day('Tuesday', false, p1_m2_kalaChana, plan1Meal3Weekday, p1_m4_moongDalKhichdi),
  makePlan1Day('Wednesday', false, p1_m2_paneerBowl, plan1Meal3Weekday, p1_m4_paneerVeg),
  makePlan1Day('Thursday', false, p1_m2_kalaChana, plan1Meal3Weekday, p1_m4_moongDalKhichdi),
  makePlan1Day('Friday', false, p1_m2_paneerBowl, plan1Meal3Weekday, p1_m4_paneerVeg),
  buildDayPlan('Saturday', true, [plan1Meal1, p1_sat_m2, p1_sat_m3, p1_sat_m4]),
  buildDayPlan('Sunday', true, [plan1Meal1, p1_sun_m2b, p1_sun_m3, p1_sun_m4]),
];

const plan2WeeklyPlan: DayMealPlan[] = [
  buildDayPlan('Monday', false, [plan2Meal1, p2_m2_tofu_bowl, plan2Meal3Weekday, p2_m4_paneer_masala]),
  buildDayPlan('Tuesday', false, [plan2Meal1, p2_m2_chana_wrap, plan2Meal3Weekday, p2_m4_soup_bowl]),
  buildDayPlan('Wednesday', false, [plan2Meal1, p2_m2_tofu_bowl, plan2Meal3Weekday, p2_m4_paneer_masala]),
  buildDayPlan('Thursday', false, [plan2Meal1, p2_m2_chana_wrap, plan2Meal3Weekday, p2_m4_soup_bowl]),
  buildDayPlan('Friday', false, [plan2Meal1, p2_m2_tofu_bowl, plan2Meal3Weekday, p2_m4_paneer_masala]),
  buildDayPlan('Saturday', true, [plan2Meal1, p2_sat_m2, sharedSat_m3, p2_sat_m4]),
  buildDayPlan('Sunday', true, [plan2Meal1, p2_sun_m2, p2_sun_m3, p2_sun_m4]),
];

const plan3WeeklyPlan: DayMealPlan[] = [
  buildDayPlan('Monday', false, [plan3Meal1, p3_m2_egg_salad, plan3Meal3Weekday, p3_m4_egg_curry]),
  buildDayPlan('Tuesday', false, [plan3Meal1, p3_m2_egg_salad, plan3Meal3Weekday, p3_m4_egg_curry]),
  buildDayPlan('Wednesday', false, [plan3Meal1, p3_m2_egg_salad, plan3Meal3Weekday, p3_m4_egg_curry]),
  buildDayPlan('Thursday', false, [plan3Meal1, p3_m2_egg_salad, plan3Meal3Weekday, p3_m4_egg_curry]),
  buildDayPlan('Friday', false, [plan3Meal1, p3_m2_egg_salad, plan3Meal3Weekday, p3_m4_egg_curry]),
  buildDayPlan('Saturday', true, [plan3Meal1, p3_sat_m2, sharedSat_m3, p3_sat_m4]),
  buildDayPlan('Sunday', true, [plan3Meal1, p3_sun_m2, p3_sun_m3, p3_sun_m4]),
];

const plan4WeeklyPlan: DayMealPlan[] = [
  buildDayPlan('Monday', false, [plan4Meal1, p4_m2_chicken, plan4Meal3Weekday, p4_m4_chicken_dal]),
  buildDayPlan('Tuesday', false, [plan4Meal1, p4_m2_fish, plan4Meal3Weekday, p4_m4_egg_rice]),
  buildDayPlan('Wednesday', false, [plan4Meal1, p4_m2_chicken, plan4Meal3Weekday, p4_m4_chicken_dal]),
  buildDayPlan('Thursday', false, [plan4Meal1, p4_m2_fish, plan4Meal3Weekday, p4_m4_egg_rice]),
  buildDayPlan('Friday', false, [plan4Meal1, p4_m2_chicken, plan4Meal3Weekday, p4_m4_chicken_dal]),
  buildDayPlan('Saturday', true, [plan4Meal1, p4_sat_m2, sharedSat_m3, p4_sat_m4]),
  buildDayPlan('Sunday', true, [plan4Meal1, p4_sun_m2, p4_sun_m3, p4_sun_m4]),
];

// ─── GROCERY LISTS ────────────────────────────────────────────────────────────

const plan1Grocery = [
  {
    category: 'Dairy & Protein',
    items: [
      { name: 'Paneer', quantity: '400g/week', estimatedCostINR: 120, notes: 'Buy in bulk, freeze portions' },
      { name: 'Full-fat curd (homemade or store)', quantity: '1kg/week', estimatedCostINR: 60 },
      { name: 'Full-fat milk', quantity: '2L/week', estimatedCostINR: 100 },
    ],
  },
  {
    category: 'Legumes & Grains',
    items: [
      { name: 'Sattu (roasted bengal gram flour)', quantity: '500g/month', estimatedCostINR: 60 },
      { name: 'Rolled oats', quantity: '1kg/month', estimatedCostINR: 90 },
      { name: 'Green moong dal', quantity: '500g/week', estimatedCostINR: 60 },
      { name: 'Kala chana', quantity: '500g/week', estimatedCostINR: 45 },
      { name: 'Roasted chana', quantity: '500g/2weeks', estimatedCostINR: 50 },
      { name: 'Whole wheat flour (atta)', quantity: '5kg/month', estimatedCostINR: 200 },
    ],
  },
  {
    category: 'Vegetables',
    items: [
      { name: 'Sweet potatoes', quantity: '1kg/week', estimatedCostINR: 40 },
      { name: 'Beetroot', quantity: '500g/week', estimatedCostINR: 25 },
      { name: 'Seasonal mixed vegetables', quantity: '2kg/week', estimatedCostINR: 80 },
      { name: 'Spinach/palak', quantity: '500g/week', estimatedCostINR: 30 },
      { name: 'Tomatoes, onions, garlic', quantity: 'Weekly staples', estimatedCostINR: 60 },
    ],
  },
  {
    category: 'Fruits',
    items: [
      { name: 'Seasonal fruits (banana, papaya, apple)', quantity: '1-1.5kg/week', estimatedCostINR: 100 },
    ],
  },
  {
    category: 'Nuts, Seeds & Fats',
    items: [
      { name: 'Almonds', quantity: '250g/month', estimatedCostINR: 180 },
      { name: 'Walnuts', quantity: '200g/month', estimatedCostINR: 200 },
      { name: 'Cashews', quantity: '150g/month', estimatedCostINR: 130 },
      { name: 'Pumpkin seeds', quantity: '200g/month', estimatedCostINR: 80 },
      { name: 'Watermelon seeds (roasted)', quantity: '100g/month', estimatedCostINR: 30 },
      { name: 'Raisins', quantity: '200g/month', estimatedCostINR: 40 },
      { name: 'Dates', quantity: '200g/month', estimatedCostINR: 50 },
      { name: 'Ghee (cow)', quantity: '200g/month', estimatedCostINR: 150 },
    ],
  },
  {
    category: 'Spices & Condiments',
    items: [
      { name: 'Basic spices (cumin, turmeric, coriander, chili)', quantity: 'Monthly', estimatedCostINR: 100 },
      { name: 'Lemon', quantity: '1kg/month', estimatedCostINR: 50 },
    ],
  },
];

// ─── MEAL PLANS EXPORT ────────────────────────────────────────────────────────

export const MEAL_PLANS: MealPlan[] = [
  {
    id: 'preferred',
    name: 'Preferred Foods',
    description: 'Built around your existing pantry: sattu, oats, paneer, moong dal, kala chana, roasted chana, sweet potato, curd, milk, ghee, nuts and seeds.',
    icon: '🏡',
    weeklyPlan: plan1WeeklyPlan,
    groceryList: plan1Grocery,
    weeklyBudgetINR: 1100,
    monthlyBudgetINR: 4300,
    budgetNote: 'Comfortably within ₹4000–5000/month target. Protein is mostly from paneer, dairy, and legumes — cost-effective sources.',
    nutritionNotes: [
      'Sattu is an exceptional food — high protein, iron, fiber, and cheap. Use it daily.',
      'Combine legumes (kala chana, moong) with grains (roti, oats) at meals for complete amino acid profiles.',
      'Lemon with every iron-containing meal (sattu, chana, dal) significantly enhances non-heme iron absorption.',
      'Soak almonds overnight — removes phytic acid, improves mineral absorption.',
      'Kala chana: high iron + high fiber. Soak 8+ hours + pressure cook for best digestibility.',
      'Papaya: excellent digestive enzyme (papain). Great for gut health. Eat 3-4x/week.',
      'Budget includes creatine supplement cost if chosen.',
    ],
  },
  {
    id: 'vegetarian',
    name: 'Research-Based Vegetarian',
    description: 'Independently designed from current evidence: optimised protein quality via complementary proteins, gut health, micronutrient density. No eggs.',
    icon: '🥗',
    weeklyPlan: plan2WeeklyPlan,
    groceryList: plan1Grocery,
    weeklyBudgetINR: 1150,
    monthlyBudgetINR: 4500,
    budgetNote: 'Tofu and quinoa are slightly more expensive than dal/sattu. Rajma replaces tofu to reduce cost. Stays within budget.',
    nutritionNotes: [
      'Protein quality in vegetarian diets improves significantly through food combining — rice + dal, quinoa alone, milk + oats.',
      'Tofu: research does NOT support negative effects of phytoestrogens in men at food doses (Messina 2010).',
      'Quinoa is one of the few complete plant proteins (contains all essential amino acids).',
      'Include Vitamin C with every legume meal for iron absorption.',
      'Brown rice over white rice: more fiber, B vitamins, and minerals.',
      'Flaxseeds add ALA omega-3 — grind before eating for absorption.',
      'Sprouting legumes increases folate and reduces antinutrients.',
    ],
  },
  {
    id: 'vegetarian-eggs',
    name: 'Vegetarian + Eggs',
    description: 'Vegetarian foundation enhanced with eggs at key meals. Eggs dramatically improve protein quality, biotin (hair), choline, and B12 intake.',
    icon: '🥚',
    weeklyPlan: plan3WeeklyPlan,
    groceryList: [
      ...plan1Grocery,
      {
        category: 'Eggs',
        items: [
          { name: 'Eggs (free-range preferred)', quantity: '18-21 eggs/week', estimatedCostINR: 120, notes: '3 eggs/day average. DIAAS 1.13 — highest protein quality food.' },
        ],
      },
    ],
    weeklyBudgetINR: 1200,
    monthlyBudgetINR: 4700,
    budgetNote: 'Eggs add ~₹120/week. This is very cost-effective protein. Significantly reduces need for paneer, lowering overall cost.',
    nutritionNotes: [
      'Eggs are the gold standard for protein quality (DIAAS 1.13). No other vegetarian food matches this.',
      'Egg yolk contains biotin — research on biotin and hair loss shows benefit mainly in those deficient. Unclear if you\'re deficient.',
      'Choline from eggs is critical for liver and brain health — often inadequate in vegetarian diets.',
      'Eggs provide natural B12 — addresses your below-optimal B12 levels.',
      'Do not discard yolks: yolk contains vitamins A, D, E, K and 43% of the protein.',
      '3 whole eggs/day is well within safe limits for healthy individuals (Harvard Medical School, 2021).',
    ],
  },
  {
    id: 'non-vegetarian',
    name: 'Research-Based Non-Vegetarian',
    description: 'Includes eggs, chicken breast, and fish (Rohu/tuna) where they genuinely improve nutritional quality. Not assumed to be superior — justified by specific nutritional benefits.',
    icon: '🍗',
    weeklyPlan: plan4WeeklyPlan,
    groceryList: [
      {
        category: 'Protein (Animal)',
        items: [
          { name: 'Chicken breast (boneless)', quantity: '700g/week', estimatedCostINR: 280, notes: 'Highest protein density. Buy in bulk, freeze.' },
          { name: 'Eggs', quantity: '21 eggs/week', estimatedCostINR: 140 },
          { name: 'Fish (Rohu) or canned tuna', quantity: '300g/week', estimatedCostINR: 120, notes: 'Omega-3 EPA/DHA — anti-inflammatory, supports scalp health.' },
        ],
      },
      ...plan1Grocery,
    ],
    weeklyBudgetINR: 1450,
    monthlyBudgetINR: 5600,
    budgetNote: 'Slightly over ₹5000/month target. Trade-off: chicken provides highest protein density. Can reduce chicken quantity or frequency to stay within ₹5000.',
    nutritionNotes: [
      'This plan does NOT claim superiority — it includes animal protein where it fills genuine nutritional gaps.',
      'Chicken breast: ~31g protein per 100g cooked. Unmatched protein efficiency for muscle-building.',
      'Fish provides EPA/DHA omega-3 — genuinely anti-inflammatory. ALA from flaxseeds/walnuts has much lower conversion rate.',
      'Non-vegetarian plan still includes significant legumes, vegetables, and dairy — not a pure meat diet.',
      'Iron from animal sources (heme iron) has 2-3× higher absorption than plant sources — relevant given your borderline B12.',
      'Keep fish intake to 2-3×/week. Avoid high-mercury fish (King mackerel, Shark, Swordfish).',
    ],
  },
];

export const MEAL_STRUCTURE_RULES = {
  meal1: 'IDENTICAL every day (Monday–Sunday) regardless of plan.',
  meal3Weekday: 'IDENTICAL Monday–Friday. Designed for office: no reheating, portable, no prep at work.',
  meal2Weekday: 'Varies daily (Mon–Fri). Must be prepped the night before and work-safe.',
  meal4Weekday: 'Varies (Mon–Fri). Main dinner. Cooked at home in the evening.',
  weekend: 'Saturday & Sunday: Meals 2–4 are flexible. More variety, easier to cook, can be more relaxed.',
  timing: {
    meal1: '7:30 AM — Before leaving for work',
    meal2: '1:00 PM — Office lunch',
    meal3: '5:30 PM — Pre-workout snack or afternoon fuel',
    meal4: '8:00 PM — Post-workout or evening dinner',
  },
};
