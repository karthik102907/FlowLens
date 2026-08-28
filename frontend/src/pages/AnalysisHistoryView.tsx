import React, { useState, useEffect } from 'react';
import { History, Sparkles, ArrowRight, CheckCircle2, RefreshCw, Layers, ShieldCheck, Activity, Search } from 'lucide-react';
import { api } from '../services/api';
import { AnalysisHistoryItem } from '../types';

interface AnalysisHistoryViewProps {
  onSelectAnalysis: (analysisId: string, datasetId: string) => void;
  currentDatasetId?: string;
}

export const AnalysisHistoryView: React.FC<AnalysisHistoryViewProps> = ({
  onSelectAnalysis,
  currentDatasetId,
}) => {
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalyses();
      setAnalyses(data);
    } catch (e) {
      console.error('Failed to fetch analyses', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const filtered = analyses.filter(
    (a) =>
      a.dataset_name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.top_bottleneck.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
              <History className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Analysis Audit History</h2>
          </div>
          <p className="text-xs text-slate-500">
            Audit trail of all executed process intelligence analyses, deterministic runs, and benchmark archives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search runs, datasets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 w-60"
            />
          </div>

          <button
            onClick={fetchAnalyses}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            title="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Analysis Run</th>
                <th className="px-6 py-4">Execution Date</th>
                <th className="px-6 py-4">Volume</th>
                <th className="px-6 py-4">Cycle Time</th>
                <th className="px-6 py-4">Health Index</th>
                <th className="px-6 py-4">Critical Bottleneck</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-600" />
                    <span>Loading analysis history records...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No analysis records found.</p>
                    <p className="text-[11px] mt-1">Upload a dataset or load an enterprise demo to create an analysis audit entry.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isCurrent = currentDatasetId === item.dataset_id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{item.dataset_name}</div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">{item.id}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">{item.created_at}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {item.total_cases.toLocaleString()} cases
                        <span className="text-[10px] text-slate-400 block">{item.total_events.toLocaleString()} events</span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">
                        {item.avg_cycle_time_hours}h
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              item.overall_health_score >= 80
                                ? 'bg-emerald-500'
                                : item.overall_health_score >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          ></span>
                          <span className="font-bold text-slate-800">{item.overall_health_score}/100</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-md font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          {item.top_bottleneck}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onSelectAnalysis(item.id, item.dataset_id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all inline-flex items-center gap-1.5 ${
                            isCurrent
                              ? 'bg-cyan-50 text-cyan-700 border border-cyan-300'
                              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                          }`}
                        >
                          <span>{isCurrent ? 'Active' : 'Open'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
