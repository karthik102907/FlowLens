import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

class DemoGenerator:
    @classmethod
    def generate_loan_processing(cls, num_cases: int = 500) -> pd.DataFrame:
        random.seed(42)
        np.random.seed(42)
        
        stages = [
            ("Application Received", "Digital Intake", 1.5, 0.5, 0.0),
            ("Document Verification", "Operations Verification", 18.4, 8.2, 0.22), # Bottleneck
            ("Credit Risk Assessment", "Risk & Compliance", 12.1, 4.0, 0.08),
            ("Underwriting Assessment", "Underwriting Dept", 24.6, 10.5, 0.28), # Bottleneck
            ("Manager Review", "Credit Management", 8.2, 3.5, 0.12),
            ("Disbursement & Closing", "Disbursement Operations", 4.0, 1.2, 0.02)
        ]
        
        departments = {
            "Digital Intake": ["Agent Alex", "Agent Bella", "System Auto-Ingest"],
            "Operations Verification": ["Team Alpha", "Team Beta (Backlogged)", "Team Gamma"],
            "Risk & Compliance": ["Analyst Dave", "Analyst Elena", "Analyst Frank"],
            "Underwriting Dept": ["Sr Underwriter Grace", "Underwriter Henry", "Underwriter Ian"],
            "Credit Management": ["Director Miller", "Manager Sophia"],
            "Disbursement Operations": ["Clerk Noah", "Clerk Olivia"]
        }

        priorities = ["Standard", "Expedited", "High-Net-Worth", "Commercial Priority"]
        prio_weights = [0.65, 0.20, 0.10, 0.05]

        base_time = datetime(2026, 7, 1, 8, 30, 0)
        records = []

        for c_idx in range(1, num_cases + 1):
            case_id = f"LN-2026-{1000 + c_idx}"
            prio = random.choices(priorities, weights=prio_weights)[0]
            cat = "Commercial Mortgage" if prio == "Commercial Priority" else ("Personal Loan" if c_idx % 2 == 0 else "Home Equity")
            
            # Start time offset over past 60 days
            case_start = base_time + timedelta(days=random.uniform(0, 50), hours=random.uniform(0, 8))
            current_time = case_start

            # Check if this case experiences rework
            has_rework = (random.random() < 0.18)

            for s_idx, (stage_name, dept_name, mean_h, std_h, breach_prob) in enumerate(stages):
                # Team selection
                assignees = departments[dept_name]
                # If Team Beta in verification, simulate 2.4x longer delay
                if dept_name == "Operations Verification" and random.random() < 0.4:
                    emp = "Team Beta (Backlogged)"
                    dur_h = max(2.0, np.random.normal(mean_h * 2.1, std_h * 1.5))
                else:
                    emp = random.choice(assignees)
                    dur_h = max(0.5, np.random.normal(mean_h, std_h))

                # If expedited, 30% faster
                if prio == "Expedited":
                    dur_h *= 0.7

                # Incur extreme duration anomaly on 4% of cases
                if random.random() < 0.04 and stage_name in ["Document Verification", "Underwriting Assessment"]:
                    dur_h *= 3.5

                event_time = current_time + timedelta(hours=dur_h)
                records.append({
                    "case_id": case_id,
                    "activity": stage_name,
                    "timestamp": event_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "department": dept_name,
                    "employee": emp,
                    "priority": prio,
                    "category": cat,
                    "status": "Completed" if s_idx == len(stages)-1 else "In Progress",
                    "cost": round(dur_h * 45.0 + random.uniform(10, 50), 2)
                })
                current_time = event_time

                # Rework trigger: return from Underwriting to Document Verification
                if has_rework and stage_name == "Underwriting Assessment":
                    rework_dur = max(4.0, np.random.normal(14.0, 4.0))
                    rework_time = current_time + timedelta(hours=rework_dur)
                    records.append({
                        "case_id": case_id,
                        "activity": "Document Verification",
                        "timestamp": rework_time.strftime("%Y-%m-%d %H:%M:%S"),
                        "department": "Operations Verification",
                        "employee": "Team Beta (Backlogged)",
                        "priority": prio,
                        "category": cat,
                        "status": "Rework Revision",
                        "cost": round(rework_dur * 45.0 + 30.0, 2)
                    })
                    current_time = rework_time
                    has_rework = False  # Only one loop per case

        return pd.DataFrame(records)

    @classmethod
    def generate_hospital_er(cls, num_cases: int = 400) -> pd.DataFrame:
        random.seed(99)
        np.random.seed(99)
        
        stages = [
            ("Patient Triage", "Emergency Triage", 0.5, 0.2),
            ("Physician Initial Exam", "Emergency Medicine", 1.8, 0.8),
            ("Diagnostic Imaging & Labs", "Radiology & Pathology", 5.2, 2.1), # Bottleneck
            ("Specialist Consultation", "Specialty Medicine", 4.1, 1.8),
            ("Inpatient Bed Allocation", "Hospital Bed Management", 6.8, 3.2), # Bottleneck
            ("Inpatient Admission", "Inpatient Ward", 1.2, 0.4)
        ]
        
        base_time = datetime(2026, 7, 10, 6, 0, 0)
        records = []

        for c_idx in range(1, num_cases + 1):
            case_id = f"PT-ER-{2000 + c_idx}"
            prio = random.choice(["ESI-1 Immediate", "ESI-2 Emergent", "ESI-3 Urgent", "ESI-4 Less Urgent"])
            cat = random.choice(["Cardiology", "Trauma & Ortho", "Internal Medicine", "Neurology"])
            
            case_start = base_time + timedelta(days=random.uniform(0, 40), hours=random.uniform(0, 23))
            current_time = case_start

            for s_idx, (stage_name, dept_name, mean_h, std_h) in enumerate(stages):
                dur_h = max(0.2, np.random.normal(mean_h, std_h))
                if prio == "ESI-1 Immediate":
                    dur_h *= 0.3
                
                # Weekend bed bottleneck
                if dept_name == "Hospital Bed Management" and current_time.weekday() in [5, 6]:
                    dur_h *= 2.2

                event_time = current_time + timedelta(hours=dur_h)
                records.append({
                    "case_id": case_id,
                    "activity": stage_name,
                    "timestamp": event_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "department": dept_name,
                    "employee": f"Staff-{random.randint(101, 125)}",
                    "priority": prio,
                    "category": cat,
                    "status": "Admitted" if s_idx == len(stages)-1 else "Pending",
                    "cost": round(dur_h * 85.0 + random.uniform(50, 200), 2)
                })
                current_time = event_time

        return pd.DataFrame(records)

    @classmethod
    def generate_university_admission(cls, num_cases: int = 450) -> pd.DataFrame:
        random.seed(77)
        np.random.seed(77)
        
        stages = [
            ("Portal Application Submission", "Admissions Intake", 1.0, 0.3),
            ("Transcript & Document Review", "Credential Evaluation", 28.5, 12.0), # Major Bottleneck
            ("Departmental Faculty Review", "Academic Faculty", 16.2, 6.5),
            ("Dean of Admissions Approval", "Admissions Board", 10.4, 4.0),
            ("Scholarship & Financial Aid", "Financial Aid Office", 18.0, 7.5), # Secondary Bottleneck
            ("Decision Letter Issued", "Registrar Office", 2.5, 0.8)
        ]
        
        base_time = datetime(2026, 6, 15, 9, 0, 0)
        records = []

        for c_idx in range(1, num_cases + 1):
            case_id = f"ADM-2026-{5000 + c_idx}"
            cat = random.choice(["Undergraduate STEM", "Graduate Business", "Medical School", "Law School"])
            prio = "International Applicant" if c_idx % 3 == 0 else "Domestic Applicant"

            case_start = base_time + timedelta(days=random.uniform(0, 50), hours=random.uniform(0, 8))
            current_time = case_start

            for s_idx, (stage_name, dept_name, mean_h, std_h) in enumerate(stages):
                dur_h = max(0.5, np.random.normal(mean_h, std_h))
                if prio == "International Applicant" and stage_name == "Transcript & Document Review":
                    dur_h *= 2.3  # International transcript verification backlog

                event_time = current_time + timedelta(hours=dur_h)
                records.append({
                    "case_id": case_id,
                    "activity": stage_name,
                    "timestamp": event_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "department": dept_name,
                    "employee": f"Evaluator-{dept_name[:3]}-{random.randint(1, 6)}",
                    "priority": prio,
                    "category": cat,
                    "status": "Enrolled" if s_idx == len(stages)-1 else "Reviewing",
                    "cost": round(dur_h * 35.0, 2)
                })
                current_time = event_time

        return pd.DataFrame(records)

    @classmethod
    def generate_it_support(cls, num_cases: int = 500) -> pd.DataFrame:
        random.seed(55)
        np.random.seed(55)
        
        stages = [
            ("Incident Created", "ServiceDesk L1", 0.4, 0.1),
            ("Initial Triage & Categorization", "ServiceDesk L1", 1.2, 0.5),
            ("Technical Investigation", "Tier 2 Support", 8.5, 3.2),
            ("Escalated Engineering Resolution", "Tier 3 DevOps / Eng", 22.4, 9.1), # Bottleneck
            ("QA & User Acceptance", "Service Quality", 6.0, 2.5),
            ("Ticket Resolved & Closed", "ServiceDesk L1", 0.8, 0.2)
        ]
        
        base_time = datetime(2026, 7, 1, 9, 0, 0)
        records = []

        for c_idx in range(1, num_cases + 1):
            case_id = f"INC-2026-{8000 + c_idx}"
            prio = random.choice(["P1-Critical", "P2-High", "P3-Medium", "P4-Low"])
            cat = random.choice(["Infrastructure Outage", "Database Lock", "API Latency", "Authentication Glitch"])

            case_start = base_time + timedelta(days=random.uniform(0, 45), hours=random.uniform(0, 10))
            current_time = case_start

            for s_idx, (stage_name, dept_name, mean_h, std_h) in enumerate(stages):
                dur_h = max(0.1, np.random.normal(mean_h, std_h))
                if prio == "P1-Critical":
                    dur_h *= 0.4

                event_time = current_time + timedelta(hours=dur_h)
                records.append({
                    "case_id": case_id,
                    "activity": stage_name,
                    "timestamp": event_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "department": dept_name,
                    "employee": f"Tech-{dept_name[-3:]}-{random.randint(1, 8)}",
                    "priority": prio,
                    "category": cat,
                    "status": "Closed" if s_idx == len(stages)-1 else "Active",
                    "cost": round(dur_h * 60.0, 2)
                })
                current_time = event_time

        return pd.DataFrame(records)
