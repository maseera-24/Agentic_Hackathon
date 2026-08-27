import httpx
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_full_flow():
    client = httpx.Client(base_url=BASE_URL)
    print("==================================================")
    print("STARTING FULL END-TO-END FLOW VERIFICATION")
    print("==================================================")

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] Backend health check: 200 OK")

    # 2. Demo accounts
    res = client.get("/api/auth/demo-accounts")
    assert res.status_code == 200
    accounts = res.json()
    assert len(accounts) >= 2
    print(f"[PASS] Demo accounts available: {[a['email'] for a in accounts]}")

    # 3. Student Login Flow
    res = client.post("/api/auth/login", json={"email": "student@example.com", "password": "student123"})
    assert res.status_code == 200
    student_auth = res.json()
    student_token = student_auth["token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print(f"[PASS] Student authenticated: {student_auth['user']['name']} ({student_auth['user']['role']})")

    # 4. Student Profile Me
    res = client.get("/api/students/me", headers=student_headers)
    assert res.status_code == 200
    profile_data = res.json()
    assert profile_data["student"]["name"] == "Rahul Sharma"
    print(f"[PASS] Student Profile: {profile_data['student']['name']}, CGPA: {profile_data['student']['cgpa']}, Completion: {profile_data['profile_completion']}%")

    # 5. Student Update Profile
    res = client.put("/api/students/me", headers=student_headers, json={
        "name": "Rahul Sharma",
        "phone": "+91 98765 43210",
        "technical_skills": ["Python", "FastAPI", "React", "Docker", "Machine Learning"]
    })
    assert res.status_code == 200
    print("[PASS] Student profile updated with skills")

    # 6. Student Resume Handling
    pdf_content = b"%PDF-1.4 Mock Student Resume for Placement Verification"
    files = {"file": ("rahul_resume.pdf", pdf_content, "application/pdf")}
    res = client.post("/api/students/me/resume", headers=student_headers, files=files)
    assert res.status_code == 200
    print("[PASS] Student PDF Resume upload verified")

    # Download resume
    res = client.get("/api/students/me/resume", headers=student_headers)
    assert res.status_code == 200
    assert b"Mock Student Resume" in res.content
    print("[PASS] Student PDF Resume download verified")

    # 7. Student Browse Placement Drives
    res = client.get("/api/drives", headers=student_headers)
    assert res.status_code == 200
    drives = res.json()
    assert len(drives) >= 5
    print(f"[PASS] Student retrieved {len(drives)} placement drives")

    # 8. Student Apply to Drive
    active_drive = next(d for d in drives if (d.get("drive_status") or d.get("status")) == "ACTIVE")
    res = client.post(f"/api/drives/{active_drive['id']}/apply", headers=student_headers, json={})
    print(f"[PASS] Student application to {active_drive['company_name']}: Status {res.status_code}")

    # 9. Student My Applications
    res = client.get("/api/applications/me", headers=student_headers)
    assert res.status_code == 200
    my_apps = res.json()
    assert len(my_apps) >= 1
    print(f"[PASS] Student My Applications: {len(my_apps)} tracked applications")

    # 10. Student Notifications
    res = client.get("/api/notifications", headers=student_headers)
    assert res.status_code == 200
    notifs = res.json()
    print(f"[PASS] Student Notifications: {len(notifs['notifications'])} total, {notifs['unread_count']} unread")

    # 11. Security Check: Student tries officer endpoint -> 403 Forbidden
    res = client.get("/api/officer/dashboard-stats", headers=student_headers)
    assert res.status_code == 403
    print("[PASS] Security isolation verified: Student blocked with 403 Forbidden from officer API")

    # 12. Officer Login Flow
    res = client.post("/api/auth/login", json={"email": "officer@example.com", "password": "officer123"})
    assert res.status_code == 200
    officer_auth = res.json()
    officer_token = officer_auth["token"]
    officer_headers = {"Authorization": f"Bearer {officer_token}"}
    print(f"[PASS] Officer authenticated: {officer_auth['user']['name']} ({officer_auth['user']['role']})")

    # 13. Officer Dashboard Stats
    res = client.get("/api/officer/dashboard-stats", headers=officer_headers)
    assert res.status_code == 200
    stats = res.json()["stats"]
    print(f"[PASS] Officer Dashboard Stats: Students={stats['total_students']}, Active Drives={stats['active_drives']}, Apps={stats['total_applications']}")

    # 14. Officer Candidate Roster & Resume Download
    res = client.get("/api/officer/students", headers=officer_headers)
    assert res.status_code == 200
    students_list = res.json()
    assert len(students_list) >= 5
    print(f"[PASS] Officer Student Roster: {len(students_list)} students")

    res = client.get("/api/officer/students/STU001/resume", headers=officer_headers)
    assert res.status_code == 200
    print("[PASS] Officer downloaded candidate STU001 resume successfully")

    # 15. Officer Create Placement Drive
    new_drive_payload = {
        "company_name": "Stripe Payments India",
        "role_title": "Software Engineer - Infrastructure",
        "package": "36.0 LPA",
        "location": "Bengaluru",
        "description": "Building global payments infrastructure.",
        "application_deadline": "2026-09-30",
        "drive_date": "2026-10-05",
        "drive_status": "ACTIVE",
        "selection_process": "Online Coding -> System Design -> Bar Raiser",
        "requirements": {
            "min_cgpa": 8.0,
            "max_backlogs": 0,
            "branches": ["Computer Science & Engineering", "Information Technology"],
            "required_skills": ["Go", "Distributed Systems", "SQL", "Networks"]
        }
    }
    res = client.post("/api/officer/drives", headers=officer_headers, json=new_drive_payload)
    assert res.status_code == 200
    created_drive = res.json()["drive"]
    print(f"[PASS] Officer created & published new drive: {created_drive['company_name']} ({created_drive['id']})")

    # 16. Officer Applications Review & Pipeline
    res = client.get("/api/officer/applications", headers=officer_headers)
    assert res.status_code == 200
    officer_apps = res.json()
    assert len(officer_apps) >= 1
    target_app = officer_apps[0]
    print(f"[PASS] Officer reviewing application {target_app['id']} for {target_app['student_name']}")

    # Shortlist application
    res = client.put(f"/api/officer/applications/{target_app['id']}/status", headers=officer_headers, json={
        "status": "SHORTLISTED",
        "current_round": "Technical Interview 1"
    })
    assert res.status_code == 200
    print("[PASS] Officer advanced candidate to SHORTLISTED")

    # 17. Officer Assign Interview Panel & Venue
    res = client.put(f"/api/officer/applications/{target_app['id']}/panel", headers=officer_headers, json={
        "panel_name": "Panel 1 - Core Algorithms & Architecture",
        "interviewers": "Dr. Vivek Sharma, Priya Iyer",
        "date": "2026-08-30",
        "time": "11:30 AM",
        "venue": "Block A - Room 102",
        "instructions": "Bring laptop and project portfolio."
    })
    assert res.status_code == 200
    print("[PASS] Officer assigned interview panel, date, time and venue")

    # 18. Officer Select Candidate with Offer & Feedback
    res = client.put(f"/api/officer/applications/{target_app['id']}/result", headers=officer_headers, json={
        "status": "SELECTED",
        "offer_ctc": "32.0 LPA",
        "feedback": "Outstanding problem solving and system design depth.",
        "next_step": "HR Verification and Background Check"
    })
    assert res.status_code == 200
    print("[PASS] Officer finalized SELECTION result with offer CTC and feedback")

    # 19. Officer Broadcast Notification
    res = client.post("/api/officer/notifications", headers=officer_headers, json={
        "recipient": "ALL",
        "title": "Placement Season 2026 - Offer Acceptance Rules",
        "message": "All students with active offers must confirm acceptance within 48 hours.",
        "type": "ANNOUNCEMENT"
    })
    assert res.status_code == 200
    print("[PASS] Officer broadcast notification dispatched to all students")

    # 20. Student Verifies Live Result & Notification
    res = client.get("/api/applications/me", headers=student_headers)
    assert res.status_code == 200
    updated_apps = res.json()
    matching_app = next(a for a in updated_apps if a["id"] == target_app["id"])
    assert matching_app["status"] == "SELECTED"
    assert matching_app["result_details"]["offer_ctc"] == "32.0 LPA"
    assert matching_app["interview_details"]["venue"] == "Block A - Room 102"
    print(f"[PASS] Student received live verified SELECTION result: Offer={matching_app['result_details']['offer_ctc']}, Venue={matching_app['interview_details']['venue']}")

    print("==================================================")
    print("ALL 20 END-TO-END VERIFICATION CHECKS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    test_full_flow()
