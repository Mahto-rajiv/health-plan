'use client';

import { useMemo } from 'react';
import type { PhaseId } from './config';
import { resolvePrices } from './data/prices';
import { computePlans, findPlan } from './meal-plans';
import { phaseOn } from './phase';
import { usePriceOverrides, useSettings } from './storage';

/** Default prices with the user's edits applied. */
export function usePrices() {
  const [overrides] = usePriceOverrides();
  return useMemo(() => resolvePrices(overrides), [overrides]);
}

/** All three plans for a phase, costed with the user's prices. */
export function usePlans(phase: PhaseId) {
  const prices = usePrices();
  return useMemo(() => computePlans(phase, prices), [phase, prices]);
}

/** The active plan for a date, at that date's phase. */
export function useActivePlan(iso: string | null) {
  const [settings] = useSettings();
  const phase = phaseOn(settings, iso);
  const plans = usePlans(phase);
  return { plan: findPlan(plans, settings.planId), plans, phase };
}
