import React from 'react';
import { AnalyticsBundle, StageMetric } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { ScoreBadge } from '../components/common/ScoreBadge';
import {
  Users,
  Clock,
  AlertOctagon,
  Repeat,
  ShieldAlert,
  DollarSign,
  TrendingDown,
  Activity,
  ArrowRight,
  Sparkles,
  Building2,
  FileText,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardViewProps {
  analytics: AnalyticsBundle;
  onNavigate: (view: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ analytics, onNavigate }) => {
  const { overview, stages, bottlenecks, departments, recommendations } = analytics;
  const topBottleneck = bottlenecks[0] || null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Process Health Header */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
              Active Dataset Analytics
            </span>
            <span className="text-xs text-slate-400 font-mono">• Dynamically calculated</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Operational Health Overview
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time process discovery across {overview.total_cases.toLocaleString()} cases and{' '}
            {overview.total_events.toLocaleString()} discrete workflow transitions.
          </p>
        </div>

        {/* Process Health Score Widget */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl shrink-0">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={overview.overall_health_score > 70 ? 'text-emerald-500' : 'text-amber-500'}
                strokeDasharray={`${overview.overall_health_score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-base font-black text-white font-mono">
              {overview.overall_health_score}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">
              Health Index
            </span>
            <span className="text-xs font-bold text-slate-200 block">
              {overview.overall_health_score > 75
                ? 'Healthy Operation'
                : overview.overall_health_score > 50
                ? 'Moderate Bottlenecks'
                : 'Critical Optimization Required'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Target: 85+/100</span>
          </div>
        </div>
      </div>

      {/* PHASE 5: Executive Summary Card */}
      {topBottleneck && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-100 text-cyan-800">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Executive Intelligence Summary
                </h3>
              </div>
              <p className="text-xs md:text-sm text-slate-800 leading-relaxed font-medium">
                FlowLens analyzed <strong className="text-slate-950">{overview.total_cases.toLocaleString()} cases</strong> across{' '}
                <strong className="text-slate-950">{overview.total_events.toLocaleString()} workflow events</strong>. The primary operational bottleneck is{' '}
                <strong className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200">{topBottleneck.activity}</strong> (Severity Score:{' '}
                <span className="font-mono font-bold">{topBottleneck.bottleneck_score}/100</span>). It contributes an average duration of{' '}
                <span className="font-mono font-bold">{topBottleneck.avg_duration_hours} hours</span> and an SLA breach rate of{' '}
                <span className="font-mono font-bold">{topBottleneck.sla_breach_rate}%</span>.
              </p>
              {recommendations.length > 0 && (
                <div className="pt-2 flex items-center gap-2 text-xs text-slate-700">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    <strong>Recommended Priority:</strong> {recommendations[0].recommended_action}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => onNavigate('bottlenecks')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <span>Investigate Bottleneck</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>
      )}

      {/* Top 8 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <MetricCard
          title="Total Cases"
          value={overview.total_cases.toLocaleString()}
          subtitle="Unique Journeys"
          icon={Users}
          variant="primary"
        />
        <MetricCard
          title="Avg Cycle Time"
          value={`${overview.avg_cycle_time_hours}h`}
          subtitle={`Median: ${overview.median_cycle_time_hours}h`}
          icon={Clock}
          variant="blue"
        />
        <MetricCard
          title="P95 Cycle Time"
          value={`${overview.p95_cycle_time_hours}h`}
          subtitle="Worst 5% Cases"
          icon={Clock}
          variant="amber"
        />
        <MetricCard
          title="Bottleneck Index"
          value={`${overview.bottleneck_score}/100`}
          subtitle={bottlenecks[0]?.bottleneck_level || 'Normal'}
          icon={AlertOctagon}
          variant="rose"
        />
        <MetricCard
          title="Rework Rate"
          value={`${overview.rework_rate}%`}
          subtitle="Loop re-entries"
          icon={Repeat}
          variant="amber"
        />
        <MetricCard
          title="SLA Breach"
          value={`${overview.sla_breach_rate}%`}
          subtitle="Over target threshold"
          icon={ShieldAlert}
          variant="rose"
        />
        <MetricCard
          title="Anomaly Rate"
          value={`${overview.anomaly_rate}%`}
          subtitle="Outlier cases"
          icon={Activity}
          variant="purple"
        />
        <MetricCard
          title="Est. Time Lost"
          value={`${overview.estimated_time_lost_hours}h`}
          subtitle={overview.estimated_cost_lost ? `$${overview.estimated_cost_lost.toLocaleString()}` : 'Financial Impact'}
          icon={DollarSign}
          variant="rose"
        />
      </div>

      {/* Main Content Grid: Trends & Bottleneck Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Volume & Delay Trend */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Case Volume & Average Delay Pacing</h3>
                <p className="text-xs text-slate-500">Chronological daily case ingestion and average processing duration</p>
              </div>
              <span className="text-xs font-mono text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md">
                30-Day Trend
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview.daily_delays}>
                  <defs>
                    <linearGradient id="delayGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} unit="h" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="avg_delay_hours"
                    name="Avg Delay (Hours)"
                    stroke="#0284c7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#delayGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stage Performance Breakdown Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Process Stages Performance</h3>
                <p className="text-xs text-slate-500">Duration, queue waiting, SLA breaches, and rework rates by activity</p>
              </div>
              <button
                onClick={() => onNavigate('bottlenecks')}
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 flex items-center gap-1"
              >
                <span>Full Bottleneck View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Process Stage</th>
                    <th className="py-2.5 px-3 text-right">Avg Time</th>
                    <th className="py-2.5 px-3 text-right">Waiting</th>
                    <th className="py-2.5 px-3 text-right">SLA Target</th>
                    <th className="py-2.5 px-3 text-right">Breach Rate</th>
                    <th className="py-2.5 px-3 text-right">Rework</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {stages.map((stage) => (
                    <tr key={stage.activity} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {stage.activity}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {stage.dominant_department || 'Operations'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold">{stage.avg_duration_hours}h</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">{stage.avg_waiting_hours}h</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">{stage.sla_hours}h</td>
                      <td className="py-3 px-3 text-right font-mono">
                        <span className={stage.sla_breach_rate > 20 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                          {stage.sla_breach_rate}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        <span className={stage.rework_rate > 10 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                          {stage.rework_rate}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <ScoreBadge level={stage.bottleneck_level} score={stage.bottleneck_score} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Top Bottlenecks Ranking & Recommendations Preview */}
        <div className="space-y-6">
          {/* Bottleneck Severity Ranking */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Top Bottleneck Ranking</h3>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Weighted Index</span>
            </div>

            <div className="space-y-3">
              {bottlenecks.slice(0, 4).map((b) => (
                <div
                  key={b.activity}
                  onClick={() => onNavigate('bottlenecks')}
                  className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                        #{b.rank}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 truncate">{b.activity}</h4>
                    </div>
                    <ScoreBadge level={b.bottleneck_level} score={b.bottleneck_score} />
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {b.summary_explanation}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Driver: {b.primary_contributor}</span>
                    <span>{b.avg_duration_hours}h avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommended Actions Preview */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 text-white shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">AI Recommendations</h3>
              </div>
              <button
                onClick={() => onNavigate('recommendations')}
                className="text-[11px] text-cyan-400 hover:underline font-semibold"
              >
                View All ({recommendations.length})
              </button>
            </div>

            {recommendations.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono">
                    Priority: {recommendations[0].priority}
                  </span>
                  <span className="text-[10px] text-slate-400">{recommendations[0].affected_stage}</span>
                </div>
                <h4 className="font-bold text-white text-xs">{recommendations[0].problem}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {recommendations[0].recommended_action}
                </p>
                {recommendations[0].estimated_time_saving_hours && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-cyan-300 font-medium">
                    <span>Est. Recovery:</span>
                    <span className="font-mono">~{recommendations[0].estimated_time_saving_hours} hrs / year</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
