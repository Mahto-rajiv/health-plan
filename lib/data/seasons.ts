import type { FoodId } from './foods';

// ─── Seasons (North Indian plains) ────────────────────────────────────────────
// Four 3-month seasons, so the fruit and vegetables change roughly every quarter:
//   Winter  Dec–Feb   Rabi vegetables: peas, cauliflower, carrot, radish, spinach; kinnow/orange, guava.
//   Summer  Mar–May   Zaid crops: bottle gourd, pumpkin, okra, cucumber, muskmelon.
//   Monsoon Jun–Aug   Kharif vegetables: okra, bottle gourd, brinjal, amaranth; mango.
//   Autumn  Sep–Nov   Early cauliflower, French beans, brinjal, spinach from Oct; apple. Papaya
//                     (all year) at breakfast: guava is high in fibre and breaks the Phase 0 fibre cap.
// Onion, tomato, potato, banana and papaya are in the market all year (stored or
// grown year-round), so they are not tied to a season.
//
// Evidence: this follows the standard Rabi / Kharif / Zaid crop seasons and common
// North Indian market availability. No official month-by-month market calendar
// could be accessed (see PROGRESS.md), so treat the boundaries as approximate:
// Settings lets you pick the season by hand when your market says otherwise.
//
// How "identical" meals survive the change: each meal has *slots* (the fruit in
// Meal 1, the fruit in Meal 3, the cooked vegetables, the salad, the greens).
// Within a season a slot is always the same food, so Meal 1 is still identical
// every day and Meal 3 identical Mon–Fri. Only the slot's food changes on the
// 1st of Dec, Mar, Jun and Sep. Everything else in the meal stays the same all
// year; only the slot's amount may change with the season.

export type SeasonId = 'winter' | 'summer' | 'monsoon' | 'autumn';
export const SEASON_IDS: SeasonId[] = ['winter', 'summer', 'monsoon', 'autumn'];

export type SlotId = 'fruit1' | 'fruit3' | 'sabzi' | 'salad' | 'greens';

export interface SlotFill {
  /** Short name used inside titles and steps, e.g. "guava". */
  name: string;
  /** Foods and their share of the slot's grams (shares sum to 1). */
  foods: [FoodId, number][];
  /** What to do if the market doesn't have it. */
  fallback?: string;
}

export interface Season {
  id: SeasonId;
  name: string;
  /** Calendar months, 1–12. */
  months: number[];
  monthsLabel: string;
  slots: Record<SlotId, SlotFill>;
}

const SALAD_CUCUMBER: SlotFill = {
  name: 'cucumber, onion and tomato',
  foods: [
    ['cucumber', 0.5],
    ['onion', 0.25],
    ['tomato', 0.25],
  ],
};

export const SEASONS: Record<SeasonId, Season> = {
  winter: {
    id: 'winter',
    name: 'Winter',
    months: [12, 1, 2],
    monthsLabel: 'Dec–Feb',
    slots: {
      fruit1: { name: 'orange (kinnow)', foods: [['orange', 1]], fallback: 'guava' },
      fruit3: { name: 'guava', foods: [['guava', 1]], fallback: 'banana' },
      sabzi: {
        name: 'peas, cauliflower and carrot',
        foods: [
          ['onion', 0.25],
          ['tomato', 0.25],
          ['peas', 0.2],
          ['cauliflower', 0.15],
          ['carrot', 0.15],
        ],
      },
      salad: {
        name: 'carrot, radish, onion and tomato',
        foods: [
          ['carrot', 0.35],
          ['radish', 0.2],
          ['onion', 0.25],
          ['tomato', 0.2],
        ],
      },
      greens: { name: 'palak (spinach)', foods: [['spinach', 1]], fallback: 'methi' },
    },
  },
  summer: {
    id: 'summer',
    name: 'Summer',
    months: [3, 4, 5],
    monthsLabel: 'Mar–May',
    slots: {
      fruit1: { name: 'muskmelon', foods: [['muskmelon', 1]], fallback: 'papaya (all year), e.g. in early March' },
      fruit3: { name: 'banana', foods: [['banana', 1]] },
      sabzi: {
        name: 'lauki, kaddu and bhindi',
        foods: [
          ['onion', 0.25],
          ['tomato', 0.25],
          ['bottleGourd', 0.2],
          ['pumpkin', 0.15],
          ['okra', 0.15],
        ],
        fallback: 'tinda or tori',
      },
      salad: SALAD_CUCUMBER,
      greens: { name: 'chaulai (amaranth)', foods: [['amaranth', 1]], fallback: 'palak' },
    },
  },
  monsoon: {
    id: 'monsoon',
    name: 'Monsoon',
    months: [6, 7, 8],
    monthsLabel: 'Jun–Aug',
    slots: {
      fruit1: { name: 'mango', foods: [['mango', 1]], fallback: 'papaya (all year)' },
      fruit3: { name: 'banana', foods: [['banana', 1]] },
      sabzi: {
        name: 'bhindi, lauki and baingan',
        foods: [
          ['onion', 0.25],
          ['tomato', 0.25],
          ['okra', 0.2],
          ['bottleGourd', 0.15],
          ['brinjal', 0.15],
        ],
      },
      salad: SALAD_CUCUMBER,
      greens: { name: 'chaulai (amaranth)', foods: [['amaranth', 1]], fallback: 'palak' },
    },
  },
  autumn: {
    id: 'autumn',
    name: 'Autumn',
    months: [9, 10, 11],
    monthsLabel: 'Sep–Nov',
    slots: {
      fruit1: { name: 'papaya', foods: [['papaya', 1]], fallback: 'guava from October' },
      fruit3: { name: 'apple', foods: [['apple', 1]], fallback: 'banana' },
      sabzi: {
        name: 'gobhi, French beans and baingan',
        foods: [
          ['onion', 0.25],
          ['tomato', 0.25],
          ['cauliflower', 0.2],
          ['frenchBeans', 0.15],
          ['brinjal', 0.15],
        ],
      },
      salad: SALAD_CUCUMBER,
      greens: { name: 'palak (spinach)', foods: [['spinach', 1]], fallback: 'chaulai' },
    },
  },
};

/** The season for an ISO date (YYYY-MM-DD). */
export function seasonForDate(iso: string): SeasonId {
  const month = Number(iso.slice(5, 7));
  return SEASON_IDS.find((s) => SEASONS[s].months.includes(month)) ?? 'winter';
}

/** The first day of the next season after an ISO date, and which season it is. */
export function nextSeasonChange(iso: string): { date: string; season: SeasonId } {
  const year = Number(iso.slice(0, 4));
  const month = Number(iso.slice(5, 7));
  const starts = [3, 6, 9, 12];
  const next = starts.find((m) => m > month);
  const date = next ? `${year}-${String(next).padStart(2, '0')}-01` : `${year + 1}-03-01`;
  return { date, season: seasonForDate(date) };
}
