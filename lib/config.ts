// ─── Single source of truth for profile, budget and phases ───────────────────
// Every "within / over budget" label, every phase target and every default
// profile value in the app is read from here. Change a number once, here.

/** Facts from the owner (Oct 2026). Defaults for Settings; Settings can override them. */
export const PROFILE = {
  sex: 'male',
  age: 24,
  heightCm: 180,
  /** Weight now (start of the program). */
  weightKg: 64,
  /** Weight about six months before the program: the pre-loss weight and first checkpoint. */
  preLossWeightKg: 68,
  longTermTargetKg: 75,
  /** Self-estimate of current intake, not measured. */
  intakeNow: { kcal: 2000, protein: 60 },
  /** Estimate: weight fell ~4 kg in 6 months on < ~2,000 kcal, so maintenance is a little above that. */
  maintenanceEstimate: [2000, 2100] as [number, number],
} as const;

/**
 * Food budget in ₹ per month. Round 3 (owner): ₹6,000 is a ceiling, not a target;
 * among plans that pass the hard rules and nutrient adequacy, the solver picks
 * the cheapest. `planningMax` is the most a plan may cost at the DEFAULT prices:
 * 10% under the ceiling, so a uniform 10% rise in prices (a year of food
 * inflation, or a dearer shop) still fits inside ₹6,000. Item prices are
 * estimates (±15% each), but item errors partly cancel; a shift across the
 * board is the realistic risk. Supplements are costed separately.
 */
export const BUDGET = {
  max: 6000,
  planningMax: 5400,
} as const;

/**
 * Variety and balance rules (Round 3). Hard limits in the solver, checked in tests.
 * They are design choices, not health limits: no guideline caps dairy for adults.
 * • Dairy must not carry the diet (owner). The solver minimises milk + curd right
 *   after nutrient adequacy and before cost (scripts/solve-plans.ts, stage 2), so
 *   dairy is as low as the nutrient targets and fibre caps allow. A fixed cap was
 *   tried first: in Phases 0–1 the vegetarian plan is infeasible below ~1,100 g a
 *   day (with less dairy, the calories must come from atta, rice and pulses, which
 *   break the 35/40 g fibre caps). `milkCurdMaxG` is only a backstop.
 * • Variety: no single food gives more than 25% of a week's energy, so the cheapest
 *   plan can't lean on a few foods; every menu item keeps its minimum portion.
 * • Soya chunks ≤ 50 g a day after Phase 0 (Phase 0 cap is in PHASES).
 * • Eggs ≤ 21 a week.
 */
export const PLAN_RULES = {
  milkCurdMaxG: 1100,
  foodEnergyShareMax: 0.25,
  soyaMaxG: 50,
  eggsPerWeek: 21,
} as const;

export type BudgetStatus = 'within' | 'over';

export function budgetStatus(monthly: number): BudgetStatus {
  return monthly > BUDGET.max ? 'over' : 'within';
}

export const BUDGET_LABEL: Record<BudgetStatus, string> = {
  within: 'within budget',
  over: 'over budget',
};

export type PhaseId = 0 | 1 | 2;

export interface Phase {
  id: PhaseId;
  name: string;
  /** Program weeks covered (inclusive). `null` = open-ended. */
  weeks: [number, number | null];
  goal: string;
  /** Daily calorie band the plans must hit on every day of the week. */
  kcal: [number, number];
  /** Daily protein band (g). */
  protein: [number, number];
  /** Maximum fibre per day (g). */
  fibreMax: number;
  /** Per-day caps for foods that need a slow start (g, dry). */
  caps: Partial<Record<'soyaChunks' | 'sattu', number>>;
}

// Phase 0 and 1 targets are "about" figures in the brief (~2,200 kcal, ~90 g);
// they are enforced as ±5% bands. Phase 2 is the brief's own range.
export const PHASES: Record<PhaseId, Phase> = {
  0: {
    id: 0,
    name: 'Phase 0 · Stop the loss',
    weeks: [1, 2],
    goal: 'Stop the weight loss: weekly average within ±0.5 kg of your start. Lets your gut get used to more food and fibre.',
    kcal: [2090, 2310],
    protein: [85.5, 94.5],
    fibreMax: 35,
    caps: { soyaChunks: 20, sattu: 25 },
  },
  1: {
    id: 1,
    name: 'Phase 1 · Build up',
    weeks: [3, 4],
    goal: 'Step up food and protein; weight should be flat or starting to rise.',
    kcal: [2280, 2520],
    protein: [99.75, 110.25],
    fibreMax: 40,
    caps: {},
  },
  2: {
    id: 2,
    name: 'Phase 2 · Gain',
    weeks: [5, null],
    goal: 'Slow gain of 0.5–1.0 kg a month toward the 68 kg checkpoint.',
    kcal: [2550, 2700],
    protein: [110, 125],
    fibreMax: 50,
    caps: {},
  },
};

export const PHASE_IDS: PhaseId[] = [0, 1, 2];

/** Shared by all phases. */
export const DAILY = {
  /** Share of energy from fat. */
  fatEnergy: [0.25, 0.3] as [number, number],
  fluidsL: [2.5, 3.5] as [number, number],
  saltG: 5,
  /** Weight-gain rate once gaining (kg/month). */
  gainPerMonth: [0.5, 1.0] as [number, number],
} as const;

export function phaseForWeek(week: number): PhaseId {
  if (week <= 2) return 0;
  if (week <= 4) return 1;
  return 2;
}

// ─── Energy ───────────────────────────────────────────────────────────────────
// kcal are computed from macros: 4 kcal/g protein, 4 kcal/g available
// carbohydrate (fibre excluded), 9 kcal/g fat and 2 kcal/g fibre (FAO 2003).
export const ATWATER = { protein: 4, carbs: 4, fat: 9, fiber: 2 } as const;
