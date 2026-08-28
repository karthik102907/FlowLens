import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, List, Tuple
from app.models.schemas import StageMetric, TransitionMetric, ProcessOverview

class ProcessEngine:
    @classmethod
    def reconstruct_process(cls, df: pd.DataFrame, mapping: Dict[str, str], default_sla_hours: float = 24.0) -> Dict[str, Any]:
        case_col = mapping.get("case_id", "case_id")
        act_col = mapping.get("activity", "activity")
        time_col = mapping.get("timestamp", "timestamp")
        dept_col = mapping.get("department")
        cost_col = mapping.get("cost")
        sla_col = mapping.get("sla")

        work_df = df.copy()
        work_df["_dt"] = pd.to_datetime(work_df[time_col])
        work_df = work_df.sort_values(by=[case_col, "_dt"]).reset_index(drop=True)

        # Calculate time differences between sequential events within each case
        work_df["_prev_case"] = work_df[case_col].shift(1)
        work_df["_prev_dt"] = work_df["_dt"].shift(1)
        work_df["_prev_act"] = work_df[act_col].shift(1)

        # Same case condition
        is_same_case = work_df[case_col] == work_df["_prev_case"]
        
        # Duration / waiting time from previous step in hours
        work_df["_duration_hours"] = np.where(
            is_same_case,
            (work_df["_dt"] - work_df["_prev_dt"]).dt.total_seconds() / 3600.0,
            0.0
        )
        work_df["_duration_hours"] = work_df["_duration_hours"].clip(lower=0.0)

        # Case-level journey reconstruction
        case_groups = work_df.groupby(case_col)
        
        case_durations = []
        case_reworks = {}
        for cid, group in case_groups:
            start_t = group["_dt"].min()
            end_t = group["_dt"].max()
            total_h = (end_t - start_t).total_seconds() / 3600.0
            case_durations.append(max(0.1, total_h))
            
            # Check for visited activities to count re-entries (rework)
            seen_acts = set()
            rework_count = 0
            for act in group[act_col]:
                if act in seen_acts:
                    rework_count += 1
                seen_acts.add(act)
            case_reworks[cid] = rework_count

        total_cases = int(work_df[case_col].nunique())
        total_events = len(work_df)
        
        avg_cycle_time = float(np.mean(case_durations)) if case_durations else 0.0
        median_cycle_time = float(np.median(case_durations)) if case_durations else 0.0
        p95_cycle_time = float(np.percentile(case_durations, 95)) if case_durations else 0.0

        # Unique activities and transition graph
        all_activities = list(work_df[act_col].unique())
        
        # Transitions
        transitions_dict: Dict[Tuple[str, str], List[float]] = {}
        transitions_rework: Dict[Tuple[str, str], int] = {}
        
        for idx, row in work_df[is_same_case].iterrows():
            src = str(row["_prev_act"])
            tgt = str(row[act_col])
            dur = float(row["_duration_hours"])
            pair = (src, tgt)
            if pair not in transitions_dict:
                transitions_dict[pair] = []
                transitions_rework[pair] = 0
            transitions_dict[pair].append(dur)

        transitions_list: List[TransitionMetric] = []
        for (src, tgt), durs in transitions_dict.items():
            arr = np.array(durs)
            transitions_list.append(TransitionMetric(
                source=src,
                target=tgt,
                count=len(arr),
                avg_waiting_hours=round(float(np.mean(arr)), 2),
                median_waiting_hours=round(float(np.median(arr)), 2),
                min_waiting_hours=round(float(np.min(arr)), 2),
                max_waiting_hours=round(float(np.max(arr)), 2),
                p95_waiting_hours=round(float(np.percentile(arr, 95)), 2),
                rework_count=transitions_rework.get((src, tgt), 0)
            ))

        # Stage metrics
        stage_metrics_list: List[StageMetric] = []
        total_sla_breaches_all = 0
        total_reworks_all = sum(case_reworks.values())

        for act in all_activities:
            act_df = work_df[work_df[act_col] == act]
            act_cases = int(act_df[case_col].nunique())
            act_events = len(act_df)
            
            # Extract durations for this activity when it represents incoming wait / transition
            durations = act_df["_duration_hours"].values
            # Filter non-zero for duration distribution if not the start step
            pos_durations = durations[durations > 0.0]
            if len(pos_durations) == 0:
                pos_durations = np.array([0.5])  # default baseline

            avg_dur = float(np.mean(pos_durations))
            med_dur = float(np.median(pos_durations))
            p90_dur = float(np.percentile(pos_durations, 90))
            p95_dur = float(np.percentile(pos_durations, 95))
            min_dur = float(np.min(pos_durations))
            max_dur = float(np.max(pos_durations))
            std_dur = float(np.std(pos_durations)) if len(pos_durations) > 1 else 0.0

            # SLA definition per stage
            stage_sla = default_sla_hours
            if sla_col and sla_col in act_df.columns:
                try:
                    stage_sla = float(act_df[sla_col].dropna().iloc[0])
                except Exception:
                    stage_sla = default_sla_hours
            else:
                # Dynamic realistic SLA based on median * 1.5
                stage_sla = max(2.0, round(med_dur * 1.6, 1))

            breaches = int(np.sum(durations > stage_sla))
            total_sla_breaches_all += breaches
            sla_breach_rate = round((breaches / max(1, act_events)) * 100, 1)

            # Rework for this activity (cases visiting it > 1 time)
            act_case_counts = act_df[case_col].value_counts()
            rework_cases = int((act_case_counts > 1).sum())
            rework_rate = round((rework_cases / max(1, act_cases)) * 100, 1)

            # Anomaly rate (duration > p95 + 1.5 * IQR or > 3 * median)
            iqr = p95_dur - med_dur
            anomaly_threshold = med_dur + 2.0 * max(1.0, iqr)
            anomalies = int(np.sum(durations > anomaly_threshold))
            anomaly_rate = round((anomalies / max(1, act_events)) * 100, 1)

            # Dominant department
            dom_dept = "Unassigned"
            if dept_col and dept_col in act_df.columns:
                dom_dept = str(act_df[dept_col].mode().iloc[0]) if not act_df[dept_col].empty else "Operations"

            stage_metrics_list.append(StageMetric(
                activity=act,
                total_cases=act_cases,
                total_events=act_events,
                avg_duration_hours=round(avg_dur, 2),
                median_duration_hours=round(med_dur, 2),
                p90_duration_hours=round(p90_dur, 2),
                p95_duration_hours=round(p95_dur, 2),
                min_duration_hours=round(min_dur, 2),
                max_duration_hours=round(max_dur, 2),
                std_duration_hours=round(std_dur, 2),
                avg_waiting_hours=round(avg_dur * 0.65, 2),
                rework_rate=rework_rate,
                rework_count=rework_cases,
                sla_hours=stage_sla,
                sla_breach_rate=sla_breach_rate,
                sla_breaches=breaches,
                anomaly_rate=anomaly_rate,
                dominant_department=dom_dept
            ))

        # Start and End activities
        start_acts = work_df.groupby(case_col).first()[act_col].value_counts().to_dict()
        end_acts = work_df.groupby(case_col).last()[act_col].value_counts().to_dict()
        start_activities_list = [{"activity": k, "count": int(v), "percentage": round(v / max(1, total_cases) * 100, 1)} for k, v in start_acts.items()]
        end_activities_list = [{"activity": k, "count": int(v), "percentage": round(v / max(1, total_cases) * 100, 1)} for k, v in end_acts.items()]

        # Daily trends
        work_df["_date_str"] = work_df["_dt"].dt.strftime("%Y-%m-%d")
        daily_vol = work_df.groupby("_date_str")[case_col].nunique().to_dict()
        daily_volume = [{"date": d, "cases": int(cnt)} for d, cnt in sorted(daily_vol.items())[-30:]]

        daily_del = work_df.groupby("_date_str")["_duration_hours"].mean().to_dict()
        daily_delays = [{"date": d, "avg_delay_hours": round(float(val), 2)} for d, val in sorted(daily_del.items())[-30:]]

        # Overall Rates
        total_sla_rate = round((total_sla_breaches_all / max(1, total_events)) * 100, 1)
        total_rework_rate = round((total_reworks_all / max(1, total_cases)) * 100, 1)
        total_anomaly_rate = round(float(np.mean([s.anomaly_rate for s in stage_metrics_list])), 1) if stage_metrics_list else 5.0

        # Estimated Time Lost (Sum of excess duration beyond SLA across all events)
        estimated_time_lost = 0.0
        for s in stage_metrics_list:
            excess = max(0.0, s.avg_duration_hours - s.sla_hours)
            estimated_time_lost += excess * s.total_cases
        estimated_time_lost = round(estimated_time_lost, 1)

        # Estimated Cost Lost (if cost exists, or standard rate $45/hour)
        cost_per_hour = 45.0
        estimated_cost_lost = round(estimated_time_lost * cost_per_hour, 2)

        # Health score: 100 - penalties
        health_penalty = min(90, (total_sla_rate * 0.4) + (total_rework_rate * 0.3) + (total_anomaly_rate * 0.3))
        overall_health_score = max(10, int(100 - health_penalty))

        return {
            "total_cases": total_cases,
            "total_events": total_events,
            "avg_cycle_time_hours": round(avg_cycle_time, 2),
            "median_cycle_time_hours": round(median_cycle_time, 2),
            "p95_cycle_time_hours": round(p95_cycle_time, 2),
            "overall_health_score": overall_health_score,
            "bottleneck_score": 0.0,  # Will be set by bottleneck engine
            "rework_rate": total_rework_rate,
            "sla_breach_rate": total_sla_rate,
            "anomaly_rate": total_anomaly_rate,
            "estimated_time_lost_hours": estimated_time_lost,
            "estimated_cost_lost": estimated_cost_lost,
            "stages": stage_metrics_list,
            "transitions": transitions_list,
            "start_activities": start_activities_list,
            "end_activities": end_activities_list,
            "daily_volume": daily_volume,
            "daily_delays": daily_delays,
            "work_df": work_df
        }
