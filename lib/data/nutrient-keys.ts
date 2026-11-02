// The nutrients the app tracks per food. Values per 100 g come from
// lib/data/composition.generated.ts; reference intakes are in lib/data/nutrients.ts.
export const NUTRIENT_KEYS = [
  'protein',
  'carbs',
  'fat',
  'fiber',
  'calcium',
  'iron',
  'zinc',
  'magnesium',
  'phosphorus',
  'potassium',
  'sodium',
  'copper',
  'selenium',
  'manganese',
  'vitA',
  'thiamin',
  'riboflavin',
  'niacin',
  'b6',
  'folate',
  'b12',
  'vitC',
  'vitE',
  'vitK',
  'biotin',
  'ala',
  'la',
] as const;

export type NutrientKey = (typeof NUTRIENT_KEYS)[number];
