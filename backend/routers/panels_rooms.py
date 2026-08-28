from fastapi import APIRouter, HTTPException, Body
from backend.data.db import db
from backend.agent.tools import agent_tools

router = APIRouter(prefix="/facilities", tags=["Panels & Venues"])

@router.get("/panels")
def list_panels():
    return db.get_panels()

@router.get("/rooms")
def list_rooms():
    return db.get_rooms()

@router.post("/assign_panel_room")
def assign_panel_room(payload: dict = Body(...)):
    panel_id = payload.get("panel_id")
    room_id = payload.get("room_id")
    if not panel_id or not room_id:
        raise HTTPException(status_code=400, detail="panel_id and room_id required")
    
    agent_tools.assign_panel(panel_id, "DRIVE_GOOGLE_2026", room_id)
    agent_tools.assign_room(room_id, panel_id, "DRIVE_GOOGLE_2026")
    return {"status": "Success", "message": f"Assigned {panel_id} to {room_id}"}
