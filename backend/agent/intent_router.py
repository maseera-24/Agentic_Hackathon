import re
from typing import Dict, Any, Optional, Tuple
from backend.data.db import db

class IntentRouter:
    """
    Intelligent Natural Language Intent Classifier & Parameter Extractor
    for Campus Placement Operations & Interview Coordination Agent.
    """

    def extract_drive_id(self, query: str, active_drive_id: str = None) -> Tuple[Optional[str], Optional[str]]:
        """
        Extracts company/drive from query text or falls back to active drive.
        Returns: (drive_id, company_name)
        """
        drives = db.get_drives()
        q_lower = query.lower()

        # Check explicit company mentions in prompt
        for d in drives:
            c_name = d.get("company_name", "").lower()
            role = d.get("role_title", "").lower()
            c_short = c_name.split()[0] if c_name else ""

            if c_name and c_name in q_lower:
                return d.get("id"), d.get("company_name")
            if c_short and len(c_short) > 2 and c_short in q_lower:
                return d.get("id"), d.get("company_name")
            if role and role in q_lower:
                return d.get("id"), d.get("company_name")

        # Fallback to active drive or first drive
        if active_drive_id:
            active_d = db.get_drive(active_drive_id)
            if active_d:
                return active_d.get("id"), active_d.get("company_name")

        if drives:
            return drives[0].get("id"), drives[0].get("company_name")

        return "DRIVE_GOOGLE_2026", "Google India"

    def extract_student_id(self, query: str, context_student_id: str = None) -> Tuple[Optional[str], Optional[str]]:
        """
        Extracts student name or ID from query text.
        Returns: (student_id, student_name)
        """
        q_lower = query.lower()
        students = db.get_students()

        # Check explicit ID match (e.g. STU001, stu003)
        id_match = re.search(r"\b(stu\d+)\b", q_lower)
        if id_match:
            target_id = id_match.group(1).upper()
            st = db.get_student(target_id)
            if st:
                return target_id, st.get("name")

        # Check student name match
        for s in students:
            name = s.get("name", "").lower()
            first_name = name.split()[0] if name else ""
            if name and name in q_lower:
                return s.get("id"), s.get("name")
            if first_name and len(first_name) > 2 and first_name in q_lower:
                return s.get("id"), s.get("name")

        if context_student_id:
            st = db.get_student(context_student_id)
            if st:
                return st.get("id"), st.get("name")

        return "STU001", "Rahul Sharma"

    def extract_time_and_date(self, query: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Extracts time (e.g., '15:00', '14:00', '10:00') and date from natural language request.
        """
        q_lower = query.lower()
        target_date = "2026-08-30" if "tomorrow" in q_lower else "2026-08-29"

        # Match explicit hour PM/AM (e.g. "3 PM", "3:00 PM", "2:30 PM", "10 AM", "at 3")
        time_match = re.search(r"\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b", q_lower)
        if time_match:
            hr = int(time_match.group(1))
            mins = time_match.group(2) or "00"
            ampm = time_match.group(3) or ("pm" if hr < 8 else "am")
            if ampm == "pm" and hr < 12:
                hr += 12
            elif ampm == "am" and hr == 12:
                hr = 0
            target_time = f"{hr:02d}:{mins}"
        elif "afternoon" in q_lower:
            target_time = "14:00"
        elif "morning" in q_lower:
            target_time = "10:00"
        else:
            target_time = "15:00"

        return target_date, target_time

    def extract_room_or_panel(self, query: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Extracts room (e.g. Block B Room 204) and panel from query.
        """
        q_lower = query.lower()
        room_match = re.search(r"\b(block\s+[a-z]\s*(?:-\s*)?room\s*\d+|room\s*\d+)\b", q_lower)
        room = room_match.group(1).title() if room_match else None

        panel_match = re.search(r"\b(panel\s*\d+|panel\s*[a-z])\b", q_lower)
        panel = panel_match.group(1).title() if panel_match else None

        return room, panel

    def classify_intent(self, message: str, role: str = "placement_officer", context: dict = None) -> Dict[str, Any]:
        """
        Classifies user query into structured intent and parameters.
        Enforces clear priority ordering to prevent generic keyword collisions.
        """
        context = context or {}
        active_drive_id = context.get("active_drive") or "DRIVE_GOOGLE_2026"
        is_student_role = (role == "student" or context.get("user_role") == "student")

        if is_student_role:
            context_student_id = context.get("student_id") or "STU001"
        else:
            context_student_id = context.get("selected_student_id") or "STU001"

        msg = message.strip()
        m_lower = msg.lower()

        drive_id, company_name = self.extract_drive_id(msg, active_drive_id)
        student_id, student_name = self.extract_student_id(msg, context_student_id)
        if is_student_role and context.get("student_id"):
            student_id = context.get("student_id")

        target_date, target_time = self.extract_time_and_date(msg)
        target_room, target_panel = self.extract_room_or_panel(msg)

        params = {
            "drive_id": drive_id,
            "company_name": company_name,
            "student_id": student_id,
            "student_name": student_name,
            "target_date": target_date,
            "target_time": target_time,
            "target_room": target_room,
            "target_panel": target_panel,
            "raw_message": message
        }

        # -------------------------------------------------------------
        # 1. STUDENT INTENTS (Role-scoped or Student questions)
        # -------------------------------------------------------------
        if role == "student" or context.get("user_role") == "student":
            if any(w in m_lower for w in ["what drive", "can i apply", "eligible drive", "eligible for", "available drive", "open drive", "which drive", "drives i am eligible", "drives can i"]):
                return {"intent": "STUDENT_ELIGIBLE_DRIVES", "params": params, "confidence": 0.95}
            if any(w in m_lower for w in ["my application", "applied drive", "drives applied", "applied to", "submitted application", "my submitted application", "applications"]):
                return {"intent": "STUDENT_APPLIED_DRIVES", "params": params, "confidence": 0.95}
            if any(w in m_lower for w in ["my interview", "interview schedule", "interview slot", "upcoming interview", "when is my interview", "my scheduled interview"]):
                return {"intent": "STUDENT_INTERVIEW_SCHEDULE", "params": params, "confidence": 0.95}
            if any(w in m_lower for w in ["my result", "placement result", "am i selected", "offer status", "selection result", "my placement status", "am i placed"]):
                return {"intent": "STUDENT_RESULTS", "params": params, "confidence": 0.95}
            if any(w in m_lower for w in ["am i eligible", "check eligibility", "eligibility for"]):
                return {"intent": "STUDENT_CHECK_ELIGIBILITY", "params": params, "confidence": 0.95}

            if any(w in m_lower for w in ["my skill gap", "skill deficit", "my gaps", "improve skills", "what skills do i lack"]):
                return {"intent": "STUDENT_SKILL_GAPS", "params": params, "confidence": 0.95}
            if any(w in m_lower for w in ["my readiness", "readiness score", "placement readiness"]):
                return {"intent": "STUDENT_READINESS", "params": params, "confidence": 0.95}

        # -------------------------------------------------------------
        # 2. EXCEL GENERATION & DOWNLOAD INTENTS (High Priority)
        # -------------------------------------------------------------
        if any(w in m_lower for w in ["excel", "xlsx", "spreadsheet", "download", "export", "give me the file", "generate report", "csv"]):
            if any(w in m_lower for w in ["not selected", "rejected", "unselected", "failed"]):
                return {"intent": "DOWNLOAD_NOT_SELECTED_EXCEL", "params": params, "confidence": 0.98}
            if any(w in m_lower for w in ["selected", "selection", "placed", "hired", "offer"]):
                if not any(w in m_lower for w in ["all", "complete"]):
                    return {"intent": "DOWNLOAD_SELECTED_EXCEL", "params": params, "confidence": 0.98}
            return {"intent": "DOWNLOAD_COMPLETE_RESULTS_EXCEL", "params": params, "confidence": 0.95}

        # -------------------------------------------------------------
        # 3. RESCHEDULING & TIME MODIFICATIONS (High Priority)
        # -------------------------------------------------------------
        if any(w in m_lower for w in ["move all", "reschedule all", "bulk reschedule", "shift all"]):
            return {"intent": "BULK_RESCHEDULE_INTERVIEWS", "params": params, "confidence": 0.97}

        if any(w in m_lower for w in ["move", "reschedule", "change slot", "change interview", "shift slot", "reschedule to", "move rahul", "move interview"]):
            return {"intent": "RESCHEDULE_INTERVIEW", "params": params, "confidence": 0.97}

        if any(w in m_lower for w in ["change room", "move room", "assign room"]):
            return {"intent": "CHANGE_ROOM", "params": params, "confidence": 0.95}

        # -------------------------------------------------------------
        # 4. WHY / EXPLAINABILITY / FIT ANALYSIS (High Priority)
        # -------------------------------------------------------------
        if any(w in m_lower for w in ["explain fit", "explain rahul", "why was", "why isn't", "why is not", "explain candidate", "fit for", "best skill match", "explain match", "reason for"]):
            if any(w in m_lower for w in ["reject", "not selected", "ineligible", "failed", "isn't", "is not"]):
                return {"intent": "EXPLAIN_REJECTION", "params": params, "confidence": 0.95}
            return {"intent": "EXPLAIN_FIT", "params": params, "confidence": 0.96}

        # -------------------------------------------------------------
        # 5. NOTIFICATION & DISPATCH INTENTS (High Priority)
        # -------------------------------------------------------------
        if any(w in m_lower for w in ["notify", "send email", "send sms", "send message", "dispatch notification", "send results", "alert candidate", "send notification", "rejection notification"]):
            if any(w in m_lower for w in ["not selected", "rejected", "unselected", "rejection", "feedback"]):
                return {"intent": "NOTIFY_NOT_SELECTED", "params": params, "confidence": 0.96}
            return {"intent": "NOTIFY_SELECTED", "params": params, "confidence": 0.96}

        # -------------------------------------------------------------
        # 6. SELECTION & REJECTION ACTIONS (High Priority)
        # -------------------------------------------------------------
        if any(w in m_lower for w in ["select the top", "select top", "select candidates", "finalize offers", "give offers to"]):
            return {"intent": "SELECT_CANDIDATES", "params": params, "confidence": 0.96}

        if any(w in m_lower for w in ["reject everyone", "reject all", "reject non-selected", "reject applicants"]):
            return {"intent": "REJECT_CANDIDATES", "params": params, "confidence": 0.96}

        # -------------------------------------------------------------
        # 7. CONFLICTS & TIMETABLE
        # -------------------------------------------------------------
        if any(w in m_lower for w in ["resolve conflict", "resolve scheduling", "fix conflict", "fix overlap", "auto buffer shift", "resolve"]):
            return {"intent": "RESOLVE_CONFLICTS", "params": params, "confidence": 0.96}

        if any(w in m_lower for w in ["conflict", "overlap", "collision", "double book", "scheduling conflicts"]):
            return {"intent": "DETECT_CONFLICTS", "params": params, "confidence": 0.95}

        if any(w in m_lower for w in ["today's interview", "today interview", "todays interview", "interviews today", "schedule today"]):
            return {"intent": "GET_TODAY_INTERVIEWS", "params": params, "confidence": 0.95}

        if any(w in m_lower for w in ["schedule interview", "generate schedule", "slot candidate", "create timetable", "schedule for"]):
            return {"intent": "SCHEDULE_INTERVIEWS", "params": params, "confidence": 0.95}

        # -------------------------------------------------------------
        # 8. ACTIVE DRIVES & PLACEMENT STATUS
        # -------------------------------------------------------------
        if any(w in m_lower for w in ["what drive", "what drives are active", "which companies are visiting", "show ongoing", "happening on campus", "show current drives", "what placement drives", "drives are going on", "active drives"]):
            return {"intent": "GET_ACTIVE_DRIVES", "params": params, "confidence": 0.97}

        if any(w in m_lower for w in ["not selected", "rejected", "unselected", "failed candidates", "rejection reason", "weren't selected", "werent selected", "were not selected", "wasn't selected"]):
            return {"intent": "GET_NOT_SELECTED_STUDENTS", "params": params, "confidence": 0.96}

        if any(w in m_lower for w in ["who got selected", "who is selected", "selected student", "selected candidate", "which students are selected", "show selected", "give me the selected"]):
            return {"intent": "GET_SELECTED_STUDENTS", "params": params, "confidence": 0.97}

        # -------------------------------------------------------------
        # 9. ELIGIBILITY & MATCHING INTENTS
        # -------------------------------------------------------------
        if any(w in m_lower for w in ["eligible", "eligibility", "who can apply", "qualify", "qualification", "who is eligible"]):
            return {"intent": "CHECK_ELIGIBILITY", "params": params, "confidence": 0.95}

        if any(w in m_lower for w in ["top candidate", "rank", "ranking", "match candidate", "skill match", "shortlist", "best fit"]):
            return {"intent": "MATCH_CANDIDATES", "params": params, "confidence": 0.95}

        if any(w in m_lower for w in ["analyze jd", "job description", "parse jd", "analyze this jd", "extract requirements"]):
            return {"intent": "ANALYZE_JD", "params": params, "confidence": 0.95}

        # -------------------------------------------------------------
        # 10. INSIGHTS, READINESS & SKILL GAPS
        # -------------------------------------------------------------
        if any(w in m_lower for w in ["skill gap", "skill deficit", "missing skill", "weak skill"]):
            return {"intent": "GET_SKILL_GAPS", "params": params, "confidence": 0.95}

        if any(w in m_lower for w in ["readiness", "placement readiness", "preparedness"]):
            return {"intent": "GET_PLACEMENT_READINESS", "params": params, "confidence": 0.95}

        # -------------------------------------------------------------
        # 11. SYSTEM LOGS, PANELS, ROOMS & DATA INTENTS
        # -------------------------------------------------------------
        if any(w in m_lower for w in ["panel", "available panel", "show panel", "list panel", "interview panel"]):
            return {"intent": "GET_AVAILABLE_PANELS", "params": params, "confidence": 0.95}

        if any(w in m_lower for w in ["room", "available room", "show room", "list room", "interview room"]):
            return {"intent": "GET_AVAILABLE_ROOMS", "params": params, "confidence": 0.95}

        if any(w in m_lower for w in ["communication log", "sms log", "email log", "message log"]):
            return {"intent": "GET_COMMUNICATION_LOGS", "params": params, "confidence": 0.95}

        if any(w in m_lower for w in ["audit log", "agent audit", "system audit", "agent log", "audit trail"]):
            return {"intent": "GET_AUDIT_LOGS", "params": params, "confidence": 0.95}

        if any(w in m_lower for w in ["drive stat", "statistics", "stats", "drive summary", "overview", "placement stat"]):
            return {"intent": "GET_DRIVE_STATISTICS", "params": params, "confidence": 0.95}

        if any(w in m_lower for w in ["registered student", "all student", "student roster", "show student", "list student", "show all registered", "all registered"]):
            return {"intent": "GET_STUDENTS", "params": params, "confidence": 0.95}

        if any(w in m_lower for w in ["show company", "list company", "all companies", "recruiters", "registered companies"]):
            return {"intent": "GET_COMPANIES", "params": params, "confidence": 0.95}

        # Navigation shortcuts
        if any(w in m_lower for w in ["take me to", "go to", "open", "navigate"]):
            return {"intent": "NAVIGATE", "params": params, "confidence": 0.90}

        return {"intent": "GENERAL_HELP", "params": params, "confidence": 0.70}

intent_router = IntentRouter()
