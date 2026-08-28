import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  Sparkles,
  Layers,
  Sliders,
  RefreshCw,
  Database,
  Eye,
  SlidersHorizontal,
  Table,
} from 'lucide-react';
import { api } from '../services/api';
import { Dataset, DataQualityCheck, AnalyticsBundle, DataCleaningOptions, DataCleaningResult } from '../types';
import { AnalysisProgressModal } from '../components/common/AnalysisProgressModal';

interface UploadViewProps {
  onDatasetReady: (dataset: Dataset, analytics: AnalyticsBundle) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ onDatasetReady }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'demo'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [processType, setProcessType] = useState('Banking & Lending');
  const [dragActive, setDragActive] = useState(false);

  // Flow steps: 1 = select, 2 = preview & map, 3 = clean & validate, 4 = analyze
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Ingestion state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{ columns: string[]; rows: any[]; total_rows: number } | null>(null);
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [cleaningResult, setCleaningResult] = useState<DataCleaningResult | null>(null);

  // Cleaning options
  const [cleaningOptions, setCleaningOptions] = useState<DataCleaningOptions>({
    remove_duplicates: true,
    remove_missing_identifiers: true,
    standardize_timestamps: true,
    normalize_text: true,
    fill_missing_departments: true,
    sort_chronological: true,
  });

  // Progress modal
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [pendingAnalyticsBundle, setPendingAnalyticsBundle] = useState<AnalyticsBundle | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      if (!datasetName) setDatasetName(dropped.name.split('.')[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!datasetName) setDatasetName(selected.name.split('.')[0]);
    }
  };

  const handleInitialUpload = async () => {
    if (!file) {
      setError('Please select a CSV, XLSX, or JSON file to upload.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const result = await api.uploadDataset(file, datasetName, processType);
      setCurrentDataset(result.dataset);
      setColumnMapping(result.dataset.column_mapping);

      // Fetch preview
      const preview = await api.getDatasetPreview(result.dataset.id, 15);
      setPreviewData(preview);
      setPendingAnalyticsBundle(result.analytics);
      setCurrentStep(2); // Move to Preview & Map step
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to upload and parse dataset.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = async (demoType: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.loadDemoDataset(demoType);
      setCurrentDataset(result.dataset);
      setColumnMapping(result.dataset.column_mapping);
      setPendingAnalyticsBundle(result.analytics);

      // Fetch preview
      const preview = await api.getDatasetPreview(result.dataset.id, 15);
      setPreviewData(preview);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load enterprise demo dataset.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMapping = async () => {
    if (!currentDataset) return;
    setLoading(true);
    try {
      await api.mapColumns(currentDataset.id, columnMapping);
      setCurrentStep(3); // Move to cleaning step
    } catch (err: any) {
      setError('Failed to update column mapping.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCleaning = async () => {
    if (!currentDataset) return;
    setLoading(true);
    try {
      const res = await api.cleanDataset(currentDataset.id, cleaningOptions);
      setCleaningResult(res);
    } catch (err: any) {
      setError('Failed to execute dataset cleaning.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteFinalAnalysis = async () => {
    if (!currentDataset) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.runAnalysis(currentDataset.id, columnMapping, cleaningOptions);
      setPendingAnalyticsBundle(res.analytics);
      setShowProgressModal(true);
    } catch (err: any) {
      setError('Failed to run full analysis pipeline.');
      setLoading(false);
    }
  };

  const handleModalFinished = () => {
    setShowProgressModal(false);
    if (currentDataset && pendingAnalyticsBundle) {
      onDatasetReady(currentDataset, pendingAnalyticsBundle);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Progress Modal */}
      <AnalysisProgressModal
        isOpen={showProgressModal}
        onComplete={handleModalFinished}
        datasetName={currentDataset?.name || datasetName || 'Process Dataset'}
      />

      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ENTERPRISE INGESTION ENGINE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Upload & Ingest Process Event Log
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl">
            Ingest structured workflow events from CSV, XLSX, or JSON. The automated engine performs schema validation, timestamp normalization, case reconstruction, and multi-factor bottleneck discovery.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentStep === 1 ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400'
            }`}
          >
            1. Ingest
          </div>
          <div className="text-slate-600">→</div>
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentStep === 2 ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400'
            }`}
          >
            2. Map
          </div>
          <div className="text-slate-600">→</div>
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentStep === 3 ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400'
            }`}
          >
            3. Clean & Analyze
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Upload / Choose Demo */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4 border-b border-slate-200 pb-4">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Custom Event Log</span>
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'demo'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-500" />
              <span>Load Enterprise Demo Datasets</span>
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
                  dragActive
                    ? 'border-cyan-500 bg-cyan-50/50 scale-[1.01]'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-base text-slate-800 mb-1">
                  Drag and drop your event log file here
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Supports CSV, Excel (.xlsx/.xls), and JSON event logs up to 100MB
                </p>
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md"
                >
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                  <span>Browse Files</span>
                </label>

                {file && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Process Name</label>
                  <input
                    type="text"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    placeholder="e.g. Mortgage Loan Processing"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Industry / Process Type</label>
                  <select
                    value={processType}
                    onChange={(e) => setProcessType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="Banking & Lending">Banking & Lending</option>
                    <option value="Healthcare">Healthcare & ER</option>
                    <option value="Education">Higher Education</option>
                    <option value="IT Support">IT Incident & Service</option>
                    <option value="Supply Chain">Supply Chain & Logistics</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleInitialUpload}
                  disabled={!file || loading}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>Ingesting File...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Column Mapping</span>
                      <ArrowRight className="w-4 h-4 text-cyan-400" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  id: 'loan',
                  title: 'Commercial & Mortgage Loan Processing',
                  category: 'Banking & Lending',
                  cases: '500 Cases',
                  events: '3,100+ Events',
                  desc: 'Includes verification latency, underwriting backlog, credit check rework loops, and branch SLA breaches.',
                  badge: 'Recommended Demo',
                },
                {
                  id: 'hospital',
                  title: 'Hospital ER Emergency Registration',
                  category: 'Healthcare',
                  cases: '400 Patients',
                  events: '2,400+ Events',
                  desc: 'Emergency triage bottlenecking, diagnostic lab delays, doctor review queues, and bed allocation friction.',
                  badge: 'Clinical Process',
                },
                {
                  id: 'college',
                  title: 'University Admissions & Enrollment Pipeline',
                  category: 'Higher Education',
                  cases: '450 Applicants',
                  events: '2,700+ Events',
                  desc: 'Transcript verification queues, departmental scholarship approvals, residency checks, and admission delays.',
                  badge: 'Academic Flow',
                },
                {
                  id: 'it',
                  title: 'Enterprise IT Incident & Problem Resolution',
                  category: 'IT Service Management',
                  cases: '500 Tickets',
                  events: '3,000+ Events',
                  desc: 'Tier 1 to Tier 3 escalation loops, security approval latency, root cause investigation, and resolution SLA tracking.',
                  badge: 'ITSM Log',
                },
              ].map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                        {d.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">{d.badge}</span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{d.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{d.desc}</p>
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-600 pt-2 border-t border-slate-100">
                      <span>• {d.cases}</span>
                      <span>• {d.events}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLoadDemo(d.id)}
                    disabled={loading}
                    className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                        <span>Load & Configure This Dataset</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Preview & Column Mapping */}
      {currentStep === 2 && previewData && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-cyan-600" />
                <span>Verify Automatic Column Mapping</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                FlowLens AI detected the column structure. Confirm or override the mapping below.
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
            >
              ← Choose Different File
            </button>
          </div>

          {/* Mapping Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'case_id', label: 'Case Identifier (Required)', required: true },
              { key: 'activity', label: 'Activity / Stage (Required)', required: true },
              { key: 'timestamp', label: 'Event Timestamp (Required)', required: true },
              { key: 'department', label: 'Department / Team', required: false },
              { key: 'employee', label: 'Employee / Assignee', required: false },
              { key: 'priority', label: 'Case Priority / Urgency', required: false },
              { key: 'category', label: 'Category / Product Type', required: false },
              { key: 'sla', label: 'Target SLA Threshold (Hours)', required: false },
              { key: 'cost', label: 'Event Cost / Expense', required: false },
            ].map((field) => (
              <div key={field.key} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>{field.label}</span>
                  {field.required && <span className="text-[10px] text-rose-500 font-bold">*</span>}
                </label>
                <select
                  value={columnMapping[field.key] || ''}
                  onChange={(e) => setColumnMapping({ ...columnMapping, [field.key]: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="">-- None / Auto-detect --</option>
                  {previewData.columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Data Preview Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Table className="w-4 h-4 text-cyan-600" />
                <span>Dataset Sample Preview (First 15 Rows)</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                Total rows detected: {previewData.total_rows.toLocaleString()}
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-x-auto max-h-60">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold text-[11px] sticky top-0">
                  <tr>
                    {previewData.columns.map((col) => (
                      <th key={col} className="px-4 py-2.5 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px]">
                  {previewData.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {previewData.columns.map((col) => (
                        <td key={col} className="px-4 py-2 whitespace-nowrap">
                          {String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Back
            </button>
            <button
              onClick={handleSaveMapping}
              disabled={loading}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span>Confirm Mapping & Continue</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Cleaning Options & Run Analysis */}
      {currentStep === 3 && currentDataset && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Data Quality Engine & Cleaning Pipeline</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure automated data normalization rules before calculating process metrics.
              </p>
            </div>
            <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
              Quality Score: {currentDataset.quality_score}/100
            </span>
          </div>

          {/* Cleaning Rules Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              {
                key: 'remove_duplicates',
                label: 'Deduplicate identical events',
                desc: 'Removes exact duplicate rows that skew stage latency metrics.',
              },
              {
                key: 'remove_missing_identifiers',
                label: 'Enforce valid Case ID & Activity',
                desc: 'Drops unassigned rows that cannot be bound to a process instance.',
              },
              {
                key: 'standardize_timestamps',
                label: 'Standardize ISO 8601 Timestamps',
                desc: 'Normalizes varied date-time formats to uniform chronological strings.',
              },
              {
                key: 'normalize_text',
                label: 'Normalize text casing & whitespace',
                desc: 'Trims leading/trailing spaces and harmonizes naming inconsistencies.',
              },
              {
                key: 'fill_missing_departments',
                label: 'Default missing organizational units',
                desc: 'Sets unassigned handlers to "Unassigned" rather than discarding rows.',
              },
              {
                key: 'sort_chronological',
                label: 'Re-sort sequential events per case',
                desc: 'Guarantees strictly chronological journey reconstruction.',
              },
            ].map((opt) => (
              <label
                key={opt.key}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-start gap-3 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={(cleaningOptions as any)[opt.key]}
                  onChange={(e) =>
                    setCleaningOptions({ ...cleaningOptions, [opt.key]: e.target.checked })
                  }
                  className="mt-0.5 w-4 h-4 text-cyan-600 rounded-sm focus:ring-cyan-500"
                />
                <div>
                  <h4 className="font-bold text-slate-900">{opt.label}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Before vs After Stats if cleaned */}
          {cleaningResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-2 animate-in fade-in">
              <h4 className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Data Cleaning Verified</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 font-mono text-[11px]">
                <div>
                  <span className="text-emerald-700 block text-[10px]">Before Rows</span>
                  <strong>{cleaningResult.before_rows.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-emerald-700 block text-[10px]">Cleaned Rows</span>
                  <strong>{cleaningResult.after_rows.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-emerald-700 block text-[10px]">Duplicates Dropped</span>
                  <strong>{cleaningResult.dropped_duplicates}</strong>
                </div>
                <div>
                  <span className="text-emerald-700 block text-[10px]">Quality Score</span>
                  <strong>{cleaningResult.quality_score_after}/100</strong>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              ← Back to Mapping
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRunCleaning}
                disabled={loading}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all"
              >
                Apply Cleaning Rules
              </button>

              <button
                onClick={handleExecuteFinalAnalysis}
                disabled={loading}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run Full Process Analysis</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
