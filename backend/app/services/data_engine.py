import pandas as pd
import numpy as np
import io
from datetime import datetime
from typing import Dict, Any, Tuple, List, Optional
from app.models.schemas import DataQualityCheck, ColumnMapping, DataCleaningOptions, DataCleaningResult

class DataEngine:
    COLUMN_ALIASES = {
        "case_id": ["case_id", "caseid", "case", "application_id", "appid", "claim_id", "patient_id", "ticket_id", "order_id", "id", "incident_id", "request_id"],
        "activity": ["activity", "process_step", "step", "event", "task", "stage", "action", "activity_name", "status_change", "status"],
        "timestamp": ["timestamp", "date_time", "datetime", "time", "date", "created_at", "event_time", "start_time", "timestamp_utc"],
        "department": ["department", "team", "unit", "division", "dept", "branch", "group", "assigned_team", "service_unit"],
        "employee": ["employee", "assigned_to", "agent", "worker", "user", "handler", "operator", "staff", "assignee", "owner"],
        "status": ["status", "state", "result", "outcome", "case_status"],
        "priority": ["priority", "severity", "urgency", "level", "tier"],
        "category": ["category", "type", "class", "product", "service", "process_type"],
        "cost": ["cost", "expense", "amount", "charge", "price", "fee"],
        "sla": ["sla", "sla_hours", "sla_target", "target_hours", "sla_days", "threshold"],
        "location": ["location", "city", "region", "country", "site", "facility", "office"]
    }

    @classmethod
    def auto_map_columns(cls, df_columns: List[str]) -> Dict[str, str]:
        mapping = {}
        normalized_cols = {col.lower().replace(" ", "_").replace("-", "_"): col for col in df_columns}
        
        for canonical_key, aliases in cls.COLUMN_ALIASES.items():
            matched = None
            for alias in aliases:
                if alias in normalized_cols:
                    matched = normalized_cols[alias]
                    break
            if not matched:
                # Fuzzy containment check
                for norm_name, original_name in normalized_cols.items():
                    if any(alias in norm_name for alias in aliases):
                        matched = original_name
                        break
            if matched:
                mapping[canonical_key] = matched
        
        # Fallbacks for required fields if still missing
        if "case_id" not in mapping and len(df_columns) > 0:
            mapping["case_id"] = df_columns[0]
        if "activity" not in mapping and len(df_columns) > 1:
            mapping["activity"] = df_columns[1]
        if "timestamp" not in mapping and len(df_columns) > 2:
            mapping["timestamp"] = df_columns[2]

        return mapping

    @classmethod
    def inspect_and_clean(
        cls,
        df: pd.DataFrame,
        mapping: Dict[str, str],
        auto_fix: bool = True,
        options: Optional[DataCleaningOptions] = None
    ) -> Tuple[pd.DataFrame, DataQualityCheck]:
        total_rows = len(df)
        issues = []
        
        case_col = mapping.get("case_id", "case_id")
        act_col = mapping.get("activity", "activity")
        time_col = mapping.get("timestamp", "timestamp")

        missing_case_ids = int(df[case_col].isna().sum()) if case_col in df.columns else total_rows
        missing_activities = int(df[act_col].isna().sum()) if act_col in df.columns else total_rows
        
        missing_values = {col: int(df[col].isna().sum()) for col in df.columns}
        total_missing = sum(missing_values.values())
        duplicate_rows = int(df.duplicated().sum())

        invalid_timestamps = 0
        extreme_durations = 0
        out_of_order_events = 0

        clean_df = df.copy()

        if time_col in clean_df.columns:
            try:
                clean_df["_parsed_time"] = pd.to_datetime(clean_df[time_col], errors="coerce")
                invalid_timestamps = int(clean_df["_parsed_time"].isna().sum())
            except Exception:
                invalid_timestamps = total_rows

        if missing_case_ids > 0:
            issues.append(f"{missing_case_ids} rows are missing a unique Case Identifier.")
        if missing_activities > 0:
            issues.append(f"{missing_activities} rows have missing Activity names.")
        if duplicate_rows > 0:
            issues.append(f"{duplicate_rows} duplicate record rows detected.")
        if invalid_timestamps > 0:
            issues.append(f"{invalid_timestamps} rows contain unparseable or corrupted timestamps.")

        opts = options or DataCleaningOptions()

        if auto_fix:
            # 1. Remove duplicate rows
            if opts.remove_duplicates:
                clean_df = clean_df.drop_duplicates()
            
            # 2. Drop rows with null case_id or activity
            if opts.remove_missing_identifiers and case_col in clean_df.columns and act_col in clean_df.columns:
                clean_df = clean_df.dropna(subset=[case_col, act_col])

            # 3. Clean and standardize timestamps
            if opts.standardize_timestamps and time_col in clean_df.columns:
                clean_df["_parsed_time"] = pd.to_datetime(clean_df[time_col], errors="coerce")
                clean_df = clean_df.dropna(subset=["_parsed_time"])
                clean_df[time_col] = clean_df["_parsed_time"].dt.strftime("%Y-%m-%d %H:%M:%S")

            # 4. Fill optional missing values with standard defaults
            if opts.fill_missing_departments:
                for opt_key, default_val in [("department", "Unassigned"), ("employee", "System"), ("priority", "Normal"), ("status", "Completed"), ("category", "Standard")]:
                    if opt_key in mapping and mapping[opt_key] in clean_df.columns:
                        col_name = mapping[opt_key]
                        clean_df[col_name] = clean_df[col_name].fillna(default_val).astype(str).str.strip()

            # 5. Normalize text casing if requested
            if opts.normalize_text:
                if act_col in clean_df.columns:
                    clean_df[act_col] = clean_df[act_col].astype(str).str.strip()

            # 6. Sort events chronologically per case
            if opts.sort_chronological and case_col in clean_df.columns and "_parsed_time" in clean_df.columns:
                clean_df = clean_df.sort_values(by=[case_col, "_parsed_time"]).reset_index(drop=True)

        # Calculate Data Quality Score (0-100)
        penalty = 0
        if total_rows > 0:
            penalty += (missing_case_ids / total_rows) * 35
            penalty += (missing_activities / total_rows) * 25
            penalty += (invalid_timestamps / total_rows) * 20
            penalty += (duplicate_rows / total_rows) * 10
            penalty += min(10, (total_missing / (total_rows * max(1, len(df.columns)))) * 20)
        
        quality_score = max(5, min(100, int(100 - penalty)))

        if "_parsed_time" in clean_df.columns:
            clean_df = clean_df.drop(columns=["_parsed_time"])

        quality_report = DataQualityCheck(
            score=quality_score,
            total_rows=total_rows,
            total_cases=int(clean_df[case_col].nunique()) if case_col in clean_df.columns else 0,
            missing_values=missing_values,
            duplicate_rows=duplicate_rows,
            invalid_timestamps=invalid_timestamps,
            missing_case_ids=missing_case_ids,
            missing_activities=missing_activities,
            out_of_order_events=out_of_order_events,
            extreme_durations=extreme_durations,
            issues=issues if issues else ["No significant data quality issues detected."],
            auto_fix_applied=auto_fix,
            cleaned_rows=len(clean_df)
        )

        return clean_df, quality_report

    @classmethod
    def clean_with_report(
        cls,
        df: pd.DataFrame,
        mapping: Dict[str, str],
        options: DataCleaningOptions
    ) -> Tuple[pd.DataFrame, DataCleaningResult]:
        before_rows = len(df)
        _, quality_before = cls.inspect_and_clean(df, mapping, auto_fix=False)
        
        cleaned_df, quality_after = cls.inspect_and_clean(df, mapping, auto_fix=True, options=options)
        after_rows = len(cleaned_df)

        result = DataCleaningResult(
            before_rows=before_rows,
            after_rows=after_rows,
            dropped_duplicates=before_rows - len(df.drop_duplicates()),
            dropped_missing=quality_before.missing_case_ids + quality_before.missing_activities,
            fixed_timestamps=quality_before.invalid_timestamps,
            normalized_fields=len(cleaned_df),
            quality_score_before=quality_before.score,
            quality_score_after=quality_after.score,
            quality_report=quality_after
        )
        return cleaned_df, result

    @classmethod
    def load_bytes_to_dataframe(cls, file_bytes: bytes, filename: str) -> pd.DataFrame:
        lower_name = filename.lower()
        if lower_name.endswith(".csv") or lower_name.endswith(".txt"):
            try:
                return pd.read_csv(io.BytesIO(file_bytes), encoding="utf-8")
            except UnicodeDecodeError:
                return pd.read_csv(io.BytesIO(file_bytes), encoding="latin1")
        elif lower_name.endswith(".xlsx") or lower_name.endswith(".xls"):
            return pd.read_excel(io.BytesIO(file_bytes))
        elif lower_name.endswith(".json"):
            return pd.read_json(io.BytesIO(file_bytes))
        else:
            raise ValueError(f"Unsupported file format: {filename}. Please upload a CSV, XLSX, or JSON file.")
