# FlowLens AI

### AI-Powered Process Bottleneck Detection & Process Intelligence Platform

> **See where your process slows down. Understand why. Decide what to improve.**

FlowLens AI is a process intelligence platform designed to analyze workflow event data and identify operational bottlenecks, delays, rework, anomalies, SLA violations, and potential root causes.

The platform combines **process mining, statistical analysis, machine learning, interactive visualization, simulation, and grounded AI** to transform raw process event logs into actionable operational insights.

---

## 🌐 Live Application

**Production Application:**  
https://flowlens-ai-mo2o.onrender.com

**API Health Check:**  
https://flowlens-ai-mo2o.onrender.com/api/health

**API Documentation:**  
https://flowlens-ai-mo2o.onrender.com/docs

### Deployment Status

| Component | Status |
|---|---|
| Production Application | 🟢 Live |
| Cloud Platform | Render |
| Architecture | FastAPI + React |
| Containerization | Docker |
| API | FastAPI REST API |
| Database | SQLite / PostgreSQL compatible |
| HTTPS | Enabled |
| Health Monitoring | `/api/health` |

> **Note:** The application is deployed on Render's Free tier. The service may spin down after inactivity, which can make the first request after inactivity take longer.

---

# 🎯 Problem Statement

Organizations generate large amounts of workflow data, but identifying where time is being lost is often difficult.

Traditional dashboards usually show:

- Average processing time
- Number of cases
- Basic KPIs
- Simple charts

However, they often do not answer important operational questions:

- Where is the actual bottleneck?
- Which process stages create the most waiting time?
- Where does rework occur?
- Which cases are at risk of delay?
- Which departments are associated with longer processing times?
- What factors are associated with SLA violations?
- What would happen if staffing or processing time changed?
- What should management prioritize first?

**FlowLens AI is designed to answer these questions using process-level evidence.**

---

# 💡 Solution

FlowLens AI converts event-log data into an interactive process intelligence workflow:

```text
Raw Event Data
      ↓
Data Ingestion
      ↓
Data Quality & Cleaning
      ↓
Case Journey Reconstruction
      ↓
Process Mining
      ↓
Bottleneck Detection
      ↓
Anomaly & Rework Detection
      ↓
SLA Analysis
      ↓
Root Cause Analysis
      ↓
ML Delay Prediction
      ↓
Grounded AI Analyst
      ↓
What-If Simulation
      ↓
Actionable Recommendations
      ↓
Executive Reports
✨ Key Features
1. Data Ingestion & Quality Analysis

FlowLens AI supports common process event-log formats:

CSV
Excel
JSON

The data ingestion engine provides:

Automatic column detection
Column alias recognition
Manual column mapping
Missing-value analysis
Duplicate detection
Timestamp validation
Data-quality scoring
Before-and-after cleaning statistics
Data Quality Score

The platform calculates a 0–100 data quality score based on important event-log characteristics such as identifiers, timestamps, missing values, and duplicate records.

2. Process Journey Reconstruction

FlowLens AI reconstructs individual case journeys from sequential event data.

For each case, the platform can analyze:

Process stages
Stage sequence
Processing duration
Waiting time
Transition latency
Case completion time
Rework loops
SLA performance

This transforms raw event records into understandable process journeys.

3. Multi-Factor Bottleneck Detection

FlowLens AI uses a weighted bottleneck scoring model instead of relying only on average duration.

Bottleneck Score
Score =
0.25 × Duration
+ 0.20 × Waiting
+ 0.15 × Volume
+ 0.15 × Rework
+ 0.15 × SLA
+ 0.10 × Variability
Severity Levels
Score	Severity
0–20	Healthy
21–40	Low
41–60	Moderate
61–80	High
81–100	Critical

The scoring model allows multiple operational factors to contribute to bottleneck prioritization.

4. Interactive Process Map

The interactive process map provides a visual representation of workflow movement.

Features
Process stage visualization
Stage volume indicators
Bottleneck severity visualization
Zoom in/out
Pan
Reset view
Stage search
Stage filtering
Stage detail inspector

Selecting a stage provides additional process metrics such as:

Average duration
Median duration
P90
P95
Waiting time
SLA performance
Bottleneck severity
5. Anomaly Detection

FlowLens AI identifies unusual process behavior using statistical analysis.

The anomaly engine can detect:

Unusually long cases
Stage latency spikes
Statistical outliers
Abnormal process journeys

Users can inspect anomalous cases through a detailed case timeline.

6. Rework & Loop Detection

The platform identifies repeated or backward process transitions.

Example:

Review
  ↓
Approval
  ↓
Review
  ↓
Approval

FlowLens analyzes:

Rework frequency
Repeated transitions
Delay impact
Estimated operational waste
Associated departments

This helps identify process areas where work may be unnecessarily repeated.

7. SLA Compliance Analysis

FlowLens evaluates whether process cases meet defined SLA targets.

Analysis includes:

SLA compliance percentage
SLA breaches
Stage-level compliance
Department-level compliance
Delayed cases
Process areas with elevated SLA risk
8. Machine Learning Delay Prediction

FlowLens AI includes a supervised Random Forest model for delay-risk prediction.

The ML module provides:

Accuracy
Precision
Recall
F1 Score
ROC-AUC
Feature importance
Case-level delay risk
Risk classification
Risk Levels
LOW
MEDIUM
HIGH
CRITICAL

The system also handles small datasets gracefully and avoids presenting unreliable ML results when there is insufficient historical data.

Important: ML predictions are probabilistic estimates based on historical process patterns and should not be interpreted as guaranteed outcomes.

9. Statistical Root Cause Analysis

FlowLens AI identifies factors statistically associated with process delays.

Potential dimensions include:

Department
Employee
Priority
Category
Day of week
Process stage
Case characteristics

The system uses non-causal language such as:

Associated with
Potential factor
Likely contributor
Observed relationship

This helps avoid incorrectly presenting statistical correlations as proven causal relationships.

10. Grounded AI Process Analyst

FlowLens AI includes an AI-assisted process analyst designed to answer operational questions using verified analysis results.

Example Questions
What is the biggest bottleneck?
Why is this stage slow?
Where is most rework happening?
Which department has the highest waiting time?
What should we fix first?
Which cases are most at risk?

The assistant can present supporting metrics alongside responses to improve transparency.

AI responses are intended to be grounded in the active process analysis and should be used as decision-support information rather than a replacement for human judgment.

11. What-If Process Simulation

FlowLens AI allows users to test potential operational improvements before implementing them.

Users can simulate changes such as:

Reducing stage duration
Increasing staffing capacity
Reducing rework
Adjusting SLA targets

The simulator recalculates estimated:

Cycle time
SLA compliance
Process improvement
Annual hours saved

This helps users evaluate potential interventions using scenario-based analysis.

12. Actionable Recommendations

FlowLens AI converts analytical findings into prioritized recommendations.

Recommendations can be based on:

Bottleneck severity
Waiting time
Rework
SLA performance
Delay risk
Process volume
Statistical contributors

The objective is to connect identified process problems with practical improvement opportunities.

13. Executive Reporting

FlowLens AI provides an executive-oriented analysis summary containing important operational indicators.

Reports can include:

Executive summary
Process KPIs
Bottleneck analysis
SLA performance
Anomaly findings
Rework analysis
Root cause insights
ML predictions
Recommendations
Simulation results
Export Formats
PDF
Excel (.xlsx)
Cleaned CSV
🏗️ System Architecture
                    ┌──────────────────────┐
                    │    User / Analyst    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │ React + TypeScript   │
                    │ Vite + Recharts      │
                    └──────────┬───────────┘
                               │
                         REST API / HTTPS
                               │
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI Backend   │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
      Data Processing    Process Mining      ML Engine
             │                 │                 │
             ▼                 ▼                 ▼
       Quality Engine    Bottleneck Engine  Predictions
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
          Anomaly Engine  Root Cause      AI Analyst
                │              │              │
                └──────────────┼──────────────┘
                               ▼
                    Simulation & Reports
🛠️ Technology Stack
Frontend
React 19
TypeScript
Vite
Tailwind CSS
Recharts
Lucide Icons
XLSX
jsPDF
Backend
Python
FastAPI
Uvicorn
Pandas
NumPy
Scikit-learn
Pydantic
Python-JOSE
Infrastructure
Docker
Render
GitHub
REST API
SQLite
PostgreSQL-compatible architecture
📂 Project Structure
FlowLens/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   └── services/
│   │
│   ├── tests/
│   │   └── test_flowlens_engine.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── Dockerfile
├── docker-compose.yml
├── render.yaml
├── railway.json
├── Procfile
├── DEPLOYMENT.md
├── RELEASE.md
├── README.md
└── .gitignore
📊 Expected Event Log Schema

FlowLens AI supports automatic column detection and common aliases.

Field	Example Aliases	Description
case_id	Application_ID, Patient_ID, Ticket_ID, Claim_ID	Unique process instance
activity	Process_Step, Step, Task, Stage, Event	Workflow activity
timestamp	Date_Time, Datetime, Event_Time, Created_At	Event timestamp
department	Team, Unit, Division, Branch	Organizational unit
employee	Assigned_To, Agent, Operator, Assignee	Person/system handling the case
priority	Severity, Urgency, Tier	Case priority
category	Type, Product, Class	Workflow category
sla	SLA_Hours, Target_Hours, Threshold	SLA target
cost	Amount, Expense, Fee	Cost-related metric
🚀 Getting Started
Prerequisites

Install:

Node.js 18+
Python 3.10+
Git
1. Clone the Repository
git clone https://github.com/karthik102907/FlowLens.git
cd FlowLens
2. Start the Backend
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

Backend API:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs
3. Start the Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Frontend:

http://127.0.0.1:5173
🐳 Running with Docker

Build the application:

docker build -t flowlens-ai .

Run the container:

docker run -p 8000:8000 flowlens-ai

Or use Docker Compose:

docker-compose up --build
☁️ Production Deployment

FlowLens AI is configured for cloud deployment using Docker.

Render

The repository includes:

render.yaml
Dockerfile

The production server binds to the port provided by the cloud platform and exposes:

/api/health
Current Production URL

https://flowlens-ai-mo2o.onrender.com

🔐 Security

FlowLens AI follows several production security practices:

Environment variables for secrets
Backend-only API keys
.env files excluded from Git
Dynamic production API resolution
Configurable CORS
Cryptographic secret configuration
Health monitoring endpoint
No hardcoded localhost production API dependency
Important

Never commit real API keys, database credentials, JWT secrets, or other sensitive credentials to GitHub.

🧪 Testing

The backend includes automated unit and integration tests covering core FlowLens functionality.

Test areas include:

Data parsing
Data cleaning
Process journey reconstruction
Bottleneck scoring
Root cause analysis
Anomaly detection
Rework detection
Machine learning
Small dataset handling
Simulation
Grounded AI responses
Recommendations

Run the test suite:

cd backend
python -m unittest discover tests -v
📈 Example Use Cases
🏦 Banking

Analyze:

Loan applications
Approval workflows
Customer onboarding
Document verification
🏥 Healthcare

Analyze:

Patient journeys
Appointment workflows
Emergency department processes
Claims processing
🎧 Customer Support

Analyze:

Support tickets
Escalations
Resolution workflows
Agent queues
🏢 Enterprise Operations

Analyze:

Approval processes
Procurement
HR workflows
Internal service requests
💳 Insurance

Analyze:

Claims
Verification
Approval
Settlement processes
📌 Project Capabilities
Capability	Status
Process Mining	✅
Data Ingestion	✅
Data Quality Analysis	✅
Bottleneck Detection	✅
Anomaly Detection	✅
Rework Detection	✅
SLA Analysis	✅
Root Cause Analysis	✅
ML Delay Prediction	✅
Grounded AI Analyst	✅
What-If Simulation	✅
Recommendations	✅
PDF Export	✅
Excel Export	✅
CSV Export	✅
Interactive Process Map	✅
Cloud Deployment	✅
Automated Testing	✅
🔬 Analytical Principles

FlowLens AI is designed around three principles:

1. Evidence First

Insights should be derived from available process data rather than unsupported assumptions.

2. Explainability

Important analytical results should be accompanied by understandable metrics and supporting evidence.

3. Decision Support

The platform is intended to help users identify improvement opportunities and evaluate possible interventions.

⚠️ Limitations

FlowLens AI provides analytical and predictive decision-support capabilities.

Results may be affected by:

Dataset quality
Missing values
Sample size
Historical process changes
Data collection practices
Model limitations

Statistical associations should not automatically be interpreted as causal relationships.

Machine-learning predictions represent probabilities rather than guaranteed outcomes.

🗺️ Future Development

Potential future improvements include:

PostgreSQL-first production architecture
Role-based access control
Multi-tenant organizations
Advanced authentication
Real-time event streaming
Additional ML models
Automated process optimization
Custom dashboards
Enterprise SSO
Advanced audit logging
Custom domains
Expanded integrations
👨‍💻 Author

Karthik

B.Tech – Artificial Intelligence & Data Science
Panimalar Engineering College

GitHub

https://github.com/karthik102907

📄 License

FlowLens AI © 2026.

This project is developed as a production-oriented process intelligence platform.

⭐ FlowLens AI

Find where your process loses time. Understand the operational evidence. Prioritize what to improve.



