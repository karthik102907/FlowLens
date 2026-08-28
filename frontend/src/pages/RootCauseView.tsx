import React from 'react';
import { AnalyticsBundle } from '../types';
import { ScoreBadge } from '../components/common/ScoreBadge';
import {
  SearchCode,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface RootCauseViewProps {
  analytics: AnalyticsBundle;
}

export const RootCauseView: React.FC<RootCauseViewProps> = ({ analytics }) => {
  const { root_causes } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Statistical Root Cause Investigation</h2>
        <p className="text-xs text-slate-500 mt-1">
          Investigating correlated drivers across departments, case priorities, categories, and temporal patterns.
        </p>
      </div>

      {/* Fairness & Non-Causation Honest Wording Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">Statistical Correlation Notice:</strong>
          Identified factors represent observed statistical associations and operational correlations. Higher processing durations in certain teams or categories may reflect specialized case complexity or multi-tier review requirements rather than operational inefficiency.
        </div>
      </div>

      {/* Root Cause Cards by Stage */}
      <div className="space-y-6">
        {root_causes.map((rc) => (
          <div key={rc.activity} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            {/* Stage Title Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 text-slate-800 rounded-xl">
                  <SearchCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{rc.activity}</h3>
                  <span className="text-xs text-slate-500">Root Cause Diagnostic</span>
                </div>
              </div>
              <ScoreBadge level="Bottleneck" score={rc.bottleneck_score} />
            </div>

            {/* Plain Language Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
              {rc.plain_language_explanation}
            </div>

            {/* Correlated Factors Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Identified Correlated Factors:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rc.primary_factors.map((factor, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px] uppercase">
                        {factor.category}
                      </span>
                      <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                        {factor.delay_multiplier}x Delay Multiplier
                      </span>
                    </div>

                    <h5 className="font-bold text-slate-900 text-xs">{factor.factor_name}</h5>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{factor.wording}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Observed: {factor.avg_duration_hours}h (vs {factor.baseline_duration_hours}h baseline)</span>
                      <span>Confidence: {factor.confidence_pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
