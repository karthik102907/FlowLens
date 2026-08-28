import pandas as pd
import numpy as np
from typing import Dict, Any, List
from app.models.schemas import StageRootCause, RootCauseFactor, BottleneckItem

class RootCauseEngine:
    @classmethod
    def analyze_root_causes(
        cls,
        work_df: pd.DataFrame,
        mapping: Dict[str, str],
        bottlenecks: List[BottleneckItem]
    ) -> List[StageRootCause]:
        results: List[StageRootCause] = []

        case_col = mapping.get("case_id", "case_id")
        act_col = mapping.get("activity", "activity")
        time_col = mapping.get("timestamp", "timestamp")
        dept_col = mapping.get("department")
        emp_col = mapping.get("employee")
        prio_col = mapping.get("priority")
        cat_col = mapping.get("category")

        # Top bottlenecks to analyze
        top_bottlenecks = [b for b in bottlenecks if b.bottleneck_score >= 30.0] or bottlenecks[:3]

        for b in top_bottlenecks:
            stage_act = b.activity
            stage_df = work_df[work_df[act_col] == stage_act].copy()
            if len(stage_df) < 5:
                continue

            baseline_avg_duration = float(stage_df["_duration_hours"].mean()) if stage_df["_duration_hours"].mean() > 0 else 1.0
            factors: List[RootCauseFactor] = []

            # 1. Department Correlation
            if dept_col and dept_col in stage_df.columns:
                dept_stats = stage_df.groupby(dept_col)["_duration_hours"].agg(["mean", "count"]).reset_index()
                dept_stats = dept_stats[dept_stats["count"] >= 3]
                if not dept_stats.empty:
                    slowest_dept = dept_stats.sort_values(by="mean", ascending=False).iloc[0]
                    dept_mean = float(slowest_dept["mean"])
                    dept_name = str(slowest_dept[dept_col])
                    dept_count = int(slowest_dept["count"])
                    multiplier = round(dept_mean / max(0.1, baseline_avg_duration), 1)

                    if multiplier > 1.25:
                        conf = min(95, max(65, int(60 + min(30, dept_count * 0.5))))
                        wording = f"Cases handled by department '{dept_name}' are strongly associated with {multiplier}x longer processing time than the baseline average."
                        factors.append(RootCauseFactor(
                            category="Department",
                            factor_name=f"Department: {dept_name}",
                            delay_multiplier=multiplier,
                            avg_duration_hours=round(dept_mean, 2),
                            baseline_duration_hours=round(baseline_avg_duration, 2),
                            affected_case_count=dept_count,
                            confidence_pct=conf,
                            wording=wording
                        ))

            # 2. Priority Correlation
            if prio_col and prio_col in stage_df.columns:
                prio_stats = stage_df.groupby(prio_col)["_duration_hours"].agg(["mean", "count"]).reset_index()
                prio_stats = prio_stats[prio_stats["count"] >= 3]
                if not prio_stats.empty:
                    slowest_prio = prio_stats.sort_values(by="mean", ascending=False).iloc[0]
                    prio_mean = float(slowest_prio["mean"])
                    prio_name = str(slowest_prio[prio_col])
                    prio_count = int(slowest_prio["count"])
                    multiplier = round(prio_mean / max(0.1, baseline_avg_duration), 1)

                    if multiplier > 1.2:
                        conf = min(92, max(60, int(55 + min(30, prio_count * 0.4))))
                        wording = f"Cases with '{prio_name}' priority show a potential correlation with {multiplier}x increased delay in this stage."
                        factors.append(RootCauseFactor(
                            category="Priority",
                            factor_name=f"Priority Level: {prio_name}",
                            delay_multiplier=multiplier,
                            avg_duration_hours=round(prio_mean, 2),
                            baseline_duration_hours=round(baseline_avg_duration, 2),
                            affected_case_count=prio_count,
                            confidence_pct=conf,
                            wording=wording
                        ))

            # 3. Category / Case Type Correlation
            if cat_col and cat_col in stage_df.columns:
                cat_stats = stage_df.groupby(cat_col)["_duration_hours"].agg(["mean", "count"]).reset_index()
                cat_stats = cat_stats[cat_stats["count"] >= 3]
                if not cat_stats.empty:
                    slowest_cat = cat_stats.sort_values(by="mean", ascending=False).iloc[0]
                    cat_mean = float(slowest_cat["mean"])
                    cat_name = str(slowest_cat[cat_col])
                    cat_count = int(slowest_cat["count"])
                    multiplier = round(cat_mean / max(0.1, baseline_avg_duration), 1)

                    if multiplier > 1.2:
                        conf = min(90, max(58, int(50 + min(30, cat_count * 0.4))))
                        wording = f"Process instances in category '{cat_name}' are a likely contributor to stage duration spikes ({multiplier}x above average)."
                        factors.append(RootCauseFactor(
                            category="Category",
                            factor_name=f"Category: {cat_name}",
                            delay_multiplier=multiplier,
                            avg_duration_hours=round(cat_mean, 2),
                            baseline_duration_hours=round(baseline_avg_duration, 2),
                            affected_case_count=cat_count,
                            confidence_pct=conf,
                            wording=wording
                        ))

            # 4. Day of Week / Temporal Effect
            if "_dt" in stage_df.columns:
                stage_df["_dow"] = stage_df["_dt"].dt.day_name()
                dow_stats = stage_df.groupby("_dow")["_duration_hours"].agg(["mean", "count"]).reset_index()
                if not dow_stats.empty:
                    slowest_dow = dow_stats.sort_values(by="mean", ascending=False).iloc[0]
                    dow_mean = float(slowest_dow["mean"])
                    dow_name = str(slowest_dow["_dow"])
                    dow_count = int(slowest_dow["count"])
                    multiplier = round(dow_mean / max(0.1, baseline_avg_duration), 1)

                    if multiplier > 1.3:
                        conf = min(88, max(55, int(50 + min(30, dow_count * 0.3))))
                        wording = f"Work initiated on {dow_name} is correlated with a {multiplier}x increase in waiting queues over other weekdays."
                        factors.append(RootCauseFactor(
                            category="TimeOfDay",
                            factor_name=f"Day of Week: {dow_name}",
                            delay_multiplier=multiplier,
                            avg_duration_hours=round(dow_mean, 2),
                            baseline_duration_hours=round(baseline_avg_duration, 2),
                            affected_case_count=dow_count,
                            confidence_pct=conf,
                            wording=wording
                        ))

            # Plain language explanation
            if factors:
                top_factor = max(factors, key=lambda f: f.delay_multiplier)
                explanation = (
                    f"Statistical analysis of stage '{stage_act}' reveals that the primary correlated driver of delays is {top_factor.factor_name.lower()}, "
                    f"showing an observed {top_factor.delay_multiplier}x higher duration ({top_factor.avg_duration_hours}h vs {top_factor.baseline_duration_hours}h baseline). "
                    f"Note: These indicators represent statistical correlation and operational associations."
                )
            else:
                explanation = (
                    f"Delays in '{stage_act}' appear evenly distributed across departments and priorities without isolated categorical outliers."
                )

            results.append(StageRootCause(
                activity=stage_act,
                bottleneck_score=b.bottleneck_score,
                primary_factors=factors,
                plain_language_explanation=explanation,
                data_quality_warning=None
            ))

        return results
