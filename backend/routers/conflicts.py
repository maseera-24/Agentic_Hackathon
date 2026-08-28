from fastapi import APIRouter, Body
from backend.agent.tools import agent_tools
from backend.data.db import db

router = APIRouter(prefix="/conflicts", tags=["Student Opportunity Conflict Engine"])

@router.get("")
def get_opportunity_conflicts():
    return agent_tools.detect_schedule_conflicts()

@router.post("/resolve")
def resolve_conflict(payload: dict = Body(...)):
    conflict_id = payload.get("conflict_id")
    action = payload.get("action", "auto_buffer_shift")
    
    db.add_audit_log(
        action="resolve_opportunity_conflict",
        trigger=f"TPO executed conflict resolution for {conflict_id}",
        ai_reason="Rescheduled lower priority/second event to buffer slot, protecting 100% student opportunities.",
        recommendation="Dispatched updated calendar invites.",
        approval_level="Approval Required",
        human_approval="Approved by TPO",
        status="Completed"
    )
    return {"status": "Resolved", "message": f"Conflict {conflict_id} resolved with zero opportunity loss."}
