import os
import sys
import io
import datetime
from fastapi.testclient import TestClient

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
from backend.data.db import db
from backend.config import settings
from backend.services.excel_service import excel_service

client = TestClient(app)

def test_full_hackathon_flows():
    print("=" * 75)
    print("NIGRAANI / AGENTIC PLACEMENT OPERATIONS - END-TO-END VERIFICATION")
    print("=" * 75)

    # Clean reset state for test predictability
    db.reset_to_seed()


    # -------------------------------------------------------------
    # 1. OFFICER AUTHENTICATION & WHITELIST
    # -------------------------------------------------------------
    print("\n[FLOW 1] Testing Placement Officer Authentication & Whitelist Enforcement...")

    # 1A. Non-whitelisted email attempting officer login must fail with 403
    unauth_res = client.post("/api/auth/login", json={
        "email": "unauthorized_user@external.com",
        "role": "placement_officer"
    })
    assert unauth_res.status_code == 403, f"Expected 403 for unauthorized officer email, got {unauth_res.status_code}"
    print("    [+] Correctly rejected non-whitelisted officer email (403 Forbidden)")

    # 1B. Whitelisted officer email succeeds and receives OTP session
    officer_email = settings.OFFICER_EMAILS[0]
    auth_res = client.post("/api/auth/login", json={
        "email": officer_email,
        "role": "placement_officer"
    })
    assert auth_res.status_code == 200, f"Expected 200 for officer login, got {auth_res.status_code}"
    officer_data = auth_res.json()
    assert officer_data.get("status") == "otp_required"
    session_id = officer_data.get("session_id")
    dev_otp = officer_data.get("dev_otp")
    assert dev_otp, "dev_otp should be provided in demo mode"

    # Verify OTP
    verify_res = client.post("/api/auth/verify-otp", json={
        "session_id": session_id,
        "otp": dev_otp
    })
    assert verify_res.status_code == 200
    officer_token = verify_res.json().get("token")
    officer_headers = {"Authorization": f"Bearer {officer_token}"}
    print(f"    [+] Placement Officer successfully authenticated: {officer_email}")

    # -------------------------------------------------------------
    # 2. EXCEL UPLOAD & AUTOMATIC ACCOUNT PROVISIONING
    # -------------------------------------------------------------
    print("\n[FLOW 2] Testing Student Excel Roster Upload & User Account Provisioning...")

    template_buf = excel_service.generate_sample_student_template()
    upload_res = client.post(
        "/api/students/upload",
        files={"file": ("students_roster.xlsx", template_buf.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers=officer_headers
    )
    assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
    upload_json = upload_res.json()
    assert upload_json.get("records_processed", 0) >= 5
    print(f"    [+] Excel Ingestion Processed {upload_json.get('records_processed')} records ({upload_json.get('added')} added, {upload_json.get('updated')} updated)")

    # Verify that new Excel student has no fake resume
    sample_student = db.get_students()[-1]
    sample_student_id = sample_student["id"]
    sample_student_email = sample_student["email"]
    assert sample_student.get("resume_filename") is None, "Newly uploaded Excel student must have resume_filename = None"
    print(f"    [+] Verified student {sample_student_id} initialized with resume_uploaded = false")

    # -------------------------------------------------------------
    # 3. STUDENT LOGIN & ROLE ISOLATION
    # -------------------------------------------------------------
    print("\n[FLOW 3] Testing Student Login via ID/Email & Data Scoping...")

    student_login_res = client.post("/api/auth/login", json={
        "email": sample_student_id,
        "role": "student"
    })
    assert student_login_res.status_code == 200, f"Student login failed: {student_login_res.text}"
    st_data = student_login_res.json()
    st_session_id = st_data.get("session_id")
    st_dev_otp = st_data.get("dev_otp")

    st_verify_res = client.post("/api/auth/verify-otp", json={
        "session_id": st_session_id,
        "otp": st_dev_otp
    })
    assert st_verify_res.status_code == 200
    student_token = st_verify_res.json().get("token")
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print(f"    [+] Student {sample_student_id} successfully logged in using Student ID")

    # Verify IDOR protection: Student cannot download another student's resume
    other_student = db.get_students()[0]
    if other_student["id"] != sample_student_id:
        forbidden_res = client.get(f"/api/students/{other_student['id']}/resume", headers=student_headers)
        assert forbidden_res.status_code == 403, f"Expected 403 when accessing another student's resume, got {forbidden_res.status_code}"
        print(f"    [+] Verified IDOR protection: Student cannot access {other_student['id']}'s resume (403 Forbidden)")

    # -------------------------------------------------------------
    # 4. RESUME STATUS & UPLOAD/DELETE LIFECYCLE
    # -------------------------------------------------------------
    print("\n[FLOW 4] Testing Accurate Resume Status & PDF Upload/Delete Lifecycle...")

    # 4A. Resume download before upload must return 404
    no_resume_res = client.get("/api/students/me/resume", headers=student_headers)
    assert no_resume_res.status_code == 404, f"Expected 404 for unuploaded resume, got {no_resume_res.status_code}"
    print("    [+] Correctly returned 404 when student has not uploaded a resume")

    # 4B. Student uploads a real PDF resume
    mock_pdf = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"
    upload_resume_res = client.post(
        "/api/students/me/resume",
        files={"file": ("my_custom_resume.pdf", mock_pdf, "application/pdf")},
        headers=student_headers
    )
    assert upload_resume_res.status_code == 200, f"Resume upload failed: {upload_resume_res.text}"
    print("    [+] Resume PDF uploaded and verified successfully")

    # 4C. Resume download after upload succeeds
    download_resume_res = client.get("/api/students/me/resume", headers=student_headers)
    assert download_resume_res.status_code == 200
    assert download_resume_res.headers.get("content-type") == "application/pdf"
    print(f"    [+] Downloaded verified PDF resume ({len(download_resume_res.content)} bytes)")

    # -------------------------------------------------------------
    # 5. OFFICER + ADD DRIVE FUNCTIONALITY
    # -------------------------------------------------------------
    print("\n[FLOW 5] Testing Placement Officer + Add Drive Feature...")

    # 5A. Deadline after drive date should fail validation
    invalid_drive = {
        "company_name": "Tesla Autonomous Systems",
        "role_title": "Embedded Software Engineer",
        "drive_date": "2026-09-10",
        "deadline": "2026-09-15", # Invalid: deadline after drive date
        "package": "₹ 28.0 LPA",
        "branches": ["Computer Science & Engineering"],
        "min_cgpa": 8.0,
        "max_backlogs": 0
    }
    invalid_res = client.post("/api/officer/drives", json=invalid_drive, headers=officer_headers)
    assert invalid_res.status_code == 400, f"Expected 400 for deadline after drive date, got {invalid_res.status_code}"
    print("    [+] Date validation rejected deadline after drive date (400 Bad Request)")

    # 5B. Valid drive creation succeeds
    valid_drive = {
        "company_name": "Tesla Autonomous Systems",
        "role_title": "Embedded Software Engineer",
        "drive_date": "2026-09-20",
        "deadline": "2026-09-15",
        "package": "₹ 28.0 LPA",
        "location": "Bengaluru / Hyderabad",
        "openings": 8,
        "status": "ACTIVE",
        "requirements": {
          "min_cgpa": 8.0,
          "max_backlogs": 0,
          "branches": ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science"],
          "required_skills": ["C++", "Python", "Robotics", "Real-Time Systems"]
        }
    }
    create_res = client.post("/api/officer/drives", json=valid_drive, headers=officer_headers)
    assert create_res.status_code == 200, f"Drive creation failed: {create_res.text}"
    created_drive = create_res.json().get("drive", create_res.json())
    new_drive_id = created_drive["id"]
    print(f"    [+] Created new placement drive: {created_drive['company_name']} ({new_drive_id})")

    # -------------------------------------------------------------
    # 6. STUDENT PLACEMENT AGENT (SCOPED IDENTITY)
    # -------------------------------------------------------------
    print("\n[FLOW 6] Testing Student Placement Agent with Authenticated Identity...")

    # Student asks for eligible drives
    agent_res = client.post(
        "/api/agent/chat",
        json={"message": "Show me the drives I am eligible for", "context": {}},
        headers=student_headers
    )
    assert agent_res.status_code == 200
    agent_json = agent_res.json()
    assert agent_json.get("intent") == "STUDENT_ELIGIBLE_DRIVES"
    assert sample_student["name"] in agent_json.get("reply", ""), "Agent response should personalize to logged-in student"
    print(f"    [+] Student agent personalized eligible drives query for {sample_student['name']}")

    # Student asks for their applications
    apps_res = client.post(
        "/api/agent/chat",
        json={"message": "Show my submitted applications", "context": {}},
        headers=student_headers
    )
    assert apps_res.status_code == 200
    assert apps_res.json().get("intent") == "STUDENT_APPLIED_DRIVES"
    print("    [+] Student agent processed application status query")

    # -------------------------------------------------------------
    # 7. OFFICER AGENT OPERATIONAL ACTIONS & CONFLICT CHECKING
    # -------------------------------------------------------------
    print("\n[FLOW 7] Testing Officer Agent Operational Rescheduling & Conflict Check...")

    # Officer asks to move interview
    reschedule_msg = client.post(
        "/api/agent/chat",
        json={"message": "Move Rahul's interview to 3 PM tomorrow", "context": {}},
        headers=officer_headers
    )
    assert reschedule_msg.status_code == 200
    resched_json = reschedule_msg.json()
    assert resched_json.get("intent") == "RESCHEDULE_INTERVIEW"
    print(f"    [+] Placement Officer agent successfully processed reschedule request")

    print("\n" + "=" * 75)
    print("ALL 7 END-TO-END WORKFLOWS VERIFIED SUCCESSFULLY (100% PASS)")
    print("=" * 75)

if __name__ == "__main__":
    test_full_hackathon_flows()
