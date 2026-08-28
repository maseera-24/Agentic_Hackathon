import os
import sys
from fastapi.testclient import TestClient

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
from backend.data.db import db
from backend.config import settings
from backend.services.notification_service import notification_service

client = TestClient(app)

def test_venkata_and_sender_email():
    print("=" * 80)
    print("TESTING CH VENKATA STUDENT ACCOUNT & PLACEMENTS1108@GMAIL.COM SENDER")
    print("=" * 80)

    # 1. Verify notification service default sender
    assert notification_service.email_provider.email_from == "placements1108@gmail.com", f"Expected placements1108@gmail.com, got {notification_service.email_provider.email_from}"
    print(f"\n[1] Notification Service Default Sender: {notification_service.email_provider.email_from} (OK)")

    # 2. Test Ch Venkata Login via Email (pavankumar.1280@gmail.com)
    print("\n[2] Testing Student Login for Ch Venkata via Email (pavankumar.1280@gmail.com)...")
    res1 = client.post("/api/auth/login", json={"email": "pavankumar.1280@gmail.com", "role": "student"})
    assert res1.status_code == 200, f"Expected 200, got {res1.status_code}: {res1.text}"
    d1 = res1.json()
    assert d1.get("status") == "otp_required"
    assert d1.get("dev_otp"), "dev_otp missing in demo mode"
    print(f"    [+] Login Init: OTP {d1['dev_otp']} sent to {d1['email_masked']}")

    # Verify OTP
    v1 = client.post("/api/auth/verify-otp", json={"session_id": d1["session_id"], "otp": d1["dev_otp"]})
    assert v1.status_code == 200, f"Expected 200, got {v1.status_code}: {v1.text}"
    user1 = v1.json()["user"]
    assert user1["name"] == "Ch Venkata", f"Expected Ch Venkata, got {user1['name']}"
    assert user1["email"] == "pavankumar.1280@gmail.com"
    assert user1["student_id"] == "STU1280"
    assert user1["role"] == "student"
    assert "student_profile" in user1
    print(f"    [+] Verified: Successfully logged in as {user1['name']} ({user1['student_id']})")

    # 3. Test Ch Venkata Login via Student ID (STU1280)
    print("\n[3] Testing Student Login for Ch Venkata via Student ID (STU1280)...")
    res2 = client.post("/api/auth/login", json={"email": "STU1280", "role": "student"})
    assert res2.status_code == 200, f"Expected 200, got {res2.status_code}: {res2.text}"
    d2 = res2.json()
    v2 = client.post("/api/auth/verify-otp", json={"session_id": d2["session_id"], "otp": d2["dev_otp"]})
    assert v2.status_code == 200
    assert v2.json()["user"]["name"] == "Ch Venkata"
    print("    [+] PASS: Logged in via Student ID STU1280")

    # 4. Test Student Agent Chat for Ch Venkata
    print("\n[4] Testing AI Placement Agent for Ch Venkata...")
    token = v1.json()["token"]
    agent_res = client.post(
        "/api/agent/chat",
        json={"message": "Show me the drives I am eligible for", "context": {}},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert agent_res.status_code == 200
    agent_data = agent_res.json()
    assert agent_data.get("intent") == "STUDENT_ELIGIBLE_DRIVES"
    assert "Ch Venkata" in agent_data.get("reply", "")
    print("    [+] PASS: Placement Agent personalized for Ch Venkata")

    print("\n" + "=" * 80)
    print("ALL TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 80)

if __name__ == "__main__":
    test_venkata_and_sender_email()
