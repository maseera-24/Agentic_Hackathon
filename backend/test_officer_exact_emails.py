import os
import sys
from fastapi.testclient import TestClient

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
from backend.data.db import db
from backend.config import settings

client = TestClient(app)

def test_all_five_officers():
    print("=" * 80)
    print("TESTING EXACT 5 AUTHORIZED PLACEMENT OFFICERS + CASE/WHITESPACE VARIATIONS")
    print("=" * 80)

    db.reset_to_seed()

    officers = [
        ("vu.241fa04a54@gmail.com", "Maseera Sk"),
        ("vu.241fa04a56@gmail.com", "Sai Kiran L"),
        ("vu.241fa04a98@gmail.com", "Pavan Kumar Ch"),
        ("vu.241fa04611@gmail.com", "K Anirudh"),
        ("vu.241fa04b04@gmail.com", "K Seshagiri"),
    ]

    for idx, (email, expected_name) in enumerate(officers, 1):
        print(f"\n[OFFICER {idx}] Testing Login for {email} ({expected_name})...")

        # Test exact email
        res = client.post("/api/auth/login", json={"email": email, "role": "placement_officer"})
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        assert data.get("status") == "otp_required", f"Expected otp_required, got {data}"
        assert data.get("session_id"), "Missing session_id"
        assert data.get("dev_otp"), "Missing dev_otp in demo mode"
        session_id = data["session_id"]
        otp = data["dev_otp"]
        print(f"    [+] Login Init: OTP generated successfully. Masked email: {data.get('email_masked')}")

        # Test verify OTP
        v_res = client.post("/api/auth/verify-otp", json={"session_id": session_id, "otp": otp})
        assert v_res.status_code == 200, f"Expected 200, got {v_res.status_code}: {v_res.text}"
        v_data = v_res.json()
        user = v_data.get("user", {})
        assert user.get("role") == "placement_officer", f"Expected placement_officer, got {user.get('role')}"
        assert user.get("name") == expected_name, f"Expected {expected_name}, got {user.get('name')}"
        assert user.get("email") == email.lower(), f"Expected {email}, got {user.get('email')}"
        print(f"    [+] Verified: Successfully authenticated as {user.get('name')} ({user.get('role')})")

    # -------------------------------------------------------------
    # CASE & WHITESPACE NORMALIZATION TEST
    # -------------------------------------------------------------
    print("\n[NORMALIZATION] Testing Pavan Kumar Ch with Uppercase & Leading/Trailing Whitespace...")
    raw_input = "   VU.241FA04A98@GMAIL.COM   "
    res_norm = client.post("/api/auth/login", json={"email": raw_input, "role": "placement_officer"})
    assert res_norm.status_code == 200, f"Expected 200 for uppercase/whitespace input, got {res_norm.status_code}: {res_norm.text}"
    data_norm = res_norm.json()
    assert data_norm.get("status") == "otp_required"
    v_norm = client.post("/api/auth/verify-otp", json={"session_id": data_norm["session_id"], "otp": data_norm["dev_otp"]})
    assert v_norm.status_code == 200
    assert v_norm.json()["user"]["name"] == "Pavan Kumar Ch"
    print("    [+] PASS: '   VU.241FA04A98@GMAIL.COM   ' normalized and verified as Pavan Kumar Ch")

    # -------------------------------------------------------------
    # UNAUTHORIZED REJECTION TEST
    # -------------------------------------------------------------
    print("\n[SECURITY] Testing Unauthorized Officer Email: unauthorized@gmail.com...")
    res_unauth = client.post("/api/auth/login", json={"email": "unauthorized@gmail.com", "role": "placement_officer"})
    assert res_unauth.status_code == 403, f"Expected 403 Forbidden, got {res_unauth.status_code}"
    assert res_unauth.json().get("detail") == "This email is not authorized for Placement Officer access."
    print(f"    [+] PASS: Correctly rejected unauthorized email with 403: {res_unauth.json()['detail']}")

    print("\n" + "=" * 80)
    print("ALL 5 AUTHORIZED OFFICERS VERIFIED WITH 100% SUCCESS!")
    print("=" * 80)

if __name__ == "__main__":
    test_all_five_officers()
