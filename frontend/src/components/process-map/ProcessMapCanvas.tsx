import React, { useState } from 'react';
import { StageMetric, TransitionMetric } from '../../types';
import { ScoreBadge } from '../common/ScoreBadge';
import { ZoomIn, ZoomOut, RotateCcw, Activity, Clock, AlertTriangle, Users, Search, Info } from 'lucide-react';

interface ProcessMapCanvasProps {
  stages: StageMetric[];
  transitions: TransitionMetric[];
  onSelectStage?: (stage: StageMetric) => void;
}

export const ProcessMapCanvas: React.FC<ProcessMapCanvasProps> = ({ stages, transitions, onSelectStage }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedStage, setSelectedStage] = useState<StageMetric | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!stages || stages.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-50 border border-slate-200 rounded-3xl text-slate-400 text-sm">
        No process stages available for mapping.
      </div>
    );
  }

  const handleStageClick = (stage: StageMetric) => {
    setSelectedStage(stage);
    if (onSelectStage) onSelectStage(stage);
  };

  const isMatched = (stageName: string) => {
    if (!searchTerm.trim()) return false;
    return stageName.toLowerCase().includes(searchTerm.toLowerCase());
  };

  return (
    <div className="relative bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Top Controls Overlay */}
      <div className="p-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 z-20 relative">
        <div className="flex items-center gap-3">
          <span className="font-bold text-xs text-white">Process Journey Graph</span>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-mono text-slate-400">{stages.length} Stages</span>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-mono text-slate-400">{transitions.length} Transitions</span>
        </div>

        {/* Stage Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Highlight stage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 w-44"
          />
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700 shadow-md">
          <button
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PHASE 7: Legend Overlay */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="text-slate-500">Severity Legend:</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Healthy (0–20)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span>Moderate (21–60)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>High (61–80)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Critical (81–100)</span>
          </span>
        </div>
      </div>

      {/* Process Graph Flow Layout */}
      <div
        className="p-10 min-h-[440px] flex items-center justify-center overflow-x-auto transition-transform duration-200"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
      >
        <div className="flex items-center gap-6 py-8 px-4">
          {stages.map((stage, idx) => {
            const isSelected = selectedStage?.activity === stage.activity;
            const isHighlighted = isMatched(stage.activity);
            const isCritical = stage.bottleneck_level === 'Critical';
            const isHigh = stage.bottleneck_level === 'High';
            const isModerate = stage.bottleneck_level === 'Moderate';

            let ringColor = 'border-slate-700 hover:border-emerald-500 bg-slate-800/90';
            let glow = '';

            if (isCritical) {
              ringColor = 'border-rose-500/80 bg-rose-950/40 text-rose-100';
              glow = 'shadow-[0_0_25px_rgba(244,63,94,0.3)] animate-pulse-glow';
            } else if (isHigh) {
              ringColor = 'border-amber-500/80 bg-amber-950/30 text-amber-100';
              glow = 'shadow-[0_0_20px_rgba(245,158,11,0.25)]';
            } else if (isModerate) {
              ringColor = 'border-sky-500/70 bg-sky-950/30 text-sky-100';
            }

            if (isHighlighted) {
              ringColor = 'border-cyan-400 bg-cyan-950/70 ring-4 ring-cyan-400/40 text-white';
            }

            return (
              <React.Fragment key={stage.activity}>
                {/* Node Box */}
                <div
                  onClick={() => handleStageClick(stage)}
                  className={`relative cursor-pointer group flex flex-col p-4 rounded-2xl border transition-all duration-200 w-64 ${ringColor} ${glow} ${
                    isSelected ? 'ring-2 ring-cyan-400 border-cyan-400' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-slate-400">Step #{idx + 1}</span>
                    <ScoreBadge level={stage.bottleneck_level} score={stage.bottleneck_score} />
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {stage.activity}
                  </h4>

                  <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Avg Duration</span>
                      <span className="font-bold text-slate-200 font-mono">{stage.avg_duration_hours}h</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Waiting Time</span>
                      <span className="font-bold text-slate-200 font-mono">{stage.avg_waiting_hours}h</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">SLA Breaches</span>
                      <span className={`font-bold font-mono ${stage.sla_breach_rate > 15 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {stage.sla_breach_rate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Rework Rate</span>
                      <span className={`font-bold font-mono ${stage.rework_rate > 10 ? 'text-amber-400' : 'text-slate-300'}`}>
                        {stage.rework_rate}%
                      </span>
                    </div>
                  </div>

                  {stage.dominant_department && (
                    <div className="mt-2.5 text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                      <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{stage.dominant_department}</span>
                    </div>
                  )}
                </div>

                {/* Arrow Connector to next stage if available */}
                {idx < stages.length - 1 && (
                  <div className="flex flex-col items-center justify-center shrink-0 w-16">
                    <div className="text-[10px] font-mono text-slate-400 mb-1">
                      {transitions[idx] ? `${transitions[idx].count} cases` : ''}
                    </div>
                    <div className="w-full flex items-center">
                      <div className="h-0.5 w-full bg-linear-to-r from-slate-700 via-cyan-500/70 to-slate-700 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-cyan-400 rotate-45"></div>
                      </div>
                    </div>
                    {transitions[idx] && transitions[idx].avg_waiting_hours > 0 && (
                      <div className="text-[10px] text-cyan-300/80 mt-1 flex items-center gap-0.5 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        <span>~{transitions[idx].avg_waiting_hours}h</span>
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Inspector Modal / Drawer */}
      {selectedStage && (
        <div className="p-5 bg-slate-950 border-t border-slate-800 text-white flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 rounded-xl text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base text-white">{selectedStage.activity}</h4>
                <ScoreBadge level={selectedStage.bottleneck_level} score={selectedStage.bottleneck_score} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Department: <strong className="text-slate-200">{selectedStage.dominant_department || 'Operations'}</strong> • SLA Target:{' '}
                <strong className="text-slate-200">{selectedStage.sla_hours} hours</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div className="text-center">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Median</span>
              <span className="font-bold text-sm text-slate-100 font-mono">{selectedStage.median_duration_hours}h</span>
            </div>
            <div className="text-center">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">P95 Worst-case</span>
              <span className="font-bold text-sm text-rose-400 font-mono">{selectedStage.p95_duration_hours}h</span>
            </div>
            <div className="text-center">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Total Cases</span>
              <span className="font-bold text-sm text-cyan-300 font-mono">{selectedStage.total_cases.toLocaleString()}</span>
            </div>
            <button
              onClick={() => setSelectedStage(null)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
