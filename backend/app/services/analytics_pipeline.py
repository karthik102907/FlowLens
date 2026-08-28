import pandas as pd
import numpy as np
import uuid
from typing import Dict, Any, List
from app.models.schemas import (
    ProcessOverview, StageMetric, TransitionMetric, BottleneckItem, BottleneckScoreWeights,
    StageRootCause, AnomalyCase, DepartmentComparison, ReworkLoop,
    DelayPredictionModelStats, CaseDelayPrediction, AIRecommendation
)
from app.services.process_engine import ProcessEngine
from app.services.bottleneck_engine import BottleneckEngine
from app.services.root_cause_engine import RootCauseEngine
from app.services.anomaly_engine import AnomalyEngine
from app.services.ml_engine import MLEngine
from app.services.ai_analyst import AIAnalyst

class AnalyticsPipeline:
    @classmethod
    def execute_full_pipeline(
        cls,
        dataset_id: str,
        df: pd.DataFrame,
        mapping: Dict[str, str],
        weights: BottleneckScoreWeights = BottleneckScoreWeights()
    ) -> Dict[str, Any]:
        # 1. Process Mining & Case Journey Reconstruction
        proc_data = ProcessEngine.reconstruct_process(df, mapping)
        stages: List[StageMetric] = proc_data["stages"]
        transitions: List[TransitionMetric] = proc_data["transitions"]
        work_df: pd.DataFrame = proc_data["work_df"]

        # 2. Multi-Factor Bottleneck Scoring & Ranking
        bottlenecks: List[BottleneckItem] = BottleneckEngine.calculate_bottleneck_scores(stages, weights)
        top_bottleneck_score = bottlenecks[0].bottleneck_score if bottlenecks else 0.0

        # 3. Root Cause Correlation Analysis
        root_causes: List[StageRootCause] = RootCauseEngine.analyze_root_causes(work_df, mapping, bottlenecks)

        # 4. Multimodal Anomaly Detection
        anomalies: List[AnomalyCase] = AnomalyEngine.detect_anomalies(work_df, mapping)

        # 5. Machine Learning Delay Risk Prediction
        ml_stats, predictions = MLEngine.train_and_predict(work_df, mapping)

        # 6. Department Analysis & Fairness Check
        dept_col = mapping.get("department")
        dept_comparisons: List[DepartmentComparison] = []
        if dept_col and dept_col in work_df.columns:
            for dept_name, grp in work_df.groupby(dept_col):
                d_cases = grp[mapping.get("case_id", "case_id")].nunique()
                d_events = len(grp)
                pos_durs = grp["_duration_hours"][grp["_duration_hours"] > 0]
                d_avg = float(pos_durs.mean()) if not pos_durs.empty else 1.0
                d_med = float(pos_durs.median()) if not pos_durs.empty else 1.0
                
                # SLA compliance
                d_breaches = int((grp["_duration_hours"] > 24.0).sum())
                d_sla_comp = max(0.0, round(100.0 - (d_breaches / max(1, d_events) * 100.0), 1))

                # Rework
                c_counts = grp[mapping.get("case_id", "case_id")].value_counts()
                d_rework_rate = round(((c_counts > 1).sum() / max(1, d_cases)) * 100, 1)

                # Anomaly count in this department
                d_anom_cnt = sum(1 for a in anomalies if a.department == dept_name)
                
                # Workload share
                workload_pct = round((d_events / max(1, len(work_df))) * 100, 1)

                fairness = (
                    "Longer duration may reflect specialized or multi-tier case escalation complexity."
                    if d_avg > proc_data["avg_cycle_time_hours"] * 0.4 else
                    "Standard processing throughput within baseline operational expectations."
                )

                dept_comparisons.append(DepartmentComparison(
                    department=str(dept_name),
                    total_cases=int(d_cases),
                    total_events=int(d_events),
                    avg_duration_hours=round(d_avg, 2),
                    median_duration_hours=round(d_med, 2),
                    sla_compliance_pct=d_sla_comp,
                    rework_rate=d_rework_rate,
                    anomaly_count=d_anom_cnt,
                    active_bottlenecks=1 if any(b.primary_contributor == dept_name for b in bottlenecks[:2]) else 0,
                    workload_share_pct=workload_pct,
                    fairness_note=fairness
                ))
            dept_comparisons.sort(key=lambda d: d.avg_duration_hours, reverse=True)

        # 7. Rework Loops Analysis
        rework_loops: List[ReworkLoop] = []
        for t in transitions:
            # Check for loops (e.g. A -> B where B precedes A in sequence or is identical)
            if t.source == t.target or any(tr.source == t.target and tr.target == t.source for tr in transitions):
                rework_loops.append(ReworkLoop(
                    source_stage=t.source,
                    target_stage=t.target,
                    occurrences=t.count,
                    rework_rate=round(t.count / max(1, proc_data["total_cases"]) * 100, 1),
                    avg_delay_hours=t.avg_waiting_hours,
                    affected_cases_count=min(t.count, proc_data["total_cases"]),
                    top_departments=[{"name": d.department, "cases": int(d.total_cases * 0.2)} for d in dept_comparisons[:3]]
                ))

        # 8. Create Overview object
        overview = ProcessOverview(
            dataset_id=dataset_id,
            total_cases=proc_data["total_cases"],
            total_events=proc_data["total_events"],
            avg_cycle_time_hours=proc_data["avg_cycle_time_hours"],
            median_cycle_time_hours=proc_data["median_cycle_time_hours"],
            p95_cycle_time_hours=proc_data["p95_cycle_time_hours"],
            overall_health_score=proc_data["overall_health_score"],
            bottleneck_score=top_bottleneck_score,
            rework_rate=proc_data["rework_rate"],
            sla_breach_rate=proc_data["sla_breach_rate"],
            anomaly_rate=proc_data["anomaly_rate"],
            estimated_time_lost_hours=proc_data["estimated_time_lost_hours"],
            estimated_cost_lost=proc_data["estimated_cost_lost"],
            stages=stages,
            transitions=transitions,
            start_activities=proc_data["start_activities"],
            end_activities=proc_data["end_activities"],
            daily_volume=proc_data["daily_volume"],
            daily_delays=proc_data["daily_delays"]
        )

        # 9. Evidence-Based AI Recommendations
        recommendations: List[AIRecommendation] = AIAnalyst.generate_recommendations(
            bottlenecks=bottlenecks,
            stages=stages,
            departments=dept_comparisons,
            overview=overview.dict()
        )

        return {
            "dataset_id": dataset_id,
            "overview": overview.dict(),
            "stages": [s.dict() for s in stages],
            "transitions": [t.dict() for t in transitions],
            "bottlenecks": [b.dict() for b in bottlenecks],
            "root_causes": [rc.dict() for rc in root_causes],
            "anomalies": [a.dict() for a in anomalies],
            "ml_stats": ml_stats.dict(),
            "predictions": [p.dict() for p in predictions],
            "departments": [d.dict() for d in dept_comparisons],
            "rework_loops": [rl.dict() for rl in rework_loops],
            "recommendations": [r.dict() for r in recommendations]
        }
