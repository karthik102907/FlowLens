import unittest
import sys
import os
import json
import io
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from app.services.data_engine import DataEngine
from app.services.process_engine import ProcessEngine
from app.services.bottleneck_engine import BottleneckEngine
from app.services.root_cause_engine import RootCauseEngine
from app.services.anomaly_engine import AnomalyEngine
from app.services.ml_engine import MLEngine
from app.services.simulation_engine import SimulationEngine
from app.services.ai_analyst import AIAnalyst
from app.services.demo_generator import DemoGenerator
from app.services.analytics_pipeline import AnalyticsPipeline
from app.models.schemas import BottleneckScoreWeights, SimulationScenario, AIChatRequest

class TestFlowLensEngineExpanded(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Generate realistic demo dataset (250 cases, >1500 events)
        cls.df = DemoGenerator.generate_loan_processing(250)
        cls.mapping = DataEngine.auto_map_columns(list(cls.df.columns))
        cls.clean_df, cls.quality = DataEngine.inspect_and_clean(cls.df, cls.mapping, auto_fix=True)
        cls.proc_data = ProcessEngine.reconstruct_process(cls.clean_df, cls.mapping)

    def test_01_data_engine_mapping_and_quality(self):
        self.assertIn("case_id", self.mapping)
        self.assertIn("activity", self.mapping)
        self.assertIn("timestamp", self.mapping)
        self.assertGreaterEqual(self.quality.score, 80)
        self.assertEqual(self.quality.total_rows, len(self.df))
        self.assertEqual(self.quality.cleaned_rows, len(self.clean_df))

    def test_02_json_and_csv_serialization(self):
        csv_str = self.df.to_csv(index=False)
        parsed_csv_df = pd.read_csv(io.StringIO(csv_str))
        self.assertEqual(len(parsed_csv_df), len(self.df))

        json_str = self.df.to_json(orient="records")
        parsed_json_df = pd.read_json(io.StringIO(json_str))
        self.assertEqual(len(parsed_json_df), len(self.df))

    def test_03_process_journey_reconstruction(self):
        res = self.proc_data
        self.assertGreater(res["total_cases"], 0)
        self.assertGreater(res["avg_cycle_time_hours"], 0)
        self.assertGreater(len(res["stages"]), 2)
        self.assertGreater(len(res["transitions"]), 2)
        
        for t in res["transitions"]:
            self.assertGreaterEqual(t.avg_waiting_hours, 0)
            self.assertGreaterEqual(t.p95_waiting_hours, t.avg_waiting_hours * 0.5)

    def test_04_bottleneck_weighted_scoring(self):
        stages = self.proc_data["stages"]
        weights = BottleneckScoreWeights(
            duration_weight=0.25,
            waiting_weight=0.20,
            volume_weight=0.15,
            rework_weight=0.15,
            sla_weight=0.15,
            variability_weight=0.10
        )
        bottlenecks = BottleneckEngine.calculate_bottleneck_scores(stages, weights)
        self.assertGreater(len(bottlenecks), 0)
        
        top = bottlenecks[0]
        self.assertGreaterEqual(top.bottleneck_score, bottlenecks[-1].bottleneck_score)
        self.assertIn(top.bottleneck_level, ["Critical", "High", "Moderate", "Low", "Healthy"])
        self.assertTrue(len(top.summary_explanation) > 10)

    def test_05_statistical_root_causes(self):
        stages = self.proc_data["stages"]
        work_df = self.proc_data["work_df"]
        bottlenecks = BottleneckEngine.calculate_bottleneck_scores(stages)
        root_causes = RootCauseEngine.analyze_root_causes(work_df, self.mapping, bottlenecks)
        self.assertGreater(len(root_causes), 0)
        self.assertLessEqual(len(root_causes), len(bottlenecks))
        for rc in root_causes:
            self.assertTrue(len(rc.plain_language_explanation) > 0)
            for factor in rc.primary_factors:
                self.assertGreaterEqual(factor.delay_multiplier, 0.5)
                self.assertIn(factor.category, ["Department", "Priority", "Category", "DayOfWeek"])

    def test_06_multimodal_anomaly_detection(self):
        work_df = self.proc_data["work_df"]
        anomalies = AnomalyEngine.detect_anomalies(work_df, self.mapping)
        self.assertIsInstance(anomalies, list)
        for a in anomalies:
            self.assertIn(a.severity, ["Critical", "High", "Medium", "Low"])
            self.assertGreater(len(a.events_timeline), 0)
            self.assertTrue(len(a.reason) > 5)

    def test_07_machine_learning_delay_prediction(self):
        work_df = self.proc_data["work_df"]
        stats, predictions = MLEngine.train_and_predict(work_df, self.mapping)
        self.assertIsNotNone(stats)
        self.assertGreaterEqual(stats.accuracy, 0.5)
        self.assertGreater(len(stats.feature_importances), 0)
        self.assertGreater(len(predictions), 0)
        for p in predictions[:5]:
            self.assertIn(p.risk_level, ["CRITICAL", "HIGH", "MEDIUM", "LOW"])
            self.assertGreaterEqual(p.predicted_delay_risk_pct, 0)
            self.assertLessEqual(p.predicted_delay_risk_pct, 100)

    def test_08_insufficient_small_dataset_handling(self):
        # Test edge case with only 5 cases
        small_df = self.df[self.df["case_id"].isin(list(self.df["case_id"].unique())[:5])].copy()
        small_clean_df, small_q = DataEngine.inspect_and_clean(small_df, self.mapping, auto_fix=True)
        small_proc = ProcessEngine.reconstruct_process(small_clean_df, self.mapping)
        self.assertEqual(small_proc["total_cases"], 5)
        
        # Pipeline must execute cleanly without throwing unhandled exceptions
        small_analytics = AnalyticsPipeline.execute_full_pipeline("small_ds", small_clean_df, self.mapping)
        self.assertIn("overview", small_analytics)
        self.assertIn("bottlenecks", small_analytics)

    def test_09_what_if_simulation_engine(self):
        scenario = SimulationScenario(
            dataset_id="test_ds",
            stage_adjustments={self.proc_data["stages"][0].activity: 0.7},
            staffing_increase_pct=20,
            sla_target_change_pct=0,
            rework_reduction_pct=30
        )
        result = SimulationEngine.run_simulation(self.proc_data, scenario)
        self.assertLessEqual(result.projected_cycle_time_hours, result.baseline_cycle_time_hours)
        self.assertGreaterEqual(result.cycle_time_reduction_pct, 0.0)
        self.assertTrue(result.is_simulation_estimate)

    def test_10_grounded_ai_analyst(self):
        analytics = AnalyticsPipeline.execute_full_pipeline("test_ds", self.clean_df, self.mapping)
        req = AIChatRequest(dataset_id="test_ds", question="Which stage is the biggest bottleneck?")
        res = AIAnalyst.answer_question(req, analytics)
        self.assertIn("bottleneck", res.answer.lower())
        self.assertGreater(len(res.grounded_facts), 0)
        self.assertEqual(len(res.suggested_followups), 5)

    def test_11_ai_analyst_unsupported_questions(self):
        analytics = AnalyticsPipeline.execute_full_pipeline("test_ds", self.clean_df, self.mapping)
        req = AIChatRequest(dataset_id="test_ds", question="What is the weather in Paris?")
        res = AIAnalyst.answer_question(req, analytics)
        # Should gracefully pivot to process facts rather than hallucinating
        self.assertTrue(len(res.answer) > 0)
        self.assertGreater(len(res.grounded_facts), 0)

    def test_12_prescriptive_recommendations(self):
        analytics = AnalyticsPipeline.execute_full_pipeline("test_ds", self.clean_df, self.mapping)
        recs = analytics["recommendations"]
        self.assertGreater(len(recs), 0)
        for r in recs:
            prob = r.get("problem") if isinstance(r, dict) else r.problem
            ev = r.get("evidence") if isinstance(r, dict) else r.evidence
            prio = r.get("priority") if isinstance(r, dict) else r.priority
            self.assertTrue(len(prob) > 0)
            self.assertTrue(len(ev) > 0)
            self.assertIn(prio, ["CRITICAL", "HIGH", "MEDIUM", "LOW"])

if __name__ == "__main__":
    unittest.main()
