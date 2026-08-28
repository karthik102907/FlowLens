import numpy as np
from typing import List, Dict, Any
from app.models.schemas import StageMetric, BottleneckItem, BottleneckScoreWeights

class BottleneckEngine:
    @classmethod
    def calculate_bottleneck_scores(
        cls,
        stages: List[StageMetric],
        weights: BottleneckScoreWeights = BottleneckScoreWeights()
    ) -> List[BottleneckItem]:
        if not stages:
            return []

        # Find max values across stages for normalization
        max_duration = max(s.avg_duration_hours for s in stages) or 1.0
        max_waiting = max(s.avg_waiting_hours for s in stages) or 1.0
        max_volume = max(s.total_cases for s in stages) or 1.0
        max_rework = max(s.rework_rate for s in stages) or 1.0
        max_sla = max(s.sla_breach_rate for s in stages) or 1.0
        max_var = max(s.std_duration_hours for s in stages) or 1.0

        bottleneck_items: List[BottleneckItem] = []

        for s in stages:
            # Sub-scores scaled 0-100
            duration_score = min(100.0, (s.avg_duration_hours / max_duration) * 100.0)
            waiting_score = min(100.0, (s.avg_waiting_hours / max_waiting) * 100.0)
            volume_score = min(100.0, (s.total_cases / max_volume) * 100.0)
            rework_score = min(100.0, (s.rework_rate / max(1.0, max_rework)) * 100.0) if s.rework_rate > 0 else 5.0
            sla_score = min(100.0, (s.sla_breach_rate / max(1.0, max_sla)) * 100.0) if s.sla_breach_rate > 0 else 5.0
            var_score = min(100.0, (s.std_duration_hours / max_var) * 100.0)

            # Weighted combined score
            raw_score = (
                weights.duration_weight * duration_score +
                weights.waiting_weight * waiting_score +
                weights.volume_weight * volume_score +
                weights.rework_weight * rework_score +
                weights.sla_weight * sla_score +
                weights.variability_weight * var_score
            )
            score = round(min(100.0, max(0.0, raw_score)), 1)

            # Classification
            if score <= 20:
                level = "Healthy"
            elif score <= 40:
                level = "Low"
            elif score <= 60:
                level = "Moderate"
            elif score <= 80:
                level = "High"
            else:
                level = "Critical"

            # Primary contributor identification
            sub_components = {
                "Duration Delays": duration_score * weights.duration_weight,
                "Queue Waiting Backlog": waiting_score * weights.waiting_weight,
                "High Process Volume": volume_score * weights.volume_weight,
                "Rework & Return Loops": rework_score * weights.rework_weight,
                "SLA Target Breaches": sla_score * weights.sla_weight,
                "High Variance & Instability": var_score * weights.variability_weight
            }
            primary_contributor = max(sub_components, key=sub_components.get)

            # Plain language summary
            summary = (
                f"Stage '{s.activity}' exhibits a {level.lower()} bottleneck score ({score}/100). "
                f"Primary driver is {primary_contributor.lower()} with an average duration of {s.avg_duration_hours}h "
                f"and {s.sla_breach_rate}% SLA breach rate."
            )

            # Mutate stage object with score for consistency
            s.bottleneck_score = score
            s.bottleneck_level = level

            bottleneck_items.append(BottleneckItem(
                rank=0,  # will be assigned after sorting
                activity=s.activity,
                bottleneck_score=score,
                bottleneck_level=level,
                avg_duration_hours=s.avg_duration_hours,
                avg_waiting_hours=s.avg_waiting_hours,
                rework_rate=s.rework_rate,
                sla_breach_rate=s.sla_breach_rate,
                variability_score=round(var_score, 1),
                volume_share=round((s.total_cases / max_volume) * 100, 1),
                affected_cases=s.total_cases,
                primary_contributor=primary_contributor,
                summary_explanation=summary
            ))

        # Sort descending by bottleneck score and assign ranks
        bottleneck_items.sort(key=lambda x: x.bottleneck_score, reverse=True)
        for idx, item in enumerate(bottleneck_items):
            item.rank = idx + 1

        return bottleneck_items
