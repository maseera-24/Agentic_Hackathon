import os
import re
import json
import copy
import datetime
import uuid
from backend.config import settings
from backend.data.seed_data import (
    STUDENTS_SEED,
    PANELS_SEED,
    ROOMS_SEED,
    COMPANIES_SEED,
    DRIVES_SEED,
    POLICIES_SEED,
    EXCEPTIONS_SEED,
    AUDIT_SEED,
    SCHEDULED_INTERVIEWS_SEED,
    COMMUNICATIONS_SEED,
    USERS_SEED,
    APPLICATIONS_SEED,
    NOTIFICATIONS_SEED
)

# Optional MongoDB Driver import
try:
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False


class Database:
    def __init__(self):
        self.data_file = settings.DATA_FILE
        self.resume_dir = settings.RESUME_DIR
        self.state = {}
        self.mongo_client = None
        self.mongo_db = None
        self.is_mongo = False

        # 1. Attempt MongoDB Atlas Connection if URI provided
        if settings.MONGODB_URI and PYMONGO_AVAILABLE:
            self._init_mongodb()

        # 2. Load or initialize database state
        self.load_or_init()

    def _init_mongodb(self):
        """Initializes connection to MongoDB Atlas with timeout protection."""
        try:
            print(f"[Database] Connecting to MongoDB Atlas: {settings.MONGODB_DB_NAME}...")
            self.mongo_client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=4000)
            # Verify connection with ping
            self.mongo_client.admin.command('ping')
            self.mongo_db = self.mongo_client[settings.MONGODB_DB_NAME]
            self.is_mongo = True
            print(f"[Database] Connected successfully to MongoDB Atlas database '{settings.MONGODB_DB_NAME}'!")
        except Exception as e:
            print(f"[Database] MongoDB Atlas connection failed ({e}). Falling back to local persistent storage.")
            self.mongo_client = None
            self.mongo_db = None
            self.is_mongo = False

    def load_or_init(self):
        os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
        os.makedirs(self.resume_dir, exist_ok=True)

        if self.is_mongo and self.mongo_db is not None:
            try:
                # Load collections from MongoDB Atlas
                collections = ["users", "students", "applications", "notifications", "drives", "panels", "rooms", "companies", "policies", "exceptions", "audit_logs", "schedules", "communications"]
                loaded_state = {}
                has_data = False
                
                for col_name in collections:
                    docs = list(self.mongo_db[col_name].find({}, {"_id": 0}))
                    loaded_state[col_name] = docs
                    if docs:
                        has_data = True

                if has_data:
                    self.state = loaded_state
                    self.state.setdefault("simulator_state", {"last_run": None, "scenarios": []})
                    self.save_to_disk() # Sync local cache
                    return
                else:
                    print("[Database] MongoDB Atlas database empty. Initializing with full seed data...")
                    self.reset_to_seed()
                    return
            except Exception as e:
                print(f"[Database] Error reading from MongoDB Atlas: {e}. Falling back to disk state.")

        # Fallback to local JSON disk persistence
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, "r", encoding="utf-8") as f:
                    self.state = json.load(f)
                    # Backwards compatibility check
                    if "users" not in self.state or not self.state["users"]:
                        self.state["users"] = copy.deepcopy(USERS_SEED)
                    if "applications" not in self.state or not self.state["applications"]:
                        self.state["applications"] = copy.deepcopy(APPLICATIONS_SEED)
                    if "notifications" not in self.state or not self.state["notifications"]:
                        self.state["notifications"] = copy.deepcopy(NOTIFICATIONS_SEED)
                    return
            except Exception as e:
                print(f"Error loading state from disk: {e}. Reinitializing with seed data.")
        
        self.reset_to_seed()

    def reset_to_seed(self):
        self.state = {
            "users": copy.deepcopy(USERS_SEED),
            "students": copy.deepcopy(STUDENTS_SEED),
            "applications": copy.deepcopy(APPLICATIONS_SEED),
            "notifications": copy.deepcopy(NOTIFICATIONS_SEED),
            "panels": copy.deepcopy(PANELS_SEED),
            "rooms": copy.deepcopy(ROOMS_SEED),
            "companies": copy.deepcopy(COMPANIES_SEED),
            "drives": copy.deepcopy(DRIVES_SEED),
            "policies": copy.deepcopy(POLICIES_SEED),
            "exceptions": copy.deepcopy(EXCEPTIONS_SEED),
            "audit_logs": copy.deepcopy(AUDIT_SEED),
            "schedules": copy.deepcopy(SCHEDULED_INTERVIEWS_SEED),
            "communications": copy.deepcopy(COMMUNICATIONS_SEED),
            "simulator_state": {
                "last_run": None,
                "scenarios": []
            }
        }
        self.save_to_disk()
        self._sync_all_to_mongo()

    def save_to_disk(self):
        try:
            with open(self.data_file, "w", encoding="utf-8") as f:
                json.dump(self.state, f, indent=2)
        except Exception as e:
            print(f"Failed to persist state to disk: {e}")

    def _sync_all_to_mongo(self):
        """Syncs in-memory collections to MongoDB Atlas if connected."""
        if not self.is_mongo or self.mongo_db is None:
            return
        try:
            for col_name, items in self.state.items():
                if isinstance(items, list):
                    col = self.mongo_db[col_name]
                    col.delete_many({})
                    if items:
                        col.insert_many([copy.deepcopy(item) for item in items])
        except Exception as e:
            print(f"[Database] MongoDB sync error: {e}")

    def _sync_collection_to_mongo(self, col_name):
        """Syncs single collection to MongoDB Atlas if connected."""
        if not self.is_mongo or self.mongo_db is None:
            return
        try:
            items = self.state.get(col_name, [])
            if isinstance(items, list):
                col = self.mongo_db[col_name]
                col.delete_many({})
                if items:
                    col.insert_many([copy.deepcopy(item) for item in items])
        except Exception as e:
            print(f"[Database] MongoDB collection sync error for '{col_name}': {e}")

    def get_connection_status(self):
        """Returns diagnostic status of the database connection."""
        if self.is_mongo and self.mongo_db is not None:
            return {
                "mode": "mongodb_atlas",
                "database_name": settings.MONGODB_DB_NAME,
                "connected": True,
                "students_count": len(self.state.get("students", [])),
                "drives_count": len(self.state.get("drives", [])),
                "applications_count": len(self.state.get("applications", []))
            }
        return {
            "mode": "local_persistent_json",
            "storage_file": self.data_file,
            "connected": True,
            "students_count": len(self.state.get("students", [])),
            "drives_count": len(self.state.get("drives", [])),
            "applications_count": len(self.state.get("applications", []))
        }

    # ==================== USERS & AUTH ====================
    def get_users(self):
        return self.state.get("users", [])

    def get_user_by_id(self, user_id):
        for u in self.state.get("users", []):
            if u.get("id") == user_id:
                return u
        return None

    def get_user_by_email(self, email):
        normalized = (email or "").strip().lower()
        for u in self.state.get("users", []):
            if u.get("email", "").strip().lower() == normalized:
                return u
            if u.get("student_id", "").strip().upper() == email.strip().upper():
                return u
        return None

    def verify_user(self, email_or_id, password):
        normalized = (email_or_id or "").strip().lower()
        id_upper = (email_or_id or "").strip().upper()
        for u in self.state.get("users", []):
            if (u.get("email", "").strip().lower() == normalized or
                u.get("student_id", "").strip().upper() == id_upper):
                if u.get("password") == password:
                    return u
        return None

    def add_user(self, user_data):
        self.state.setdefault("users", []).append(user_data)
        self.save_to_disk()
        self._sync_collection_to_mongo("users")
        return user_data

    def get_or_create_email_user(self, email, role="student"):
        """Return an email-authenticated user, creating a minimal account when needed."""
        normalized_email = (email or "").strip().lower()
        existing_user = self.get_user_by_email(normalized_email)
        if existing_user:
            return existing_user

        user = {
            "id": f"USR-{uuid.uuid4().hex[:12].upper()}",
            "email": normalized_email,
            "password": None,
            "name": normalized_email.split("@", 1)[0],
            "role": role
        }
        if role == "student":
            user["student_id"] = f"STU-{uuid.uuid4().hex[:8].upper()}"
        self.add_user(user)
        if role == "student":
            self.add_student({
                "id": user["student_id"],
                "name": user["name"],
                "email": normalized_email,
                "branch": "Not specified",
                "cgpa": 0,
                "active_backlogs": 0,
                "skills": [],
                "profile_completion": 15
            })
        return user

    # ==================== STUDENTS ====================
    def get_students(self):
        return self.state.get("students", [])

    def get_student(self, student_id):
        for s in self.state.get("students", []):
            if s.get("id") == student_id:
                return s
        return None

    def get_student_by_email(self, email):
        normalized = (email or "").strip().lower()
        for s in self.state.get("students", []):
            if s.get("email", "").strip().lower() == normalized:
                return s
        return None

    def update_student(self, student_id, updates):
        for idx, s in enumerate(self.state.get("students", [])):
            if s.get("id") == student_id:
                protected_fields = ["id", "role"]
                clean_updates = {k: v for k, v in updates.items() if k not in protected_fields}
                self.state["students"][idx].update(clean_updates)
                self.save_to_disk()
                self._sync_collection_to_mongo("students")
                return self.state["students"][idx]
        return None

    def add_student(self, student_data):
        self.state.setdefault("students", []).append(student_data)
        self.save_to_disk()
        self._sync_collection_to_mongo("students")
        return student_data

    def add_students_batch(self, added_students: list, updated_students: list):
        """Batch upsert students from Excel upload with MongoDB sync."""
        # 1. Update existing students
        for u in updated_students:
            uid = u.get("id")
            uemail = (u.get("email") or "").strip().lower()
            found = False
            for idx, s in enumerate(self.state.get("students", [])):
                if s.get("id") == uid or (s.get("email", "").strip().lower() == uemail and uemail):
                    self.state["students"][idx].update(u)
                    found = True
                    break
            if not found:
                self.state.setdefault("students", []).append(u)

        # 2. Add new students
        for a in added_students:
            self.state.setdefault("students", []).append(a)

        self.save_to_disk()
        self._sync_collection_to_mongo("students")
        return {
            "added_count": len(added_students),
            "updated_count": len(updated_students),
            "total_students": len(self.state.get("students", []))
        }

    # ==================== RESUME MANAGEMENT ====================
    def save_student_resume(self, student_id, original_filename, file_bytes):
        os.makedirs(self.resume_dir, exist_ok=True)
        safe_ext = ".pdf" if original_filename.lower().endswith(".pdf") else ""
        if not safe_ext:
            raise ValueError("Only PDF files are supported")
        
        disk_filename = f"{student_id}_resume.pdf"
        file_path = os.path.join(self.resume_dir, disk_filename)
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        
        resume_info = {
            "resume_url": f"/api/students/{student_id}/resume",
            "resume_filename": original_filename,
            "resume_uploaded_at": datetime.datetime.now().isoformat(),
            "resume_size_bytes": len(file_bytes)
        }
        self.update_student(student_id, resume_info)
        return resume_info

    def get_student_resume_path(self, student_id):
        disk_filename = f"{student_id}_resume.pdf"
        file_path = os.path.join(self.resume_dir, disk_filename)
        if os.path.exists(file_path):
            return file_path
        return None

    def delete_student_resume(self, student_id):
        disk_filename = f"{student_id}_resume.pdf"
        file_path = os.path.join(self.resume_dir, disk_filename)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error removing resume file: {e}")
        
        resume_info = {
            "resume_url": None,
            "resume_filename": None,
            "resume_uploaded_at": None,
            "resume_size_bytes": 0
        }
        self.update_student(student_id, resume_info)
        return True

    # ==================== PLACEMENT DRIVES ====================
    def get_drives(self, status=None):
        drives = self.state.get("drives", [])
        if status:
            status_upper = status.upper()
            return [d for d in drives if d.get("drive_status", d.get("status", "")).upper() == status_upper or d.get("status", "").upper() == status_upper]
        return drives

    def get_drive(self, drive_id):
        for d in self.state.get("drives", []):
            if d.get("id") == drive_id:
                return d
        return None

    def add_drive(self, drive_data):
        if "id" not in drive_data:
            company_clean = drive_data.get("company_name", "DRIVE").upper().replace(" ", "_")[:6]
            drive_data["id"] = f"DRIVE_{company_clean}_{len(self.state.get('drives', [])) + 1:03d}"
        if "drive_status" not in drive_data:
            drive_data["drive_status"] = "ACTIVE"
        if "status" not in drive_data:
            drive_data["status"] = "Active"
        if "requirements" not in drive_data:
            drive_data["requirements"] = {}
            
        self.state.setdefault("drives", []).insert(0, drive_data)
        self.save_to_disk()
        self._sync_collection_to_mongo("drives")
        return drive_data

    def update_drive(self, drive_id, updates):
        for idx, d in enumerate(self.state.get("drives", [])):
            if d.get("id") == drive_id:
                self.state["drives"][idx].update(updates)
                self.save_to_disk()
                self._sync_collection_to_mongo("drives")
                return self.state["drives"][idx]
        return None

    def delete_drive(self, drive_id):
        drives = self.state.get("drives", [])
        initial_len = len(drives)
        self.state["drives"] = [d for d in drives if d.get("id") != drive_id]
        if len(self.state["drives"]) < initial_len:
            self.save_to_disk()
            self._sync_collection_to_mongo("drives")
            return True
        return False

    # ==================== APPLICATIONS ====================
    def get_applications(self, student_id=None, drive_id=None, status=None):
        apps = self.state.get("applications", [])
        if student_id:
            apps = [a for a in apps if a.get("student_id") == student_id]
        if drive_id:
            apps = [a for a in apps if a.get("drive_id") == drive_id]
        if status:
            status_upper = status.upper()
            apps = [a for a in apps if a.get("status", "").upper() == status_upper]
        return apps

    def get_application(self, app_id):
        for a in self.state.get("applications", []):
            if a.get("id") == app_id:
                return a
        return None

    def add_application(self, app_data):
        if "id" not in app_data:
            app_data["id"] = f"APP_{len(self.state.get('applications', [])) + 1:03d}"
        if "applied_at" not in app_data:
            app_data["applied_at"] = datetime.datetime.now().isoformat()
        if "status" not in app_data:
            app_data["status"] = "APPLIED"
        if "interview_details" not in app_data:
            app_data["interview_details"] = {}
        if "result_details" not in app_data:
            app_data["result_details"] = {
                "status": app_data.get("status", "APPLIED"),
                "reason": "",
                "feedback": "Application submitted."
            }
        self.state.setdefault("applications", []).insert(0, app_data)
        self.save_to_disk()
        self._sync_collection_to_mongo("applications")
        return app_data

    def update_application(self, app_id, updates):
        for idx, a in enumerate(self.state.get("applications", [])):
            if a.get("id") == app_id:
                self.state["applications"][idx].update(updates)
                self.save_to_disk()
                self._sync_collection_to_mongo("applications")
                return self.state["applications"][idx]
        return None

    def update_application_status(self, app_id, new_status, current_round=None):
        for idx, a in enumerate(self.state.get("applications", [])):
            if a.get("id") == app_id:
                self.state["applications"][idx]["status"] = new_status
                if current_round:
                    self.state["applications"][idx]["current_round"] = current_round
                self.state["applications"][idx].setdefault("result_details", {})["status"] = new_status
                self.save_to_disk()
                self._sync_collection_to_mongo("applications")
                return self.state["applications"][idx]
        return None

    def update_application_result(self, app_id, status, reason="", feedback="", next_step="", offer_ctc=""):
        for idx, a in enumerate(self.state.get("applications", [])):
            if a.get("id") == app_id:
                self.state["applications"][idx]["status"] = status
                result_obj = {
                    "status": status,
                    "reason": reason or "",
                    "feedback": feedback or "",
                    "next_step": next_step or "",
                    "updated_at": datetime.datetime.now().isoformat()
                }
                if offer_ctc:
                    result_obj["offer_ctc"] = offer_ctc
                self.state["applications"][idx]["result_details"] = result_obj
                self.save_to_disk()
                self._sync_collection_to_mongo("applications")
                return self.state["applications"][idx]
        return None

    def assign_application_panel(self, app_id, panel_id, panel_name, date, time, venue, interviewers="", instructions=""):
        for idx, a in enumerate(self.state.get("applications", [])):
            if a.get("id") == app_id:
                self.state["applications"][idx]["interview_details"] = {
                    "panel_id": panel_id,
                    "panel_name": panel_name,
                    "interviewers": interviewers,
                    "date": date,
                    "time": time,
                    "venue": venue,
                    "instructions": instructions
                }
                if self.state["applications"][idx]["status"] in ["APPLIED", "SHORTLISTED", "ASSESSMENT"]:
                    self.state["applications"][idx]["status"] = "INTERVIEW"
                self.save_to_disk()
                self._sync_collection_to_mongo("applications")
                return self.state["applications"][idx]
        return None

    # ==================== NOTIFICATIONS ====================
    def get_notifications(self, student_id=None, unread_only=False):
        notifs = self.state.get("notifications", [])
        if student_id:
            notifs = [n for n in notifs if n.get("student_id") == student_id or n.get("student_id") == "ALL"]
        if unread_only:
            notifs = [n for n in notifs if not n.get("is_read", False)]
        return notifs

    def add_notification(self, student_id, title, message, notif_type="GENERAL", link="/applications"):
        notif = {
            "id": f"NOTIF_{len(self.state.get('notifications', [])) + 1:03d}",
            "student_id": student_id,
            "title": title,
            "message": message,
            "type": notif_type,
            "is_read": False,
            "created_at": datetime.datetime.now().isoformat(),
            "link": link or "/applications"
        }
        self.state.setdefault("notifications", []).insert(0, notif)
        self.save_to_disk()
        self._sync_collection_to_mongo("notifications")
        return notif

    def mark_notification_read(self, notif_id):
        for idx, n in enumerate(self.state.get("notifications", [])):
            if n.get("id") == notif_id:
                self.state["notifications"][idx]["is_read"] = True
                self.save_to_disk()
                self._sync_collection_to_mongo("notifications")
                return self.state["notifications"][idx]
        return None

    def mark_all_notifications_read(self, student_id):
        for idx, n in enumerate(self.state.get("notifications", [])):
            if n.get("student_id") == student_id or n.get("student_id") == "ALL":
                self.state["notifications"][idx]["is_read"] = True
        self.save_to_disk()
        self._sync_collection_to_mongo("notifications")
        return True

    # ==================== PANELS & ROOMS ====================
    def get_panels(self):
        return self.state.get("panels", [])

    def get_panel(self, panel_id):
        for p in self.state.get("panels", []):
            if p.get("id") == panel_id:
                return p
        return None

    def update_panel(self, panel_id, updates):
        for idx, p in enumerate(self.state.get("panels", [])):
            if p.get("id") == panel_id:
                self.state["panels"][idx].update(updates)
                self.save_to_disk()
                self._sync_collection_to_mongo("panels")
                return self.state["panels"][idx]
        return None

    def get_rooms(self):
        return self.state.get("rooms", [])

    def get_room(self, room_id):
        for r in self.state.get("rooms", []):
            if r.get("id") == room_id:
                return r
        return None

    def update_room(self, room_id, updates):
        for idx, r in enumerate(self.state.get("rooms", [])):
            if r.get("id") == room_id:
                self.state["rooms"][idx].update(updates)
                self.save_to_disk()
                self._sync_collection_to_mongo("rooms")
                return self.state["rooms"][idx]
        return None

    def get_companies(self):
        return self.state.get("companies", [])

    def get_company(self, company_id):
        for c in self.state.get("companies", []):
            if c.get("id") == company_id:
                return c
        return None

    def add_company(self, company_data):
        if "id" not in company_data:
            clean_name = re.sub(r'[^a-zA-Z0-9]', '_', company_data.get("name", "COMP")).upper()[:8]
            company_data["id"] = f"COMP_{clean_name}_{len(self.state.get('companies', [])) + 1:02d}"
        if "created_at" not in company_data:
            company_data["created_at"] = datetime.datetime.now().isoformat()
        if "roles" not in company_data:
            company_data["roles"] = []

        self.state.setdefault("companies", []).append(company_data)
        self.save_to_disk()
        self._sync_collection_to_mongo("companies")
        return company_data

    def update_company(self, company_id, updates):
        for idx, c in enumerate(self.state.get("companies", [])):
            if c.get("id") == company_id:
                self.state["companies"][idx].update(updates)
                self.save_to_disk()
                self._sync_collection_to_mongo("companies")
                return self.state["companies"][idx]
        return None

    def delete_company(self, company_id):
        companies = self.state.get("companies", [])
        initial_len = len(companies)
        self.state["companies"] = [c for c in companies if c.get("id") != company_id]
        if len(self.state["companies"]) < initial_len:
            self.save_to_disk()
            self._sync_collection_to_mongo("companies")
            return True
        return False

    def get_policies(self):
        return self.state.get("policies", [])

    def get_exceptions(self):
        return self.state.get("exceptions", [])

    def add_exception(self, exception_data):
        self.state.setdefault("exceptions", []).insert(0, exception_data)
        self.save_to_disk()
        self._sync_collection_to_mongo("exceptions")
        return exception_data

    def update_exception(self, exception_id, updates):
        for idx, e in enumerate(self.state.get("exceptions", [])):
            if e.get("id") == exception_id:
                self.state["exceptions"][idx].update(updates)
                self.save_to_disk()
                self._sync_collection_to_mongo("exceptions")
                return self.state["exceptions"][idx]
        return None

    def get_audit_logs(self):
        return self.state.get("audit_logs", [])

    def add_audit_log(self, action, trigger, ai_analysis, recommendation, confidence=0.95, approval_level="Automatic", human_approval="System Auto", status="Completed"):
        log_entry = {
            "id": f"AUD_{len(self.state.get('audit_logs', [])) + 1:03d}",
            "timestamp": datetime.datetime.now().isoformat(),
            "action": action,
            "trigger": trigger,
            "ai_analysis": ai_analysis,
            "recommendation": recommendation,
            "confidence": confidence,
            "approval_level": approval_level,
            "human_approval": human_approval,
            "status": status
        }
        self.state.setdefault("audit_logs", []).insert(0, log_entry)
        self.save_to_disk()
        self._sync_collection_to_mongo("audit_logs")
        return log_entry

    def get_schedules(self, drive_id=None):
        scheds = self.state.get("schedules", [])
        if drive_id:
            return [s for s in scheds if s.get("drive_id") == drive_id]
        return scheds

    def set_schedules(self, new_schedules):
        self.state["schedules"] = new_schedules
        self.save_to_disk()
        self._sync_collection_to_mongo("schedules")
        return self.state["schedules"]

    def add_schedule(self, schedule_item):
        self.state.setdefault("schedules", []).append(schedule_item)
        self.save_to_disk()
        self._sync_collection_to_mongo("schedules")
        return schedule_item

    def update_schedule(self, schedule_id, updates):
        for idx, s in enumerate(self.state.get("schedules", [])):
            if s.get("id") == schedule_id:
                self.state["schedules"][idx].update(updates)
                self.save_to_disk()
                self._sync_collection_to_mongo("schedules")
                return self.state["schedules"][idx]
        return None

    def get_schedule(self, schedule_id):
        for s in self.state.get("schedules", []):
            if s.get("id") == schedule_id:
                return s
        return None

    def get_student_schedules(self, student_id):
        return [s for s in self.state.get("schedules", []) if s.get("student_id") == student_id]

    def delete_schedule(self, schedule_id):
        scheds = self.state.get("schedules", [])
        initial_len = len(scheds)
        self.state["schedules"] = [s for s in scheds if s.get("id") != schedule_id]
        if len(self.state["schedules"]) < initial_len:
            self.save_to_disk()
            self._sync_collection_to_mongo("schedules")
            return True
        return False

    def remove_student_from_drive(self, drive_id, student_id):
        apps = self.state.get("applications", [])
        initial_len = len(apps)
        self.state["applications"] = [a for a in apps if not (a.get("drive_id") == drive_id and a.get("student_id") == student_id)]
        if len(self.state["applications"]) < initial_len:
            self.save_to_disk()
            self._sync_collection_to_mongo("applications")
            return True
        return False

    def get_drive_applications(self, drive_id):
        return self.get_applications(drive_id=drive_id)

    def get_active_drives(self):
        return self.get_drives(status="ACTIVE")

    def get_communications(self, student_id=None):
        comms = self.state.get("communications", [])
        if student_id:
            return [c for c in comms if c.get("student_id") == student_id]
        return comms

    def get_communication_logs(self, drive_id=None):
        comms = self.state.get("communications", [])
        if drive_id:
            return [c for c in comms if c.get("drive_id") == drive_id]
        return comms

    def add_communication(self, comm_data):
        if "id" not in comm_data:
            comm_data["id"] = f"COMM_{len(self.state.get('communications', [])) + 1:03d}"
        if "timestamp" not in comm_data:
            comm_data["timestamp"] = datetime.datetime.now().isoformat()
        self.state.setdefault("communications", []).insert(0, comm_data)
        self.save_to_disk()
        self._sync_collection_to_mongo("communications")
        return comm_data

db = Database()
