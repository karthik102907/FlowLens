import React from 'react';
import { AnalyticsBundle } from '../types';
import { Building2, ShieldCheck, Repeat, Clock, Info, Users } from 'lucide-react';

interface DepartmentViewProps {
  analytics: AnalyticsBundle;
}

export const DepartmentView: React.FC<DepartmentViewProps> = ({ analytics }) => {
  const { departments } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cross-Department Benchmark Matrix</h2>
        <p className="text-xs text-slate-500 mt-1">
          Comparing operational throughput, workload share, SLA compliance, and rework rates across organizational units.
        </p>
      </div>

      {/* Fairness & Context Notice */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-blue-900 flex items-start gap-3 text-xs leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">Fairness & Process Context Warning:</strong>
          Do not evaluate operational teams purely on speed metrics without considering case complexity, regulatory compliance checks, or escalation thresholds. Longer processing times are often associated with specialized handling.
        </div>
      </div>

      {/* Department Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-3">Department / Organizational Unit</th>
                <th className="py-3 px-3 text-right">Handled Cases</th>
                <th className="py-3 px-3 text-right">Workload Share</th>
                <th className="py-3 px-3 text-right">Avg Duration</th>
                <th className="py-3 px-3 text-right">Median Time</th>
                <th className="py-3 px-3 text-right">SLA Compliance</th>
                <th className="py-3 px-3 text-right">Rework Rate</th>
                <th className="py-3 px-3">Operational Complexity Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {departments.map((dept) => (
                <tr key={dept.department} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span>{dept.department}</span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-900">
                    {dept.total_cases.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-500">
                    {dept.workload_share_pct}%
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                    {dept.avg_duration_hours}h
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-500">
                    {dept.median_duration_hours}h
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono">
                    <span
                      className={`font-bold ${
                        dept.sla_compliance_pct >= 85 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {dept.sla_compliance_pct}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono">
                    <span className={dept.rework_rate > 10 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                      {dept.rework_rate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 text-[11px] max-w-xs leading-relaxed">
                    {dept.fairness_note}
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
