import type { FoodId } from './foods';

// ─── Default food prices ──────────────────────────────────────────────────────
// ₹ per kg as bought (milk: per litre, counted as 1 ml = 1 g). ALL of these are estimates of
// Indian urban retail prices, not quotes: a few were compared with online
// listings in Oct 2026 (milk, eggs, chicken, fruit, soya, oats, sattu, daliya),
// the rest are local-shop estimates. Seasonal produce added in Nov 2026 is a
// rough estimate only (marked in its note). Your shop may differ by ±15% or more.
// Every cost and grocery total in the app is computed from this table.

export const PRICES_AS_OF = '2026-10';
export const PRICES_BASIS = 'Estimate';

export interface PriceEntry {
  perKg: number;
  note?: string;
}

export const DEFAULT_PRICES: Record<FoodId, PriceEntry> = {
  milk: { perKg: 58, note: 'per litre; double-toned, priced as toned milk (not re-checked)' },
  curd: { perKg: 58, note: 'home-set from double-toned milk (≈ milk price)' },
  paneer: { perKg: 450 },
  ghee: { perKg: 620 },
  oil: { perKg: 190, note: 'rice-bran oil, 1 L ≈ 910 g; rough estimate (Nov 2026), not compared with any listing' },
  sattu: { perKg: 170, note: '1 kg packs ≈ ₹140–170/kg (Oct 2026); 500 g packs cost more per kg' },
  roastedChana: { perKg: 200 },
  moongWhole: { perKg: 130 },
  moongDal: { perKg: 130 },
  toorDal: { perKg: 160 },
  kalaChana: { perKg: 110 },
  kabuliChana: { perKg: 160 },
  rajma: { perKg: 180 },
  soyaChunks: { perKg: 135, note: '1 kg pouch ≈ ₹130–135 online (Oct 2026); 200 g packs ≈ ₹180/kg' },
  besan: { perKg: 110 },
  oats: { perKg: 160 },
  atta: { perKg: 50 },
  daliya: { perKg: 65, note: '1 kg store-brand packs ≈ ₹58–70 (Oct 2026)' },
  rice: { perKg: 55 },
  poha: { perKg: 75 },
  peanuts: { perKg: 150 },
  pumpkinSeeds: { perKg: 800 },
  flax: { perKg: 220 },
  sunflowerSeeds: { perKg: 500, note: 'rough estimate (Nov 2026), not compared with any listing' },
  almonds: { perKg: 1000 },
  sesame: { perKg: 240, note: 'rough estimate (Nov 2026), not compared with any listing' },
  walnuts: { perKg: 1300 },
  cashews: { perKg: 1000 },
  raisins: { perKg: 380 },
  dates: { perKg: 320 },
  banana: { perKg: 36, note: '≈ ₹72 a dozen, ~₹6 a banana' },
  papaya: { perKg: 55 },
  guava: { perKg: 80 },
  lemon: { perKg: 120 },
  sweetPotato: { perKg: 70 },
  beetroot: { perKg: 50 },
  spinach: { perKg: 40 },
  egg: { perKg: 140, note: '≈ ₹7 an egg, ~50 g edible' },
  chicken: { perKg: 380, note: 'per kg EDIBLE part (curry cut ≈ ₹280/kg bought, ~75% edible)' },
  fish: { perKg: 380, note: 'per kg edible part' },
  potato: { perKg: 35 },
  orange: { perKg: 80, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
  muskmelon: { perKg: 50, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
  mango: { perKg: 100, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
  apple: { perKg: 160, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
  amaranth: { perKg: 40, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
  peas: { perKg: 60, note: 'in the pod; rough estimate (Nov 2026), not compared with any listing' },
  cauliflower: { perKg: 40, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
  carrot: { perKg: 45, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
  radish: { perKg: 30, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
  bottleGourd: { perKg: 35, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
  okra: { perKg: 50, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
  pumpkin: { perKg: 30, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
  brinjal: { perKg: 40, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
  frenchBeans: { perKg: 70, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
  cucumber: { perKg: 40, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
  onion: { perKg: 40, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
  tomato: { perKg: 40, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
  capsicum: { perKg: 80, note: 'rough estimate (Nov 2026), not compared with any listing; varies a lot with the season' },
};

export type PriceTable = Record<FoodId, number>;

export const DEFAULT_PRICE_TABLE = Object.fromEntries(
  Object.entries(DEFAULT_PRICES).map(([k, v]) => [k, v.perKg]),
) as PriceTable;
