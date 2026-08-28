import React, { useState } from 'react';
import { AnalyticsBundle, Dataset } from '../types';
import { FileText, Download, Printer, CheckCircle2, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportsViewProps {
  dataset: Dataset;
  analytics: AnalyticsBundle;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ dataset, analytics }) => {
  const { overview, stages, bottlenecks, recommendations, departments } = analytics;
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF();

      // Title & Header
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('FlowLens AI - Executive Process Intelligence Report', 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Dataset: ${dataset.name} | Process: ${dataset.process_type} | Generated: ${new Date().toLocaleDateString()}`, 14, 30);

      // Section 1: Executive Summary
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('1. Executive Process Summary', 14, 42);

      autoTable(doc, {
        startY: 46,
        head: [['Metric', 'Value', 'Benchmark Target', 'Status']],
        body: [
          ['Total Process Cases', overview.total_cases.toLocaleString(), 'N/A', 'Ingested (100%)'],
          ['Average Cycle Time', `${overview.avg_cycle_time_hours} hours`, '< 40.0 hours', overview.avg_cycle_time_hours > 40 ? 'Action Required' : 'Optimal'],
          ['Process Health Index', `${overview.overall_health_score}/100`, '> 85/100', overview.overall_health_score > 75 ? 'Healthy' : 'Sub-optimal'],
          ['Overall SLA Breach Rate', `${overview.sla_breach_rate}%`, '< 10.0%', overview.sla_breach_rate > 15 ? 'Critical Concern' : 'Normal'],
          ['Process Rework Rate', `${overview.rework_rate}%`, '< 5.0%', overview.rework_rate > 10 ? 'High Loops' : 'Normal'],
          ['Operational Time Lost', `${overview.estimated_time_lost_hours} hours`, '0 hours', `$${(overview.estimated_cost_lost || 0).toLocaleString()} Impact`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
      });

      // Section 2: Ranked Bottlenecks
      const lastY = (doc as any).lastAutoTable.finalY || 100;
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('2. Ranked Process Bottlenecks', 14, lastY + 12);

      autoTable(doc, {
        startY: lastY + 16,
        head: [['Rank', 'Process Stage', 'Score', 'Avg Time', 'Waiting Time', 'SLA Breaches', 'Primary Driver']],
        body: bottlenecks.map((b) => [
          `#${b.rank}`,
          b.activity,
          `${b.bottleneck_score}/100`,
          `${b.avg_duration_hours}h`,
          `${b.avg_waiting_hours}h`,
          `${b.sla_breach_rate}%`,
          b.primary_contributor,
        ]),
        theme: 'grid',
        headStyles: { fillColor: [2, 132, 199] },
      });

      // Section 3: Recommendations
      const lastY2 = (doc as any).lastAutoTable.finalY || 180;
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('3. Prescriptive AI Recommendations', 14, lastY2 + 12);

      autoTable(doc, {
        startY: lastY2 + 16,
        head: [['Priority', 'Stage', 'Problem & Evidence', 'Recommended Action Plan']],
        body: recommendations.slice(0, 4).map((r) => [
          r.priority,
          r.affected_stage,
          `${r.problem}\nEvidence: ${r.evidence}`,
          r.recommended_action,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
      });

      doc.save(`FlowLens_Executive_Report_${dataset.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Stages
    const stagesWs = XLSX.utils.json_to_sheet(
      stages.map((s) => ({
        Activity: s.activity,
        Total_Cases: s.total_cases,
        Avg_Duration_Hours: s.avg_duration_hours,
        Median_Hours: s.median_duration_hours,
        P95_Hours: s.p95_duration_hours,
        Waiting_Hours: s.avg_waiting_hours,
        SLA_Breach_Rate: `${s.sla_breach_rate}%`,
        Rework_Rate: `${s.rework_rate}%`,
        Bottleneck_Score: s.bottleneck_score,
        Dominant_Dept: s.dominant_department,
      }))
    );
    XLSX.utils.book_append_sheet(wb, stagesWs, 'Stage_Performance');

    // Sheet 2: Bottlenecks
    const bWs = XLSX.utils.json_to_sheet(
      bottlenecks.map((b) => ({
        Rank: b.rank,
        Stage: b.activity,
        Score: b.bottleneck_score,
        Severity: b.bottleneck_level,
        Avg_Time_H: b.avg_duration_hours,
        Waiting_Time_H: b.avg_waiting_hours,
        Primary_Driver: b.primary_contributor,
        Summary: b.summary_explanation,
      }))
    );
    XLSX.utils.book_append_sheet(wb, bWs, 'Bottlenecks');

    // Sheet 3: Recommendations
    const recWs = XLSX.utils.json_to_sheet(
      recommendations.map((r) => ({
        Priority: r.priority,
        Stage: r.affected_stage,
        Problem: r.problem,
        Evidence: r.evidence,
        Recommended_Action: r.recommended_action,
        Est_Hours_Saved: r.estimated_time_saving_hours || 0,
        Est_Cost_Saved: r.estimated_cost_saving || 0,
      }))
    );
    XLSX.utils.book_append_sheet(wb, recWs, 'Recommendations');

    XLSX.writeFile(wb, `FlowLens_Report_${dataset.name.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Process Audit Report</h2>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive printable documentation ready for C-suite and process engineering presentation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Excel (.xlsx)</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>{exporting ? 'Generating PDF...' : 'Download Executive PDF'}</span>
          </button>
        </div>
      </div>

      {/* Formatted On-Screen Report Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-8 max-w-4xl mx-auto text-slate-900">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-600">
              FlowLens Operational Audit
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Process Performance & Bottleneck Assessment
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Target Organization: Global Enterprise Services • Dataset: {dataset.name}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800 block">Health Index</span>
            <span className="text-2xl font-black text-cyan-600 font-mono">
              {overview.overall_health_score}/100
            </span>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
            1. Operational Summary
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            During the evaluated period, a total of <strong>{overview.total_cases.toLocaleString()} cases</strong>{' '}
            were reconstructed from raw event logs. End-to-end cycle times average{' '}
            <strong>{overview.avg_cycle_time_hours} hours</strong> (with a median of{' '}
            {overview.median_cycle_time_hours}h). An overall SLA breach rate of{' '}
            <strong>{overview.sla_breach_rate}%</strong> was recorded, generating an estimated{' '}
            <strong>{overview.estimated_time_lost_hours} hours</strong> of excess queue backlog.
          </p>
        </div>

        {/* Section 2: Top Bottleneck Findings */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
            2. Critical Bottlenecks
          </h3>
          <div className="space-y-3">
            {bottlenecks.slice(0, 3).map((b) => (
              <div key={b.activity} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>
                    #{b.rank} {b.activity}
                  </span>
                  <span className="font-mono text-rose-600 font-bold">Severity: {b.bottleneck_score}/100</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{b.summary_explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Recommended Next Steps */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
            3. AI Prescriptive Next Steps
          </h3>
          <div className="space-y-2 text-xs">
            {recommendations.slice(0, 3).map((r, rIdx) => (
              <div key={rIdx} className="p-3 rounded-xl bg-cyan-50/50 border border-cyan-200/60 text-slate-800">
                <strong className="text-slate-900 block mb-0.5">
                  Action {rIdx + 1}: {r.recommended_action}
                </strong>
                <span className="text-[11px] text-slate-600">{r.expected_impact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
