'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { MEAL_PLANS, MEAL_STRUCTURE_RULES } from '@/lib/mealPlanData';
import { MealPlan, DayMealPlan, MealPlanId } from '@/lib/types';
import { getDayOfWeek, getLocal, setLocal, STORAGE_KEYS, cn } from '@/lib/utils';
import { Info, Check, Clock, Utensils, ShoppingCart, IndianRupee, AlertCircle } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type Day = typeof DAYS[number];

export default function MealPlansPage() {
  const today = getDayOfWeek() as Day;
  
  // Try to load from localStorage first, then fallback
  const [activePlanId, setActivePlanId] = useState<MealPlanId>('preferred');
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setActivePlanId(getLocal(STORAGE_KEYS.SELECTED_PLAN, 'preferred') as MealPlanId);
    setIsLoaded(true);
  }, []);

  const [activeTab, setActiveTab] = useState('daily');
  const [selectedDay, setSelectedDay] = useState<Day>(today);

  // Avoid hydration mismatch by not rendering until we have loaded from localStorage
  if (!isLoaded) return <div className="p-8 text-center text-slate-500">Loading meal plans...</div>;

  const activePlan = MEAL_PLANS.find(p => p.id === activePlanId) || MEAL_PLANS[0];
  const dayPlan = activePlan.weeklyPlan.find(d => d.day === selectedDay) || activePlan.weeklyPlan[0];

  const handlePlanSelect = (id: string) => {
    const planId = id as MealPlanId;
    setActivePlanId(planId);
    setLocal(STORAGE_KEYS.SELECTED_PLAN, planId);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Meal Plans</h1>
          <p className="text-sm text-slate-500 mt-0.5">Four evidence-based approaches to reach 2400 kcal & 160g protein</p>
        </div>
      </div>

      {/* Plan selector (Tabs style but custom to show icons) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {MEAL_PLANS.map(plan => (
          <button
            key={plan.id}
            onClick={() => handlePlanSelect(plan.id)}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-sm font-medium transition-all',
              activePlanId === plan.id
                ? 'bg-sky-50 border-sky-300 text-sky-800 shadow-sm ring-1 ring-sky-300'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            <span className="text-xl">{plan.icon}</span>
            <span className="text-center leading-tight">{plan.name}</span>
            {activePlanId === plan.id && <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider">Active</span>}
          </button>
        ))}
      </div>

      <Card className="!p-4 bg-slate-50">
        <p className="text-sm font-medium text-slate-800 mb-1">{activePlan.name} Approach</p>
        <p className="text-xs text-slate-600 leading-relaxed">{activePlan.description}</p>
        <div className="mt-3 flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <IndianRupee size={14} className="text-emerald-600" />
            <span>~₹{activePlan.monthlyBudgetINR}/month</span>
          </div>
        </div>
      </Card>

      <Tabs
        tabs={[
          { id: 'daily', label: 'Daily Menu', icon: '🍽️' },
          { id: 'grocery', label: 'Grocery List', icon: '🛒' },
          { id: 'notes', label: 'Nutrition Notes', icon: '📓' },
          { id: 'rules', label: 'Structure Rules', icon: '📏' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'daily' && (
        <DailyMenuTab
          activePlan={activePlan}
          dayPlan={dayPlan}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          today={today}
        />
      )}
      
      {activeTab === 'grocery' && <GroceryTab activePlan={activePlan} />}
      {activeTab === 'notes' && <NotesTab activePlan={activePlan} />}
      {activeTab === 'rules' && <RulesTab />}
    </div>
  );
}

function DailyMenuTab({ activePlan, dayPlan, selectedDay, setSelectedDay, today }: any) {
  return (
    <div className="space-y-4">
      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {DAYS.map(day => {
          const isToday = day === today;
          const isSelected = day === selectedDay;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                'flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg text-xs font-medium transition-all border',
                isSelected
                  ? 'bg-slate-800 text-white border-slate-800'
                  : isToday
                    ? 'bg-slate-100 text-slate-800 border-slate-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              <span>{day.slice(0, 3)}</span>
            </button>
          );
        })}
      </div>

      {/* Daily Totals */}
      <Card className="!p-3 flex justify-between items-center bg-sky-50 border-sky-100">
        <div>
          <p className="text-xs font-semibold text-sky-800 uppercase tracking-wider">{selectedDay}'s Totals</p>
          <p className="text-sm font-bold text-sky-900 mt-0.5">{dayPlan.totalCalories} kcal</p>
        </div>
        <div className="flex gap-3 text-xs text-sky-800">
          <div className="text-center">
            <span className="font-bold">{Math.round(dayPlan.totalProteinG)}g</span>
            <p className="opacity-70 text-[10px] uppercase">Protein</p>
          </div>
          <div className="text-center">
            <span className="font-bold">{Math.round(dayPlan.totalCarbsG)}g</span>
            <p className="opacity-70 text-[10px] uppercase">Carbs</p>
          </div>
          <div className="text-center">
            <span className="font-bold">{Math.round(dayPlan.totalFatG)}g</span>
            <p className="opacity-70 text-[10px] uppercase">Fat</p>
          </div>
        </div>
      </Card>

      {dayPlan.isWeekend && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg flex gap-2 items-center text-xs text-emerald-800">
          <Info size={14} className="flex-shrink-0" />
          <span>Weekend meals are flexible. Cook at home and enjoy some variety while hitting targets.</span>
        </div>
      )}

      {/* Meals */}
      <div className="space-y-3">
        {dayPlan.meals.map((meal: any, idx: number) => (
          <Card key={meal.id} padding="none" className="overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-3 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{meal.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={12} /> {meal.timeLabel}</span>
                    {meal.isFixed && <Badge variant="neutral" size="sm">Fixed Meal</Badge>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-700 text-sm">{meal.totalCalories} kcal</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{meal.totalProteinG.toFixed(0)}g P</p>
              </div>
            </div>
            
            <div className="p-3">
              <ul className="space-y-2">
                {meal.foods.map((food: any, i: number) => (
                  <li key={i} className="flex justify-between items-start text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <div className="pr-2">
                      <span className="font-medium text-slate-700">{food.name}</span>
                      <span className="text-slate-500 ml-1">({food.quantityStr})</span>
                      {food.notes && <p className="text-[10px] text-slate-500 mt-0.5">{food.notes}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-medium text-slate-600">{food.calories} kcal</span>
                      <span className="text-slate-400 text-[10px] block">{food.proteinG.toFixed(1)}g P</span>
                    </div>
                  </li>
                ))}
              </ul>
              
              {meal.prepNote && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex gap-2">
                  <Utensils size={14} className="text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-slate-600 font-medium">Prep: <span className="font-normal">{meal.prepNote}</span></p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function GroceryTab({ activePlan }: any) {
  return (
    <div className="space-y-4">
      <Card className="!p-4 bg-emerald-50 border-emerald-200">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-semibold text-emerald-800">Estimated Budget</p>
          <p className="text-lg font-bold text-emerald-700">~₹{activePlan.monthlyBudgetINR}/mo</p>
        </div>
        <p className="text-xs text-emerald-700">{activePlan.budgetNote}</p>
      </Card>

      <div className="space-y-4">
        {activePlan.groceryList.map((category: any, i: number) => (
          <div key={i}>
            <h3 className="text-sm font-bold text-slate-800 mb-2 pb-1 border-b border-slate-200">{category.category}</h3>
            <ul className="space-y-2">
              {category.items.map((item: any, j: number) => (
                <li key={j} className="flex justify-between items-start text-xs bg-white p-2 rounded border border-slate-100 shadow-sm">
                  <div>
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <span className="text-slate-500 ml-2">{item.quantity}</span>
                    {item.notes && <p className="text-[10px] text-slate-500 mt-0.5 italic">{item.notes}</p>}
                  </div>
                  <span className="font-medium text-emerald-600 flex-shrink-0">~₹{item.estimatedCostINR}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotesTab({ activePlan }: any) {
  return (
    <div className="space-y-3">
      <Card className="!p-4 border-l-4 border-l-sky-500">
        <h3 className="font-semibold text-slate-800 text-sm mb-3">Evidence & Rationale</h3>
        <ul className="space-y-2">
          {activePlan.nutritionNotes.map((note: string, i: number) => (
            <li key={i} className="flex gap-2 items-start text-xs text-slate-600">
              <Check size={14} className="text-sky-500 flex-shrink-0 mt-0.5" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </Card>
      
      <Card className="!p-4">
        <h3 className="font-semibold text-slate-800 text-sm mb-2">Digestive Health Considerations</h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-2">
          Since you feel your digestion is not optimal, follow these guidelines regardless of which plan you choose:
        </p>
        <ul className="space-y-1.5 list-disc pl-4 text-xs text-slate-600">
          <li><strong>Chew thoroughly:</strong> Digestion begins in the mouth. Eat slowly.</li>
          <li><strong>Hydration timing:</strong> Avoid drinking large amounts of water immediately before or during meals to not dilute stomach acid.</li>
          <li><strong>Legume prep:</strong> Always soak legumes (chana, beans, dal) for 8+ hours and cook thoroughly. Sprouting further improves digestibility.</li>
          <li><strong>Fiber adaptation:</strong> If you are not used to 30g of fiber, build up to it over 2-3 weeks to avoid bloating.</li>
        </ul>
      </Card>
    </div>
  );
}

function RulesTab() {
  return (
    <div className="space-y-3">
      <Card className="!p-4">
        <h3 className="font-semibold text-slate-800 text-sm mb-3">Hard Constraints Followed</h3>
        <div className="space-y-2.5">
          <div className="flex gap-2">
            <Check size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-slate-700">Exactly 4 meals per day</p>
              <p className="text-[10px] text-slate-500">No extra snacking required to hit targets.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Check size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-slate-700">Meal 1 (Breakfast) is identical 7 days a week</p>
              <p className="text-[10px] text-slate-500">Reduces decision fatigue completely.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Check size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-slate-700">Meal 3 (Snack) is identical Mon-Fri</p>
              <p className="text-[10px] text-slate-500">Office-friendly, no prep required at work.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Check size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-slate-700">Corporate Practicality</p>
              <p className="text-[10px] text-slate-500">Meal 2 (Lunch) is preppable the night before and transportable.</p>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="!p-4 bg-sky-50 border-sky-200">
        <h3 className="font-semibold text-sky-900 text-sm mb-2">Meal Timing Target</h3>
        <ul className="space-y-1.5 text-xs text-sky-800">
          <li className="flex justify-between border-b border-sky-100 pb-1"><span>Meal 1</span> <span className="font-bold">7:30 AM</span></li>
          <li className="flex justify-between border-b border-sky-100 pb-1"><span>Meal 2</span> <span className="font-bold">1:00 PM</span></li>
          <li className="flex justify-between border-b border-sky-100 pb-1"><span>Meal 3</span> <span className="font-bold">5:30 PM</span></li>
          <li className="flex justify-between"><span>Meal 4</span> <span className="font-bold">8:00 PM</span></li>
        </ul>
      </Card>
    </div>
  );
}

