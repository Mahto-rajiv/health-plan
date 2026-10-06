'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar, MacroProgress } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { USER_PROFILE, MACRO_TARGETS } from '@/lib/userData';
import { WORKOUT_SESSIONS, WEEKLY_SCHEDULE } from '@/lib/trainingData';
import { MEAL_PLANS } from '@/lib/mealPlanData';
import { SAMPLE_WEIGHT_DATA } from '@/lib/healthData';
import { getDayOfWeek, formatDate, calcWeightProgress, getLocal, setLocal, STORAGE_KEYS } from '@/lib/utils';
import {
  TrendingUp, Target, Dumbbell, Utensils, Droplets, Scale,
  CheckCircle2, Clock, ChevronRight, AlertCircle, Zap, Activity
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function DashboardPage() {
  const today = getDayOfWeek();
  const todaySchedule = WEEKLY_SCHEDULE[today as keyof typeof WEEKLY_SCHEDULE];
  const session = todaySchedule?.sessionId
    ? WORKOUT_SESSIONS.find(s => s.id === todaySchedule.sessionId)
    : null;

  const activePlanId = getLocal(STORAGE_KEYS.SELECTED_PLAN, 'preferred');
  const activePlan = MEAL_PLANS.find(p => p.id === activePlanId) || MEAL_PLANS[0];
  const todayDayPlan = activePlan.weeklyPlan.find(d => d.day === today) || activePlan.weeklyPlan[0];

  const [workoutDone, setWorkoutDone] = useState(() =>
    getLocal(`workout_${new Date().toISOString().split('T')[0]}`, false)
  );
  const [calories, setCalories] = useState(1680);
  const [protein, setProtein] = useState(112);
  const [water, setWater] = useState(2100);

  useEffect(() => {
    setLocal(`workout_${new Date().toISOString().split('T')[0]}`, workoutDone);
  }, [workoutDone]);

  const weightData = SAMPLE_WEIGHT_DATA.slice(-6).map(d => ({
    date: formatDate(d.date).split(' ').slice(0, 2).join(' '),
    weight: d.weightKg,
  }));

  const weightProgress = calcWeightProgress(
    SAMPLE_WEIGHT_DATA[SAMPLE_WEIGHT_DATA.length - 1]?.weightKg || USER_PROFILE.currentWeightKg,
    USER_PROFILE.startWeightKg,
    USER_PROFILE.targetWeightKg
  );

  const latestWeight = SAMPLE_WEIGHT_DATA[SAMPLE_WEIGHT_DATA.length - 1]?.weightKg || USER_PROFILE.currentWeightKg;
  const weightGained = latestWeight - USER_PROFILE.startWeightKg;
  const weightToGo = USER_PROFILE.targetWeightKg - latestWeight;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Good {getGreeting()}, Rajiv 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={todaySchedule?.type === 'rest' ? 'neutral' : 'info'}>
            {todaySchedule?.label || 'Rest Day'}
          </Badge>
        </div>
      </div>

      {/* Sample data notice */}
      <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
        <span>Dashboard shows <strong>sample data</strong> to illustrate the system. Progress, macros, and workout completion are mock values. Use the Progress page to add real entries.</span>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Current Weight"
          value={`${latestWeight} kg`}
          sub={`+${weightGained.toFixed(1)} kg gained`}
          icon={<Scale size={18} className="text-sky-500" />}
          color="sky"
        />
        <StatCard
          label="Target Weight"
          value="75 kg"
          sub={`${weightToGo.toFixed(1)} kg to go`}
          icon={<Target size={18} className="text-emerald-500" />}
          color="emerald"
        />
        <StatCard
          label="Training Week"
          value="Week 4"
          sub="Linear progression"
          icon={<Dumbbell size={18} className="text-violet-500" />}
          color="violet"
        />
        <StatCard
          label="BMI"
          value={String(USER_PROFILE.bmi)}
          sub="Healthy range (18.5–24.9)"
          icon={<Activity size={18} className="text-rose-500" />}
          color="rose"
        />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Weight trend chart */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Weight Trend</h3>
                <p className="text-xs text-slate-500 mt-0.5">Target: 0.25–0.5 kg/month lean gain</p>
              </div>
              <Link href="/progress">
                <Button variant="ghost" size="xs" className="text-sky-600">
                  View All <ChevronRight size={14} />
                </Button>
              </Link>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[65, 70]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(v: any) => [`${v} kg`, 'Weight']}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#0ea5e9" strokeWidth={2} fill="url(#weightGrad)" dot={{ fill: '#0ea5e9', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Progress bar */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Start: {USER_PROFILE.startWeightKg} kg</span>
                <span className="font-medium text-slate-700">{weightProgress}% to target</span>
                <span>Target: {USER_PROFILE.targetWeightKg} kg</span>
              </div>
              <ProgressBar value={weightProgress} max={100} color="bg-sky-500" />
            </div>
          </Card>
        </div>

        {/* Today's workout */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 text-sm">Today&apos;s Workout</h3>
            {workoutDone && <Badge variant="success">Completed ✓</Badge>}
          </div>

          {session ? (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border ${workoutDone ? 'bg-emerald-50 border-emerald-200' : 'bg-sky-50 border-sky-200'}`}>
                <p className="font-medium text-slate-800 text-sm">{session.name}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Clock size={12} />{session.estimatedMinutes} min</span>
                  <span>{session.exercises.length} exercises</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {session.exercises.slice(0, 3).map(ex => (
                  <div key={ex.id} className="flex justify-between text-xs text-slate-600">
                    <span>{ex.name}</span>
                    <span className="text-slate-400">{ex.sets}×{ex.repsStr}</span>
                  </div>
                ))}
                {session.exercises.length > 3 && (
                  <p className="text-xs text-slate-400">+{session.exercises.length - 3} more exercises</p>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                {!workoutDone && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setWorkoutDone(true)}
                    icon={<CheckCircle2 size={14} />}
                  >
                    Mark Done
                  </Button>
                )}
                <Link href="/training" className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">
                    Open Workout
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">{todaySchedule?.type === 'cardio' ? '🏃' : '😴'}</div>
              <p className="text-sm font-medium text-slate-700">{todaySchedule?.label}</p>
              <p className="text-xs text-slate-500 mt-1">
                {todaySchedule?.type === 'cardio'
                  ? '30-40 min Zone 2 cardio + mobility'
                  : 'Rest and recover. You earned it.'}
              </p>
              <Link href="/training" className="mt-3 inline-block">
                <Button variant="secondary" size="sm">View Schedule</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Nutrition + Meals row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Daily nutrition */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">Daily Nutrition</h3>
            <Link href="/nutrition">
              <Button variant="ghost" size="xs" className="text-sky-600">Details <ChevronRight size={14} /></Button>
            </Link>
          </div>

          {/* Calorie ring summary */}
          <div className="flex items-center gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#0ea5e9" strokeWidth="3"
                  strokeDasharray={`${(calories / MACRO_TARGETS.calories) * 100} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-700">{Math.round((calories / MACRO_TARGETS.calories) * 100)}%</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{calories}<span className="text-sm font-normal text-slate-400">/{MACRO_TARGETS.calories}</span></p>
              <p className="text-xs text-slate-500">kcal consumed</p>
              <p className="text-xs text-slate-400 mt-0.5">{MACRO_TARGETS.calories - calories} kcal remaining</p>
            </div>
          </div>

          <div className="space-y-3">
            <MacroProgress label="Protein" current={protein} target={MACRO_TARGETS.proteinG} unit="g" color="bg-sky-500" bgColor="bg-sky-50" />
            <MacroProgress label="Carbs" current={Math.round(calories * 0.48 / 4)} target={MACRO_TARGETS.carbsG} unit="g" color="bg-amber-400" bgColor="bg-amber-50" />
            <MacroProgress label="Fat" current={Math.round(calories * 0.24 / 9)} target={MACRO_TARGETS.fatG} unit="g" color="bg-violet-400" bgColor="bg-violet-50" />
            <MacroProgress label="Water" current={water} target={MACRO_TARGETS.waterMl} unit="ml" color="bg-blue-400" bgColor="bg-blue-50" />
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="secondary" size="sm" onClick={() => setProtein(p => Math.min(p + 20, MACRO_TARGETS.proteinG))}>+Protein</Button>
            <Button variant="secondary" size="sm" onClick={() => setCalories(c => Math.min(c + 200, MACRO_TARGETS.calories))}>+Calories</Button>
            <Button variant="secondary" size="sm" onClick={() => setWater(w => Math.min(w + 500, MACRO_TARGETS.waterMl))}>
              <Droplets size={14} className="text-blue-400" /> +Water
            </Button>
          </div>
        </Card>

        {/* Today's meals */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">Today&apos;s Meals</h3>
            <div className="flex items-center gap-2">
              <Badge variant="neutral" size="sm">{activePlan.icon} {activePlan.name}</Badge>
              <Link href="/meal-plans">
                <Button variant="ghost" size="xs" className="text-sky-600"><ChevronRight size={14} /></Button>
              </Link>
            </div>
          </div>

          <div className="space-y-2.5">
            {todayDayPlan?.meals.map((meal, idx) => (
              <div key={meal.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-xs font-medium text-slate-700 leading-snug">{meal.name}</p>
                    <span className="text-xs text-slate-400 flex-shrink-0">{meal.timeLabel}</span>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-slate-500">
                    <span>{meal.totalCalories} kcal</span>
                    <span>{meal.totalProteinG.toFixed(0)}g P</span>
                    {meal.isFixed && <Badge variant="info" size="sm">Fixed</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Daily total</span>
            <span className="font-medium text-slate-700">
              {todayDayPlan?.totalCalories} kcal · {todayDayPlan?.totalProteinG.toFixed(0)}g protein
            </span>
          </div>
        </Card>
      </div>

      {/* Quick insights row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <QuickInsight
          icon="💊"
          title="Supplements"
          items={['Vitamin D3: 2000 IU with dinner', 'Creatine: 5g any time', 'B12: 500mcg with meal']}
          href="/health"
          color="violet"
        />
        <QuickInsight
          icon="🏃"
          title="Activity Goal"
          items={['7,000–8,000 steps today', '5-min walk every hour', 'Stretch hips before dinner']}
          href="/recovery"
          color="emerald"
        />
        <QuickInsight
          icon="😴"
          title="Recovery"
          items={['Target: bed by 12:00 AM', 'Aim for 7.5–8 hours sleep', 'Deload: Week 8 (4 wks away)']}
          href="/recovery"
          color="sky"
        />
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function StatCard({ label, value, sub, icon, color }: {
  label: string; value: string; sub: string; icon: React.ReactNode; color: string;
}) {
  const bgMap: Record<string, string> = {
    sky: 'bg-sky-50', emerald: 'bg-emerald-50', violet: 'bg-violet-50', rose: 'bg-rose-50'
  };
  return (
    <Card className="!p-4">
      <div className={`w-8 h-8 rounded-lg ${bgMap[color]} flex items-center justify-center mb-2.5`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </Card>
  );
}

function QuickInsight({ icon, title, items, href, color }: {
  icon: string; title: string; items: string[]; href: string; color: string;
}) {
  const borderMap: Record<string, string> = {
    sky: 'border-l-sky-400', emerald: 'border-l-emerald-400', violet: 'border-l-violet-400'
  };
  return (
    <Card className={`border-l-4 ${borderMap[color]} !p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h4 className="font-semibold text-slate-700 text-sm">{title}</h4>
        </div>
        <Link href={href}>
          <ChevronRight size={14} className="text-slate-400" />
        </Link>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
            <span className="text-slate-300 mt-0.5">•</span>
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

