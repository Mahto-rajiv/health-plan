'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SAMPLE_WEIGHT_DATA, SAMPLE_STRENGTH_DATA, SAMPLE_NUTRITION_LOG } from '@/lib/healthData';
import { USER_PROFILE } from '@/lib/userData';
import { formatDate, formatShortDate, calcWeightProgress, cn } from '@/lib/utils';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { TrendingUp, Scale, Dumbbell, Target, History, Plus, Info } from 'lucide-react';

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState('body');
  
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Progress Tracking</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track your metrics and adaptations</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={16} />}>Log Entry</Button>
      </div>

      <Tabs
        tabs={[
          { id: 'body', label: 'Body Composition', icon: '⚖️' },
          { id: 'strength', label: 'Strength', icon: '💪' },
          { id: 'consistency', label: 'Consistency', icon: '🔥' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'body' && <BodyTab />}
      {activeTab === 'strength' && <StrengthTab />}
      {activeTab === 'consistency' && <ConsistencyTab />}
      
    </div>
  );
}

function BodyTab() {
  const latestWeight = SAMPLE_WEIGHT_DATA[SAMPLE_WEIGHT_DATA.length - 1]?.weightKg || USER_PROFILE.currentWeightKg;
  const startWeight = USER_PROFILE.startWeightKg;
  const targetWeight = USER_PROFILE.targetWeightKg;
  const weightProgress = calcWeightProgress(latestWeight, startWeight, targetWeight);

  const formattedData = SAMPLE_WEIGHT_DATA.map(d => ({
    ...d,
    displayDate: formatShortDate(d.date)
  }));

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="!p-4 text-center">
          <p className="text-xs font-medium text-slate-500 mb-1">Start Weight</p>
          <p className="text-xl font-bold text-slate-800">{startWeight} kg</p>
        </Card>
        <Card className="!p-4 text-center bg-sky-50 border-sky-100">
          <p className="text-xs font-medium text-sky-600 mb-1">Current</p>
          <p className="text-xl font-bold text-sky-900">{latestWeight} kg</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-xs font-medium text-slate-500 mb-1">Target Weight</p>
          <p className="text-xl font-bold text-slate-800">{targetWeight} kg</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-xs font-medium text-slate-500 mb-1">Trend</p>
          <p className="text-xl font-bold text-emerald-600">+{((latestWeight - startWeight) / SAMPLE_WEIGHT_DATA.length).toFixed(2)} kg/wk</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4">
          <h3 className="font-semibold text-slate-800 text-sm">Weight Progression</h3>
          <p className="text-xs text-slate-500">Goal: Lean bulk (0.25-0.5 kg/month)</p>
        </div>
        
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="displayDate" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis domain={[65, 70]} tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(val: any) => [`${val} kg`, 'Weight']}
              />
              <Area type="monotone" dataKey="weightKg" stroke="#0ea5e9" strokeWidth={3} fill="url(#colorWeight)" dot={{r: 4, strokeWidth: 2, fill: 'white'}} activeDot={{r: 6}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-700 mb-2 flex justify-between">
            <span>Goal Progress</span>
            <span className="text-sky-600">{weightProgress}%</span>
          </p>
          <ProgressBar value={weightProgress} max={100} color="bg-sky-500" height="md" />
        </div>
      </Card>

      <Card>
        <div className="mb-4">
          <h3 className="font-semibold text-slate-800 text-sm">Waist Circumference</h3>
          <p className="text-xs text-slate-500">Monitoring fat gain during caloric surplus</p>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="displayDate" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(val: any) => [`${val} cm`, 'Waist']}
              />
              <Line type="monotone" dataKey="waistCm" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: 'white'}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex gap-2">
          <Info size={14} className="flex-shrink-0 text-slate-400" />
          <span>Waist measurement is the best proxy for body fat changes. A slight increase is normal during a lean bulk, but rapid increases mean surplus is too high.</span>
        </div>
      </Card>
    </div>
  );
}

function StrengthTab() {
  // Process strength data to group by exercise
  const exercises = ['squat', 'bench', 'deadlift', 'ohp'];
  
  // Format for Recharts - combine dates
  const dates = [...new Set(SAMPLE_STRENGTH_DATA.map(d => d.date))].sort();
  
  const chartData = dates.map(date => {
    const entry: any = { displayDate: formatShortDate(date) };
    exercises.forEach(ex => {
      const match = SAMPLE_STRENGTH_DATA.find(d => d.date === date && d.exercise === ex);
      if (match) entry[ex] = match.estimatedOneRM;
    });
    return entry;
  });

  const colors = {
    squat: '#0ea5e9', // sky
    bench: '#8b5cf6', // violet
    deadlift: '#10b981', // emerald
    ohp: '#f59e0b', // amber
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4">
          <h3 className="font-semibold text-slate-800 text-sm">Estimated 1 Rep Max (1RM)</h3>
          <p className="text-xs text-slate-500">Calculated using the Epley formula</p>
        </div>
        
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="displayDate" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(val: any) => [`${val} kg`, undefined]}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
              {exercises.map(ex => (
                <Line 
                  key={ex} type="monotone" dataKey={ex} 
                  name={ex.charAt(0).toUpperCase() + ex.slice(1)} 
                  stroke={colors[ex as keyof typeof colors]} strokeWidth={2} 
                  dot={{r: 3}} activeDot={{r: 5}} 
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {exercises.map(ex => {
          const exData = SAMPLE_STRENGTH_DATA.filter(d => d.exercise === ex);
          const first = exData[0];
          const last = exData[exData.length - 1];
          const improvement = last.estimatedOneRM - first.estimatedOneRM;
          
          return (
            <Card key={ex} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 text-sm capitalize">{ex}</p>
                <p className="text-xs text-slate-500 mt-0.5">Current Working: {last.weightKg}kg × {last.reps}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-700">{last.estimatedOneRM} kg</p>
                <Badge variant="success" size="sm">+{improvement} kg</Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ConsistencyTab() {
  const data = SAMPLE_NUTRITION_LOG.slice(-14).map(d => ({
    ...d,
    displayDate: formatShortDate(d.date),
    dayLetter: new Date(d.date).toLocaleDateString('en-US', {weekday: 'short'}).charAt(0)
  }));

  const avgAdherence = Math.round(data.reduce((sum, d) => sum + d.adherencePercent, 0) / data.length);

  return (
    <div className="space-y-4">
      <Card className="!p-4 bg-sky-50 border-sky-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-sky-900">Nutrition Adherence</p>
          <p className="text-xs text-sky-700 mt-0.5">Last 14 days average</p>
        </div>
        <div className="w-16 h-16 rounded-full border-4 border-sky-200 flex items-center justify-center bg-white">
          <span className="font-bold text-sky-600">{avgAdherence}%</span>
        </div>
      </Card>

      <Card>
        <div className="mb-4">
          <h3 className="font-semibold text-slate-800 text-sm">Caloric Intake vs Target (2400)</h3>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="dayLetter" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis domain={[1500, 3000]} tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                cursor={{fill: '#f8fafc'}}
              />
              <Bar dataKey="calories" name="Calories" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.calories >= 2200 && entry.calories <= 2600 ? '#10b981' : '#f59e0b'} />
                ))}
              </Bar>
              {/* Target Line */}
              <Line type="step" dataKey={() => 2400} stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} activeDot={false} name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex gap-4 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500"></div> <span className="text-slate-600">On Target (±200)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-500"></div> <span className="text-slate-600">Off Target</span></div>
        </div>
      </Card>
      
      <Card>
        <div className="mb-4">
          <h3 className="font-semibold text-slate-800 text-sm">Workout Consistency</h3>
        </div>
        {/* Heatmap visualization mock */}
        <div className="flex gap-1 flex-wrap">
          {Array.from({length: 28}).map((_, i) => {
            // Mock data - 4 workouts a week roughly
            const didWorkout = [0,1,3,4].includes(i % 7);
            const isFuture = i > 24;
            return (
              <div 
                key={i} 
                className={cn(
                  'w-6 h-6 rounded-sm',
                  isFuture ? 'bg-slate-100' : didWorkout ? 'bg-emerald-400' : 'bg-slate-200'
                )}
                title={isFuture ? 'Future' : didWorkout ? 'Completed' : 'Rest/Missed'}
              />
            )
          })}
        </div>
        <div className="mt-3 text-xs text-slate-500 text-right">Last 4 weeks</div>
      </Card>
    </div>
  );
}

