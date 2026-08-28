# FlowLens AI — Advanced Process Bottleneck Detection & Intelligence Platform

> **"See Where Your Process Slows Down. Know Why. Fix It Before It Costs You."**

FlowLens AI is an enterprise-grade AI Process Bottleneck Detection & Process Intelligence SaaS platform. It ingests sequential workflow event data (CSV, Excel, JSON), reconstructs individual case journeys, calculates stage latencies and queue backlogs, automatically discovers bottlenecks using a multi-factor weighted scoring model, correlates root causes, predicts delay risks using machine learning, detects anomalies, isolates rework loops, simulates optimization scenarios, and generates executive C-suite reports.

---

## 🚀 Key Architectural Capabilities

### 1. Multi-Factor Weighted Bottleneck Detection
Unlike basic dashboards that only check average duration, FlowLens AI calculates a balanced 0–100 severity index:
$$\text{Score} = 0.25 \times \text{Duration} + 0.20 \times \text{Waiting} + 0.15 \times \text{Volume} + 0.15 \times \text{Rework} + 0.15 \times \text{SLA} + 0.10 \times \text{Variability}$$
- **0–20**: Healthy
- **21–40**: Low
- **41–60**: Moderate
- **61–80**: High
- **81–100**: Critical
- Fully configurable weights with instant live recalculation.

### 2. Statistical Root Cause Investigation
- Discovers non-causal correlations across departments, assignees, case priorities, categories, and temporal day-of-week distributions.
- Calculates delay multipliers (e.g. *2.4x baseline duration*) with confidence percentages.
- Employs truthful, non-causation phrasing (*"associated with"*, *"likely contributor"*, *"potential factor"*).

### 3. Machine Learning Delay Risk Prediction
- Supervised ensemble Random Forest classifier trained on historical event journeys.
- Full model evaluation: **Accuracy, Precision, Recall, F1-Score, ROC-AUC**.
- Explainable feature importances (SHAP-aligned) isolating factors like elapsed process time, rework loops, and priority complexity.
- Case-level delay risk percentages with risk levels (*LOW, MEDIUM, HIGH, CRITICAL*) and expected completion timeframes.

### 4. Multimodal Anomaly Detection
- Identifies unusual cases using statistical IQR/Z-score thresholds and multi-stage latency spikes.
- Interactive modal timeline inspector displaying step-by-step event timestamps for any anomalous case.

### 5. Rework & Return Loop Detection
- Detects recurring backward transitions between review and approval gates.
- Quantifies rework frequency, delay penalties, financial waste estimates, and responsible organizational units.

### 6. Interactive Process Map Canvas
- Dynamic visual graph with zoom, pan, stage volume scaling, bottleneck color gradients, and click-to-inspect stage details (Median, P90, P95 worst-case, SLA targets).

### 7. What-If Process Simulator
- Live interactive parameter tuning (stage duration reductions, staffing capacity increases, SLA target modifications, rework defect reduction).
- Real-time recalculation of projected cycle time, SLA compliance, and estimated annual hours saved.

### 8. Factually Grounded AI Process Analyst
- Natural language query assistant strictly grounded in computed dataset metrics without hallucinations.
- Evidence-based prescriptive recommendations with quantified operational and financial impact estimates.

### 9. Executive Reporting & Multi-Format Data Export
- Comprehensive printable executive reports with structured sections.
- 1-click export to **PDF**, **Excel (.xlsx)**, and **Cleaned CSV**.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons, jsPDF, XLSX
- **Backend**: Python 3.14, FastAPI, Uvicorn, Pandas, NumPy, Scikit-learn, Pydantic, Python-JOSE
- **Architecture**: Decoupled REST API + Grounded Analytical Pipeline + Responsive Enterprise SaaS Shell

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Start the FastAPI Backend
```bash
cd backend
python -m pip install -r requirements.txt # or install fastapi uvicorn pandas numpy scikit-learn openpyxl
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://127.0.0.1:5173` in your browser.

---

## 📊 Expected Process Event Log Schema

FlowLens AI features automated column detection supporting standard event logs:

| Canonical Field | Alternative Aliases | Description |
|---|---|---|
| `case_id` | `Application_ID`, `Patient_ID`, `Ticket_ID`, `Claim_ID` | Unique process instance ID |
| `activity` | `Process_Step`, `Step`, `Task`, `Stage`, `Event` | Discrete workflow action |
| `timestamp` | `Date_Time`, `Datetime`, `Event_Time`, `Created_At` | Chronological event time |
| `department` | `Team`, `Unit`, `Division`, `Branch` | Assigned organizational unit |
| `employee` | `Assigned_To`, `Agent`, `Operator`, `Assignee` | Handling individual or system |
| `priority` | `Severity`, `Urgency`, `Tier` | Case urgency level |
| `category` | `Type`, `Product`, `Class` | Workflow classification |
| `sla` | `SLA_Hours`, `Target_Hours`, `Threshold` | Target duration in hours |
| `cost` | `Amount`, `Expense`, `Fee` | Activity cost metric |

---

## 📄 License & Attribution
Engineered as a production-grade Process Bottleneck Intelligence SaaS. FlowLens AI © 2026.
