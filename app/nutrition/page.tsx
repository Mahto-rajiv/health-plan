'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MacroProgress } from '@/components/ui/ProgressBar';
import { Tabs } from '@/components/ui/Tabs';
import { MACRO_TARGETS, MACRO_TARGETS_TRAINING_DAY, NUTRITION_RATIONALE, SUPPLEMENT_RECOMMENDATIONS } from '@/lib/userData';
import { WEEKLY_SCHEDULE } from '@/lib/trainingData';
import { getDayOfWeek, cn } from '@/lib/utils';
import { Info, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Droplets, Utensils } from 'lucide-react';

export default function NutritionPage() {
  const today = getDayOfWeek();
  const todaySchedule = WEEKLY_SCHEDULE[today as keyof typeof WEEKLY_SCHEDULE];
  const isTrainingDay = todaySchedule?.type === 'strength';
  const targets = isTrainingDay ? MACRO_TARGETS_TRAINING_DAY : MACRO_TARGETS;

  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSupplement, setExpandedSupplement] = useState<string | null>(null);

  // Sample daily intake (interactive mock)
  const [intake, setIntake] = useState({
    calories: 1680, protein: 112, carbs: 198, fat: 48, fiber: 22, water: 2100
  });

  const remaining = {
    calories: targets.calories - intake.calories,
    protein: targets.proteinG - intake.protein,
    carbs: targets.carbsG - intake.carbs,
    fat: targets.fatG - intake.fat,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Nutrition</h1>
          <p className="text-sm text-slate-500">2400 kcal target · 160g protein · Evidence-based targets</p>
        </div>
        <Badge variant={isTrainingDay ? 'info' : 'neutral'}>
          {isTrainingDay ? '🏋️ Training Day (+100 kcal)' : '💤 Rest Day'}
        </Badge>
      </div>

      <Tabs
        tabs={[
          { id: 'overview', label: 'Daily Overview', icon: '📊' },
          { id: 'targets', label: 'Macro Targets', icon: '🎯' },
          { id: 'timing', label: 'Meal Timing', icon: '🕐' },
          { id: 'supplements', label: 'Supplements', icon: '💊' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'overview' && (
        <OverviewTab targets={targets} intake={intake} setIntake={setIntake} remaining={remaining} isTrainingDay={isTrainingDay} />
      )}
      {activeTab === 'targets' && <TargetsTab />}
      {activeTab === 'timing' && <TimingTab isTrainingDay={isTrainingDay} />}
      {activeTab === 'supplements' && (
        <SupplementsTab expandedSupplement={expandedSupplement} setExpandedSupplement={setExpandedSupplement} />
      )}
    </div>
  );
}

function OverviewTab({ targets, intake, setIntake, remaining, isTrainingDay }: any) {
  const pct = Math.round((intake.calories / targets.calories) * 100);

  return (
    <div className="space-y-4">
      {/* Calorie summary */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Donut */}
          <div className="relative w-32 h-32 flex-shrink-0 mx-auto sm:mx-0">
            <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={pct >= 100 ? '#10b981' : '#0ea5e9'} strokeWidth="3.5"
                strokeDasharray={`${Math.min(pct, 100)} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-800">{intake.calories}</span>
              <span className="text-xs text-slate-400">of {targets.calories}</span>
              <span className="text-xs font-medium text-sky-600">{pct}%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-3 w-full">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 rounded-lg p-2.5">
                <p className="text-lg font-bold text-sky-600">{intake.calories}</p>
                <p className="text-xs text-slate-500">Consumed</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5">
                <p className={cn('text-lg font-bold', remaining.calories > 0 ? 'text-emerald-600' : 'text-rose-500')}>
                  {remaining.calories > 0 ? remaining.calories : 0}
                </p>
                <p className="text-xs text-slate-500">Remaining</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5">
                <p className="text-lg font-bold text-slate-700">{targets.calories}</p>
                <p className="text-xs text-slate-500">Target</p>
              </div>
            </div>
            <MacroProgress label="Protein" current={intake.protein} target={targets.proteinG} unit="g" color="bg-sky-500" bgColor="" />
            <MacroProgress label="Carbohydrates" current={intake.carbs} target={targets.carbsG} unit="g" color="bg-amber-400" bgColor="" />
            <MacroProgress label="Fat" current={intake.fat} target={targets.fatG} unit="g" color="bg-violet-400" bgColor="" />
            <MacroProgress label="Fiber" current={intake.fiber} target={targets.fiberG} unit="g" color="bg-emerald-400" bgColor="" />
          </div>
        </div>

        {/* Water */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Droplets size={14} className="text-blue-400" />
              <span className="text-sm font-medium text-slate-700">Hydration</span>
            </div>
            <span className="text-sm text-slate-500">{intake.water}ml / {targets.waterMl}ml</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, (intake.water / targets.waterMl) * 100)}%` }}
            />
          </div>
          <div className="flex gap-2 mt-2.5">
            {[250, 500, 750].map(ml => (
              <button key={ml}
                onClick={() => setIntake((p: typeof intake) => ({ ...p, water: Math.min(p.water + ml, targets.waterMl) }))}
                className="flex-1 text-xs py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >+{ml}ml</button>
            ))}
          </div>
        </div>

        {/* Quick add calories */}
        <div className="mt-3 flex gap-2">
          {[200, 400, 600].map(kcal => (
            <button key={kcal}
              onClick={() => setIntake((p: typeof intake) => ({
                ...p,
                calories: Math.min(p.calories + kcal, targets.calories),
                protein: Math.min(p.protein + Math.round(kcal * 0.25 / 4), targets.proteinG),
                carbs: Math.min(p.carbs + Math.round(kcal * 0.5 / 4), targets.carbsG),
                fat: Math.min(p.fat + Math.round(kcal * 0.25 / 9), targets.fatG),
              }))}
              className="flex-1 text-xs py-1.5 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors font-medium"
            >+{kcal} kcal</button>
          ))}
        </div>
      </Card>

      {/* Remaining breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Protein', value: remaining.protein, unit: 'g', color: 'text-sky-600' },
          { label: 'Carbs', value: remaining.carbs, unit: 'g', color: 'text-amber-600' },
          { label: 'Fat', value: remaining.fat, unit: 'g', color: 'text-violet-600' },
          { label: 'Calories', value: remaining.calories, unit: 'kcal', color: 'text-slate-600' },
        ].map(item => (
          <Card key={item.label} className="!p-3 text-center">
            <p className={cn('text-xl font-bold', item.color)}>{Math.max(0, item.value)}</p>
            <p className="text-xs text-slate-400">{item.unit} {item.label}</p>
            <p className="text-xs text-slate-300 mt-0.5">remaining</p>
          </Card>
        ))}
      </div>

      {isTrainingDay && (
        <div className="flex items-start gap-2.5 p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-700">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <span><strong>Training Day:</strong> Target is +100 kcal and +30g carbs vs. rest day to support workout performance and recovery.</span>
        </div>
      )}
    </div>
  );
}

function TargetsTab() {
  return (
    <div className="space-y-4">
      <Card className="!p-4">
        <h3 className="font-semibold text-slate-800 text-sm mb-4">Your Evidence-Based Targets</h3>
        <div className="space-y-4">
          {[
            { label: 'Calories', value: '2400 kcal/day', rationale: NUTRITION_RATIONALE.calorieTarget, color: 'border-rose-400' },
            { label: 'Protein', value: '160g/day (~2.4g/kg)', rationale: NUTRITION_RATIONALE.proteinTarget, color: 'border-sky-400' },
            { label: 'Carbohydrates', value: '290g/day (training: 320g)', rationale: NUTRITION_RATIONALE.carbTarget, color: 'border-amber-400' },
            { label: 'Fat', value: '65g/day (~24% of calories)', rationale: NUTRITION_RATIONALE.fatTarget, color: 'border-violet-400' },
            { label: 'Fiber', value: '30g/day', rationale: NUTRITION_RATIONALE.fiberTarget, color: 'border-emerald-400' },
            { label: 'Water', value: '3L/day (3.5L training days)', rationale: NUTRITION_RATIONALE.waterTarget, color: 'border-blue-400' },
          ].map(item => (
            <div key={item.label} className={`border-l-4 ${item.color} pl-3 py-1`}>
              <div className="flex justify-between items-start gap-3">
                <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                <Badge variant="neutral" size="sm">{item.value}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.rationale}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="!p-4 bg-amber-50 border-amber-200">
        <div className="flex gap-2">
          <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-amber-700">Weight Target Context</p>
            <p className="text-xs text-amber-700 mt-0.5">{NUTRITION_RATIONALE.weightTarget}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function TimingTab({ isTrainingDay }: { isTrainingDay: boolean }) {
  const meals = [
    {
      number: 1, time: '7:30 AM', name: 'Breakfast', fixed: true,
      notes: 'Always the same. Prepare night before if possible.',
      prePost: null, targets: 'High carb + protein. Fuel for the day.',
    },
    {
      number: 2, time: '1:00 PM', name: 'Lunch (Office)', fixed: false,
      notes: 'Prepped the night before. Refrigerator at office. Can carry hot in insulated container.',
      prePost: null, targets: 'Balanced. Moderate protein + carbs + fat.',
    },
    {
      number: 3, time: '5:30 PM', name: 'Pre-Workout Snack', fixed: true,
      notes: 'Same Mon–Fri. Portable, no prep at office. 60-90 min before training.',
      prePost: 'pre', targets: 'Moderate carb + protein. Fuel for workout.',
    },
    {
      number: 4, time: '8:00 PM', name: 'Post-Workout Dinner', fixed: false,
      notes: 'Main dinner. Cooked at home. Largest protein meal of the day.',
      prePost: 'post', targets: 'High protein. Moderate carbs for recovery.',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {meals.map(meal => (
          <Card key={meal.number} className="!p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                {meal.number}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-800 text-sm">{meal.name}</p>
                  <span className="text-xs text-slate-400">{meal.time}</span>
                  {meal.fixed && <Badge variant="info" size="sm">Fixed daily</Badge>}
                  {meal.prePost === 'pre' && <Badge variant="warning" size="sm">Pre-workout</Badge>}
                  {meal.prePost === 'post' && <Badge variant="success" size="sm">Post-workout</Badge>}
                </div>
                <p className="text-xs text-slate-600">{meal.notes}</p>
                <p className="text-xs text-sky-600 mt-1.5 font-medium">{meal.targets}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="!p-4 bg-slate-50 border-slate-200">
        <h4 className="text-xs font-semibold text-slate-700 mb-2">Key Timing Rules</h4>
        <ul className="space-y-1.5 text-xs text-slate-600">
          <li className="flex gap-2"><CheckCircle size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />Meal 1 is identical every day (all 7 days)</li>
          <li className="flex gap-2"><CheckCircle size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />Meal 3 is identical Mon–Fri (office-friendly snack)</li>
          <li className="flex gap-2"><CheckCircle size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />Consume 30–40g protein within 2h post-training</li>
          <li className="flex gap-2"><CheckCircle size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />Protein is distributed across all 4 meals — improves muscle protein synthesis</li>
          <li className="flex gap-2"><CheckCircle size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />Saturdays/Sundays: Meals 2–4 are flexible (home cooking)</li>
          <li className="flex gap-2"><Info size={12} className="text-sky-500 flex-shrink-0 mt-0.5" />The "anabolic window" is wider than once thought — total daily protein matters most (Morton et al. 2018)</li>
        </ul>
      </Card>
    </div>
  );
}

function SupplementsTab({ expandedSupplement, setExpandedSupplement }: any) {
  const priorityVariant: Record<string, 'danger' | 'warning' | 'neutral'> = {
    high: 'danger', medium: 'warning', low: 'neutral'
  };
  const evidenceVariant: Record<string, 'success' | 'info' | 'warning'> = {
    'Very Strong': 'success', 'Strong': 'info', 'Moderate': 'warning', 'Weak (supplementation without deficiency)': 'neutral' as any
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
        <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
        <span>These are evidence-based suggestions, not prescriptions. Discuss with your doctor before starting any supplement, especially if on medication. Supplements are adjuncts to food, not replacements.</span>
      </div>

      <div className="space-y-3">
        {SUPPLEMENT_RECOMMENDATIONS.map(supp => {
          const isExpanded = expandedSupplement === supp.name;
          return (
            <Card key={supp.name} padding="none" className="overflow-hidden">
              <button
                onClick={() => setExpandedSupplement(isExpanded ? null : supp.name)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-800 text-sm">{supp.name}</p>
                    <Badge variant={priorityVariant[supp.priority]} size="sm">
                      {supp.priority} priority
                    </Badge>
                    <Badge variant={evidenceVariant[supp.evidence] || 'neutral'} size="sm">
                      Evidence: {supp.evidence}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{supp.dose}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-400">{supp.cost}</span>
                  {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 p-4 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">Rationale</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{supp.rationale}</p>
                  </div>
                  <div className="p-2.5 bg-amber-50 rounded-lg text-xs text-amber-700">
                    <strong>⚠️ Caution: </strong>{supp.caution}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="!p-4 bg-emerald-50 border-emerald-200">
        <h4 className="text-xs font-semibold text-emerald-700 mb-2">Priority Order</h4>
        <ol className="space-y-1.5 text-xs text-emerald-700">
          <li>1. <strong>Vitamin D3</strong> — address documented insufficiency</li>
          <li>2. <strong>Creatine Monohydrate</strong> — highest ROI for your training goal</li>
          <li>3. <strong>Vitamin B12</strong> — prevent gradual depletion as a vegetarian</li>
          <li>4. <strong>Whey Protein</strong> — only if food protein targets consistently missed</li>
        </ol>
      </Card>
    </div>
  );
}

