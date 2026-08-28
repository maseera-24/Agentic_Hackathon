from fastapi import APIRouter, Body
from backend.agent.orchestrator import orchestrator
from backend.agent.tools import agent_tools
from backend.data.db import db

router = APIRouter(prefix="/agent", tags=["AI Operations Copilot"])

@router.post("/chat")
def chat_with_copilot(payload: dict = Body(...)):
    message = payload.get("message", "")
    context = payload.get("context", {})
    return orchestrator.process_tpo_message(message, context=context)

@router.get("/status")
def get_agent_brain_status():
    drives = db.get_drives()
    exceptions = db.get_exceptions()
    unresolved_exc = [e for e in exceptions if "Pending" in e.get("status", "")]
    schedules = db.get_schedules()
    students = db.get_students()
    unconfirmed = [s for s in students if not s.get("attendance_confirmed", True)]

    return {
        "status": "Online & Monitoring",
        "agent_mode": "Autonomous Operations with Human-in-the-Loop Gating",
        "active_drives_count": len(drives),
        "total_scheduled_interviews": len(schedules),
        "critical_unhandled_exceptions": len(unresolved_exc),
        "unconfirmed_students_count": len(unconfirmed),
        "last_heartbeat": "Active"
    }

@router.post("/tools/{tool_name}")
def execute_tool_directly(tool_name: str, payload: dict = Body(default={})):
    tool_func = getattr(agent_tools, tool_name, None)
    if not tool_func:
        return {"error": f"Tool '{tool_name}' not found in registry"}
    try:
        return tool_func(**payload)
    except Exception as e:
        return {"error": str(e)}
