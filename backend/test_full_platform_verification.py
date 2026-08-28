import os
import sys
import io
import json
import openpyxl

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.main import app
from backend.config import settings

def run_full_verification():
    print("=" * 70)
    print("STARTING FULL PLATFORM VERIFICATION TEST SUITE")
    print("=" * 70)

    client = TestClient(app)

    # 1. Health Check
    print("\n[1] Testing /api/health ...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health_data = res.json()
    assert health_data.get("status") == "healthy"
    print("    [PASS] Health check OK:", health_data.get("service"))

    # 2. Demo Accounts
    print("\n[2] Testing /api/auth/demo-accounts ...")
    res = client.get("/api/auth/demo-accounts")
    assert res.status_code == 200
    accounts = res.json()
    assert len(accounts) >= 2
    print(f"    [PASS] Retrieved {len(accounts)} demo accounts")

    # 3. Student 2-Step OTP Authentication Flow (Password-Free)
    print("\n[3] Testing Student 2-Step OTP Authentication (Password-Free) ...")
    login_init_res = client.post("/api/auth/login", json={
        "email": "student@example.com",
        "role": "student"
    })
    assert login_init_res.status_code == 200, f"Login init failed: {login_init_res.text}"
    login_init = login_init_res.json()
    assert login_init.get("status") == "otp_required"
    session_id = login_init.get("session_id")
    dev_otp = login_init.get("dev_otp")
    assert session_id, "Missing session_id in response"
    assert dev_otp, "Missing dev_otp in demo mode"
    print(f"    [PASS] Step 1 Login Init OK: Session={session_id[:8]}..., Masked={login_init.get('email_masked')}")

    # Test Invalid OTP Code (Rate limit test)
    bad_otp_res = client.post("/api/auth/verify-otp", json={
        "session_id": session_id,
        "otp": "000000"
    })
    assert bad_otp_res.status_code == 400
    assert "remaining" in bad_otp_res.json().get("detail", "").lower()
    print("    [PASS] Invalid OTP caught with remaining attempts warning")

    # Step 2: Verify with correct OTP
    verify_res = client.post("/api/auth/verify-otp", json={
        "session_id": session_id,
        "otp": dev_otp
    })
    assert verify_res.status_code == 200, f"OTP verification failed: {verify_res.text}"
    auth_data = verify_res.json()
    assert auth_data.get("status") == "success"
    student_token = auth_data.get("token")
    student_user = auth_data.get("user")
    assert student_user.get("role") == "student"
    assert "student_profile" in student_user
    print(f"    [PASS] Step 2 Verify OTP OK: Authenticated Student={student_user.get('name')}")

    # 4. Officer OTP Login Flow (Password-Free)
    print("\n[4] Testing Placement Officer 2-Step OTP Authentication (Password-Free) ...")
    off_init_res = client.post("/api/auth/login", json={
        "email": "vu.241fa04a54@gmail.com",
        "role": "placement_officer"
    })
    assert off_init_res.status_code == 200
    off_init = off_init_res.json()
    assert off_init.get("status") == "otp_required"
    off_session_id = off_init.get("session_id")
    off_otp = off_init.get("dev_otp")

    off_verify_res = client.post("/api/auth/verify-otp", json={
        "session_id": off_session_id,
        "otp": off_otp
    })
    assert off_verify_res.status_code == 200
    off_auth = off_verify_res.json()
    officer_token = off_auth.get("token")
    officer_user = off_auth.get("user")
    assert officer_user.get("role") == "placement_officer"
    print(f"    [PASS] Officer Authenticated: {officer_user.get('name')}")

    # 5. Officer Headers
    officer_headers = {"Authorization": f"Bearer {officer_token}"}
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 6. Check /api/auth/me
    print("\n[5] Testing /api/auth/me for both roles ...")
    me_student = client.get("/api/auth/me", headers=student_headers)
    assert me_student.status_code == 200
    assert me_student.json().get("role") == "student"

    me_officer = client.get("/api/auth/me", headers=officer_headers)
    assert me_officer.status_code == 200
    assert me_officer.json().get("role") == "placement_officer"
    print("    [PASS] /api/auth/me verified for student and officer")

    # 7. Staged Notifications & Approval Dispatch
    print("\n[6] Testing Notification Review & Dispatch ...")
    staged_res = client.get("/api/communication/staged-notifications", headers=officer_headers)
    assert staged_res.status_code == 200
    staged = staged_res.json()
    print(f"    [PASS] Staged notifications retrieved: Total={staged.get('total_staged')}, Selected={staged.get('selected_count')}, Not Selected={staged.get('not_selected_count')}")

    # Approve and send
    approve_res = client.post("/api/communication/approve_and_send", json={}, headers=officer_headers)
    assert approve_res.status_code == 200
    approve_data = approve_res.json()
    assert approve_data.get("status") == "success"
    print(f"    [PASS] Dispatched notifications: {approve_data.get('message')}")

    # 8. Communication Logs Audit
    print("\n[7] Testing Communication Logs ...")
    logs_res = client.get("/api/communication/logs", headers=officer_headers)
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert len(logs) > 0
    sample_comm = logs[0]
    assert "channel" in sample_comm
    assert "status" in sample_comm
    assert "recipient" in sample_comm
    print(f"    [PASS] Verified {len(logs)} communication dispatch audit entries in database")

    # 9. Excel Results Export (2 Sheets + 14 Columns)
    print("\n[8] Testing Excel Export (Selected + Not Selected Sheets) ...")
    export_res = client.get("/api/drives/DRIVE_GOOGLE_2026/results/export/all", headers=officer_headers)
    assert export_res.status_code == 200
    assert "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" in export_res.headers.get("content-type", "")
    assert "placement_results" in export_res.headers.get("content-disposition", "")

    # Parse openpyxl workbook in memory
    wb = openpyxl.load_workbook(io.BytesIO(export_res.content))
    sheet_names = wb.sheetnames
    assert "Selected Students" in sheet_names, f"Missing 'Selected Students' sheet: {sheet_names}"
    assert "Not Selected Students" in sheet_names, f"Missing 'Not Selected Students' sheet: {sheet_names}"

    ws1 = wb["Selected Students"]
    headers1 = [cell.value for cell in ws1[1]]
    expected_cols = ["Student ID", "Student Name", "Email", "Phone", "Branch", "CGPA", "Company", "Role", "Skill Match", "Eligibility", "Selection Status", "Reason / Feedback", "Drive", "Date"]
    for col in expected_cols:
        assert col in headers1, f"Missing required column '{col}' in Selected Students sheet"

    ws2 = wb["Not Selected Students"]
    headers2 = [cell.value for cell in ws2[1]]
    for col in expected_cols:
        assert col in headers2, f"Missing required column '{col}' in Not Selected Students sheet"

    print(f"    [PASS] Excel Workbook verified: Sheets={sheet_names}, Total Columns={len(headers1)} (all 14 required columns present)")

    # 10. AI Operations Agent Prompts
    print("\n[9] Testing AI Placement Operations Agent Prompts ...")
    test_prompts = [
        "Analyze this job description",
        "Find eligible students for active drive",
        "Show the top candidates and rank by skill match",
        "Why was Rahul selected? Explain candidate match.",
        "Schedule interviews for eligible candidates",
        "Check for scheduling conflicts",
        "Show today's interviews",
        "Notify selected students",
        "Show me the students who were not selected",
        "Download the placement results",
        "Show the biggest student skill gaps"
    ]

    for p in test_prompts:
        agent_res = client.post("/api/agent/chat", json={
            "message": p,
            "active_drive_id": "DRIVE_GOOGLE_2026",
            "context": {}
        }, headers=officer_headers)
        assert agent_res.status_code == 200, f"Agent prompt failed '{p}': {agent_res.text}"
        data = agent_res.json()
        assert "reply" in data and len(data["reply"]) > 0
        print(f"    [PASS] Prompt '{p[:35]}...' -> Tools: {[t['name'] for t in data.get('executed_tools', [])]}")

    # 11. Agent Evaluation Suite
    print("\n[10] Testing Agent Evaluation Suite ...")
    eval_res = client.post("/api/agent/evaluation/run", headers=officer_headers)
    assert eval_res.status_code == 200, f"Evaluation run failed: {eval_res.text}"
    eval_data = eval_res.json()
    assert eval_data.get("status") == "success"
    report = eval_data.get("report", {})
    assert report.get("overall_benchmark_score") == "100.0%"
    print(f"    [PASS] Agent Evaluation Score: {report.get('overall_benchmark_score')} ({report.get('passed_cases')}/{report.get('total_test_cases')} tests passed)")

    print("\n" + "=" * 70)
    print("ALL 10 VERIFICATION CATEGORIES PASSED WITH ZERO ERRORS!")
    print("=" * 70)

if __name__ == "__main__":
    run_full_verification()
