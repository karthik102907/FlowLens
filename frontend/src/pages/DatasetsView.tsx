import React from 'react';
import { Dataset } from '../types';
import { FileSpreadsheet, CheckCircle2, ArrowRight, UploadCloud, Database } from 'lucide-react';

interface DatasetsViewProps {
  datasets: Dataset[];
  selectedDatasetId: string;
  onSelectDataset: (id: string) => void;
  onNavigateUpload: () => void;
}

export const DatasetsView: React.FC<DatasetsViewProps> = ({
  datasets,
  selectedDatasetId,
  onSelectDataset,
  onNavigateUpload,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dataset Inventory & Assets</h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse ingested process event logs, validation quality ratings, and schema mapping details.
          </p>
        </div>
        <button
          onClick={onNavigateUpload}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <UploadCloud className="w-4 h-4 text-cyan-400" />
          <span>Upload New Event Log</span>
        </button>
      </div>

      {/* Datasets Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-3">Dataset Name</th>
                <th className="py-3 px-3">Domain</th>
                <th className="py-3 px-3 text-right">Event Records</th>
                <th className="py-3 px-3 text-right">Unique Cases</th>
                <th className="py-3 px-3 text-right">Stages</th>
                <th className="py-3 px-3 text-center">Quality Score</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {datasets.map((d) => {
                const isActive = d.id === selectedDatasetId;

                return (
                  <tr key={d.id} className={`hover:bg-slate-50 transition-colors ${isActive ? 'bg-cyan-50/30' : ''}`}>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{d.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {d.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {d.process_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold">{d.row_count?.toLocaleString()}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {d.case_count?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600">{d.activity_count}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md text-[11px]">
                        {d.quality_score}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {isActive ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active In Analysis
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] text-slate-500 bg-slate-100">
                          Available
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {!isActive && (
                        <button
                          onClick={() => onSelectDataset(d.id)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-2xs"
                        >
                          Load
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
