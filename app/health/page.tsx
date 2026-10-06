'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BLOOD_RESULTS, HAIR_HEALTH_CONTEXT } from '@/lib/healthData';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { Activity, AlertTriangle, FileText, Info, Stethoscope, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function HealthPage() {
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const needsDiscussion = BLOOD_RESULTS.filter(r => r.discussWithDoctor).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Health Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">Blood work analysis and relevant considerations</p>
        </div>
        {needsDiscussion > 0 && (
          <Badge variant="warning">
            <Stethoscope size={14} className="mr-1 inline" /> {needsDiscussion} item(s) to discuss with doctor
          </Badge>
        )}
      </div>

      <Card className="!p-4 bg-sky-50 border-sky-200">
        <div className="flex gap-3">
          <Info size={20} className="text-sky-600 flex-shrink-0" />
          <div className="text-xs text-sky-800 space-y-2">
            <p className="font-semibold">Medical Disclaimer</p>
            <p>
              This section provides educational context regarding your blood test from <strong>3 October 2026</strong>. 
              It highlights relevant physiological connections to your training and nutrition goals.
              <strong> This is not a medical diagnosis.</strong> Do not begin high-dose supplementation or alter medications without consulting a healthcare professional.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Blood Results List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Blood Biomarkers</h2>
          
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {BLOOD_RESULTS.map((result, idx) => (
              <div 
                key={result.name}
                className={`border-b border-slate-100 last:border-0 ${selectedResult === result.name ? 'bg-slate-50' : 'hover:bg-slate-50/50'} transition-colors cursor-pointer`}
                onClick={() => setSelectedResult(selectedResult === result.name ? null : result.name)}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-800 text-sm">{result.name}</p>
                      {result.discussWithDoctor && <AlertTriangle size={14} className="text-amber-500" />}
                    </div>
                    <p className="text-xs text-slate-500">Ref: {result.refRangeStr}</p>
                  </div>
                  
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-bold text-slate-700">{result.value} <span className="text-xs font-normal text-slate-500">{result.unit}</span></p>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${getStatusColor(result.status)}`}>
                        {getStatusLabel(result.status).toUpperCase()}
                      </span>
                    </div>
                    <ChevronRight size={16} className={`text-slate-400 transition-transform ${selectedResult === result.name ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {selectedResult === result.name && (
                  <div className="p-4 pt-0 bg-slate-50 border-t border-slate-100/50">
                    <div className="space-y-3 text-xs">
                      <div>
                        <p className="font-semibold text-slate-700 mb-1">Interpretation:</p>
                        <p className="text-slate-600">{result.interpretation}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 mb-1">Relevance to Goals:</p>
                        <p className="text-slate-600">{result.relevance}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hair Health Context */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Hair Health Context</h2>
          
          <Card className="!p-4 border-l-4 border-l-violet-500">
            <p className="text-xs text-slate-600 leading-relaxed italic mb-3">
              {HAIR_HEALTH_CONTEXT.disclaimer}
            </p>
            
            <div className="space-y-4 mt-4">
              {HAIR_HEALTH_CONTEXT.nutritionalConsiderations.map((item, i) => (
                <div key={i}>
                  <p className="text-xs font-semibold text-slate-800">{item.factor}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 mb-1">{item.relevance}</p>
                  <div className="flex items-start gap-1.5 text-[11px] text-violet-700 bg-violet-50 p-1.5 rounded">
                    <Activity size={12} className="flex-shrink-0 mt-0.5" />
                    <span>{item.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="!p-4 bg-slate-800 text-white border-0">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Stethoscope size={16} className="text-sky-400" /> Discuss with Doctor
            </h3>
            <ul className="space-y-2">
              {HAIR_HEALTH_CONTEXT.doctorDiscussion.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

