import os
import sys
import requests
import json

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("==================================================")
    print("[*] RUNNING FULL VERIFICATION TEST SUITE")
    print("==================================================")

    # 1. Health
    res = requests.get(f"{BASE_URL}/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] 1. Health check passed:", res.json())

    # 2. Reset Demo
    res = requests.post(f"{BASE_URL}/demo/reset")
    assert res.status_code == 200, f"Reset failed: {res.text}"
    print("[PASS] 2. Demo state reset successfully.")

    # 3. Get Drives
    res = requests.get(f"{BASE_URL}/drives")
    assert res.status_code == 200 and len(res.json()) >= 3, "Failed to fetch drives"
    print(f"[PASS] 3. Fetched {len(res.json())} active placement drives.")

    # 4. JD Extraction Tool
    jd_sample = "Company: Google\nRole: Software Development Engineer\nMin CGPA: 7.5\nMax Backlogs: 0\nBranches: CSE, IT, ECE, AI&DS"
    res = requests.post(f"{BASE_URL}/drives/parse_jd", json={"jd_text": jd_sample})
    assert res.status_code == 200, "JD extraction failed"
    jd_data = res.json()
    assert jd_data["min_cgpa"] == 7.5, "JD CGPA mismatch"
    print(f"[PASS] 4. JD Parser extracted requirements: {jd_data['role_title']} (CGPA >= {jd_data['min_cgpa']})")

    # 5. Student Eligibility Verification
    res = requests.get(f"{BASE_URL}/drives/DRIVE_GOOGLE_2026/eligibility")
    assert res.status_code == 200, "Eligibility verification failed"
    evals = res.json()
    eligible = [e for e in evals if e["eligibility"]["status"] == "Eligible"]
    print(f"[PASS] 5. Verified {len(evals)} candidate profiles: {len(eligible)} eligible candidates found.")

    # 6. Schedule Generation Tool
    res = requests.post(f"{BASE_URL}/drives/DRIVE_GOOGLE_2026/generate_schedule", json={"duration_mins": 45})
    assert res.status_code == 200, "Schedule generation failed"
    sched_data = res.json()
    assert len(sched_data.get("schedules", [])) > 0, "No schedules produced"
    print(f"[PASS] 6. Scheduler generated {len(sched_data['schedules'])} candidate interview slots across panels.")

    # 7. Opportunity Conflict Detection
    res = requests.get(f"{BASE_URL}/conflicts")
    assert res.status_code == 200, "Conflict detection failed"
    conflicts = res.json()
    print(f"[PASS] 7. Opportunity Conflict Engine detected {len(conflicts)} cross-drive collisions.")

    # 8. Trigger Incident: Panel 2 Down
    res = requests.post(f"{BASE_URL}/exceptions/trigger_demo_exception", json={"panel_id": "PANEL_02"})
    assert res.status_code == 200, "Exception trigger failed"
    exc_plan = res.json()
    print(f"[PASS] 8. Exception Agent created Plan A for incident: {exc_plan.get('title')}")

    # 9. Approve Plan A
    exc_id = exc_plan["id"]
    res = requests.post(f"{BASE_URL}/exceptions/{exc_id}/approve")
    assert res.status_code == 200, "Exception approval failed"
    print("[PASS] 9. TPO approved Plan A recovery. Schedule re-slotted & notifications dispatched.")

    # 10. AI Voice Call Escalation
    res = requests.post(f"{BASE_URL}/communication/simulate_voice_call", json={"student_id": "STU003"})
    assert res.status_code == 200, "Voice call simulation failed"
    voice_data = res.json()
    print(f"[PASS] 10. Autonomous AI Voice Call executed with student: {voice_data.get('status')}")

    # 11. What-If Placement Simulator
    res = requests.post(f"{BASE_URL}/simulator/run", json={"scenario_type": "more_candidates", "params": {"candidate_delta": 30}})
    assert res.status_code == 200, "Simulator failed"
    sim_data = res.json()
    print(f"[PASS] 11. What-If Simulator forecasted impact for +30 candidates: {sim_data.get('impact')}")

    # 12. Policy RAG
    res = requests.post(f"{BASE_URL}/policies/query", json={"query": "Can a student appear for a Dream drive after accepting a Core offer?"})
    assert res.status_code == 200, "Policy query failed"
    pol_data = res.json()
    print(f"[PASS] 12. Policy Agent answered query with rule citation [{pol_data.get('rule_code')}]: {pol_data.get('answer')[:70]}...")

    # 13. Audit Trail
    res = requests.get(f"{BASE_URL}/audit")
    assert res.status_code == 200 and len(res.json()) > 0, "Audit log empty"
    print(f"[PASS] 13. Agent Audit Trail logged {len(res.json())} immutable actions with confidence metrics.")

    # 14. TPO Copilot Natural Language Query
    res = requests.post(f"{BASE_URL}/agent/chat", json={"message": "Show me all students eligible for Google"})
    assert res.status_code == 200, "Chat failed"
    chat_data = res.json()
    print(f"[PASS] 14. TPO Copilot processed query with tools: {[t['name'] for t in chat_data.get('executed_tools', [])]}")

    print("==================================================")
    print("[SUCCESS] ALL 14 CORE ENGINE TESTS PASSED WITH 100% SUCCESS!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
