export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'Administrator' | 'Process Analyst' | 'Manager' | 'Viewer';
  organization_id: string;
  created_at: string;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  organization_id: string;
  uploaded_at: string;
  row_count: number;
  case_count: number;
  activity_count: number;
  department_count: number;
  columns: string[];
  column_mapping: Record<string, string>;
  quality_score: number;
  is_demo: boolean;
  process_type: string;
}

export interface DataQualityCheck {
  score: number;
  total_rows: number;
  total_cases: number;
  missing_values: Record<string, number>;
  duplicate_rows: number;
  invalid_timestamps: number;
  missing_case_ids: number;
  missing_activities: number;
  out_of_order_events: number;
  extreme_durations: number;
  issues: string[];
  auto_fix_applied: boolean;
  cleaned_rows: number;
}

export interface DataCleaningOptions {
  remove_duplicates: boolean;
  remove_missing_identifiers: boolean;
  standardize_timestamps: boolean;
  normalize_text: boolean;
  fill_missing_departments: boolean;
  sort_chronological: boolean;
}

export interface DataCleaningResult {
  before_rows: number;
  after_rows: number;
  dropped_duplicates: number;
  dropped_missing: number;
  fixed_timestamps: number;
  normalized_fields: number;
  quality_score_before: number;
  quality_score_after: number;
  quality_report: DataQualityCheck;
}

export interface AnalysisHistoryItem {
  id: string;
  dataset_id: string;
  dataset_name: string;
  created_at: string;
  total_cases: number;
  total_events: number;
  avg_cycle_time_hours: number;
  overall_health_score: number;
  bottleneck_score: number;
  top_bottleneck: string;
  status: string;
}

export interface StageMetric {
  activity: string;
  total_cases: number;
  total_events: number;
  avg_duration_hours: number;
  median_duration_hours: number;
  p90_duration_hours: number;
  p95_duration_hours: number;
  min_duration_hours: number;
  max_duration_hours: number;
  std_duration_hours: number;
  avg_waiting_hours: number;
  rework_rate: number;
  rework_count: number;
  sla_hours: number;
  sla_breach_rate: number;
  sla_breaches: number;
  anomaly_rate: number;
  dominant_department?: string;
  bottleneck_score: number;
  bottleneck_level: 'Healthy' | 'Low' | 'Moderate' | 'High' | 'Critical';
}

export interface TransitionMetric {
  source: string;
  target: string;
  count: number;
  avg_waiting_hours: number;
  median_waiting_hours: number;
  min_waiting_hours: number;
  max_waiting_hours: number;
  p95_waiting_hours: number;
  rework_count: number;
}

export interface ProcessOverview {
  dataset_id: string;
  total_cases: number;
  total_events: number;
  avg_cycle_time_hours: number;
  median_cycle_time_hours: number;
  p95_cycle_time_hours: number;
  overall_health_score: number;
  bottleneck_score: number;
  rework_rate: number;
  sla_breach_rate: number;
  anomaly_rate: number;
  estimated_time_lost_hours: number;
  estimated_cost_lost?: number;
  stages: StageMetric[];
  transitions: TransitionMetric[];
  start_activities: { activity: string; count: number; percentage: number }[];
  end_activities: { activity: string; count: number; percentage: number }[];
  daily_volume: { date: string; cases: number }[];
  daily_delays: { date: string; avg_delay_hours: number }[];
}

export interface BottleneckItem {
  rank: number;
  activity: string;
  bottleneck_score: number;
  bottleneck_level: 'Healthy' | 'Low' | 'Moderate' | 'High' | 'Critical';
  avg_duration_hours: number;
  avg_waiting_hours: number;
  rework_rate: number;
  sla_breach_rate: number;
  variability_score: number;
  volume_share: number;
  affected_cases: number;
  primary_contributor: string;
  summary_explanation: string;
}

export interface RootCauseFactor {
  category: string;
  factor_name: string;
  delay_multiplier: number;
  avg_duration_hours: number;
  baseline_duration_hours: number;
  affected_case_count: number;
  confidence_pct: number;
  wording: string;
}

export interface StageRootCause {
  activity: string;
  bottleneck_score: number;
  primary_factors: RootCauseFactor[];
  plain_language_explanation: string;
  data_quality_warning?: string;
}

export interface AnomalyCase {
  case_id: string;
  anomaly_score: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  duration_hours: number;
  normal_median_hours: number;
  affected_stage: string;
  stage_duration_hours: number;
  rework_count: number;
  department: string;
  reason: string;
  events_timeline: { activity: string; timestamp: string; duration_hours: number; department: string }[];
}

export interface DepartmentComparison {
  department: string;
  total_cases: number;
  total_events: number;
  avg_duration_hours: number;
  median_duration_hours: number;
  sla_compliance_pct: number;
  rework_rate: number;
  anomaly_count: number;
  active_bottlenecks: number;
  workload_share_pct: number;
  fairness_note: string;
}

export interface DelayPredictionModelStats {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  feature_importances: { feature: string; importance_pct: number }[];
  total_trained_samples: number;
  training_date: string;
}

export interface CaseDelayPrediction {
  case_id: string;
  current_stage: string;
  elapsed_hours: number;
  predicted_delay_risk_pct: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expected_completion_time: string;
  confidence_range_hours: number;
  contributing_factors: string[];
}

export interface AIRecommendation {
  id: string;
  problem: string;
  evidence: string;
  recommended_action: string;
  expected_impact: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: 'Low' | 'Medium' | 'High';
  affected_stage: string;
  estimated_time_saving_hours?: number;
  estimated_cost_saving?: number;
}

export interface SimulationResult {
  baseline_cycle_time_hours: number;
  projected_cycle_time_hours: number;
  cycle_time_reduction_pct: number;
  baseline_sla_breach_rate: number;
  projected_sla_breach_rate: number;
  baseline_rework_rate: number;
  projected_rework_rate: number;
  estimated_annual_hours_saved: number;
  stage_improvements: {
    activity: string;
    baseline_duration_hours: number;
    projected_duration_hours: number;
    reduction_pct: number;
    baseline_sla_hours: number;
    projected_sla_hours: number;
  }[];
  is_simulation_estimate: boolean;
}

export interface AIChatResponse {
  answer: string;
  grounded_facts: string[];
  related_metrics: Record<string, any>;
  confidence_level: string;
  suggested_followups: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  is_read: boolean;
  related_process?: string;
  related_bottleneck?: string;
}

export interface AnalyticsBundle {
  dataset_id: string;
  overview: ProcessOverview;
  stages: StageMetric[];
  transitions: TransitionMetric[];
  bottlenecks: BottleneckItem[];
  root_causes: StageRootCause[];
  anomalies: AnomalyCase[];
  ml_stats: DelayPredictionModelStats;
  predictions: CaseDelayPrediction[];
  departments: DepartmentComparison[];
  rework_loops: any[];
  recommendations: AIRecommendation[];
}
