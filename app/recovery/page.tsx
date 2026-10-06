'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SAMPLE_SLEEP_DATA, RECOVERY_TIPS, DESK_JOB_TIPS } from '@/lib/healthData';
import { formatShortDate } from '@/lib/utils';
import { Moon, Battery, AlertTriangle, Monitor, Activity, Zap, Info } from 'lucide-react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';

export default function RecoveryPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Recovery & Sleep</h1>
          <p className="text-sm text-slate-500 mt-0.5">Adaptation happens outside the gym</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Sleep Chart */}
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <Moon size={16} className="text-indigo-500" /> Sleep Duration
              </h3>
              <p className="text-xs text-slate-500">Target: 7.5+ hours (Goal: Before Midnight)</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-indigo-900">
                {(SAMPLE_SLEEP_DATA.reduce((acc, curr) => acc + curr.durationHours, 0) / SAMPLE_SLEEP_DATA.length).toFixed(1)}h
              </p>
              <p className="text-xs text-slate-500">14-day average</p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SAMPLE_SLEEP_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => formatShortDate(val)}
                  tick={{fontSize: 11, fill: '#64748b'}} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis domain={[4, 10]} tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  formatter={(val: any, name: any, props: any) => [
                    `${val}h (Bed: ${props.payload.bedtime})`, 
                    'Duration'
                  ]}
                  labelFormatter={(val: any) => formatShortDate(val || "")}
                />
                <ReferenceLine y={7.5} stroke="#10b981" strokeDasharray="3 3" />
                <Bar dataKey="durationHours" radius={[4, 4, 0, 0]}>
                  {SAMPLE_SLEEP_DATA.map((entry, index) => {
                    // Color code based on bedtime. Assuming format HH:MM and < 24 is past midnight (00:xx or 01:xx)
                    const bedHour = parseInt(entry.bedtime.split(':')[0]);
                    const isLate = bedHour < 5; // 12am - 4am
                    return <Cell key={`cell-${index}`} fill={isLate ? '#94a3b8' : '#6366f1'} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex gap-4 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-500"></div> <span className="text-slate-600">Bed before midnight</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-400"></div> <span className="text-slate-600">Bed after midnight</span></div>
          </div>
        </Card>

        {/* Readiness */}
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white !p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-100 mb-1">
              <Battery size={18} />
              <span className="text-sm font-medium">System Readiness</span>
            </div>
            <h2 className="text-4xl font-bold mt-2">82%</h2>
            <p className="text-emerald-100 text-sm mt-1">Ready to train</p>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-emerald-100">Sleep Score</span>
              <span className="font-semibold">Good</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-emerald-100">Nutrition Adherence</span>
              <span className="font-semibold">Optimal</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-emerald-100">Muscle Soreness</span>
              <span className="font-semibold">Low</span>
            </div>
          </div>
        </Card>

        {/* Desk Job Active Recovery */}
        <Card className="border-l-4 border-l-amber-400">
          <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
            <Monitor size={16} className="text-amber-500" /> Desk Job Management
          </h3>
          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent hidden"></div>
          
          <div className="space-y-4">
            {DESK_JOB_TIPS.map((tip, i) => (
              <div key={i} className="flex gap-3 text-xs">
                <span className="font-medium text-slate-500 w-24 flex-shrink-0 text-right">{tip.time}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                <span className="text-slate-700">{tip.action}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <h2 className="text-lg font-bold text-slate-800 mt-8 mb-4">Recovery Guidelines</h2>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RECOVERY_TIPS.map((tip, i) => {
          const icons: any = {
            'Sleep': <Moon size={16} className="text-indigo-500" />,
            'Desk Job': <Monitor size={16} className="text-amber-500" />,
            'Stress': <AlertTriangle size={16} className="text-rose-500" />,
            'Active Recovery': <Activity size={16} className="text-emerald-500" />,
            'Nutrition': <Zap size={16} className="text-sky-500" />,
            'Hydration': <Zap size={16} className="text-blue-500" />,
            'Deload': <Battery size={16} className="text-violet-500" />,
            'General': <Info size={16} className="text-slate-500" />,
          };
          
          return (
            <Card key={i} className="!p-4 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                {icons[tip.category] || <Info size={16} />}
                <Badge variant={tip.priority === 'high' ? 'danger' : tip.priority === 'medium' ? 'warning' : 'neutral'} size="sm">
                  {tip.category}
                </Badge>
              </div>
              <h4 className="font-semibold text-slate-800 text-sm mb-1">{tip.title}</h4>
              <p className="text-xs text-slate-600 flex-1">{tip.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


