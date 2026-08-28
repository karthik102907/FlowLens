import React, { useState } from 'react';
import { AnalyticsBundle, StageMetric } from '../types';
import { ProcessMapCanvas } from '../components/process-map/ProcessMapCanvas';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { Workflow, Clock, Activity, ArrowRight, Play, CheckCircle } from 'lucide-react';

interface ProcessExplorerViewProps {
  analytics: AnalyticsBundle;
}

export const ProcessExplorerView: React.FC<ProcessExplorerViewProps> = ({ analytics }) => {
  const { stages, transitions, overview } = analytics;
  const [activeStage, setActiveStage] = useState<StageMetric | null>(stages[0] || null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Process Journey Map & Explorer</h2>
          <p className="text-xs text-slate-500 mt-1">
            Visual process mining reconstruction across {overview.total_cases.toLocaleString()} cases, displaying stage queues, transition frequencies, and bottleneck severity.
          </p>
        </div>
      </div>

      {/* Interactive Process Canvas */}
      <ProcessMapCanvas
        stages={stages}
        transitions={transitions}
        onSelectStage={(s) => setActiveStage(s)}
      />

      {/* Transition Graph & Start/End Points */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Start and End Activities Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Process Entry Points</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Initial trigger activity distribution</p>
          </div>

          <div className="space-y-2">
            {overview.start_activities.map((sa, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{sa.activity}</span>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block font-mono">{sa.percentage}%</span>
                  <span className="text-[10px] text-slate-400 font-mono">{sa.count} cases</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-600" />
              <h3 className="text-sm font-bold text-slate-900">Process Terminal Points</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Final completion stage distribution</p>
          </div>

          <div className="space-y-2">
            {overview.end_activities.map((ea, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{ea.activity}</span>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block font-mono">{ea.percentage}%</span>
                  <span className="text-[10px] text-slate-400 font-mono">{ea.count} cases</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 cols: Detailed Transitions Matrix */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inter-Stage Transition Latencies</h3>
              <p className="text-xs text-slate-500">Waiting times and case volume between sequential activities</p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {transitions.length} Transition Paths
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Source Stage</th>
                  <th className="py-2.5 px-3">Target Stage</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                  <th className="py-2.5 px-3 text-right">Avg Wait</th>
                  <th className="py-2.5 px-3 text-right">Median</th>
                  <th className="py-2.5 px-3 text-right">P95 Worst</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {transitions.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{t.source}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.target}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{t.count.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-cyan-700">{t.avg_waiting_hours}h</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">{t.median_waiting_hours}h</td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-600 font-bold">{t.p95_waiting_hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
