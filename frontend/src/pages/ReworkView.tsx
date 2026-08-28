import React from 'react';
import { AnalyticsBundle } from '../types';
import { Repeat, RotateCcw, DollarSign, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

interface ReworkViewProps {
  analytics: AnalyticsBundle;
}

export const ReworkView: React.FC<ReworkViewProps> = ({ analytics }) => {
  const { rework_loops, overview } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Rework & Loop Cycle Detection</h2>
        <p className="text-xs text-slate-500 mt-1">
          Identifying cases where a workflow returns to a previous stage, calculating re-entry frequency, delay penalties, and departmental impact.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Overall Rework Rate</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Repeat className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-900 mt-2 block font-mono">{overview.rework_rate}%</span>
          <span className="text-slate-500 text-[11px]">Percentage of cases revisited</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Total Detected Loops</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-900 mt-2 block font-mono">{rework_loops.length} Recurring Loops</span>
          <span className="text-slate-500 text-[11px]">Inter-stage backward transitions</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Estimated Rework Cost</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-900 mt-2 block font-mono">
            ${((overview.estimated_cost_lost || 10000) * (overview.rework_rate / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-slate-500 text-[11px]">Operational waste estimate</span>
        </div>
      </div>

      {/* Rework Loops Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Identified Rework Loops & Return Gates</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Trigger Stage</th>
                <th className="py-2.5 px-3">Return Stage</th>
                <th className="py-2.5 px-3 text-right">Occurrences</th>
                <th className="py-2.5 px-3 text-right">Loop Rate</th>
                <th className="py-2.5 px-3 text-right">Avg Loop Latency</th>
                <th className="py-2.5 px-3">Associated Departments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {rework_loops.map((loop, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">{loop.source_stage}</td>
                  <td className="py-3 px-3 font-semibold text-rose-700">
                    <div className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{loop.target_stage}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold">{loop.occurrences}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-amber-600">{loop.rework_rate}%</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">{loop.avg_delay_hours}h</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {loop.top_departments.map((d: any, dIdx: number) => (
                        <span key={dIdx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px]">
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
