from fastapi import APIRouter, HTTPException, Depends, Query
from backend.data.db import db
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
def get_student_notifications(
    unread_only: bool = Query(False),
    current_user: dict = Depends(get_current_user)
):
    """
    Get notifications for the logged-in student.
    Returns notification list along with unread count.
    """
    student_id = current_user.get("student_id") or (current_user.get("id") if current_user.get("role") == "student" else "ALL")
    notifs = db.get_notifications(student_id=student_id, unread_only=unread_only)
    unread_count = len([n for n in db.get_notifications(student_id=student_id) if not n.get("is_read", False)])

    return {
        "notifications": notifs,
        "unread_count": unread_count
    }

@router.put("/{notif_id}/read")
def mark_notification_as_read(
    notif_id: str,
    current_user: dict = Depends(get_current_user)
):
    notif = db.mark_notification_read(notif_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success", "notification": notif}

@router.put("/read-all")
def mark_all_notifications_read(
    current_user: dict = Depends(get_current_user)
):
    student_id = current_user.get("student_id") or "ALL"
    db.mark_all_notifications_read(student_id)
    return {"status": "success", "message": "All notifications marked as read"}
