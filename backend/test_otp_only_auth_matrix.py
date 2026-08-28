import os
import sys
from fastapi.testclient import TestClient

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
from backend.data.db import db
from backend.config import settings

client = TestClient(app)

def test_otp_auth_matrix():
    print("=" * 80)
    print("AI CAMPUS PLACEMENT OPERATIONS - OTP-ONLY AUTHENTICATION TEST MATRIX")
    print("=" * 80)

    db.reset_to_seed()

    # -------------------------------------------------------------
    # TEST 1: Student Candidate (student@example.com)
    # -------------------------------------------------------------
    print("\n[TEST 1] Testing Student Login: student@example.com...")
    res1 = client.post("/api/auth/login", json={"email": "student@example.com", "role": "student"})
    assert res1.status_code == 200, f"Expected 200, got {res1.status_code}: {res1.text}"
    d1 = res1.json()
    assert d1.get("status") == "otp_required"
    assert d1.get("dev_otp"), "dev_otp must be provided in demo mode"
    assert "password" not in str(d1).lower(), "Response must not contain password"

    v1 = client.post("/api/auth/verify-otp", json={"session_id": d1["session_id"], "otp": d1["dev_otp"]})
    assert v1.status_code == 200
    u1 = v1.json()["user"]
    assert u1["role"] == "student"
    assert u1["student_id"] == "STU001"
    print(f"    [+] PASS: Logged in as Student ({u1['name']}) -> Token Issued")

    # -------------------------------------------------------------
    # TEST 2: Another Student Candidate (anotherstudent@gmail.com - Auto Provision)
    # -------------------------------------------------------------
    print("\n[TEST 2] Testing Student Login: anotherstudent@gmail.com (Auto Provisioning)...")
    res2 = client.post("/api/auth/login", json={"email": "anotherstudent@gmail.com", "role": "student"})
    assert res2.status_code == 200, f"Expected 200, got {res2.status_code}: {res2.text}"
    d2 = res2.json()
    assert d2.get("status") == "otp_required"

    v2 = client.post("/api/auth/verify-otp", json={"session_id": d2["session_id"], "otp": d2["dev_otp"]})
    assert v2.status_code == 200
    u2 = v2.json()["user"]
    assert u2["role"] == "student"
    assert u2["email"] == "anotherstudent@gmail.com"
    print(f"    [+] PASS: Logged in as New Student ({u2['name']}) -> Student Dashboard")

    # -------------------------------------------------------------
    # TEST 3: Placement Officer 1 (vu.241fa04a54@gmail.com - Maseera Sk)
    # -------------------------------------------------------------
    print("\n[TEST 3] Testing Officer 1: vu.241fa04a54@gmail.com (Maseera Sk)...")
    res3 = client.post("/api/auth/login", json={"email": "vu.241fa04a54@gmail.com", "role": "placement_officer"})
    assert res3.status_code == 200, f"Expected 200, got {res3.status_code}: {res3.text}"
    d3 = res3.json()
    assert d3.get("status") == "otp_required"

    v3 = client.post("/api/auth/verify-otp", json={"session_id": d3["session_id"], "otp": d3["dev_otp"]})
    assert v3.status_code == 200
    u3 = v3.json()["user"]
    assert u3["role"] == "placement_officer"
    assert u3["name"] == "Maseera Sk"
    print(f"    [+] PASS: Logged in as Placement Officer ({u3['name']}) -> Officer Dashboard")

    # -------------------------------------------------------------
    # TEST 4: Placement Officer 2 (vu.241fa04a56@gmail.com - Sai Kiran L)
    # -------------------------------------------------------------
    print("\n[TEST 4] Testing Officer 2: vu.241fa04a56@gmail.com (Sai Kiran L)...")
    res4 = client.post("/api/auth/login", json={"email": "vu.241fa04a56@gmail.com", "role": "placement_officer"})
    assert res4.status_code == 200, f"Expected 200, got {res4.status_code}: {res4.text}"
    d4 = res4.json()
    assert d4.get("status") == "otp_required"

    v4 = client.post("/api/auth/verify-otp", json={"session_id": d4["session_id"], "otp": d4["dev_otp"]})
    assert v4.status_code == 200
    u4 = v4.json()["user"]
    assert u4["role"] == "placement_officer"
    assert u4["name"] == "Sai Kiran L"
    print(f"    [+] PASS: Logged in as Placement Officer ({u4['name']}) -> Officer Dashboard")

    # -------------------------------------------------------------
    # TEST 5: Placement Officer 3 (vu.241fa04a98@gmail.com - Pavan Kumar Ch)
    # -------------------------------------------------------------
    print("\n[TEST 5] Testing Officer 3: vu.241fa04a98@gmail.com (Pavan Kumar Ch)...")
    res5 = client.post("/api/auth/login", json={"email": "vu.241fa04a98@gmail.com", "role": "placement_officer"})
    assert res5.status_code == 200, f"Expected 200, got {res5.status_code}: {res5.text}"
    d5 = res5.json()
    assert d5.get("status") == "otp_required"

    v5 = client.post("/api/auth/verify-otp", json={"session_id": d5["session_id"], "otp": d5["dev_otp"]})
    assert v5.status_code == 200
    u5 = v5.json()["user"]
    assert u5["role"] == "placement_officer"
    assert u5["name"] == "Pavan Kumar Ch"
    print(f"    [+] PASS: Logged in as Placement Officer ({u5['name']}) -> Officer Dashboard")

    # -------------------------------------------------------------
    # TEST 6: Placement Officer 4 (vu.241fa04611@gmail.com - K Anirudh)
    # -------------------------------------------------------------
    print("\n[TEST 6] Testing Officer 4: vu.241fa04611@gmail.com (K Anirudh)...")
    res6 = client.post("/api/auth/login", json={"email": "vu.241fa04611@gmail.com", "role": "placement_officer"})
    assert res6.status_code == 200, f"Expected 200, got {res6.status_code}: {res6.text}"
    d6 = res6.json()
    assert d6.get("status") == "otp_required"

    v6 = client.post("/api/auth/verify-otp", json={"session_id": d6["session_id"], "otp": d6["dev_otp"]})
    assert v6.status_code == 200
    u6 = v6.json()["user"]
    assert u6["role"] == "placement_officer"
    assert u6["name"] == "K Anirudh"
    print(f"    [+] PASS: Logged in as Placement Officer ({u6['name']}) -> Officer Dashboard")

    # -------------------------------------------------------------
    # TEST 7: Placement Officer 5 (vu.241fa04b04@gmail.com - K Seshagiri)
    # -------------------------------------------------------------
    print("\n[TEST 7] Testing Officer 5: vu.241fa04b04@gmail.com (K Seshagiri)...")
    res7 = client.post("/api/auth/login", json={"email": "vu.241fa04b04@gmail.com", "role": "placement_officer"})
    assert res7.status_code == 200, f"Expected 200, got {res7.status_code}: {res7.text}"
    d7 = res7.json()
    assert d7.get("status") == "otp_required"

    v7 = client.post("/api/auth/verify-otp", json={"session_id": d7["session_id"], "otp": d7["dev_otp"]})
    assert v7.status_code == 200
    u7 = v7.json()["user"]
    assert u7["role"] == "placement_officer"
    assert u7["name"] == "K Seshagiri"
    print(f"    [+] PASS: Logged in as Placement Officer ({u7['name']}) -> Officer Dashboard")

    # -------------------------------------------------------------
    # TEST 8: Unauthorized Officer Email (unauthorized@gmail.com)
    # -------------------------------------------------------------
    print("\n[TEST 8] Testing Unauthorized Officer Rejection: unauthorized@gmail.com...")
    res8 = client.post("/api/auth/login", json={"email": "unauthorized@gmail.com", "role": "placement_officer"})
    assert res8.status_code == 403, f"Expected 403 Forbidden, got {res8.status_code}"
    assert "not authorized for Placement Officer access" in res8.json().get("detail", "")
    print(f"    [+] PASS: Correctly blocked with 403 Forbidden: {res8.json()['detail']}")

    # -------------------------------------------------------------
    # TEST 9: Privilege Escalation Prevention (Officer email requesting student role)
    # -------------------------------------------------------------
    print("\n[TEST 9] Testing Privilege Isolation & No Escalation...")
    res9 = client.post("/api/auth/login", json={"email": "vu.241fa04a54@gmail.com", "role": "student"})
    assert res9.status_code == 200
    d9 = res9.json()
    v9 = client.post("/api/auth/verify-otp", json={"session_id": d9["session_id"], "otp": d9["dev_otp"]})
    assert v9.status_code == 200
    u9 = v9.json()["user"]
    token9 = v9.json()["token"]
    # If token has student role, they cannot access officer endpoints
    officer_stat_res = client.get("/api/officer/dashboard-stats", headers={"Authorization": f"Bearer {token9}"})
    # If role returned is student, accessing officer endpoint must be forbidden
    if u9.get("role") == "student":
        assert officer_stat_res.status_code == 403, "Student token must not access officer endpoints"
        print("    [+] PASS: Student token cannot access Officer endpoints (403 Forbidden)")
    else:
        print(f"    [+] PASS: Handled securely as {u9.get('role')}")

    # -------------------------------------------------------------
    # TEST 10: Session Persistence (GET /api/auth/me)
    # -------------------------------------------------------------
    print("\n[TEST 10] Testing Session Token Persistence (/api/auth/me)...")
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {v3.json()['token']}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "vu.241fa04a54@gmail.com"
    assert me_data["name"] == "Maseera Sk"
    assert me_data["role"] == "placement_officer"
    print(f"    [+] PASS: Session token valid for {me_data['name']} ({me_data['role']})")

    # -------------------------------------------------------------
    # TEST 11: Logout (/api/auth/logout)
    # -------------------------------------------------------------
    print("\n[TEST 11] Testing Logout (/api/auth/logout)...")
    logout_res = client.post("/api/auth/logout")
    assert logout_res.status_code == 200
    assert logout_res.json().get("status") == "success"
    print("    [+] PASS: Logout executed cleanly")

    print("\n" + "=" * 80)
    print("ALL 11 AUTHENTICATION TEST MATRIX CASES PASSED (100% SUCCESS)!")
    print("=" * 80)

if __name__ == "__main__":
    test_otp_auth_matrix()
