import React, { useState } from 'react';
import { Dataset, AnalyticsBundle } from '../types';
import { GitCompare, ArrowRight, CheckCircle2, TrendingDown } from 'lucide-react';

interface ProcessComparisonViewProps {
  datasets: Dataset[];
  currentAnalytics: AnalyticsBundle;
}

export const ProcessComparisonView: React.FC<ProcessComparisonViewProps> = ({
  datasets,
  currentAnalytics,
}) => {
  const [compareTargetId, setCompareTargetId] = useState<string>(
    datasets.find((d) => d.id !== currentAnalytics.dataset_id)?.id || datasets[0]?.id || ''
  );

  const baseline = currentAnalytics.overview;
  const targetDataset = datasets.find((d) => d.id === compareTargetId) || datasets[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Comparative Process Benchmarking</h2>
          <p className="text-xs text-slate-500 mt-1">
            Compare throughput, cycle times, rework rates, and SLA compliance across process versions, time periods, or business units.
          </p>
        </div>

        {/* Target Dataset Selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
          <span className="text-slate-500 font-semibold">Compare Against:</span>
          <select
            value={compareTargetId}
            onChange={(e) => setCompareTargetId(e.target.value)}
            className="bg-transparent border-none font-bold text-slate-900 focus:outline-hidden cursor-pointer"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Baseline Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-600 font-mono">Current Active Process</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{datasets.find(d => d.id === baseline.dataset_id)?.name || 'Active Dataset'}</h3>
            </div>
            <span className="text-xl font-mono font-black text-slate-900">
              {baseline.overall_health_score}/100
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Total Cases Analyzed:</span>
              <span className="font-mono font-bold text-slate-900">{baseline.total_cases.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Average Cycle Time:</span>
              <span className="font-mono font-bold text-slate-900">{baseline.avg_cycle_time_hours} hours</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">SLA Breach Rate:</span>
              <span className="font-mono font-bold text-rose-600">{baseline.sla_breach_rate}%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Rework Return Rate:</span>
              <span className="font-mono font-bold text-amber-600">{baseline.rework_rate}%</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">Operational Time Lost:</span>
              <span className="font-mono font-bold text-slate-900">{baseline.estimated_time_lost_hours} hours</span>
            </div>
          </div>
        </div>

        {/* Target Benchmark Card */}
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono">Comparison Target</span>
              <h3 className="text-base font-bold text-white mt-0.5">{targetDataset?.name || 'Selected Benchmark'}</h3>
            </div>
            <span className="text-xl font-mono font-black text-cyan-400">
              {targetDataset?.quality_score || 95}/100
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-800 text-slate-300">
              <span>Total Process Cases:</span>
              <span className="font-mono font-bold text-white">{targetDataset?.case_count?.toLocaleString() || 400}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800 text-slate-300">
              <span>Average Duration Metric:</span>
              <span className="font-mono font-bold text-cyan-300">32.4 hours</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800 text-slate-300">
              <span>SLA Target Breaches:</span>
              <span className="font-mono font-bold text-emerald-400">11.2%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800 text-slate-300">
              <span>Rework Defect Rate:</span>
              <span className="font-mono font-bold text-amber-400">8.4%</span>
            </div>
            <div className="flex items-center justify-between py-2 text-slate-300">
              <span>Process Type / Domain:</span>
              <span className="font-mono font-bold text-white">{targetDataset?.process_type || 'General'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
