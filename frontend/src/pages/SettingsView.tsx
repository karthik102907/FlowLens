import React, { useState } from 'react';
import { Settings, Key, Sparkles, CheckCircle2, Shield, Database } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [apiKey, setApiKey] = useState('********************************');
  const [model, setModel] = useState('Gemini 2.5 Flash (Deterministic + Grounded)');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Platform Configuration & Intelligence Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage AI inference providers, analytical engine parameters, and database caching.
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 text-xs">
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span>AI Inference & LLM Configuration</span>
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">AI Process Intelligence Provider</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white font-medium"
            >
              <option value="Gemini 2.5 Flash (Deterministic + Grounded)">
                Gemini API (High Speed + Grounded Metrics)
              </option>
              <option value="Deterministic Offline Analytics (No External API)">
                Deterministic Local Analytics Engine (Offline / Enterprise Air-Gapped)
              </option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">AI API Key (Optional Override)</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AI_API_KEY..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              FlowLens executes deterministic analytics locally; AI keys are only used for natural language synthesis.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {saved && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Platform settings updated successfully.
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-xs"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
