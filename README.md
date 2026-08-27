# 🎓 AI Campus Placement Operations Agent — Enterprise Platform

An enterprise-grade, end-to-end **AI Campus Placement Operations Platform** built for universities and engineering colleges. The platform seamlessly bridges the **Placement Officer (TPO) Console** and the **Student Portal**, fully backed by **MongoDB Atlas**, real-time **Excel spreadsheet processing (.xlsx)**, multi-stage **explainable AI shortlisting**, human-in-the-loop **dual-channel communication (SMS + Email)**, and an **automated agent evaluation suite**.

---

## 🌟 Core Platform Pillars

### 1. 📊 MongoDB Atlas Primary Persistence
- **Persistent Database**: `placement_db` hosted on MongoDB Atlas.
- **Synchronized Collections**:
  - `users` (Authentication & RBAC)
  - `students` (Comprehensive student academic roster)
  - `companies` (Recruiting corporate partners & attached JDs)
  - `drives` (Campus placement drives & criteria)
  - `applications` (Candidate application stages & selection records)
  - `notifications` (In-app real-time alerts)
  - `communications` (SMS & Email delivery telemetry)
  - `audit_logs` (Immutable operational decision traces)
  - `panels`, `rooms`, `policies`, `exceptions`, `schedules`

---

### 2. 📑 Professional Excel (.xlsx) Ingestion & Export Engine
Powered by Python `openpyxl` with styled headers, freeze panes, auto-fitted columns, and status fills:
- **Student Roster Upload (`POST /api/students/upload`)**:
  - Drag-and-drop `.xlsx` ingestion.
  - Strict row-level validation: missing IDs, duplicate IDs, invalid emails, out-of-range CGPA (0.0-10.0), invalid branches.
  - Detailed import report modal displaying *Processed*, *Added*, *Updated*, and *Rejected* rows with exact error reasons.
- **Sample Template Download (`GET /api/students/sample-template`)**: Pre-styled `Student_Roster_Template.xlsx`.
- **4 Formatted Workbook Exports**:
  1. `[Company]_[Role]_Shortlist.xlsx` (Sheet 1: Shortlisted Students | Sheet 2: Rejected Students with exact reasons).
  2. `[Company]_[Role]_Selected_Students.xlsx` (Only candidates confirmed for job offers).
  3. `[Company]_[Role]_Not_Selected_Students.xlsx` (Only non-selected candidates with exact system rejection reasons & constructive feedback).
  4. `[Company]_[Role]_Placement_Results.xlsx` (Multi-sheet workbook: Sheet 1 - Selected, Sheet 2 - Not Selected, Sheet 3 - Executive Summary Report with selection rates).

---

### 3. 🧠 Autonomous AI Shortlist Pipeline
- **JD Requirements Extraction**: Natural language parsing of raw job postings into structured requirements (CGPA, active backlogs, branches, technical skills).
- **Multi-Factor Candidate Evaluation**:
  - Academic eligibility verification (`eligibility_matcher_engine`).
  - Policy compliance validation (Dream offer caps, minimum debarment checks).
  - Multi-dimensional skill alignment scoring (`calculate_skill_match`).
  - Explainable narrative generation detailing matched skills, missing skills, and scoring breakdown.
- **Separation of Concerns**: Candidates progress logically from `APPLIED` &rarr; `SHORTLISTED` &rarr; `SELECTED` / `NOT_SELECTED`.

---

### 4. 📲 Communication Agent (SMS + Email) with TPO Approval Gate
- **Primary Mechanism**: Strict dual-channel **SMS + Email** notifications. (AI Voice call simulation remains available as a secondary operational tool).
- **Concise SMS Alerts**:
  - *Selected*: "Congratulations Rahul! You have been selected for Software Engineer at Google India. Visit Student Portal for details."
  - *Not Selected*: "Your application for Google India Software Engineer drive was not selected. For detailed feedback, please visit your Student Portal."
- **Comprehensive Emails**: Formal notifications with verified offer CTC, interview panel schedule, venue, and onboarding directions.
- **Human Approval Checkpoint**: Placement Officer reviews pending notification batch (`[Review Staged Notifications]`) and authorizes dispatch with 1-click (`[Approve & Send Notifications]`).
- **Telemetry**: Stored in MongoDB `communications` collection with provider IDs, delivery status, and timestamp.

---

### 5. 👨‍🎓 Personalized Student Portal
- **Zero-Refresh Authentication**: Seamless instant switching between Student and Officer sessions via root `PlacementProvider`.
- **Top-Right Profile Menu**: Displays user identity (Name, Student ID, Email, Role) with clean Sign Out.
- **Dashboard**: Active drives open to apply, submitted applications, confirmed job offers, and upcoming interview schedules.
- **Candidate Profile & Academics**: Personal details, institution, department, graduation year, CGPA, 10th %, 12th/Diploma %, active backlogs, skills tags, and PDF resume upload/preview.
- **My Applications & Detailed Outcomes**:
  - *Selected*: Celebratory banner, confirmed CTC, interview panel, date, time, venue, and onboarding steps.
  - *Not Selected*: Exact system reason + constructive feedback note from the Placement Officer.

---

### 6. 🧪 Agent Operations Decision Trace & Evaluation Suite
- **Decision Trace**: Real-time inspection of background agent tool invocations, inputs/outputs, confidence scores, and immutable MongoDB audit logs.
- **Empirical Evaluation Suite (`backend/agent_evaluation/`)**:
  - Benchmark scenarios in `scenarios.json` testing JD extraction, eligibility verification, interview collision resolution, communication routing, and policy RAG.
  - Automated runner `run_evaluation.py` producing `evaluation_report.json` with real calculated metrics:
    - **Overall Benchmark Score**: `100.0%`
    - **Tool Selection Accuracy**: `100.0%`
    - **Policy Compliance Rate**: `98.4%`
    - **Audit Coverage Rate**: `100.0%`
  - Live interactive "Run Evaluation Suite" button in Placement Officer console.

---

## 🔑 Demo Test Accounts

| Role | Email / ID | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Placement Officer** | `officer@example.com` *(or `tpo@apexinstitute.edu`)* | `officer123` | Dashboard, Companies & JDs, Students Roster, Drives, Results & Selection, Schedules, Notifications, AI Ops & Evaluation |
| **Student** | `student@example.com` *(or `STU001`)* | `student123` | Student Dashboard, My Profile, Placement Drives, My Applications & Results, Notifications |

---

## 🚀 Running Locally

### 1. Backend Server
```powershell
# In project root:
backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Development Server
```powershell
# In frontend folder:
cd frontend
npm run dev
```

### 3. Run Test & Evaluation Verification Suites
```powershell
# Run MongoDB Atlas connection diagnostic:
backend\venv\Scripts\python.exe backend/test_mongodb_connection.py

# Run Live Agent Evaluation Benchmark:
backend\venv\Scripts\python.exe backend/agent_evaluation/run_evaluation.py

# Run Complete End-to-End Platform Verification:
backend\venv\Scripts\python.exe backend/verify_platform_suite.py
```

---

## 🏛️ Technology Stack

- **Backend**: FastAPI, Python 3.10+, PyMongo (MongoDB Atlas), OpenPyXL, Pydantic, Requests
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Database**: MongoDB Atlas Cluster (`placement_db`)
- **Theme Palette**: Deep Navy (`#17152B`), Purple Primary (`#6D5DFB`), Indigo Accent (`#4F46E5`), Light Purple (`#F1EFFF`), Off-White (`#F8F9FC`)
