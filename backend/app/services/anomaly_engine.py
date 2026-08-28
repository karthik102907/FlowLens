import pandas as pd
import numpy as np
from typing import Dict, Any, List
from app.models.schemas import AnomalyCase

class AnomalyEngine:
    @classmethod
    def detect_anomalies(cls, work_df: pd.DataFrame, mapping: Dict[str, str], max_results: int = 50) -> List[AnomalyCase]:
        case_col = mapping.get("case_id", "case_id")
        act_col = mapping.get("activity", "activity")
        time_col = mapping.get("timestamp", "timestamp")
        dept_col = mapping.get("department")

        case_groups = work_df.groupby(case_col)
        case_durations = {}
        case_events_map = {}
        case_reworks = {}
        case_depts = {}
        stage_durations_map = {}

        for cid, group in case_groups:
            start_t = group["_dt"].min()
            end_t = group["_dt"].max()
            dur_h = (end_t - start_t).total_seconds() / 3600.0
            case_durations[cid] = dur_h
            
            # Events timeline
            events_list = []
            for _, row in group.iterrows():
                events_list.append({
                    "activity": str(row[act_col]),
                    "timestamp": str(row[time_col]),
                    "duration_hours": round(float(row.get("_duration_hours", 0.0)), 2),
                    "department": str(row.get(dept_col, "Operations")) if dept_col else "Operations"
                })
            case_events_map[cid] = events_list
            
            # Dominant dept
            case_depts[cid] = str(group[dept_col].iloc[0]) if dept_col and dept_col in group.columns else "Operations"

            # Rework
            seen = set()
            rework = 0
            for a in group[act_col]:
                if a in seen:
                    rework += 1
                seen.add(a)
            case_reworks[cid] = rework

            # Max stage duration
            max_row = group.sort_values(by="_duration_hours", ascending=False).iloc[0]
            stage_durations_map[cid] = (str(max_row[act_col]), float(max_row["_duration_hours"]))

        durations_arr = np.array(list(case_durations.values()))
        if len(durations_arr) == 0:
            return []

        median_dur = float(np.median(durations_arr))
        p75 = float(np.percentile(durations_arr, 75))
        p25 = float(np.percentile(durations_arr, 25))
        iqr = max(1.0, p75 - p25)
        outlier_upper = p75 + 1.5 * iqr

        anomaly_cases: List[AnomalyCase] = []

        for cid, dur_h in case_durations.items():
            longest_stage, stage_dur = stage_durations_map.get(cid, ("Processing", dur_h))
            rework_cnt = case_reworks.get(cid, 0)
            dept = case_depts.get(cid, "Operations")

            # Calculate anomaly score (0-100)
            # Factors: duration vs IQR upper bound, rework loops, individual stage spikes
            dur_ratio = dur_h / max(1.0, median_dur)
            score = 0
            reason_parts = []

            if dur_h > outlier_upper:
                score += min(50, int((dur_h / outlier_upper) * 35))
                reason_parts.append(f"Total cycle time ({round(dur_h, 1)}h) is {round(dur_ratio, 1)}x longer than normal median ({round(median_dur, 1)}h).")
            
            if stage_dur > median_dur * 1.5:
                score += min(35, int((stage_dur / (median_dur + 0.1)) * 25))
                reason_parts.append(f"Stage '{longest_stage}' took {round(stage_dur, 1)}h (unusually long).")

            if rework_cnt > 1:
                score += min(25, rework_cnt * 10)
                reason_parts.append(f"Detected {rework_cnt} rework loops through previous process stages.")

            if score >= 35:
                final_score = min(99, max(40, score))
                if final_score >= 80:
                    severity = "Critical"
                elif final_score >= 60:
                    severity = "High"
                else:
                    severity = "Medium"

                anomaly_cases.append(AnomalyCase(
                    case_id=str(cid),
                    anomaly_score=final_score,
                    severity=severity,
                    duration_hours=round(dur_h, 2),
                    normal_median_hours=round(median_dur, 2),
                    affected_stage=longest_stage,
                    stage_duration_hours=round(stage_dur, 2),
                    rework_count=rework_cnt,
                    department=dept,
                    reason=" ".join(reason_parts) if reason_parts else "Duration deviates significantly from standard distribution.",
                    events_timeline=case_events_map.get(cid, [])
                ))

        anomaly_cases.sort(key=lambda x: x.anomaly_score, reverse=True)
        return anomaly_cases[:max_results]
