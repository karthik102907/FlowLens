from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Auth & User
class UserBase(BaseModel):
    email: str
    full_name: str
    role: str = "Process Analyst"  # Administrator, Process Analyst, Manager, Viewer
    organization_id: str = "org_default"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Dataset & Column Mapping
class ColumnMapping(BaseModel):
    case_id: str
    activity: str
    timestamp: str
    department: Optional[str] = None
    employee: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    cost: Optional[str] = None
    sla: Optional[str] = None
    location: Optional[str] = None

class DataQualityCheck(BaseModel):
    score: int  # 0-100
    total_rows: int
    total_cases: int
    missing_values: Dict[str, int]
    duplicate_rows: int
    invalid_timestamps: int
    missing_case_ids: int
    missing_activities: int
    out_of_order_events: int
    extreme_durations: int
    issues: List[str]
    auto_fix_applied: bool = False
    cleaned_rows: int = 0

class DataCleaningOptions(BaseModel):
    remove_duplicates: bool = True
    remove_missing_identifiers: bool = True
    standardize_timestamps: bool = True
    normalize_text: bool = True
    fill_missing_departments: bool = True
    sort_chronological: bool = True

class DataCleaningResult(BaseModel):
    before_rows: int
    after_rows: int
    dropped_duplicates: int
    dropped_missing: int
    fixed_timestamps: int
    normalized_fields: int
    quality_score_before: int
    quality_score_after: int
    quality_report: DataQualityCheck

class DatasetSummary(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    organization_id: str
    uploaded_at: str
    row_count: int
    case_count: int
    activity_count: int
    department_count: int
    columns: List[str]
    column_mapping: Dict[str, str]
    quality_score: int
    is_demo: bool = False
    process_type: str = "General"

# Analysis Request & History
class AnalysisRunRequest(BaseModel):
    dataset_id: str
    column_mapping: Optional[Dict[str, str]] = None
    cleaning_options: Optional[DataCleaningOptions] = None
    weights: Optional[Dict[str, float]] = None

class AnalysisHistoryItem(BaseModel):
    id: str
    dataset_id: str
    dataset_name: str
    created_at: str
    total_cases: int
    total_events: int
    avg_cycle_time_hours: float
    overall_health_score: int
    bottleneck_score: float
    top_bottleneck: str
    status: str = "Completed"

# Process Mining & Metrics
class TransitionMetric(BaseModel):
    source: str
    target: str
    count: int
    avg_waiting_hours: float
    median_waiting_hours: float
    min_waiting_hours: float
    max_waiting_hours: float
    p95_waiting_hours: float
    rework_count: int = 0

class StageMetric(BaseModel):
    activity: str
    total_cases: int
    total_events: int
    avg_duration_hours: float
    median_duration_hours: float
    p90_duration_hours: float
    p95_duration_hours: float
    min_duration_hours: float
    max_duration_hours: float
    std_duration_hours: float
    avg_waiting_hours: float
    rework_rate: float  # Percentage
    rework_count: int
    sla_hours: float
    sla_breach_rate: float  # Percentage
    sla_breaches: int
    anomaly_rate: float
    dominant_department: Optional[str] = None
    bottleneck_score: float = 0.0
    bottleneck_level: str = "Healthy"

class ProcessOverview(BaseModel):
    dataset_id: str
    total_cases: int
    total_events: int
    avg_cycle_time_hours: float
    median_cycle_time_hours: float
    p95_cycle_time_hours: float
    overall_health_score: int
    bottleneck_score: float
    rework_rate: float
    sla_breach_rate: float
    anomaly_rate: float
    estimated_time_lost_hours: float
    estimated_cost_lost: Optional[float] = None
    stages: List[StageMetric]
    transitions: List[TransitionMetric]
    start_activities: List[Dict[str, Any]]
    end_activities: List[Dict[str, Any]]
    daily_volume: List[Dict[str, Any]]
    daily_delays: List[Dict[str, Any]]

# Bottleneck
class BottleneckScoreWeights(BaseModel):
    duration_weight: float = 0.25
    waiting_weight: float = 0.20
    volume_weight: float = 0.15
    rework_weight: float = 0.15
    sla_weight: float = 0.15
    variability_weight: float = 0.10

class BottleneckItem(BaseModel):
    rank: int
    activity: str
    bottleneck_score: float
    bottleneck_level: str  # Healthy, Low, Moderate, High, Critical
    avg_duration_hours: float
    avg_waiting_hours: float
    rework_rate: float
    sla_breach_rate: float
    variability_score: float
    volume_share: float
    affected_cases: int
    primary_contributor: str
    summary_explanation: str

# Root Cause
class RootCauseFactor(BaseModel):
    category: str  # Department, Priority, Assignee, TimeOfDay, PreviousStage
    factor_name: str
    delay_multiplier: float  # e.g., 2.4x
    avg_duration_hours: float
    baseline_duration_hours: float
    affected_case_count: int
    confidence_pct: int
    wording: str  # "Cases handled by Team B are associated with 2.4x longer processing time than Team A."

class StageRootCause(BaseModel):
    activity: str
    bottleneck_score: float
    primary_factors: List[RootCauseFactor]
    plain_language_explanation: str
    data_quality_warning: Optional[str] = None

# Anomaly
class AnomalyCase(BaseModel):
    case_id: str
    anomaly_score: int  # 0-100
    severity: str  # Low, Medium, High, Critical
    duration_hours: float
    normal_median_hours: float
    affected_stage: str
    stage_duration_hours: float
    rework_count: int
    department: str
    reason: str
    events_timeline: List[Dict[str, Any]]

# Rework
class ReworkLoop(BaseModel):
    source_stage: str
    target_stage: str
    occurrences: int
    rework_rate: float
    avg_delay_hours: float
    affected_cases_count: int
    top_departments: List[Dict[str, Any]]

# Department
class DepartmentComparison(BaseModel):
    department: str
    total_cases: int
    total_events: int
    avg_duration_hours: float
    median_duration_hours: float
    sla_compliance_pct: float
    rework_rate: float
    anomaly_count: int
    active_bottlenecks: int
    workload_share_pct: float
    fairness_note: str

# Delay Prediction (ML)
class DelayPredictionModelStats(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    feature_importances: List[Dict[str, Any]]
    total_trained_samples: int
    training_date: str

class CaseDelayPrediction(BaseModel):
    case_id: str
    current_stage: str
    elapsed_hours: float
    predicted_delay_risk_pct: int
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    expected_completion_time: str
    confidence_range_hours: float
    contributing_factors: List[str]

# AI Recommendations
class AIRecommendation(BaseModel):
    id: str
    problem: str
    evidence: str
    recommended_action: str
    expected_impact: str
    priority: str  # LOW, MEDIUM, HIGH, CRITICAL
    confidence: str  # Low, Medium, High
    affected_stage: str
    estimated_time_saving_hours: Optional[float] = None
    estimated_cost_saving: Optional[float] = None

# What-If Simulation
class SimulationScenario(BaseModel):
    dataset_id: str
    stage_adjustments: Dict[str, float]  # stage -> duration multiplier (e.g., 0.7 = -30%)
    staffing_increase_pct: float = 0.0
    sla_target_change_pct: float = 0.0
    rework_reduction_pct: float = 0.0

class SimulationResult(BaseModel):
    baseline_cycle_time_hours: float
    projected_cycle_time_hours: float
    cycle_time_reduction_pct: float
    baseline_sla_breach_rate: float
    projected_sla_breach_rate: float
    baseline_rework_rate: float
    projected_rework_rate: float
    estimated_annual_hours_saved: float
    stage_improvements: List[Dict[str, Any]]
    is_simulation_estimate: bool = True

# Natural Language Chat
class AIChatRequest(BaseModel):
    dataset_id: str
    question: str
    context_filters: Optional[Dict[str, Any]] = None

class AIChatResponse(BaseModel):
    answer: str
    grounded_facts: List[str]
    related_metrics: Dict[str, Any]
    confidence_level: str
    suggested_followups: List[str]

# Notification
class NotificationItem(BaseModel):
    id: str
    title: str
    message: str
    severity: str  # INFO, WARNING, HIGH, CRITICAL
    timestamp: str
    is_read: bool = False
    related_process: Optional[str] = None
    related_bottleneck: Optional[str] = None
