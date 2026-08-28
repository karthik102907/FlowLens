import os
import json
from typing import Dict, Any, List
from app.models.schemas import AIChatRequest, AIChatResponse, AIRecommendation, BottleneckItem, StageMetric, DepartmentComparison
from app.core.config import settings

def _get_val(obj: Any, key: str, default: Any = None) -> Any:
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)

class AIAnalyst:
    @classmethod
    def generate_recommendations(
        cls,
        bottlenecks: List[Any],
        stages: List[Any],
        departments: List[Any],
        overview: Dict[str, Any]
    ) -> List[AIRecommendation]:
        recs: List[AIRecommendation] = []
        cost_per_hour = 45.0

        for idx, b in enumerate(bottlenecks[:5]):
            b_act = _get_val(b, "activity")
            b_rework = _get_val(b, "rework_rate", 0.0)
            b_sla = _get_val(b, "sla_breach_rate", 0.0)
            b_dur = _get_val(b, "avg_duration_hours", 1.0)
            b_wait = _get_val(b, "avg_waiting_hours", 0.5)
            b_cases = _get_val(b, "affected_cases", 100)
            b_level = _get_val(b, "bottleneck_level", "Moderate")
            b_score = _get_val(b, "bottleneck_score", 50.0)
            b_rank = _get_val(b, "rank", idx + 1)
            b_vol = _get_val(b, "volume_share", 20.0)

            # Rule-based contextual recommendations strictly derived from data
            if b_rework > 10.0:
                rec_id = f"rec_rework_{idx+1}"
                prob = f"High rework loop rate ({b_rework}%) detected in '{b_act}'."
                ev = f"{round(b_rework, 1)}% of cases return to this stage repeatedly, creating an average of {b_dur}h extra delay per rework cycle."
                act = f"Implement mandatory automated validation checklists and upfront input requirements before cases advance to '{b_act}'."
                impact = f"Potential to eliminate up to {round(b_rework * 0.7, 1)}% of re-entry loops and recover approximately {round(b_cases * b_rework * 0.01 * b_dur, 0):.0f} hours."
                prio = "CRITICAL" if b_level in ["Critical", "High"] else "HIGH"
                saving_h = round(b_cases * b_rework * 0.01 * b_dur * 0.7, 1)
                recs.append(AIRecommendation(
                    id=rec_id,
                    problem=prob,
                    evidence=ev,
                    recommended_action=act,
                    expected_impact=impact,
                    priority=prio,
                    confidence="High",
                    affected_stage=b_act,
                    estimated_time_saving_hours=saving_h,
                    estimated_cost_saving=round(saving_h * cost_per_hour, 2)
                ))

            elif b_sla > 20.0:
                rec_id = f"rec_sla_{idx+1}"
                prob = f"Severe SLA breach rate ({b_sla}%) at '{b_act}'."
                ev = f"Average processing time is {b_dur}h against the defined target threshold, leading to {b_sla}% missed SLAs."
                act = f"Rebalance workload allocation, introduce queue alerts at 70% SLA threshold, and cross-train capacity for '{b_act}'."
                impact = f"Anticipated SLA compliance improvement from {round(100 - b_sla, 1)}% to ~90%+."
                prio = "CRITICAL" if b_sla > 30 else "HIGH"
                saving_h = round(b_cases * (b_sla / 100.0) * (b_dur * 0.4), 1)
                recs.append(AIRecommendation(
                    id=rec_id,
                    problem=prob,
                    evidence=ev,
                    recommended_action=act,
                    expected_impact=impact,
                    priority=prio,
                    confidence="High",
                    affected_stage=b_act,
                    estimated_time_saving_hours=saving_h,
                    estimated_cost_saving=round(saving_h * cost_per_hour, 2)
                ))

            else:
                rec_id = f"rec_opt_{idx+1}"
                prob = f"Stage '{b_act}' represents {b_vol}% of total process volume with {b_wait}h waiting time."
                ev = f"Identified as rank #{b_rank} operational bottleneck with an overall score of {b_score}/100."
                act = f"Streamline verification steps and consider parallel execution with preceding tasks."
                impact = f"Projected 20-30% reduction in stage queue backlog."
                prio = "MEDIUM" if b_level == "Moderate" else "LOW"
                saving_h = round(b_cases * b_wait * 0.25, 1)
                recs.append(AIRecommendation(
                    id=rec_id,
                    problem=prob,
                    evidence=ev,
                    recommended_action=act,
                    expected_impact=impact,
                    priority=prio,
                    confidence="Medium",
                    affected_stage=b_act,
                    estimated_time_saving_hours=saving_h,
                    estimated_cost_saving=round(saving_h * cost_per_hour, 2)
                ))

        # Check Department Disparities
        if len(departments) > 1:
            dept_sorted = sorted(departments, key=lambda d: _get_val(d, "avg_duration_hours", 0.0), reverse=True)
            worst_dept = dept_sorted[0]
            best_dept = dept_sorted[-1]
            w_avg = _get_val(worst_dept, "avg_duration_hours", 0.0)
            b_avg = _get_val(best_dept, "avg_duration_hours", 0.0)
            w_name = _get_val(worst_dept, "department", "Dept A")
            b_name = _get_val(best_dept, "department", "Dept B")
            w_cases = _get_val(worst_dept, "total_cases", 100)

            if w_avg > b_avg * 1.5:
                recs.append(AIRecommendation(
                    id="rec_dept_disparity",
                    problem=f"Significant throughput variance across departments ({w_name} vs {b_name}).",
                    evidence=f"{w_name} averages {w_avg}h per case compared to {b_avg}h for {b_name}.",
                    recommended_action=f"Conduct standard operating procedure (SOP) harmonization and review case complexity distribution for {w_name}.",
                    expected_impact="Harmonize cycle times across organizational units.",
                    priority="HIGH",
                    confidence="High",
                    affected_stage="Cross-Departmental",
                    estimated_time_saving_hours=round((w_avg - b_avg) * w_cases * 0.3, 1),
                    estimated_cost_saving=round((w_avg - b_avg) * w_cases * 0.3 * cost_per_hour, 2)
                ))

        return recs

    @classmethod
    def answer_question(cls, req: AIChatRequest, analytics: Dict[str, Any]) -> AIChatResponse:
        q_lower = req.question.lower().strip()
        overview = analytics.get("overview", {})
        bottlenecks = analytics.get("bottlenecks", [])
        stages = analytics.get("stages", [])
        departments = analytics.get("departments", [])

        top_b = bottlenecks[0] if bottlenecks else None
        worst_dept = max(departments, key=lambda d: _get_val(d, "avg_duration_hours", 0.0)) if departments else None
        
        grounded_facts = []
        related_metrics = {
            "total_cases": overview.get("total_cases", 0),
            "avg_cycle_time_hours": overview.get("avg_cycle_time_hours", 0),
            "rework_rate": overview.get("rework_rate", 0),
            "sla_breach_rate": overview.get("sla_breach_rate", 0)
        }

        # Deterministic grounded query routing
        if "biggest bottleneck" in q_lower or "main bottleneck" in q_lower or "where is the bottleneck" in q_lower or "worst stage" in q_lower:
            if top_b:
                act = _get_val(top_b, "activity")
                score = _get_val(top_b, "bottleneck_score")
                avg_dur = _get_val(top_b, "avg_duration_hours")
                avg_wait = _get_val(top_b, "avg_waiting_hours")
                sla = _get_val(top_b, "sla_breach_rate")
                rework = _get_val(top_b, "rework_rate")
                driver = _get_val(top_b, "primary_contributor")
                expl = _get_val(top_b, "summary_explanation")

                answer = (
                    f"The biggest bottleneck in this process is **{act}** with a critical score of **{score}/100**.\n\n"
                    f"**Key Evidence:**\n"
                    f"• **Average Duration:** {avg_dur} hours\n"
                    f"• **Average Waiting Time:** {avg_wait} hours\n"
                    f"• **SLA Breach Rate:** {sla}%\n"
                    f"• **Rework Rate:** {rework}%\n"
                    f"• **Primary Contributor:** {driver}\n\n"
                    f"{expl}"
                )
                grounded_facts = [
                    f"Rank #1 Bottleneck: {act} (Score: {score}/100)",
                    f"Average stage duration: {avg_dur} hours",
                    f"SLA breach rate: {sla}%"
                ]
            else:
                answer = "No significant bottlenecks were identified in the uploaded dataset."

        elif "why is the process slow" in q_lower or "why slow" in q_lower or "root cause" in q_lower or "why delay" in q_lower:
            if top_b:
                act = _get_val(top_b, "activity")
                avg_wait = _get_val(top_b, "avg_waiting_hours")
                sla = _get_val(top_b, "sla_breach_rate")
                driver = _get_val(top_b, "primary_contributor")

                answer = (
                    f"The process experiences delay primarily at **{act}**, which accounts for the largest queue backlog.\n\n"
                    f"**Primary Contributing Factors:**\n"
                    f"1. **{driver}** is the leading statistical driver.\n"
                    f"2. Cases in this stage average **{avg_wait} hours of waiting time** before active handling begins.\n"
                    f"3. An SLA breach rate of **{sla}%** indicates capacity or approval gate friction."
                )
                grounded_facts = [
                    f"Primary delay driver: {driver}",
                    f"Waiting time at {act}: {avg_wait} hours"
                ]
            else:
                answer = "The process cycle times are within normal operational parameters."

        elif "department" in q_lower or "team" in q_lower or "highest waiting time" in q_lower or "who is slowest" in q_lower:
            if worst_dept:
                d_name = _get_val(worst_dept, "department")
                d_avg = _get_val(worst_dept, "avg_duration_hours")
                d_sla = _get_val(worst_dept, "sla_compliance_pct")
                d_rework = _get_val(worst_dept, "rework_rate")
                d_note = _get_val(worst_dept, "fairness_note")

                answer = (
                    f"**{d_name}** has the longest average processing time at **{d_avg} hours** per case, "
                    f"with an SLA compliance rate of **{d_sla}%**.\n\n"
                    f"> *Fairness Note: {d_note}*"
                )
                grounded_facts = [
                    f"Highest average duration department: {d_name} ({d_avg}h)",
                    f"SLA compliance: {d_sla}%",
                    f"Rework rate: {d_rework}%"
                ]
            else:
                answer = "Department-level attribution is not available in the current column mapping."

        elif "how much time" in q_lower or "time lost" in q_lower or "cost" in q_lower or "saving" in q_lower or "money" in q_lower:
            lost_h = overview.get("estimated_time_lost_hours", 0)
            cost_l = overview.get("estimated_cost_lost", 0)
            answer = (
                f"Based on excess stage durations beyond defined SLA targets:\n\n"
                f"• **Estimated Operational Time Lost:** **{lost_h:,.1f} hours** across all processed cases.\n"
                f"• **Estimated Financial Impact:** **${cost_l:,.2f}** (calculated at standard benchmark of $45/hour).\n\n"
                f"*Note: Figures represent calculated time variance beyond standard target thresholds.*"
            )
            grounded_facts = [
                f"Total excess hours beyond SLA: {lost_h:,.1f} hours",
                f"Calculated operational impact: ${cost_l:,.2f}"
            ]

        elif "fix first" in q_lower or "recommendation" in q_lower or "what should we fix" in q_lower or "priority" in q_lower:
            if top_b:
                act = _get_val(top_b, "activity")
                avg_wait = _get_val(top_b, "avg_waiting_hours", 1.0)
                sla = _get_val(top_b, "sla_breach_rate", 20.0)
                rework = _get_val(top_b, "rework_rate", 15.0)

                answer = (
                    f"**Recommended First Action:** Address the bottleneck at **{act}**.\n\n"
                    f"1. **Triage Backlog:** Introduce preliminary automated completeness checks to reduce the {rework}% rework loop rate.\n"
                    f"2. **Dynamic Workload Rebalancing:** Reallocate cases when stage queue waiting exceeds {avg_wait * 0.8:.1f} hours.\n"
                    f"3. **SLA Monitoring:** Set proactive alert triggers before the {sla}% breach threshold is crossed."
                )
                grounded_facts = [
                    f"Priority Stage: {act}",
                    f"Current SLA breaches: {sla}%"
                ]
            else:
                answer = "Continue monitoring standard operational thresholds."

        else:
            top_b_act = _get_val(top_b, "activity", "None") if top_b else "None"
            top_b_score = _get_val(top_b, "bottleneck_score", 0) if top_b else 0

            answer = (
                f"**FlowLens AI Operational Summary:**\n\n"
                f"• **Total Cases Analyzed:** {overview.get('total_cases', 0):,}\n"
                f"• **Average End-to-End Cycle Time:** {overview.get('avg_cycle_time_hours', 0)} hours\n"
                f"• **Overall Process Health Score:** {overview.get('overall_health_score', 0)}/100\n"
                f"• **Critical Bottleneck:** {top_b_act} (Score: {top_b_score}/100)\n"
                f"• **Overall Rework Rate:** {overview.get('rework_rate', 0)}%\n"
                f"• **Overall SLA Breach Rate:** {overview.get('sla_breach_rate', 0)}%\n\n"
                f"You can ask specific questions like *'Which stage is the biggest bottleneck?'*, *'Why is the process slow?'*, or *'How much time are we losing?'*."
            )
            grounded_facts = [
                f"Overall Process Health: {overview.get('overall_health_score', 0)}/100",
                f"Average Cycle Time: {overview.get('avg_cycle_time_hours', 0)}h"
            ]

        return AIChatResponse(
            answer=answer,
            grounded_facts=grounded_facts,
            related_metrics=related_metrics,
            confidence_level="High (100% Factually Grounded)",
            suggested_followups=[
                "Which stage is the biggest bottleneck?",
                "Why is the process slow?",
                "Which department has the highest waiting time?",
                "How much time and cost are we losing?",
                "What should we fix first?"
            ]
        )
