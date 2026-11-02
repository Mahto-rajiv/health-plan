'use client';

import { useMemo } from 'react';
import type { PhaseId } from './config';
import { resolvePrices } from './data/prices';
import { computePlans, findPlan } from './meal-plans';
import { phaseOn, seasonOn } from './phase';
import type { SeasonId } from './data/seasons';
import { usePriceOverrides, useSettings } from './storage';

/** Default prices with the user's edits applied. */
export function usePrices() {
  const [overrides] = usePriceOverrides();
  return useMemo(() => resolvePrices(overrides), [overrides]);
}

/** All three plans for a phase and season, costed with the user's prices. */
export function usePlans(phase: PhaseId, season: SeasonId) {
  const prices = usePrices();
  return useMemo(() => computePlans(phase, season, prices), [phase, season, prices]);
}

/** The active plan for a date, at that date's phase. */
export function useActivePlan(iso: string | null) {
  const [settings] = useSettings();
  const phase = phaseOn(settings, iso);
  const season = seasonOn(settings, iso);
  const plans = usePlans(phase, season);
  return { plan: findPlan(plans, settings.planId), plans, phase, season };
}
