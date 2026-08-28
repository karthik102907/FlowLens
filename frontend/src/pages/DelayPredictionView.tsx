import React from 'react';
import { AnalyticsBundle } from '../types';
import {
  Sparkles,
  Brain,
  ShieldCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DelayPredictionViewProps {
  analytics: AnalyticsBundle;
}

export const DelayPredictionView: React.FC<DelayPredictionViewProps> = ({ analytics }) => {
  const { ml_stats, predictions } = analytics;

  const hasSufficientData = ml_stats && ml_stats.total_trained_samples >= 20 && predictions.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Machine Learning Delay Prediction</h2>
        <p className="text-xs text-slate-500 mt-1">
          Predicting case-level delay risk, SLA breach probabilities, and estimated completion times using supervised ensemble models.
        </p>
      </div>

      {/* PHASE 10 & 29: Honest Disclaimer Banner */}
      <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-2.5 text-xs text-slate-700">
        <ShieldCheck className="w-4 h-4 text-cyan-700 shrink-0" />
        <span>
          <strong>Probabilistic Estimation:</strong> Predictions are estimates based on historical process patterns and should not be treated as guaranteed outcomes.
        </span>
      </div>

      {/* PHASE 11: Insufficient Data Handling */}
      {!hasSufficientData ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Info className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-bold text-slate-900 text-base">Insufficient Historical Data for ML Training</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Supervised delay risk modeling requires at least 25 completed process cases with transition timestamps to avoid overfitting.
            </p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto text-left text-xs text-slate-700 space-y-1.5 font-medium">
            <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">Available Analytical Modules:</span>
            <div className="flex items-center gap-2 text-emerald-700">✓ Full Process Journey Reconstruction</div>
            <div className="flex items-center gap-2 text-emerald-700">✓ Multi-Factor Bottleneck Detection</div>
            <div className="flex items-center gap-2 text-emerald-700">✓ Rework & Return Loop Discovery</div>
            <div className="flex items-center gap-2 text-emerald-700">✓ Grounded AI Process Analyst</div>
          </div>
        </div>
      ) : (
        <>
          {/* Model Performance & Evaluation Metrics */}
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 shadow-md space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{ml_stats.model_name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Trained & Evaluated
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    Trained on {ml_stats.total_trained_samples.toLocaleString()} historical transitions • Updated {ml_stats.training_date}
                  </p>
                </div>
              </div>
            </div>

            {/* 5 ML Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-bold block font-mono">Accuracy</span>
                <span className="text-xl font-black text-cyan-400 font-mono mt-1 block">
                  {(ml_stats.accuracy * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500">Holdout validation</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-bold block font-mono">Precision</span>
                <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">
                  {(ml_stats.precision * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500">Low false positives</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-bold block font-mono">Recall</span>
                <span className="text-xl font-black text-blue-400 font-mono mt-1 block">
                  {(ml_stats.recall * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500">Delay detection rate</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-bold block font-mono">F1-Score</span>
                <span className="text-xl font-black text-purple-400 font-mono mt-1 block">
                  {(ml_stats.f1_score * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500">Harmonic balance</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-bold block font-mono">ROC-AUC</span>
                <span className="text-xl font-black text-amber-400 font-mono mt-1 block">
                  {ml_stats.roc_auc.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500">Discrimination index</span>
              </div>
            </div>

            {/* Feature Importance Chart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px] font-mono">
                  Explainable Feature Importance Breakdown (SHAP-aligned)
                </span>
              </div>

              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ml_stats.feature_importances} layout="vertical" margin={{ left: 80, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                    <XAxis type="number" unit="%" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 50]} />
                    <YAxis dataKey="feature" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={140} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#020617', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="importance_pct" name="Importance %" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Real-time Case Delay Risk Predictions Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Case-Level Delay Risk Scores</h3>
                <p className="text-xs text-slate-500">Predicted delay probabilities and expected completion ranges</p>
              </div>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                Showing top {predictions.length} scored cases
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Case ID</th>
                    <th className="py-2.5 px-3">Current Active Stage</th>
                    <th className="py-2.5 px-3 text-right">Elapsed</th>
                    <th className="py-2.5 px-3 text-center">Delay Risk</th>
                    <th className="py-2.5 px-3">Expected Completion</th>
                    <th className="py-2.5 px-3">Primary Risk Contributors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {predictions.map((p) => {
                    let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                    if (p.risk_level === 'CRITICAL') {
                      badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                    } else if (p.risk_level === 'HIGH') {
                      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                    } else if (p.risk_level === 'MEDIUM') {
                      badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                    }

                    return (
                      <tr key={p.case_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{p.case_id}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{p.current_stage}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">{p.elapsed_hours}h</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}>
                            <span>{p.predicted_delay_risk_pct}%</span>
                            <span className="opacity-75 font-mono text-[10px]">({p.risk_level})</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          <div>{p.expected_completion_time}</div>
                          <span className="text-[10px] text-slate-400">± {p.confidence_range_hours}h confidence</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {p.contributing_factors.map((f, fIdx) => (
                              <span
                                key={fIdx}
                                className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
