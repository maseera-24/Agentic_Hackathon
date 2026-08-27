from fastapi import APIRouter, HTTPException, Body
from backend.data.db import db
from backend.agent.tools import agent_tools
from backend.agent.engines.exception_recovery_engine import exception_recovery_engine

router = APIRouter(prefix="/exceptions", tags=["Placement Exception Recovery Agent"])

@router.get("")
def list_exceptions():
    return db.get_exceptions()

@router.post("/trigger_demo_exception")
def trigger_panel_exception(payload: dict = Body(default={})):
    panel_id = payload.get("panel_id", "PANEL_02")
    # Mark panel status as Critical / Unavailable
    db.update_panel(panel_id, {"status": "Critical"})
    plan = agent_tools.generate_recovery_plan(panel_id)
    return plan

@router.post("/{exception_id}/approve")
def approve_recovery_plan(exception_id: str):
    exceptions = db.get_exceptions()
    exc = next((e for e in exceptions if e.get("id") == exception_id), None)
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")
    
    # Execute schedule changes
    all_scheds = db.get_schedules()
    all_panels = db.get_panels()
    updated_scheds = exception_recovery_engine.execute_recovery(exc, all_scheds, all_panels)
    db.set_schedules(updated_scheds)

    # Mark exception status as Approved / Resolved
    db.update_exception(exception_id, {"status": "Resolved (Plan A Executed)"})

    # Dispatch notifications to affected candidates
    for sid in exc.get("affected_student_ids", []):
        stu = db.get_student(sid)
        if stu:
            agent_tools.send_notification(sid, "Your interview has been rescheduled to a backup panel to prevent delays. Check your portal for new room details.")

    # Audit Trail
    db.add_audit_log(
        action="Approve Recovery Plan",
        trigger=f"TPO Approved Plan A for {exception_id}",
        ai_analysis="Reallocated candidates to Panel 4 & 5. Updated 18 calendar slots.",
        recommendation="Dispatched real-time schedule update notifications to all affected candidates.",
        approval_level="Approval Required",
        human_approval="Approved by TPO Dr. Ramanathan",
        status="Completed"
    )

    return {
        "status": "Success",
        "message": f"Recovery plan executed for {exc.get('affected_count', 18)} candidates. Schedule updated and notifications dispatched.",
        "exception_id": exception_id
    }

@router.post("/{exception_id}/reject")
def reject_recovery_plan(exception_id: str):
    db.update_exception(exception_id, {"status": "Rejected by TPO"})
    db.add_audit_log(
        action="Reject Recovery Plan",
        trigger=f"TPO Rejected Plan for {exception_id}",
        ai_analysis="Exception flagged for manual TPO override.",
        recommendation="Review individual slots manually.",
        approval_level="Approval Required",
        human_approval="Rejected by TPO",
        status="Manual Override"
    )
    return {"status": "Rejected", "message": "Recovery plan rejected. Drive flagged for manual TPO assignment."}
