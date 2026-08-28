from typing import Dict, Any, List
from app.models.schemas import SimulationScenario, SimulationResult

def _get_val(obj: Any, key: str, default: Any = None) -> Any:
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)

class SimulationEngine:
    @classmethod
    def run_simulation(cls, overview: Dict[str, Any], scenario: SimulationScenario) -> SimulationResult:
        stages: List[Any] = overview.get("stages", [])
        baseline_cycle_time = float(overview.get("avg_cycle_time_hours", 48.0))
        baseline_sla_breach = float(overview.get("sla_breach_rate", 18.0))
        baseline_rework = float(overview.get("rework_rate", 12.0))
        total_cases = int(overview.get("total_cases", 1000))

        # Adjust stage durations
        stage_improvements = []
        accumulated_saving_hours = 0.0

        for s in stages:
            s_act = _get_val(s, "activity")
            s_cases = _get_val(s, "total_cases", 100)
            original_dur = float(_get_val(s, "avg_duration_hours", 1.0))
            sla_hours = float(_get_val(s, "sla_hours", 24.0))

            multiplier = scenario.stage_adjustments.get(s_act, 1.0)
            
            # Apply staffing increase benefit (diminishing return log curve)
            if scenario.staffing_increase_pct > 0:
                staff_benefit = 1.0 - min(0.4, (scenario.staffing_increase_pct / 100.0) * 0.5)
                multiplier *= staff_benefit

            new_dur = round(original_dur * max(0.2, multiplier), 2)
            saving_per_case = max(0.0, original_dur - new_dur)
            accumulated_saving_hours += saving_per_case * s_cases

            stage_improvements.append({
                "activity": s_act,
                "baseline_duration_hours": original_dur,
                "projected_duration_hours": new_dur,
                "reduction_pct": round(((original_dur - new_dur) / max(0.01, original_dur)) * 100, 1),
                "baseline_sla_hours": sla_hours,
                "projected_sla_hours": round(sla_hours * (1.0 + (scenario.sla_target_change_pct / 100.0)), 1)
            })

        # Calculate projected cycle time
        projected_cycle_time = max(1.0, round(baseline_cycle_time * (1.0 - (accumulated_saving_hours / max(1.0, baseline_cycle_time * total_cases))), 2))
        cycle_reduction_pct = round(((baseline_cycle_time - projected_cycle_time) / max(0.1, baseline_cycle_time)) * 100, 1)

        # Projected SLA breach rate
        projected_sla_breach = max(1.0, round(baseline_sla_breach * (1.0 - (cycle_reduction_pct / 100.0) * 0.8), 1))

        # Projected rework rate
        projected_rework = max(0.5, round(baseline_rework * (1.0 - (scenario.rework_reduction_pct / 100.0)), 1))

        return SimulationResult(
            baseline_cycle_time_hours=baseline_cycle_time,
            projected_cycle_time_hours=projected_cycle_time,
            cycle_time_reduction_pct=cycle_reduction_pct,
            baseline_sla_breach_rate=baseline_sla_breach,
            projected_sla_breach_rate=projected_sla_breach,
            baseline_rework_rate=baseline_rework,
            projected_rework_rate=projected_rework,
            estimated_annual_hours_saved=round(accumulated_saving_hours, 1),
            stage_improvements=stage_improvements,
            is_simulation_estimate=True
        )
