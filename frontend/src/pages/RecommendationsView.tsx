import React from 'react';
import { AnalyticsBundle } from '../types';
import { Lightbulb, Sparkles, CheckCircle2, Clock, DollarSign, ArrowRight, ShieldAlert } from 'lucide-react';

interface RecommendationsViewProps {
  analytics: AnalyticsBundle;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({ analytics }) => {
  const { recommendations, overview } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Evidence-Based AI Intelligence
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Prescriptive AI Process Recommendations</h2>
          <p className="text-xs text-slate-500 mt-1">
            Targeted operational interventions automatically generated from quantitative bottleneck metrics and rework frequencies.
          </p>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        {recommendations.map((rec, idx) => {
          let badgeBg = 'bg-slate-100 text-slate-700 border-slate-200';
          if (rec.priority === 'CRITICAL') badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
          else if (rec.priority === 'HIGH') badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';

          return (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{rec.affected_stage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeBg}`}>
                    PRIORITY: {rec.priority}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    Confidence: {rec.confidence}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Problem & Evidence */}
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                    Observed Bottleneck Problem:
                  </span>
                  <p className="font-bold text-slate-900">{rec.problem}</p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong>Evidence:</strong> {rec.evidence}
                  </p>
                </div>

                {/* Action & Expected Impact */}
                <div className="space-y-2 p-3.5 rounded-xl bg-cyan-50/50 border border-cyan-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 block">
                    Prescriptive Action Plan:
                  </span>
                  <p className="font-bold text-slate-900">{rec.recommended_action}</p>
                  <p className="text-cyan-950 text-[11px] leading-relaxed">
                    <strong>Projected Impact:</strong> {rec.expected_impact}
                  </p>
                </div>
              </div>

              {/* Savings Footer */}
              {(rec.estimated_time_saving_hours || rec.estimated_cost_saving) && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-4">
                    {rec.estimated_time_saving_hours && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <Clock className="w-3.5 h-3.5" />
                        Est. Time Recovery: ~{rec.estimated_time_saving_hours.toLocaleString()} hrs / year
                      </span>
                    )}
                    {rec.estimated_cost_saving && (
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <DollarSign className="w-3.5 h-3.5 text-cyan-600" />
                        Est. Cost Recovery: ~${rec.estimated_cost_saving.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
