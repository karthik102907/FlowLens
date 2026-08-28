import os
import time
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.endpoints import router as api_router
from app.services.demo_generator import DemoGenerator
from app.services.data_engine import DataEngine
from app.services.analytics_pipeline import AnalyticsPipeline
from app.models.database import db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Pre-populate rich default datasets and analysis history
    print("[INIT] Initializing FlowLens AI Production Engine...")
    
    # 1. Mortgage Loan Approval Demo
    loan_df = DemoGenerator.generate_loan_processing(500)
    loan_id = "ds_demo_loan_mortgage"
    loan_map = DataEngine.auto_map_columns(list(loan_df.columns))
    clean_loan_df, loan_quality = DataEngine.inspect_and_clean(loan_df, loan_map, auto_fix=True)
    db.raw_dataframes[loan_id] = clean_loan_df
    db.datasets[loan_id] = {
        "id": loan_id,
        "name": "Commercial & Mortgage Loan Processing",
        "description": "Enterprise financial event log with 3,000+ events across verification, risk assessment, and underwriting.",
        "organization_id": "org_flowlens_enterprise",
        "uploaded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "row_count": len(clean_loan_df),
        "case_count": int(clean_loan_df["case_id"].nunique()),
        "activity_count": int(clean_loan_df["activity"].nunique()),
        "department_count": int(clean_loan_df["department"].nunique()),
        "columns": list(clean_loan_df.columns),
        "column_mapping": loan_map,
        "quality_score": loan_quality.score,
        "quality_report": loan_quality.dict(),
        "is_demo": True,
        "process_type": "Banking & Lending"
    }
    loan_analytics = AnalyticsPipeline.execute_full_pipeline(loan_id, clean_loan_df, loan_map)
    db.save_analysis(f"an_{loan_id}", loan_id, "Commercial & Mortgage Loan Processing", loan_analytics)

    # 2. Hospital ER Inpatient Demo
    er_df = DemoGenerator.generate_hospital_er(400)
    er_id = "ds_demo_hospital_er"
    er_map = DataEngine.auto_map_columns(list(er_df.columns))
    clean_er_df, er_quality = DataEngine.inspect_and_clean(er_df, er_map, auto_fix=True)
    db.raw_dataframes[er_id] = clean_er_df
    db.datasets[er_id] = {
        "id": er_id,
        "name": "Hospital Emergency & Inpatient Registration",
        "description": "Clinical patient journey from ER triage, diagnostics, specialist consult to bed allocation.",
        "organization_id": "org_flowlens_enterprise",
        "uploaded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "row_count": len(clean_er_df),
        "case_count": int(clean_er_df["case_id"].nunique()),
        "activity_count": int(clean_er_df["activity"].nunique()),
        "department_count": int(clean_er_df["department"].nunique()),
        "columns": list(clean_er_df.columns),
        "column_mapping": er_map,
        "quality_score": er_quality.score,
        "quality_report": er_quality.dict(),
        "is_demo": True,
        "process_type": "Healthcare"
    }
    er_analytics = AnalyticsPipeline.execute_full_pipeline(er_id, clean_er_df, er_map)
    db.save_analysis(f"an_{er_id}", er_id, "Hospital Emergency & Inpatient Registration", er_analytics)

    print("[SUCCESS] FlowLens AI Production Engine ready.")
    yield
    print("[SHUTDOWN] Shutting down FlowLens AI backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Advanced Process Bottleneck Detection & Process Intelligence Platform",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check Endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now().isoformat(),
        "active_datasets": len(db.datasets),
        "active_analyses": len(db.analyses_history)
    }

# API Router Mount
app.include_router(api_router, prefix="/api")

# Static Frontend SPA Serving
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
assets_dir = os.path.join(frontend_dist, "assets")

if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if os.path.exists(frontend_dist):
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
    return {
        "status": "online",
        "service": "FlowLens AI Unified Server",
        "version": settings.VERSION,
        "docs": "/docs"
    }
