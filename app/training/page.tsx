'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { WORKOUT_SESSIONS, WEEKLY_SCHEDULE, PROGRESSION_GUIDE, CARDIO_PROTOCOL, MOBILITY_PROTOCOL } from '@/lib/trainingData';
import { WorkoutSession, Exercise, CompletedSet } from '@/lib/types';
import { getDayOfWeek, getLocal, setLocal, STORAGE_KEYS, cn } from '@/lib/utils';
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp, Timer, AlertCircle,
  Dumbbell, Info, TrendingUp, RotateCcw, PlayCircle, StopCircle, Check
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type Day = typeof DAYS[number];

export default function TrainingPage() {
  const today = getDayOfWeek() as Day;
  const [activeTab, setActiveTab] = useState('workout');
  const [selectedDay, setSelectedDay] = useState<Day>(today);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerTarget, setTimerTarget] = useState(90);
  const [workoutComplete, setWorkoutComplete] = useState(false);

  const schedule = WEEKLY_SCHEDULE[selectedDay];
  const session = schedule?.sessionId
    ? WORKOUT_SESSIONS.find(s => s.id === schedule.sessionId)
    : null;

  // Rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => {
          if (s <= 1) { setTimerActive(false); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const toggleExercise = (id: string) => {
    setExpandedExercises(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSet = (exerciseId: string, setIndex: number, totalSets: number) => {
    setCompletedSets(prev => {
      const existing = prev[exerciseId] || Array(totalSets).fill(false);
      const updated = [...existing];
      updated[setIndex] = !updated[setIndex];
      return { ...prev, [exerciseId]: updated };
    });
  };

  const startRestTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setTimerTarget(seconds);
    setTimerActive(true);
  };

  const allSetsComplete = session
    ? session.exercises.every(ex => {
        const sets = completedSets[ex.id] || [];
        return sets.filter(Boolean).length >= ex.sets;
      })
    : false;

  const totalCompletedSets = Object.values(completedSets).flat().filter(Boolean).length;
  const totalSets = session?.exercises.reduce((s, ex) => s + ex.sets, 0) || 0;

  const timerPercent = timerTarget > 0 ? ((timerTarget - timerSeconds) / timerTarget) * 100 : 0;
  const timerMin = Math.floor(timerSeconds / 60);
  const timerSec = timerSeconds % 60;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Training</h1>
          <p className="text-sm text-slate-500 mt-0.5">Upper/Lower 4-day program · Beginner linear progression</p>
        </div>
        <Badge variant="info">Week 4 · Linear Progression</Badge>
      </div>

      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {DAYS.map(day => {
          const daySchedule = WEEKLY_SCHEDULE[day];
          const isToday = day === today;
          const isSelected = day === selectedDay;
          const hasWorkout = daySchedule.sessionId !== null;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                'flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border',
                isSelected
                  ? 'bg-sky-500 text-white border-sky-500'
                  : isToday
                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              <span>{day.slice(0, 3)}</span>
              <div className={cn(
                'w-1.5 h-1.5 rounded-full',
                hasWorkout ? (isSelected ? 'bg-white' : 'bg-sky-400') : 'bg-transparent'
              )} />
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'workout', label: "Today's Workout", icon: '💪' },
          { id: 'schedule', label: 'Weekly Schedule', icon: '📅' },
          { id: 'cardio', label: 'Cardio & Mobility', icon: '🏃' },
          { id: 'progression', label: 'Progression', icon: '📈' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'workout' && (
        <WorkoutTab
          session={session}
          schedule={schedule}
          selectedDay={selectedDay}
          today={today}
          workoutStarted={workoutStarted}
          setWorkoutStarted={setWorkoutStarted}
          workoutComplete={workoutComplete}
          setWorkoutComplete={setWorkoutComplete}
          expandedExercises={expandedExercises}
          toggleExercise={toggleExercise}
          completedSets={completedSets}
          toggleSet={toggleSet}
          startRestTimer={startRestTimer}
          totalCompletedSets={totalCompletedSets}
          totalSets={totalSets}
          allSetsComplete={allSetsComplete}
          timerSeconds={timerSeconds}
          timerActive={timerActive}
          setTimerActive={setTimerActive}
          timerPercent={timerPercent}
          timerMin={timerMin}
          timerSec={timerSec}
          setCompletedSets={setCompletedSets}
        />
      )}

      {activeTab === 'schedule' && <ScheduleTab today={today} setSelectedDay={setSelectedDay} setActiveTab={setActiveTab} />}
      {activeTab === 'cardio' && <CardioTab />}
      {activeTab === 'progression' && <ProgressionTab />}
    </div>
  );
}

// ─── Workout Tab ──────────────────────────────────────────────────────────────
function WorkoutTab({
  session, schedule, selectedDay, today, workoutStarted, setWorkoutStarted,
  workoutComplete, setWorkoutComplete, expandedExercises, toggleExercise,
  completedSets, toggleSet, startRestTimer, totalCompletedSets, totalSets,
  allSetsComplete, timerSeconds, timerActive, setTimerActive, timerPercent,
  timerMin, timerSec, setCompletedSets
}: any) {

  if (!session) {
    return (
      <Card className="text-center py-10">
        <div className="text-5xl mb-3">{schedule?.type === 'cardio' ? '🏃' : schedule?.type === 'rest' ? '😴' : '🧘'}</div>
        <h3 className="font-semibold text-slate-800 text-lg">{schedule?.label}</h3>
        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
          {schedule?.type === 'cardio'
            ? 'Zone 2 cardio (30-40 min) + Saturday mobility session. See the Cardio & Mobility tab.'
            : schedule?.type === 'rest'
              ? 'Rest day. Your muscles are recovering and growing. A light walk is encouraged — no gym.'
              : 'Active recovery or extra rest. No resistance training today.'}
        </p>
        {selectedDay !== today && (
          <div className="mt-4 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block">
            Viewing {selectedDay}&apos;s plan (today is {today})
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Session header */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <h2 className="font-bold text-slate-800">{session.name}</h2>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-500">
              <span>⏱ ~{session.estimatedMinutes} min</span>
              <span>🏋️ {session.exercises.length} exercises</span>
              <span>📊 {totalSets} total sets</span>
              <span>🔥 Warm-up: {session.warmupMinutes} min</span>
            </div>
            {session.focusNote && (
              <p className="text-xs text-sky-700 bg-sky-50 rounded-md px-2 py-1.5 mt-2 border border-sky-100">{session.focusNote}</p>
            )}
          </div>
          <div className="flex gap-2">
            {!workoutStarted ? (
              <Button
                variant="primary"
                size="sm"
                icon={<PlayCircle size={15} />}
                onClick={() => setWorkoutStarted(true)}
              >
                Start Workout
              </Button>
            ) : (
              <Button
                variant="success"
                size="sm"
                icon={<Check size={15} />}
                onClick={() => setWorkoutComplete(true)}
                disabled={workoutComplete}
              >
                {workoutComplete ? 'Done! ✓' : 'Finish'}
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {workoutStarted && totalSets > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>{totalCompletedSets} of {totalSets} sets complete</span>
              <span>{Math.round((totalCompletedSets / totalSets) * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${(totalCompletedSets / totalSets) * 100}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Rest timer */}
      {timerSeconds > 0 && (
        <Card className="!p-4 bg-slate-800 text-white border-0">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                  strokeDasharray={`${timerPercent} 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{timerMin}:{timerSec.toString().padStart(2, '0')}</span>
              </div>
            </div>
            <div>
              <p className="font-medium text-sm">Rest Timer</p>
              <p className="text-xs text-slate-400">{timerActive ? 'Resting…' : 'Timer complete!'}</p>
            </div>
            <button
              onClick={() => setTimerActive(false)}
              className="ml-auto text-slate-400 hover:text-white"
            >
              <StopCircle size={20} />
            </button>
          </div>
        </Card>
      )}

      {/* Exercises */}
      <div className="space-y-3">
        {session.exercises.map((ex: Exercise) => {
          const isExpanded = expandedExercises.has(ex.id);
          const sets = completedSets[ex.id] || Array(ex.sets).fill(false);
          const completedCount = sets.filter(Boolean).length;

          return (
            <Card key={ex.id} padding="none" className="overflow-hidden">
              {/* Exercise header */}
              <button
                onClick={() => toggleExercise(ex.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                  completedCount === ex.sets ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                )}>
                  {completedCount === ex.sets ? '✓' : `${completedCount}/${ex.sets}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm">{ex.name}</p>
                  <div className="flex flex-wrap gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{ex.sets}×{ex.repsStr} reps</span>
                    <span className="text-xs text-slate-400">RIR {ex.rir}</span>
                    <span className="text-xs text-slate-400">Rest {ex.restSeconds}s</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {ex.muscleGroups.slice(0, 1).map(m => (
                    <Badge key={m} variant="neutral" size="sm">{m}</Badge>
                  ))}
                  {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-4 space-y-4">
                  {/* Set tracker */}
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-2">Set Completion</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: ex.sets }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            toggleSet(ex.id, i, ex.sets);
                            if (!sets[i]) startRestTimer(ex.restSeconds);
                          }}
                          className={cn(
                            'w-10 h-10 rounded-lg text-sm font-medium border-2 transition-all',
                            sets[i]
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-sky-300'
                          )}
                        >
                          {sets[i] ? <CheckCircle2 size={16} className="mx-auto" /> : i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => startRestTimer(ex.restSeconds)}
                        className="w-10 h-10 rounded-lg text-xs border-2 border-dashed border-slate-200 text-slate-400 hover:border-sky-300 hover:text-sky-500 transition-all flex items-center justify-center"
                        title="Start rest timer"
                      >
                        <Timer size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">Tap sets to mark complete · Timer auto-starts</p>
                  </div>

                  {/* Notes */}
                  {ex.notes && (
                    <div className="flex gap-2 text-xs text-slate-600 bg-sky-50 rounded-lg p-2.5">
                      <Info size={13} className="text-sky-500 flex-shrink-0 mt-0.5" />
                      {ex.notes}
                    </div>
                  )}

                  {/* Form cues */}
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1.5">Form Cues</p>
                    <ul className="space-y-1">
                      {ex.formCues.map((cue, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          {cue}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Progression */}
                  <div className="flex gap-2 text-xs bg-amber-50 rounded-lg p-2.5">
                    <TrendingUp size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-amber-700">Progression: </span>
                      <span className="text-amber-700">{ex.progressionRule}</span>
                    </div>
                  </div>

                  {/* Muscle groups */}
                  <div className="flex flex-wrap gap-1.5">
                    {ex.muscleGroups.map(m => <Badge key={m} variant="neutral" size="sm">{m}</Badge>)}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Cooldown note */}
      <Card className="bg-emerald-50 border-emerald-200 !p-4">
        <p className="text-xs font-medium text-emerald-700 mb-1">Cool-down</p>
        <p className="text-xs text-emerald-700">{session.cooldownNote}</p>
      </Card>

      {/* Missed workout guide */}
      <Card className="!p-4 border-l-4 border-l-amber-400">
        <div className="flex items-start gap-2">
          <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-amber-700">If you miss this workout:</p>
            <p className="text-xs text-amber-600 mt-0.5">{session.alternativeIfMissed || 'Train the following day. Do not stack sessions.'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Schedule Tab ─────────────────────────────────────────────────────────────
function ScheduleTab({ today, setSelectedDay, setActiveTab }: any) {
  const typeColors: Record<string, string> = {
    strength: 'bg-sky-100 text-sky-700 border-sky-200',
    cardio: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rest: 'bg-slate-100 text-slate-500 border-slate-200',
  };
  return (
    <div className="space-y-3">
      <Card className="!p-4">
        <h3 className="font-semibold text-slate-800 text-sm mb-3">Weekly Training Schedule</h3>
        <div className="space-y-2">
          {DAYS.map(day => {
            const schedule = WEEKLY_SCHEDULE[day];
            const session = schedule.sessionId ? WORKOUT_SESSIONS.find(s => s.id === schedule.sessionId) : null;
            const isToday = day === today;
            return (
              <button
                key={day}
                onClick={() => { setSelectedDay(day); setActiveTab('workout'); }}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all hover:shadow-sm',
                  typeColors[schedule.type],
                  isToday && 'ring-2 ring-sky-400'
                )}
              >
                <div className="w-16 flex-shrink-0">
                  <p className="text-xs font-semibold">{day}</p>
                  {isToday && <span className="text-xs opacity-70">Today</span>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{schedule.label}</p>
                  {session && (
                    <p className="text-xs opacity-70 mt-0.5">{session.exercises.length} exercises · ~{session.estimatedMinutes} min</p>
                  )}
                </div>
                <Badge variant={schedule.type === 'strength' ? 'info' : schedule.type === 'cardio' ? 'success' : 'neutral'} size="sm">
                  {schedule.type}
                </Badge>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Missed workout policy */}
      <Card className="!p-4">
        <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <RotateCcw size={14} className="text-amber-500" /> Missed Workout Policy
        </h3>
        <div className="space-y-2.5">
          {Object.entries(PROGRESSION_GUIDE.missedWorkout).map(([key, val]) => (
            <div key={key} className="flex gap-3 text-xs">
              <span className="font-medium text-slate-700 w-28 flex-shrink-0 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
              <span className="text-slate-600">{val}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Cardio Tab ───────────────────────────────────────────────────────────────
function CardioTab() {
  return (
    <div className="space-y-4">
      <Card className="!p-4">
        <h3 className="font-semibold text-slate-800 text-sm mb-3">🏃 Saturday Cardio</h3>
        <div className="space-y-2.5">
          <InfoRow label="Type" value={CARDIO_PROTOCOL.primary.name} />
          <InfoRow label="Duration" value={CARDIO_PROTOCOL.primary.duration} />
          <InfoRow label="Intensity" value={CARDIO_PROTOCOL.primary.intensity} />
          <InfoRow label="HR Zone" value={CARDIO_PROTOCOL.primary.hrTarget} />
          <div className="mt-2 p-2.5 bg-sky-50 rounded-lg text-xs text-sky-700">{CARDIO_PROTOCOL.primary.note}</div>
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1.5">Equipment Options</p>
            <div className="flex flex-wrap gap-1.5">
              {CARDIO_PROTOCOL.primary.options.map(o => <Badge key={o} variant="info" size="sm">{o}</Badge>)}
            </div>
          </div>
        </div>
      </Card>

      <Card className="!p-4">
        <h3 className="font-semibold text-slate-800 text-sm mb-3">📱 Daily Activity</h3>
        <InfoRow label="Step Goal" value={CARDIO_PROTOCOL.supplementary.target} />
        <p className="text-xs text-slate-500 mt-2">{CARDIO_PROTOCOL.supplementary.note}</p>
        <div className="mt-3 p-2.5 bg-amber-50 rounded-lg text-xs text-amber-700">
          <strong>Desk rule:</strong> {CARDIO_PROTOCOL.walkingDesk.rule}
        </div>
      </Card>

      <Card className="!p-4">
        <h3 className="font-semibold text-slate-800 text-sm mb-3">🧘 Saturday Mobility (15-20 min)</h3>
        <div className="space-y-1.5">
          {MOBILITY_PROTOCOL.saturdayRoutine.exercises.map((ex, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <span className="text-sky-400 font-medium flex-shrink-0">{i + 1}.</span>
              {ex}
            </div>
          ))}
        </div>
      </Card>

      <Card className="!p-4">
        <h3 className="font-semibold text-slate-800 text-sm mb-3">⚡ Daily Mobility (2-3 min)</h3>
        <div className="space-y-2.5">
          {MOBILITY_PROTOCOL.daily.map((item, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-2.5">
              <p className="text-xs font-medium text-slate-700">{item.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.duration}</p>
              <p className="text-xs text-sky-600 mt-0.5">{item.note}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Progression Tab ──────────────────────────────────────────────────────────
function ProgressionTab() {
  return (
    <div className="space-y-4">
      <Card className="!p-4">
        <h3 className="font-semibold text-slate-800 text-sm mb-3">📈 Progression Principle</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{PROGRESSION_GUIDE.principle}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {Object.entries(PROGRESSION_GUIDE.increments).map(([key, val]) => (
            <div key={key} className="bg-slate-50 rounded-lg p-2.5">
              <p className="text-xs font-medium text-slate-700 capitalize">{key}</p>
              <p className="text-xs text-slate-500 mt-0.5">{val}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="!p-4">
        <h3 className="font-semibold text-slate-800 text-sm mb-3">🔄 Deload Schedule</h3>
        <p className="text-xs text-slate-600">{PROGRESSION_GUIDE.deloadSchedule}</p>
      </Card>

      <Card className="!p-4">
        <h3 className="font-semibold text-slate-800 text-sm mb-3">🧱 Plateau Protocol</h3>
        <p className="text-xs text-slate-600">{PROGRESSION_GUIDE.plateauProtocol}</p>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-xs">
      <span className="font-medium text-slate-500 w-20 flex-shrink-0">{label}</span>
      <span className="text-slate-700">{value}</span>
    </div>
  );
}

