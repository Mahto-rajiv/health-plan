import { PROGRAM_START, phaseForWeek, type PhaseId } from './config';
import { programWeek, startsLabel } from './dates';

/** Program week (1-based) on a date, from the fixed start. Before the start it is week 1. */
export const weekOn = (iso: string) => programWeek(PROGRAM_START, iso);

/** The phase on a date: weeks 1–2 → 0, 3–4 → 1, 5+ → 2. Before the start (or during SSR), Phase 0. */
export function phaseOn(iso: string | null): PhaseId {
  return iso ? phaseForWeek(weekOn(iso)) : 0;
}

/** "Starts Mon 9 Nov" before the start, otherwise "Program week N". */
export const weekLabel = (iso: string) => startsLabel(PROGRAM_START, iso) ?? `Program week ${weekOn(iso)}`;
