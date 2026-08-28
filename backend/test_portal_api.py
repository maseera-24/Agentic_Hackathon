"""
End-to-End Test Suite for Campus Placement Portal Backend
Validates Student Flow, Officer Flow, and Role-Based Authorization
"""
import sys
import os

# Set working directory to project root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.main import app
from backend.data.db import db

client = TestClient(app)

def run_test_suite():
    print("=" * 60)
    print("[TEST] STARTING PLACEMENT PORTAL BACKEND TEST SUITE")
    print("=" * 60)

    # 0. Reset state
    db.reset_to_seed()
    print("[PASS] Reset state to clean seed data")

    # 1. Test Health Check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] Health Check Passed:", res.json()["service"])

    # 2. Test Invalid Login
    res = client.post("/api/auth/login", json={"email": "wrong@example.com", "password": "bad"})
    assert res.status_code == 401, "Expected 401 on invalid credentials"
    print("[PASS] Invalid Login Correctly Rejected (401 Unauthorized)")

    # 3. Test Student Login
    res = client.post("/api/auth/login", json={"email": "student@example.com", "password": "student123"})
    assert res.status_code == 200, f"Student login failed: {res.text}"
    student_auth = res.json()
    student_token = student_auth["token"]
    assert student_auth["user"]["role"] == "student"
    assert student_auth["user"]["student_id"] == "STU001"
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("[PASS] Student Login Successful (Role: student, ID: STU001)")

    # 4. Test Officer Login
    res = client.post("/api/auth/login", json={"email": "officer@example.com", "password": "officer123"})
    assert res.status_code == 200, f"Officer login failed: {res.text}"
    officer_auth = res.json()
    officer_token = officer_auth["token"]
    assert officer_auth["user"]["role"] == "placement_officer"
    officer_headers = {"Authorization": f"Bearer {officer_token}"}
    print("[PASS] Officer Login Successful (Role: placement_officer)")

    # 5. Security Test: Student blocked from Officer Endpoints
    res = client.get("/api/officer/dashboard-stats", headers=student_headers)
    assert res.status_code == 403, f"Expected 403 Forbidden for student accessing officer API, got: {res.status_code}"
    print("[PASS] Security Check Passed: Student blocked from Officer APIs (403 Forbidden)")

    # 6. Test Student Profile Fetch and Edit
    res = client.get("/api/students/me", headers=student_headers)
    assert res.status_code == 200, f"Get student profile failed: {res.text}"
    profile = res.json()
    assert profile["student"]["id"] == "STU001"
    print(f"[PASS] Student Profile Loaded: {profile['student']['name']} (Completion: {profile['profile_completion']}%)")

    # Update Profile
    update_data = {
        "phone": "+91 99999 88888",
        "technical_skills": ["Python", "FastAPI", "React", "Docker", "PostgreSQL", "System Design"]
    }
    res = client.put("/api/students/me", json=update_data, headers=student_headers)
    assert res.status_code == 200
    updated_student = res.json()["student"]
    assert updated_student["phone"] == "+91 99999 88888"
    assert "System Design" in updated_student["technical_skills"]
    print("[PASS] Student Profile Successfully Updated (Phone & Skills)")

    # 7. Test Student Resume Upload & Download
    fake_pdf = b"%PDF-1.4 Fake resume content for test"
    res = client.post(
        "/api/students/me/resume",
        files={"file": ("My_Updated_Resume.pdf", fake_pdf, "application/pdf")},
        headers=student_headers
    )
    assert res.status_code == 200, f"Resume upload failed: {res.text}"
    print("[PASS] Student Resume Upload Passed:", res.json()["message"])

    # Download resume
    res = client.get("/api/students/me/resume", headers=student_headers)
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    print("[PASS] Student Resume Download Verified")

    # 8. Test Drives Listing
    res = client.get("/api/drives")
    assert res.status_code == 200
    drives = res.json()
    assert len(drives) >= 5
    print(f"[PASS] Placement Drives Listed ({len(drives)} drives available)")

    # Active drives
    res = client.get("/api/drives?status=ACTIVE")
    assert res.status_code == 200
    active_drives = res.json()
    print(f"[PASS] Active Drives Filtered ({len(active_drives)} active drives)")

    # 9. Test Student Apply to Drive
    res = client.post(
        "/api/officer/drives",
        json={
            "company_name": "Atlassian",
            "role_title": "Associate Software Engineer",
            "package": "26.0 LPA",
            "location": "Bengaluru",
            "description": "Building next-generation Jira, Confluence, and Cloud tooling.",
            "application_deadline": "2026-10-30",
            "drive_date": "2026-11-05",
            "drive_status": "ACTIVE",
            "requirements": {
                "min_cgpa": 7.0,
                "max_backlogs": 0,
                "branches": ["Computer Science & Engineering", "Information Technology"],
                "graduation_year": 2026,
                "required_skills": ["Java", "Python", "Data Structures"]
            }
        },
        headers=officer_headers
    )
    assert res.status_code == 200
    new_drive = res.json()["drive"]
    new_drive_id = new_drive["id"]
    print(f"[PASS] Officer Created New Drive: {new_drive['company_name']} ({new_drive_id})")

    # Student applies to new drive
    res = client.post(f"/api/drives/{new_drive_id}/apply", headers=student_headers)
    assert res.status_code == 200, f"Apply failed: {res.text}"
    app_res = res.json()["application"]
    app_id = app_res["id"]
    print(f"[PASS] Student Successfully Applied to {new_drive['company_name']} (App ID: {app_id})")

    # Duplicate Apply Test (Must Fail)
    res = client.post(f"/api/drives/{new_drive_id}/apply", headers=student_headers)
    assert res.status_code == 400, "Expected 400 on duplicate application"
    print("[PASS] Duplicate Application Prevention Verified (400 Bad Request)")

    # 10. Test Officer Applications Review & Pipeline
    res = client.get(f"/api/officer/applications?drive_id={new_drive_id}", headers=officer_headers)
    assert res.status_code == 200
    drive_apps = res.json()
    assert len(drive_apps) >= 1
    print(f"[PASS] Officer Retrieved Applications for Drive ({len(drive_apps)} applicants)")

    # Officer moves student to SHORTLISTED
    res = client.put(
        f"/api/officer/applications/{app_id}/status",
        json={"status": "SHORTLISTED", "current_round": "Technical Round 1"},
        headers=officer_headers
    )
    assert res.status_code == 200
    assert res.json()["application"]["status"] == "SHORTLISTED"
    print("[PASS] Officer Updated Status to SHORTLISTED")

    # Officer schedules interview panel
    res = client.put(
        f"/api/officer/applications/{app_id}/panel",
        json={
            "panel_id": "PANEL_05",
            "panel_name": "Panel 5 - Problem Solving & Fullstack",
            "date": "2026-11-05",
            "time": "11:00 AM",
            "venue": "Block A - Room 105",
            "interviewers": "Anand Mohan, Divya Rao",
            "instructions": "Be prepared with System Architecture and Git portfolio."
        },
        headers=officer_headers
    )
    assert res.status_code == 200
    updated_app = res.json()["application"]
    assert updated_app["interview_details"]["venue"] == "Block A - Room 105"
    print("[PASS] Officer Assigned Interview Panel, Time & Venue")

    # Officer marks student as SELECTED
    res = client.put(
        f"/api/officer/applications/{app_id}/result",
        json={
            "status": "SELECTED",
            "offer_ctc": "26.0 LPA",
            "feedback": "Outstanding architectural clarity and problem solving.",
            "next_step": "Background Verification & HR Documentation"
        },
        headers=officer_headers
    )
    assert res.status_code == 200
    assert res.json()["application"]["status"] == "SELECTED"
    print("[PASS] Officer Marked Student as SELECTED with Offer CTC & Feedback")

    # 11. Student Views Updated Applications and Notifications
    res = client.get("/api/applications/me", headers=student_headers)
    assert res.status_code == 200
    my_apps = res.json()
    atlassian_app = next((a for a in my_apps if a["id"] == app_id), None)
    assert atlassian_app is not None
    assert atlassian_app["status"] == "SELECTED"
    assert atlassian_app["interview_details"]["venue"] == "Block A - Room 105"
    assert atlassian_app["result_details"]["offer_ctc"] == "26.0 LPA"
    print("[PASS] Student Verified Real-Time Selected Result, Panel & Venue in My Applications")

    # Notifications check
    res = client.get("/api/notifications", headers=student_headers)
    assert res.status_code == 200
    notifs_payload = res.json()
    assert len(notifs_payload["notifications"]) > 0
    print(f"[PASS] Student Notifications Received ({len(notifs_payload['notifications'])} notifications, {notifs_payload['unread_count']} unread)")

    # Mark notification as read
    first_notif_id = notifs_payload["notifications"][0]["id"]
    res = client.put(f"/api/notifications/{first_notif_id}/read", headers=student_headers)
    assert res.status_code == 200
    print("[PASS] Mark Notification Read Verified")

    # 12. Retained Agent Capabilities Check
    res = client.get("/api/agent/status")
    assert res.status_code == 200
    print("[PASS] Retained AI Agent Status:", res.json()["status"])

    res = client.post("/api/drives/parse_jd", json={"jd_text": "Company: TestCorp\nRole: Backend Engineer\nPackage: 15 LPA\nMin CGPA: 7.5\nSkills: Python, SQL"})
    assert res.status_code == 200
    print("[PASS] AI JD Parser Engine Verified")

    print("=" * 60)
    print("[COMPLETE] ALL TEST SUITE ASSERTIONS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_test_suite()
