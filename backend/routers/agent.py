from typing import Optional
from fastapi import APIRouter, Body, Header
from backend.agent.orchestrator import orchestrator
from backend.agent.tools import agent_tools
from backend.data.db import db
from backend.routers.auth import decode_auth_token

router = APIRouter(prefix="/agent", tags=["AI Operations Copilot"])

@router.post("/chat")
def chat_with_copilot(
    payload: dict = Body(...),
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    message = payload.get("message", "")
    context = payload.get("context", {}) or {}

    # Extract authenticated identity if present
    token_str = None
    if authorization and authorization.startswith("Bearer "):
        token_str = authorization[7:].strip()

    if token_str:
        user_payload = decode_auth_token(token_str)
        if user_payload:
            context["user_role"] = user_payload.get("role", context.get("user_role"))
            context["user_id"] = user_payload.get("user_id", context.get("user_id"))
            context["student_id"] = user_payload.get("student_id", context.get("student_id"))
            context["user_email"] = user_payload.get("email", context.get("user_email"))

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
