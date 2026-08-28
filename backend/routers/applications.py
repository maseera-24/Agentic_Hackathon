from fastapi import APIRouter, HTTPException, Depends, Query
from backend.data.db import db
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/applications", tags=["Student Applications"])

@router.get("")
def get_applications(
    student_id: str = Query(None),
    drive_id: str = Query(None),
    status: str = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Get applications scoped by role.
    Students only ever receive their own applications.
    """
    if current_user.get("role") == "student":
        actual_student_id = current_user.get("student_id")
        return db.get_applications(student_id=actual_student_id, drive_id=drive_id, status=status)
    return db.get_applications(student_id=student_id, drive_id=drive_id, status=status)

@router.get("/me")
def get_my_applications(

    status: str = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all applications submitted by the logged-in student.
    Students can never view another student's applications.
    """
    if current_user.get("role") != "student":
        raise HTTPException(
            status_code=400,
            detail="Officer should use /api/officer/applications to view all applicant records."
        )

    student_id = current_user.get("student_id")
    if not student_id:
        raise HTTPException(status_code=404, detail="Student profile not linked to user")

    apps = db.get_applications(student_id=student_id, status=status)
    return apps

@router.get("/{app_id}")
def get_application_details(
    app_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get single application details.
    Enforces authorization: Students can only view their own applications.
    """
    app = db.get_application(app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if current_user.get("role") == "student":
        student_id = current_user.get("student_id")
        if app.get("student_id") != student_id:
            raise HTTPException(status_code=403, detail="Forbidden: You cannot access another student's application.")

    # Attach drive info if available
    drive = db.get_drive(app.get("drive_id"))
    return {
        "application": app,
        "drive": drive
    }
