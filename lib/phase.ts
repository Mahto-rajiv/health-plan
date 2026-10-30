import { PHASES, phaseForWeek, type PhaseId } from './config';
import { daysBetween, programWeek } from './dates';
import { assessGain } from './progress';
import type { BodyEntry, Settings } from './storage';

/** The phase in force on a date: the Settings override, or the program week. */
export function phaseOn(settings: Settings, iso: string | null): PhaseId {
  if (settings.phase !== 'auto') return settings.phase;
  return iso ? phaseForWeek(programWeek(settings.programStart, iso)) : 0;
}

/** Weight assessment for today with the user's settings. */
export function assessToday(body: BodyEntry[], settings: Settings, today: string) {
  const phase = phaseOn(settings, today);
  const weeksIn = Math.max(0, Math.floor(daysBetween(settings.programStart, today) / 7));
  const phase2From = (PHASES[2].weeks[0] - 1) * 7;
  const monthsGaining = Math.max(0, (daysBetween(settings.programStart, today) - phase2From) / 30.4);
  return assessGain(body, {
    heightCm: settings.heightCm,
    startWeightKg: settings.startWeightKg,
    preLossWeightKg: settings.preLossWeightKg,
    phase,
    weeksIn,
    monthsGaining: phase === 2 ? monthsGaining : 0,
  });
}
