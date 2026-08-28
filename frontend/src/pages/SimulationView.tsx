import React, { useState, useEffect } from 'react';
import { AnalyticsBundle, SimulationResult } from '../types';
import { api } from '../services/api';
import { Sliders, RotateCcw, TrendingDown, Clock, DollarSign, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface SimulationViewProps {
  analytics: AnalyticsBundle;
}

export const SimulationView: React.FC<SimulationViewProps> = ({ analytics }) => {
  const { stages, overview, dataset_id } = analytics;

  // Simulation controls state
  const [stageAdjustments, setStageAdjustments] = useState<Record<string, number>>({});
  const [staffingIncrease, setStaffingIncrease] = useState(0);
  const [slaChange, setSlaChange] = useState(0);
  const [reworkReduction, setReworkReduction] = useState(0);

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    // Initial baseline stage adjustments = 1.0 (no change)
    const initialMap: Record<string, number> = {};
    stages.forEach((s) => {
      initialMap[s.activity] = 1.0;
    });
    setStageAdjustments(initialMap);
    runSim(initialMap, 0, 0, 0);
  }, [dataset_id]);

  const runSim = async (
    adjustments: Record<string, number>,
    staffing: number,
    sla: number,
    rework: number
  ) => {
    setRunning(true);
    try {
      const res = await api.runSimulation({
        dataset_id,
        stage_adjustments: adjustments,
        staffing_increase_pct: staffing,
        sla_target_change_pct: sla,
        rework_reduction_pct: rework,
      });
      setSimulationResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  const handleStageSlider = (activity: string, multiplier: number) => {
    const updated = { ...stageAdjustments, [activity]: multiplier };
    setStageAdjustments(updated);
    runSim(updated, staffingIncrease, slaChange, reworkReduction);
  };

  const handleReset = () => {
    const resetMap: Record<string, number> = {};
    stages.forEach((s) => {
      resetMap[s.activity] = 1.0;
    });
    setStageAdjustments(resetMap);
    setStaffingIncrease(0);
    setSlaChange(0);
    setReworkReduction(0);
    runSim(resetMap, 0, 0, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Hypothetical Modeling Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">What-If Process Simulation</h2>
          <p className="text-xs text-slate-500 mt-1">
            Simulate operational interventions—reducing stage durations, increasing capacity, or eliminating rework—with instant projection recalculation.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs w-fit"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Simulation</span>
        </button>
      </div>

      {/* Projection Impact Cards */}
      {simulationResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-slate-500 font-semibold uppercase text-[10px] block">Projected Cycle Time</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {simulationResult.projected_cycle_time_hours}h
              </span>
              <span className="text-xs font-mono text-slate-400 line-through">
                {simulationResult.baseline_cycle_time_hours}h
              </span>
            </div>
            <span className="text-emerald-700 font-semibold text-[11px] mt-1 block">
              ↓ {simulationResult.cycle_time_reduction_pct}% Faster Completion
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-slate-500 font-semibold uppercase text-[10px] block">Projected SLA Breach</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {simulationResult.projected_sla_breach_rate}%
              </span>
              <span className="text-xs font-mono text-slate-400 line-through">
                {simulationResult.baseline_sla_breach_rate}%
              </span>
            </div>
            <span className="text-emerald-700 font-semibold text-[11px] mt-1 block">
              Enhanced On-Time Delivery
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-slate-500 font-semibold uppercase text-[10px] block">Projected Rework Rate</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {simulationResult.projected_rework_rate}%
              </span>
              <span className="text-xs font-mono text-slate-400 line-through">
                {simulationResult.baseline_rework_rate}%
              </span>
            </div>
            <span className="text-emerald-700 font-semibold text-[11px] mt-1 block">
              Reduced Gate Re-entries
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md">
            <span className="text-slate-400 font-semibold uppercase text-[10px] block">Annual Capacity Recovered</span>
            <span className="text-2xl font-bold text-cyan-400 font-mono mt-2 block">
              ~{simulationResult.estimated_annual_hours_saved.toLocaleString()} hrs
            </span>
            <span className="text-slate-400 text-[11px]">
              Est. ${ (simulationResult.estimated_annual_hours_saved * 45).toLocaleString() } Value
            </span>
          </div>
        </div>
      )}

      {/* Main Simulation Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Global Simulation Levers */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Organizational Levers</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-slate-700">Staffing / Handling Capacity</span>
              <span className="font-mono text-cyan-600 font-bold">+{staffingIncrease}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={staffingIncrease}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setStaffingIncrease(val);
                runSim(stageAdjustments, val, slaChange, reworkReduction);
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <p className="text-[10px] text-slate-400">Diminishing returns capacity scaling</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-slate-700">Rework Defect Elimination</span>
              <span className="font-mono text-amber-600 font-bold">-{reworkReduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="10"
              value={reworkReduction}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setReworkReduction(val);
                runSim(stageAdjustments, staffingIncrease, slaChange, val);
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <p className="text-[10px] text-slate-400">Eliminating approval return loops</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-slate-800 block mb-1">Simulation Label:</strong>
            All simulation figures are mathematical projections based on historical process distribution data and should be validated with pilot deployments.
          </div>
        </div>

        {/* Right 2 cols: Stage Duration Fine-Tuning Sliders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Per-Stage Duration Modifiers</h3>
            <span className="text-xs font-mono text-slate-400">Target Process Duration</span>
          </div>

          <div className="space-y-4">
            {stages.map((stage) => {
              const currentMultiplier = stageAdjustments[stage.activity] ?? 1.0;
              const reductionPct = Math.round((1.0 - currentMultiplier) * 100);
              const projectedDur = (stage.avg_duration_hours * currentMultiplier).toFixed(1);

              return (
                <div
                  key={stage.activity}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <div>
                      <span className="text-slate-900 font-bold">{stage.activity}</span>
                      <span className="text-[11px] text-slate-500 font-normal ml-2">
                        Baseline: {stage.avg_duration_hours}h
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md">
                        {projectedDur}h ({reductionPct > 0 ? `-${reductionPct}%` : 'Baseline'})
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0.3"
                    max="1.0"
                    step="0.05"
                    value={currentMultiplier}
                    onChange={(e) => handleStageSlider(stage.activity, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
