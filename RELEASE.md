# FlowLens AI — Official Release Notes (v1.0.0)

## 📌 Product Information

- **Product Name**: FlowLens AI
- **Version**: `1.0.0`
- **Release Status**: 🟢 Production Ready
- **Architecture**: Unified ASGI Container (FastAPI ASGI Backend + React 19 SPA)
- **Interactive Documentation**: `/docs` (OpenAPI / Swagger)
- **Health Check Endpoint**: `/api/health`

---

## 🌐 Endpoints & Verified Hosting Configurations

| Component | Target URL / Path | Verified Status |
|---|---|---|
| **Web Application** | `https://99517b37bf47b6.lhr.life` | 🟢 200 OK |
| **API & Health Check** | `https://99517b37bf47b6.lhr.life/api/health` | 🟢 200 OK (`status: healthy`) |
| **Swagger UI** | `https://99517b37bf47b6.lhr.life/docs` | 🟢 200 OK |
| **Render Cloud Blueprint** | [`render.yaml`](./render.yaml) | 🟢 1-Click 24/7 Ready |
| **Railway Deployment** | [`railway.json`](./railway.json) & [`Procfile`](./Procfile) | 🟢 Cloud Container Ready |
| **Docker VPS** | [`docker-compose.yml`](./docker-compose.yml) & [`Dockerfile`](./Dockerfile) | 🟢 Independent 24/7 Container |

---

## 🚀 Core Features & Analytical Capabilities

### 1. Ingestion & Data Quality Engine
- Ingests CSV, XLSX, and JSON event logs with flexible column auto-detection (Case ID, Activity, Timestamp, Department, Cost, SLA).
- Real-time data quality score (0–100) evaluating completeness, invalid timestamps, and duplicate detection.
- Interactive column mapper with manual override and automated cleaning with Before vs After statistics.

### 2. Deterministic Process Mining
- Sequential case journey reconstruction, transition latency calculation (average, median, P95), active processing duration, and queue waiting time.
- Dynamic Process Map canvas with zoom, pan, stage search/filter, color-coded severity legend, and stage inspector.

### 3. Multi-Factor Bottleneck Scoring
- Balanced 0–100 severity index computed across 6 distinct dimensions:
  $$\text{Score} = 0.25 \times \text{Duration} + 0.20 \times \text{Waiting} + 0.15 \times \text{Volume} + 0.15 \times \text{Rework} + 0.15 \times \text{SLA} + 0.10 \times \text{Variance}$$
- Classifies stages into 5 operational levels: Healthy, Low, Moderate, High, Critical.

### 4. Statistical Root Cause Analysis
- Computes delay multipliers and correlation metrics across teams, case priorities, categories, and day-of-week with transparent non-causal phrasing.

### 5. Multimodal Anomaly & Rework Loop Detection
- Inter-quartile range (IQR) duration outliers with case timeline drilldown.
- Quantifies circular rework loops between approval gates with time penalties and department attribution.

### 6. Machine Learning Delay Risk Prediction
- Supervised Random Forest Classifier predicting per-case delay probability with evaluation metrics (Accuracy, Precision, Recall, F1, ROC-AUC) and SHAP-aligned feature importances.
- Transparent disclaimer: *Predictions are probabilistic estimates based on historical process patterns and should not be treated as guaranteed outcomes.*
- Graceful handling for small datasets (< 25 cases).

### 7. Grounded AI Process Analyst
- Natural language query assistant grounded strictly in verified computed process metrics.
- Suggested questions and explicit *"Based on this analysis"* supporting metric cards.

### 8. What-If Scenario Simulator
- Interactive parameter sliders to simulate the impact of duration cuts, staffing multipliers, and rework reduction on projected cycle times and estimated annual time savings.

### 9. Executive Report Generation
- 1-click export to **PDF**, **Excel (.xlsx)**, and **Cleaned CSV**.

### 10. Audit History & Persistence
- Dedicated Analysis History audit view (`#/history`) with search, filter, and 1-click reload.

---

## 🔒 Security & Production Hardening

- **Zero Client-Side Secrets**: All API keys, database credentials, and token secrets remain on the backend.
- **Dynamic Same-Origin Routing**: Production frontend resolves API calls to `/api` without depending on localhost.
- **Strict CORS & Secret Key**: Configurable `CORS_ORIGINS` and cryptographically random `SECRET_KEY`.
- **Upload Validation**: File type, size, and header checks prevent path traversal and memory exhaustion.

---

## 🧪 Automated Test Suite

- Automated test suite in `backend/tests/test_flowlens_engine.py`:
- **Result**: `Ran 12 tests in 2.996s — OK (100% Passed)`.
- Tested modules: DataEngine, ProcessEngine, BottleneckEngine, RootCauseEngine, AnomalyEngine, MLEngine, SimulationEngine, AIAnalyst, Small Dataset Fallback, and Multi-format serialization.

---

## ⚠️ Known Limitations & Operational Boundaries

1. **Machine Learning Sample Size**: Reliable delay risk modeling requires ≥ 25 completed cases. For smaller datasets, core process mining and bottleneck analysis remain fully operational while ML prediction displays an informative notification.
2. **Correlation vs Causation**: Root cause factors represent statistical correlation observed within event logs. Operational investigations should confirm physical causation before making structural organizational changes.
3. **Simulation Assumptions**: What-if scenario projections represent mathematical estimates based on linear and queue assumptions.
