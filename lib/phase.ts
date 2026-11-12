import { PROGRAM_START, PHASE_IDS, phaseForWeek, type PhaseId } from './config';
import { programWeek, startsLabel } from './dates';

/** Program week (1-based) on a date, from the fixed start. Before the start it is week 1. */
export const weekOn = (iso: string) => programWeek(PROGRAM_START, iso);

/** The phase on a date: weeks 1–4 → 1, 5+ → 2. Before the start (or during SSR), Phase 1. */
export function phaseOn(iso: string | null): PhaseId {
  return iso ? phaseForWeek(weekOn(iso)) : 1;
}

/** A phase from a URL or an old saved value, or null if it isn't a current phase (e.g. "0"). */
export function parsePhase(raw: string | null | undefined): PhaseId | null {
  if (raw === null || raw === undefined || raw.trim() === '') return null;
  const n = Number(raw);
  return (PHASE_IDS as number[]).includes(n) ? (n as PhaseId) : null;
}

/** "Starts Mon 9 Nov" before the start, otherwise "Program week N". */
export const weekLabel = (iso: string) => startsLabel(PROGRAM_START, iso) ?? `Program week ${weekOn(iso)}`;
