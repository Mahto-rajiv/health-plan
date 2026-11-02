// Weekly-average vitamins and minerals for a computed plan, compared with the
// reference intakes in lib/data/nutrients.ts. Everything is computed from the
// food table, so it can't go stale when meals or amounts change.
import { FOODS, type FoodId } from './data/foods';
import { NUTRIENTS, type NutrientInfo } from './data/nutrients';
import type { NutrientKey } from './data/nutrient-keys';
import type { ComputedPlan } from './meal-plans';

export type AuditStatus = 'below-ear' | 'below-rda' | 'below-ai' | 'meets' | 'above-ul' | 'info';

export interface AuditRow {
  info: NutrientInfo;
  /** Weekly average per day. */
  value: number;
  /** Lowest single day. */
  lowestDay: number;
  status: AuditStatus;
  /** Foods with no value for this nutrient in their source table. */
  missing: FoodId[];
  /** Biggest contributors, share of the weekly total. */
  topSources: { food: FoodId; name: string; share: number }[];
}

export function statusFor(info: NutrientInfo, value: number): AuditStatus {
  if (info.infoOnly) return 'info';
  if (info.ul && value > info.ul) return 'above-ul';
  if (info.ear && value < info.ear) return 'below-ear';
  // Nutrients with only an adequate intake (AI) have no average need, so "above the
  // average need" would be meaningless for them (owner's Round 3 review).
  if (info.rda && value < info.rda) return info.adequateIntake ? 'below-ai' : 'below-rda';
  return 'meets';
}

export const STATUS_LABEL: Record<AuditStatus, string> = {
  'below-ear': 'below the average need (EAR)',
  'below-rda': 'above the average need, below the RDA',
  'below-ai': 'below the adequate intake (no average need is set)',
  meets: 'meets the RDA or AI',
  'above-ul': 'above the upper limit',
  info: 'for information',
};

/** Per-food weekly amount of one nutrient. */
function contributions(plan: ComputedPlan, key: NutrientKey): Map<FoodId, number> {
  const out = new Map<FoodId, number>();
  for (const d of plan.days)
    for (const pm of d.meals)
      for (const it of pm.meal.items) {
        const v = ((FOODS[it.food].per100[key] ?? 0) * it.g) / 100;
        if (v > 0) out.set(it.food, (out.get(it.food) ?? 0) + v);
      }
  return out;
}

export function auditPlan(plan: ComputedPlan): AuditRow[] {
  return NUTRIENTS.map((info) => {
    const value = plan.weeklyAverage[info.key];
    const lowestDay = Math.min(...plan.days.map((d) => d.totals[info.key]));
    const contrib = contributions(plan, info.key);
    const total = [...contrib.values()].reduce((s, v) => s + v, 0);
    const topSources = [...contrib.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([food, v]) => ({ food, name: FOODS[food].name, share: total ? v / total : 0 }));
    return { info, value, lowestDay, status: statusFor(info, value), missing: plan.missing[info.key] ?? [], topSources };
  });
}

/** Smallest and largest weekly average across many plans (e.g. all phases). */
export function auditRange(plans: ComputedPlan[]): { info: NutrientInfo; min: number; max: number; worst: AuditStatus; belowEar: string[] }[] {
  const audits = plans.map((p) => ({ p, rows: auditPlan(p) }));
  const order: AuditStatus[] = ['above-ul', 'below-ear', 'below-rda', 'below-ai', 'meets', 'info'];
  return NUTRIENTS.map((info, i) => {
    const vals = audits.map((a) => a.rows[i].value);
    const statuses = audits.map((a) => a.rows[i].status);
    const worst = order.find((s) => statuses.includes(s)) ?? 'meets';
    const belowEar = audits.filter((a) => a.rows[i].status === 'below-ear').map((a) => `${a.p.def.shortName}, Phase ${a.p.phase}`);
    return { info, min: Math.min(...vals), max: Math.max(...vals), worst, belowEar };
  });
}

/** Round for display with sensible precision for the unit size. */
export function fmtAmount(v: number): string {
  if (v >= 100) return Math.round(v).toLocaleString('en-IN');
  if (v >= 10) return v.toFixed(0);
  if (v >= 1) return v.toFixed(1);
  return v.toFixed(2);
}
