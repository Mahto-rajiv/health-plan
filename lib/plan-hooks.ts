'use client';

import { useMemo } from 'react';
import type { PhaseId } from './config';
import { DEFAULT_PRICE_TABLE } from './data/prices';
import { computePlans, findPlan } from './meal-plans';
import { phaseOn } from './phase';
import { useSettings } from './storage';

/** The price table every cost in the app uses (estimates in lib/data/prices.ts). */
export const usePrices = () => DEFAULT_PRICE_TABLE;

/** All three plans for a phase, costed at the default prices. */
export function usePlans(phase: PhaseId) {
  return useMemo(() => computePlans(phase, DEFAULT_PRICE_TABLE), [phase]);
}

/** The picked plan for a date, at that date's phase. */
export function useActivePlan(iso: string | null) {
  const [settings] = useSettings();
  const phase = phaseOn(iso);
  const plans = usePlans(phase);
  return { plan: findPlan(plans, settings.planId), plans, phase };
}
