import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Loader2, Bot, ArrowRight } from 'lucide-react';

interface AnalysisProgressModalProps {
  isOpen: boolean;
  onComplete: () => void;
  datasetName: string;
}

interface StepItem {
  id: number;
  label: string;
  detail: string;
}

const STEPS: StepItem[] = [
  { id: 1, label: 'Ingesting dataset & schema validation', detail: 'Parsing column headers, data types, and record bounds...' },
  { id: 2, label: 'Executing data cleaning & normalization', detail: 'Resolving null identifiers, deduplicating, and standardizing ISO timestamps...' },
  { id: 3, label: 'Reconstructing sequential case journeys', detail: 'Grouping event logs chronologically into end-to-end patient/loan journeys...' },
  { id: 4, label: 'Computing transition latencies & cycle times', detail: 'Calculating average, median, and P95 waiting durations across stage pairs...' },
  { id: 5, label: 'Executing multi-factor bottleneck engine', detail: 'Calculating weighted scores for duration, waiting, rework, SLA, and variance...' },
  { id: 6, label: 'Statistical root cause correlation analysis', detail: 'Correlating delays across departments, priorities, categories, and time-of-day...' },
  { id: 7, label: 'Running multimodal anomaly detection', detail: 'Executing IQR statistical distributions and multi-stage latency outlier scoring...' },
  { id: 8, label: 'Discovering rework & approval return loops', detail: 'Quantifying inter-stage loop frequency, delay penalties, and cost impact...' },
  { id: 9, label: 'Training ML delay risk prediction ensemble', detail: 'Fitting Random Forest models and computing Accuracy, F1, and SHAP feature importances...' },
  { id: 10, label: 'Synthesizing prescriptive AI recommendations', detail: 'Synthesizing evidence-based operational actions grounded in computed metrics...' },
];

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  isOpen,
  onComplete,
  datasetName,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setIsFinished(false);
      return;
    }

    // Progress through analytical steps
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsFinished(true);
          return prev;
        }
      });
    }, 280);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">FlowLens Process Intelligence Engine</h3>
              <p className="text-xs text-slate-400">
                Running real-time analysis on <strong className="text-cyan-300 font-semibold">{datasetName}</strong>
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800">
            {isFinished ? '100%' : `${Math.round((currentStep / STEPS.length) * 100)}%`}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-linear-to-r from-cyan-500 via-sky-400 to-blue-600 h-full transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          ></div>
        </div>

        {/* Steps List */}
        <div className="p-6 space-y-3 text-xs max-h-[50vh] overflow-y-auto bg-slate-50">
          {STEPS.map((step) => {
            const isDone = step.id < currentStep || isFinished;
            const isCurrent = step.id === currentStep && !isFinished;

            return (
              <div
                key={step.id}
                className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                  isCurrent
                    ? 'bg-white border-cyan-500/80 shadow-md ring-1 ring-cyan-500/20'
                    : isDone
                    ? 'bg-white border-slate-200/80 opacity-90'
                    : 'bg-slate-100/50 border-slate-200/40 opacity-40'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-600 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300"></div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className={`font-bold text-xs ${isCurrent ? 'text-cyan-950' : 'text-slate-900'}`}>
                      {step.label}
                    </h5>
                    <span className="font-mono text-[10px] text-slate-400">Stage {step.id}/10</span>
                  </div>
                  {isCurrent && (
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed animate-in fade-in">
                      {step.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
            <span>{isFinished ? 'Analysis ready!' : 'Computing deterministic metrics...'}</span>
          </div>

          <button
            onClick={onComplete}
            disabled={!isFinished}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <span>Open Executive Results</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
