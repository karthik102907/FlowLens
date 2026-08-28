import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional

class DatabaseStore:
    def __init__(self):
        self.users: Dict[str, Dict[str, Any]] = {}
        self.organizations: Dict[str, Dict[str, Any]] = {}
        self.datasets: Dict[str, Dict[str, Any]] = {}
        self.raw_dataframes: Dict[str, Any] = {}  # In-memory pandas DataFrames
        self.computed_analytics: Dict[str, Dict[str, Any]] = {}
        self.analyses_history: Dict[str, Dict[str, Any]] = {}
        self.notifications: Dict[str, List[Dict[str, Any]]] = {}
        self.audit_logs: List[Dict[str, Any]] = []

        self._seed_defaults()

    def _seed_defaults(self):
        # Default Enterprise Organization
        org_id = "org_flowlens_enterprise"
        self.organizations[org_id] = {
            "id": org_id,
            "name": "Global Financial & Healthcare Services",
            "tier": "Enterprise",
            "created_at": datetime.now().isoformat(),
            "max_datasets": 50,
            "sla_threshold_hours": 48.0
        }

        # Default Administrator User
        admin_id = "usr_admin_01"
        self.users["admin@flowlens.ai"] = {
            "id": admin_id,
            "email": "admin@flowlens.ai",
            "full_name": "Dr. Sarah Jenkins",
            "password_hash": "admin123",
            "role": "Administrator",
            "organization_id": org_id,
            "created_at": datetime.now().isoformat()
        }

        # Default Process Analyst User
        analyst_id = "usr_analyst_01"
        self.users["analyst@flowlens.ai"] = {
            "id": analyst_id,
            "email": "analyst@flowlens.ai",
            "full_name": "Marcus Vance",
            "password_hash": "analyst123",
            "role": "Process Analyst",
            "organization_id": org_id,
            "created_at": datetime.now().isoformat()
        }

        # Seed initial enterprise notifications
        self.notifications[org_id] = [
            {
                "id": "notif_01",
                "title": "Critical Bottleneck Alert",
                "message": "Document Verification average waiting time increased by 42% over baseline SLA target.",
                "severity": "CRITICAL",
                "timestamp": datetime.now().isoformat(),
                "is_read": False,
                "related_process": "Mortgage Loan Approval",
                "related_bottleneck": "Document Verification"
            },
            {
                "id": "notif_02",
                "title": "Rework Spike Detected",
                "message": "Repeated loop detected between Manager Review and Underwriting in 18.4% of high-value cases.",
                "severity": "HIGH",
                "timestamp": datetime.now().isoformat(),
                "is_read": False,
                "related_process": "Mortgage Loan Approval",
                "related_bottleneck": "Manager Review"
            },
            {
                "id": "notif_03",
                "title": "SLA Compliance Warning",
                "message": "Commercial Lending SLA breach rate reached 23.5% across Regional Branch B.",
                "severity": "WARNING",
                "timestamp": datetime.now().isoformat(),
                "is_read": True,
                "related_process": "Mortgage Loan Approval",
                "related_bottleneck": "Underwriting Assessment"
            }
        ]

    def log_action(self, user_email: str, action: str, details: Dict[str, Any]):
        self.audit_logs.append({
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now().isoformat(),
            "user": user_email,
            "action": action,
            "details": details
        })

    def save_analysis(self, analysis_id: str, dataset_id: str, dataset_name: str, analytics_bundle: Dict[str, Any]):
        overview = analytics_bundle.get("overview", {})
        bottlenecks = analytics_bundle.get("bottlenecks", [])
        top_b = bottlenecks[0].get("activity") if bottlenecks else "None"

        record = {
            "id": analysis_id,
            "dataset_id": dataset_id,
            "dataset_name": dataset_name,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "total_cases": overview.get("total_cases", 0),
            "total_events": overview.get("total_events", 0),
            "avg_cycle_time_hours": overview.get("avg_cycle_time_hours", 0.0),
            "overall_health_score": overview.get("overall_health_score", 85),
            "bottleneck_score": overview.get("bottleneck_score", 0.0),
            "top_bottleneck": top_b,
            "status": "Completed",
            "analytics": analytics_bundle
        }
        self.analyses_history[analysis_id] = record
        self.computed_analytics[analysis_id] = analytics_bundle
        self.computed_analytics[dataset_id] = analytics_bundle

    def list_analyses(self) -> List[Dict[str, Any]]:
        # Return sorted by creation date descending
        items = list(self.analyses_history.values())
        items.sort(key=lambda x: x["created_at"], reverse=True)
        return items

db = DatabaseStore()
