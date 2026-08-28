import React, { useState } from 'react';
import { AnalyticsBundle, BottleneckItem } from '../types';
import { api } from '../services/api';
import { ScoreBadge } from '../components/common/ScoreBadge';
import {
  AlertOctagon,
  Sliders,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  Repeat,
  ShieldAlert,
  BarChart2,
  X,
} from 'lucide-react';

interface BottleneckViewProps {
  analytics: AnalyticsBundle;
  onUpdateAnalytics: (updated: AnalyticsBundle) => void;
}

export const BottleneckView: React.FC<BottleneckViewProps> = ({ analytics, onUpdateAnalytics }) => {
  const { bottlenecks, dataset_id } = analytics;

  // Configurable scoring weights
  const [weights, setWeights] = useState({
    duration_weight: 0.25,
    waiting_weight: 0.2,
    volume_weight: 0.15,
    rework_weight: 0.15,
    sla_weight: 0.15,
    variability_weight: 0.1,
  });

  const [showWeightModal, setShowWeightModal] = useState(false);
  const [selectedBottleneck, setSelectedBottleneck] = useState<BottleneckItem | null>(null);
  const [recalculating, setRecalculating] = useState(false);

  const handleApplyWeights = async () => {
    setRecalculating(true);
    try {
      const updated = await api.recalculateWeights(dataset_id, weights);
      onUpdateAnalytics(updated);
      setShowWeightModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setRecalculating(false);
    }
  };

  const handleResetWeights = async () => {
    const defaultWeights = {
      duration_weight: 0.25,
      waiting_weight: 0.2,
      volume_weight: 0.15,
      rework_weight: 0.15,
      sla_weight: 0.15,
      variability_weight: 0.1,
    };
    setWeights(defaultWeights);
    setRecalculating(true);
    try {
      const updated = await api.recalculateWeights(dataset_id, defaultWeights);
      onUpdateAnalytics(updated);
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Multi-Factor Bottleneck Scoring</h2>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic 0-100 severity index combining duration, queue backlog, case volume, rework loops, SLA breaches, and time variability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWeightModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-600" />
            <span>Configure Weights</span>
          </button>
          <button
            onClick={handleResetWeights}
            disabled={recalculating}
            title="Reset standard weights"
            className="p-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs text-slate-500 hover:text-slate-800 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Formula Explanation Callout */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-1">
            Weighted Scoring Formula:
          </span>
          <code className="font-mono text-slate-200 text-xs bg-slate-950 px-2 py-1 rounded-md border border-slate-800 block md:inline-block">
            Score = {(weights.duration_weight * 100).toFixed(0)}% Duration +{' '}
            {(weights.waiting_weight * 100).toFixed(0)}% Waiting + {(weights.volume_weight * 100).toFixed(0)}%
            Volume + {(weights.rework_weight * 100).toFixed(0)}% Rework +{' '}
            {(weights.sla_weight * 100).toFixed(0)}% SLA + {(weights.variability_weight * 100).toFixed(0)}%
            Variance
          </code>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 0-20 Healthy
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> 41-60 Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> 81-100 Critical
          </span>
        </div>
      </div>

      {/* Ranked Bottleneck Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Process Stage</th>
                <th className="py-3 px-3 text-center">Bottleneck Score</th>
                <th className="py-3 px-3 text-right">Avg Duration</th>
                <th className="py-3 px-3 text-right">Waiting Time</th>
                <th className="py-3 px-3 text-right">Rework Rate</th>
                <th className="py-3 px-3 text-right">SLA Breach</th>
                <th className="py-3 px-3">Primary Delay Driver</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {bottlenecks.map((b) => (
                <tr key={b.activity} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                      #{b.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-900 text-sm">
                    {b.activity}
                    <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                      {b.affected_cases.toLocaleString()} cases ({b.volume_share}% of total)
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <ScoreBadge level={b.bottleneck_level} score={b.bottleneck_score} />
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-semibold">{b.avg_duration_hours}h</td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-500">{b.avg_waiting_hours}h</td>
                  <td className="py-3.5 px-3 text-right font-mono">
                    <span className={b.rework_rate > 10 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                      {b.rework_rate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono">
                    <span className={b.sla_breach_rate > 20 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                      {b.sla_breach_rate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md font-medium text-[11px]">
                      {b.primary_contributor}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => setSelectedBottleneck(b)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
                    >
                      Drill Down
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill Down Detail Modal */}
      {selectedBottleneck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedBottleneck.activity}</h3>
                  <p className="text-xs text-slate-400">Bottleneck Rank #{selectedBottleneck.rank} Detailed Diagnostic</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBottleneck(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 leading-relaxed text-slate-700">
                <strong className="text-slate-900 block mb-1">Analytical Executive Summary:</strong>
                {selectedBottleneck.summary_explanation}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Average Stage Duration</span>
                  <span className="text-lg font-bold text-slate-900 font-mono mt-0.5 block">{selectedBottleneck.avg_duration_hours} hours</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Queue Waiting Latency</span>
                  <span className="text-lg font-bold text-cyan-600 font-mono mt-0.5 block">{selectedBottleneck.avg_waiting_hours} hours</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Rework Return Rate</span>
                  <span className="text-lg font-bold text-amber-600 font-mono mt-0.5 block">{selectedBottleneck.rework_rate}%</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">SLA Target Breach</span>
                  <span className="text-lg font-bold text-rose-600 font-mono mt-0.5 block">{selectedBottleneck.sla_breach_rate}%</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedBottleneck(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors"
                >
                  Close Diagnostic
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weight Config Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Configure Bottleneck Formula Weights</h3>
                <p className="text-xs text-slate-400">Adjust the relative weighting coefficients for bottleneck score index</p>
              </div>
              <button
                onClick={() => setShowWeightModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {[
                { key: 'duration_weight', label: 'Duration Weight', val: weights.duration_weight },
                { key: 'waiting_weight', label: 'Waiting Backlog Weight', val: weights.waiting_weight },
                { key: 'volume_weight', label: 'Process Volume Weight', val: weights.volume_weight },
                { key: 'rework_weight', label: 'Rework Loop Weight', val: weights.rework_weight },
                { key: 'sla_weight', label: 'SLA Breach Rate Weight', val: weights.sla_weight },
                { key: 'variability_weight', label: 'Variability / Variance Weight', val: weights.variability_weight },
              ].map((item) => (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="font-mono text-cyan-600 font-bold">{(item.val * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.05"
                    value={item.val}
                    onChange={(e) =>
                      setWeights({
                        ...weights,
                        [item.key]: parseFloat(e.target.value),
                      })
                    }
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                </div>
              ))}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetWeights}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Reset Defaults
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWeightModal(false)}
                    className="px-3.5 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyWeights}
                    disabled={recalculating}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-xs"
                  >
                    {recalculating ? 'Recalculating...' : 'Apply & Recalculate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
