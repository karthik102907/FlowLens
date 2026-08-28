import uuid
import pandas as pd
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Header
from fastapi.responses import JSONResponse

from app.models.schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    ColumnMapping, DataQualityCheck, DatasetSummary,
    DataCleaningOptions, DataCleaningResult,
    AnalysisRunRequest, AnalysisHistoryItem,
    BottleneckScoreWeights, SimulationScenario, AIChatRequest
)
from app.models.database import db
from app.services.data_engine import DataEngine
from app.services.analytics_pipeline import AnalyticsPipeline
from app.services.simulation_engine import SimulationEngine
from app.services.ai_analyst import AIAnalyst
from app.services.demo_generator import DemoGenerator

router = APIRouter()

# ----------------- AUTHENTICATION -----------------
@router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    if user_data.email in db.users:
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    
    uid = f"usr_{uuid.uuid4().hex[:8]}"
    org_id = user_data.organization_id or "org_flowlens_enterprise"
    
    new_user = {
        "id": uid,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "password_hash": user_data.password,
        "role": user_data.role,
        "organization_id": org_id,
        "created_at": datetime.now().isoformat()
    }
    db.users[user_data.email] = new_user
    db.log_action(user_data.email, "USER_REGISTERED", {"user_id": uid, "role": user_data.role})

    user_resp = UserResponse(
        id=uid,
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role,
        organization_id=org_id,
        created_at=new_user["created_at"]
    )
    return TokenResponse(access_token=f"jwt_{uid}_{int(datetime.now().timestamp())}", user=user_resp)

@router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = db.users.get(credentials.email)
    if not user or user["password_hash"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    db.log_action(credentials.email, "USER_LOGGED_IN", {})
    user_resp = UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        organization_id=user["organization_id"],
        created_at=user["created_at"]
    )
    return TokenResponse(access_token=f"jwt_{user['id']}_{int(datetime.now().timestamp())}", user=user_resp)

@router.get("/auth/me", response_model=UserResponse)
async def get_me(authorization: Optional[str] = Header(None)):
    admin = db.users["admin@flowlens.ai"]
    return UserResponse(
        id=admin["id"],
        email=admin["email"],
        full_name=admin["full_name"],
        role=admin["role"],
        organization_id=admin["organization_id"],
        created_at=admin["created_at"]
    )

# ----------------- DATASETS & UPLOAD -----------------
@router.post("/datasets/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    process_type: Optional[str] = Form("General")
):
    try:
        contents = await file.read()
        df = DataEngine.load_bytes_to_dataframe(contents, file.filename)
        
        ds_id = f"ds_{uuid.uuid4().hex[:8]}"
        dataset_name = name or file.filename.rsplit(".", 1)[0]

        # Auto-map columns
        mapping = DataEngine.auto_map_columns(list(df.columns))
        
        # Clean and inspect quality
        clean_df, quality_report = DataEngine.inspect_and_clean(df, mapping, auto_fix=True)

        # Store in DB
        db.raw_dataframes[ds_id] = clean_df
        
        summary = {
            "id": ds_id,
            "name": dataset_name,
            "description": f"Uploaded process event log with {len(clean_df):,} events.",
            "organization_id": "org_flowlens_enterprise",
            "uploaded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "row_count": len(clean_df),
            "case_count": int(clean_df[mapping.get("case_id", list(clean_df.columns)[0])].nunique()),
            "activity_count": int(clean_df[mapping.get("activity", list(clean_df.columns)[1])].nunique()),
            "department_count": int(clean_df[mapping.get("department")].nunique()) if mapping.get("department") and mapping.get("department") in clean_df.columns else 1,
            "columns": list(clean_df.columns),
            "column_mapping": mapping,
            "quality_score": quality_report.score,
            "quality_report": quality_report.dict(),
            "is_demo": False,
            "process_type": process_type or "General"
        }
        db.datasets[ds_id] = summary

        # Run pipeline and persist analysis
        analytics = AnalyticsPipeline.execute_full_pipeline(ds_id, clean_df, mapping)
        db.save_analysis(f"an_{ds_id}", ds_id, dataset_name, analytics)

        db.log_action("admin@flowlens.ai", "DATASET_UPLOADED", {"dataset_id": ds_id, "name": dataset_name})
        return {"dataset": summary, "quality": quality_report.dict(), "analytics": analytics}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process dataset: {str(e)}")

@router.post("/datasets/demo/{demo_type}")
async def load_demo_dataset(demo_type: str):
    dt = demo_type.lower()
    if "loan" in dt or "bank" in dt:
        df = DemoGenerator.generate_loan_processing(500)
        name = "Commercial & Mortgage Loan Processing"
        p_type = "Banking"
    elif "hospital" in dt or "health" in dt or "er" in dt:
        df = DemoGenerator.generate_hospital_er(400)
        name = "Hospital Emergency & Inpatient Journey"
        p_type = "Healthcare"
    elif "college" in dt or "admission" in dt or "edu" in dt:
        df = DemoGenerator.generate_university_admission(450)
        name = "University Admissions & Enrollment Pipeline"
        p_type = "Education"
    else:
        df = DemoGenerator.generate_it_support(500)
        name = "Enterprise IT Incident Resolution"
        p_type = "IT Support"

    ds_id = f"demo_{dt}_{uuid.uuid4().hex[:6]}"
    mapping = DataEngine.auto_map_columns(list(df.columns))
    clean_df, quality_report = DataEngine.inspect_and_clean(df, mapping, auto_fix=True)

    db.raw_dataframes[ds_id] = clean_df
    summary = {
        "id": ds_id,
        "name": name,
        "description": f"High-fidelity enterprise demo dataset with {len(clean_df):,} events across {int(clean_df['case_id'].nunique()):,} cases.",
        "organization_id": "org_flowlens_enterprise",
        "uploaded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "row_count": len(clean_df),
        "case_count": int(clean_df["case_id"].nunique()),
        "activity_count": int(clean_df["activity"].nunique()),
        "department_count": int(clean_df["department"].nunique()) if "department" in clean_df.columns else 4,
        "columns": list(clean_df.columns),
        "column_mapping": mapping,
        "quality_score": quality_report.score,
        "quality_report": quality_report.dict(),
        "is_demo": True,
        "process_type": p_type
    }
    db.datasets[ds_id] = summary

    # Run analytical pipeline & save
    analytics = AnalyticsPipeline.execute_full_pipeline(ds_id, clean_df, mapping)
    db.save_analysis(f"an_{ds_id}", ds_id, name, analytics)

    return {"dataset": summary, "quality": quality_report.dict(), "analytics": analytics}

@router.get("/datasets")
async def list_datasets():
    return list(db.datasets.values())

@router.get("/datasets/{dataset_id}")
async def get_dataset(dataset_id: str):
    if dataset_id not in db.datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return db.datasets[dataset_id]

@router.get("/datasets/{dataset_id}/preview")
async def get_dataset_preview(dataset_id: str, limit: int = 50):
    if dataset_id not in db.raw_dataframes:
        raise HTTPException(status_code=404, detail="Raw dataset not found")
    df: pd.DataFrame = db.raw_dataframes[dataset_id]
    preview_rows = df.head(limit).to_dict(orient="records")
    return {"columns": list(df.columns), "rows": preview_rows, "total_rows": len(df)}

@router.post("/datasets/{dataset_id}/map-columns")
async def update_column_mapping(dataset_id: str, mapping: Dict[str, str]):
    if dataset_id not in db.datasets or dataset_id not in db.raw_dataframes:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    db.datasets[dataset_id]["column_mapping"] = mapping
    df = db.raw_dataframes[dataset_id]
    clean_df, quality_report = DataEngine.inspect_and_clean(df, mapping, auto_fix=True)
    db.raw_dataframes[dataset_id] = clean_df
    db.datasets[dataset_id]["quality_score"] = quality_report.score
    db.datasets[dataset_id]["quality_report"] = quality_report.dict()
    
    return {"status": "ok", "mapping": mapping, "quality": quality_report.dict()}

@router.post("/datasets/{dataset_id}/clean")
async def clean_dataset(dataset_id: str, options: DataCleaningOptions):
    if dataset_id not in db.datasets or dataset_id not in db.raw_dataframes:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    df = db.raw_dataframes[dataset_id]
    mapping = db.datasets[dataset_id]["column_mapping"]
    cleaned_df, report = DataEngine.clean_with_report(df, mapping, options)
    
    db.raw_dataframes[dataset_id] = cleaned_df
    db.datasets[dataset_id]["quality_score"] = report.quality_score_after
    db.datasets[dataset_id]["quality_report"] = report.quality_report.dict()
    db.datasets[dataset_id]["row_count"] = report.after_rows

    return report.dict()

# ----------------- ANALYSES & EXECUTION -----------------
@router.post("/analyses/run")
async def run_full_analysis(req: AnalysisRunRequest):
    ds_id = req.dataset_id
    if ds_id not in db.datasets or ds_id not in db.raw_dataframes:
        raise HTTPException(status_code=404, detail="Dataset not found for analysis run")

    df = db.raw_dataframes[ds_id]
    mapping = req.column_mapping or db.datasets[ds_id]["column_mapping"]
    
    # Optional cleaning step
    if req.cleaning_options:
        df, _ = DataEngine.clean_with_report(df, mapping, req.cleaning_options)
        db.raw_dataframes[ds_id] = df

    # Weights
    weights = BottleneckScoreWeights(**req.weights) if req.weights else BottleneckScoreWeights()

    analytics = AnalyticsPipeline.execute_full_pipeline(ds_id, df, mapping, weights)
    
    an_id = f"an_{uuid.uuid4().hex[:8]}"
    db.save_analysis(an_id, ds_id, db.datasets[ds_id]["name"], analytics)

    return {"analysis_id": an_id, "analytics": analytics}

@router.get("/analyses")
async def list_analyses():
    return db.list_analyses()

@router.get("/analyses/{analysis_id}")
async def get_analysis_by_id(analysis_id: str):
    if analysis_id in db.analyses_history:
        return db.analyses_history[analysis_id]["analytics"]
    if analysis_id in db.computed_analytics:
        return db.computed_analytics[analysis_id]
    raise HTTPException(status_code=404, detail="Analysis not found")

# ----------------- PROCESS EXPLORER & OVERVIEWS -----------------
@router.get("/process/{dataset_id}/all")
async def get_all_analytics(dataset_id: str):
    if dataset_id not in db.computed_analytics:
        if dataset_id in db.raw_dataframes and dataset_id in db.datasets:
            ds = db.datasets[dataset_id]
            analytics = AnalyticsPipeline.execute_full_pipeline(dataset_id, db.raw_dataframes[dataset_id], ds["column_mapping"])
            db.save_analysis(f"an_{dataset_id}", dataset_id, ds["name"], analytics)
            return analytics
        raise HTTPException(status_code=404, detail="Analytics not found for this dataset")
    return db.computed_analytics[dataset_id]

@router.post("/process/{dataset_id}/recalculate")
async def recalculate_analytics(dataset_id: str, weights: BottleneckScoreWeights):
    if dataset_id not in db.raw_dataframes or dataset_id not in db.datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    ds = db.datasets[dataset_id]
    analytics = AnalyticsPipeline.execute_full_pipeline(dataset_id, db.raw_dataframes[dataset_id], ds["column_mapping"], weights)
    db.save_analysis(f"an_{dataset_id}", dataset_id, ds["name"], analytics)
    return analytics

# ----------------- WHAT-IF SIMULATION -----------------
@router.post("/simulation/run")
async def run_simulation(scenario: SimulationScenario):
    ds_id = scenario.dataset_id
    if ds_id not in db.computed_analytics:
        if ds_id in db.raw_dataframes:
            analytics = AnalyticsPipeline.execute_full_pipeline(ds_id, db.raw_dataframes[ds_id], db.datasets[ds_id]["column_mapping"])
            db.save_analysis(f"an_{ds_id}", ds_id, db.datasets[ds_id]["name"], analytics)
        else:
            raise HTTPException(status_code=404, detail="Dataset not found")

    overview = db.computed_analytics[ds_id]["overview"]
    result = SimulationEngine.run_simulation(overview, scenario)
    return result

# ----------------- AI PROCESS ANALYST CHAT -----------------
@router.post("/ai/ask")
async def ask_ai_analyst(req: AIChatRequest):
    ds_id = req.dataset_id
    if ds_id not in db.computed_analytics:
        if ds_id in db.raw_dataframes:
            analytics = AnalyticsPipeline.execute_full_pipeline(ds_id, db.raw_dataframes[ds_id], db.datasets[ds_id]["column_mapping"])
            db.save_analysis(f"an_{ds_id}", ds_id, db.datasets[ds_id]["name"], analytics)
        else:
            raise HTTPException(status_code=404, detail="Dataset not found for AI analysis")

    response = AIAnalyst.answer_question(req, db.computed_analytics[ds_id])
    return response

# ----------------- NOTIFICATIONS & ORG -----------------
@router.get("/notifications")
async def get_notifications():
    org_id = "org_flowlens_enterprise"
    return db.notifications.get(org_id, [])

@router.post("/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: str):
    org_id = "org_flowlens_enterprise"
    for n in db.notifications.get(org_id, []):
        if n["id"] == notif_id:
            n["is_read"] = True
            return {"status": "ok", "notification": n}
    return {"status": "not_found"}

@router.get("/organization")
async def get_organization():
    org_id = "org_flowlens_enterprise"
    return db.organizations.get(org_id, {})

@router.get("/audit-logs")
async def get_audit_logs():
    return db.audit_logs[-50:]
