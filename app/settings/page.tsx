'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { removeLocal, STORAGE_KEYS } from '@/lib/utils';
import { Settings as SettingsIcon, Database, RefreshCw, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [cleared, setCleared] = useState(false);

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all local app data? This includes completed workouts and selected plans.')) {
      Object.values(STORAGE_KEYS).forEach(key => removeLocal(key));
      // Also clear dynamic workout keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('workout_')) {
          localStorage.removeItem(key);
        }
      });
      setCleared(true);
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your application preferences</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Database className="text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-800">Local Data Storage</h2>
        </div>
        
        <p className="text-sm text-slate-600 mb-4">
          This is a frontend-only prototype. Your selected meal plan and completed workouts for today are saved in your browser's local storage.
        </p>

        <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-rose-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <h3 className="text-sm font-semibold text-rose-800">Clear Local Data</h3>
              <p className="text-xs text-rose-600 mt-1 mb-3">
                This will reset your selected meal plan to default and clear any workouts you've marked as completed today.
              </p>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={handleClearData}
                disabled={cleared}
                icon={cleared ? <RefreshCw size={14} className="animate-spin" /> : undefined}
              >
                {cleared ? 'Clearing...' : 'Clear All Data'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <SettingsIcon className="text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-800">System Information</h2>
        </div>
        
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-medium">Version</span>
            <span>1.0.0 (Prototype)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-medium">Framework</span>
            <span>Next.js App Router</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-medium">Styling</span>
            <span>Tailwind CSS</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium">Architecture</span>
            <span>Frontend-only (No Database)</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

