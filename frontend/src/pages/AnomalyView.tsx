import React, { useState } from 'react';
import { AnalyticsBundle, AnomalyCase } from '../types';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { ShieldAlert, AlertTriangle, Clock, Repeat, Eye, X, Activity } from 'lucide-react';

interface AnomalyViewProps {
  analytics: AnalyticsBundle;
}

export const AnomalyView: React.FC<AnomalyViewProps> = ({ analytics }) => {
  const { anomalies, overview } = analytics;
  const [selectedCase, setSelectedCase] = useState<AnomalyCase | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Multimodal Anomaly Detection</h2>
          <p className="text-xs text-slate-500 mt-1">
            Statistical IQR distribution and multi-stage duration outliers detecting non-standard case journeys and queue anomalies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold">
            {anomalies.length} Outliers Detected ({overview.anomaly_rate}% Anomaly Rate)
          </span>
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-3">Case ID</th>
                <th className="py-3 px-3 text-center">Anomaly Score</th>
                <th className="py-3 px-3 text-right">Cycle Time</th>
                <th className="py-3 px-3">Affected Stage</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Root Deviation Reason</th>
                <th className="py-3 px-3 text-center">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {anomalies.map((a) => (
                <tr key={a.case_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{a.case_id}</td>
                  <td className="py-3.5 px-3 text-center">
                    <ScoreBadge level={a.severity} score={a.anomaly_score} />
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono">
                    <span className="font-bold text-rose-600">{a.duration_hours}h</span>
                    <span className="block text-[10px] text-slate-400 font-normal">
                      vs {a.normal_median_hours}h median
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-900">
                    {a.affected_stage}
                    <span className="block text-[10px] text-slate-400 font-normal font-mono">
                      took {a.stage_duration_hours}h
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">{a.department}</td>
                  <td className="py-3.5 px-3 text-slate-600 max-w-xs">{a.reason}</td>
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => setSelectedCase(a)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                      title="Inspect Event Timeline"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Timeline Inspector Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Case #{selectedCase.case_id} Timeline</h3>
                  <p className="text-xs text-slate-400">
                    Anomaly Score: {selectedCase.anomaly_score}/100 • Total Duration: {selectedCase.duration_hours}h
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 leading-relaxed font-medium">
                <strong>Deviation Flag:</strong> {selectedCase.reason}
              </div>

              <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                Sequential Event Log Execution:
              </h4>

              <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
                {selectedCase.events_timeline.map((evt, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-white"></span>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{evt.activity}</span>
                        <span className="font-mono text-cyan-700">{evt.duration_hours}h</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center justify-between">
                        <span>{evt.timestamp}</span>
                        <span>{evt.department}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
