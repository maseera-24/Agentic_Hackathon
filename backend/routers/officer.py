import os
import datetime
from fastapi import APIRouter, HTTPException, Depends, Query, Body, Response
from fastapi.responses import FileResponse
from backend.data.db import db
from backend.routers.auth import require_role

router = APIRouter(prefix="/officer", tags=["Placement Officer Management"])

# All routes in this router require placement_officer authorization
officer_auth = require_role("placement_officer")

# ==================== OFFICER DASHBOARD ====================
@router.get("/dashboard-stats")
def get_officer_dashboard_stats(current_user: dict = Depends(officer_auth)):
    students = db.get_students()
    drives = db.get_drives()
    applications = db.get_applications()
    schedules = db.get_schedules()

    active_drives = [d for d in drives if d.get("drive_status", "").upper() == "ACTIVE" or d.get("status", "").lower() == "active"]
    upcoming_drives = [d for d in drives if d.get("drive_status", "").upper() == "UPCOMING" or d.get("status", "").lower() == "upcoming"]
    completed_drives = [d for d in drives if d.get("drive_status", "").upper() == "COMPLETED" or d.get("status", "").lower() == "completed"]

    shortlisted = [a for a in applications if a.get("status") in ["SHORTLISTED", "ASSESSMENT", "INTERVIEW"]]
    selected = [a for a in applications if a.get("status") == "SELECTED"]

    recent_drives = drives[:5]
    recent_apps = applications[:8]
    upcoming_interviews = schedules[:6]

    return {
        "stats": {
            "total_students": len(students),
            "active_drives": len(active_drives),
            "upcoming_drives": len(upcoming_drives),
            "completed_drives": len(completed_drives),
            "total_applications": len(applications),
            "shortlisted_students": len(shortlisted),
            "selected_students": len(selected),
            "scheduled_interviews": len(schedules)
        },
        "recent_drives": recent_drives,
        "recent_applications": recent_apps,
        "upcoming_interviews": upcoming_interviews
    }

# ==================== STUDENT MANAGEMENT ====================
@router.get("/students")
def list_students(
    search: str = Query(None),
    branch: str = Query(None),
    min_cgpa: float = Query(None),
    current_user: dict = Depends(officer_auth)
):
    students = db.get_students()
    if branch and branch != "All":
        students = [s for s in students if s.get("branch") == branch]
    if min_cgpa is not None:
        students = [s for s in students if s.get("cgpa", 0) >= min_cgpa]
    if search:
        q = search.lower().strip()
        students = [
            s for s in students if
            q in s.get("name", "").lower() or
            q in s.get("id", "").lower() or
            q in s.get("email", "").lower() or
            any(q in skill.lower() for skill in s.get("technical_skills", []))
        ]
    return students

@router.get("/students/{student_id}")
def get_student_details(
    student_id: str,
    current_user: dict = Depends(officer_auth)
):
    student = db.get_student(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    apps = db.get_applications(student_id=student_id)
    schedules = [s for s in db.get_schedules() if s.get("student_id") == student_id]
    communications = db.get_communications(student_id)

    return {
        "student": student,
        "applications": apps,
        "schedules": schedules,
        "communications": communications
    }

@router.get("/students/{student_id}/resume")
def download_student_resume(
    student_id: str,
    current_user: dict = Depends(officer_auth)
):
    student = db.get_student(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    resume_path = db.get_student_resume_path(student_id)
    if resume_path and os.path.exists(resume_path):
        return FileResponse(
            resume_path,
            media_type="application/pdf",
            filename=student.get("resume_filename", f"{student.get('name', 'Student')}_Resume.pdf")
        )

    raise HTTPException(
        status_code=404,
        detail=f"Resume has not been uploaded by {student.get('name', student_id)}."
    )

@router.post("/students")
def create_student(
    payload: dict = Body(...),
    current_user: dict = Depends(officer_auth)
):
    if not payload.get("name") or not payload.get("email"):
        raise HTTPException(status_code=400, detail="Student Name and Email are required")

    new_id = f"STU{len(db.get_students()) + 1:03d}"
    payload["id"] = new_id
    payload.setdefault("branch", "Computer Science & Engineering")
    payload.setdefault("cgpa", 8.0)
    payload.setdefault("graduation_year", 2026)
    payload.setdefault("placement_status", "Unplaced")
    payload.setdefault("technical_skills", ["Python", "Java", "SQL"])

    student = db.add_student(payload)
    return {"status": "success", "student": student}

@router.put("/students/{student_id}")
def update_student(
    student_id: str,
    payload: dict = Body(...),
    current_user: dict = Depends(officer_auth)
):
    updated = db.update_student(student_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"status": "success", "student": updated}

# ==================== DRIVE MANAGEMENT ====================
@router.get("/drives")
def list_officer_drives(
    status: str = Query(None),
    current_user: dict = Depends(officer_auth)
):
    return db.get_drives(status=status)

@router.post("/drives")
def create_placement_drive(
    payload: dict = Body(...),
    current_user: dict = Depends(officer_auth)
):
    if not payload.get("company_name") or not payload.get("role_title"):
        raise HTTPException(status_code=400, detail="Company Name and Job Role are required")

    drive_date = payload.get("drive_date") or payload.get("date")
    deadline = payload.get("deadline") or payload.get("application_deadline")

    # Date validations
    if drive_date and deadline:
        try:
            d_date = datetime.date.fromisoformat(str(drive_date).strip()[:10])
            d_dead = datetime.date.fromisoformat(str(deadline).strip()[:10])
            if d_dead > d_date:
                raise HTTPException(
                    status_code=400,
                    detail="Application deadline cannot be after the drive date."
                )
        except ValueError:
            pass

    drive = db.add_drive(payload)

    # Broadcast notification to all eligible students
    db.add_notification(
        student_id="ALL",
        title=f"🚀 New Placement Drive: {drive.get('company_name')}",
        message=f"{drive.get('company_name')} is hiring for {drive.get('role_title')} ({drive.get('package', drive.get('ctc', 'Best in Industry'))}). Check eligibility and apply now!",
        notif_type="NEW_DRIVE",
        link="/drives"
    )

    return {"status": "success", "drive": drive}


@router.put("/drives/{drive_id}")
def update_placement_drive(
    drive_id: str,
    payload: dict = Body(...),
    current_user: dict = Depends(officer_auth)
):
    drive = db.update_drive(drive_id, payload)
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
    return {"status": "success", "drive": drive}

@router.delete("/drives/{drive_id}")
def delete_placement_drive(
    drive_id: str,
    current_user: dict = Depends(officer_auth)
):
    deleted = db.delete_drive(drive_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Drive not found")
    return {"status": "success", "message": "Placement drive deleted successfully"}

# ==================== APPLICATION MANAGEMENT ====================
@router.get("/applications")
def list_all_applications(
    drive_id: str = Query(None),
    status: str = Query(None),
    student_id: str = Query(None),
    current_user: dict = Depends(officer_auth)
):
    return db.get_applications(student_id=student_id, drive_id=drive_id, status=status)

@router.put("/applications/{app_id}/status")
def update_application_stage(
    app_id: str,
    payload: dict = Body(...),
    current_user: dict = Depends(officer_auth)
):
    new_status = payload.get("status")
    current_round = payload.get("current_round")

    if not new_status:
        raise HTTPException(status_code=400, detail="Status is required")

    app = db.update_application_status(app_id, new_status, current_round=current_round)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Send status change notification to student
    status_label = new_status.replace("_", " ").title()
    db.add_notification(
        student_id=app.get("student_id"),
        title=f"Application Status: {app.get('company_name')} - {status_label}",
        message=f"Your application status for {app.get('role_title')} at {app.get('company_name')} is now '{status_label}'.",
        notif_type="APPLICATION_UPDATE",
        link="/applications"
    )

    return {"status": "success", "application": app}

@router.put("/applications/{app_id}/result")
def set_application_result(
    app_id: str,
    payload: dict = Body(...),
    current_user: dict = Depends(officer_auth)
):
    status = payload.get("status") # "SELECTED" or "NOT_SELECTED"
    reason = payload.get("reason", "")
    feedback = payload.get("feedback", "")
    next_step = payload.get("next_step", "")
    offer_ctc = payload.get("offer_ctc", "")

    if status not in ["SELECTED", "NOT_SELECTED"]:
        raise HTTPException(status_code=400, detail="Status must be 'SELECTED' or 'NOT_SELECTED'")

    app = db.update_application_result(
        app_id=app_id,
        status=status,
        reason=reason,
        feedback=feedback,
        next_step=next_step,
        offer_ctc=offer_ctc
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Dispatch notification to student
    if status == "SELECTED":
        db.add_notification(
            student_id=app.get("student_id"),
            title=f"🎉 Offer Extended: {app.get('company_name')}!",
            message=f"Congratulations! You have been selected for {app.get('role_title')} at {app.get('company_name')} ({offer_ctc or app.get('package', '')}). View your offer details on the portal.",
            notif_type="SELECTION",
            link="/applications"
        )
    else:
        db.add_notification(
            student_id=app.get("student_id"),
            title=f"Placement Drive Result: {app.get('company_name')}",
            message=f"Feedback and results for your {app.get('company_name')} interview are now available.",
            notif_type="RESULT",
            link="/applications"
        )

    return {"status": "success", "application": app}

@router.put("/applications/{app_id}/panel")
def assign_interview_panel(
    app_id: str,
    payload: dict = Body(...),
    current_user: dict = Depends(officer_auth)
):
    panel_id = payload.get("panel_id", "PANEL_01")
    panel_name = payload.get("panel_name", "Technical Interview Panel")
    date = payload.get("date")
    time = payload.get("time")
    venue = payload.get("venue")
    interviewers = payload.get("interviewers", "")
    instructions = payload.get("instructions", "")

    if not date or not time or not venue:
        raise HTTPException(status_code=400, detail="Date, Time, and Venue are required")

    app = db.assign_application_panel(
        app_id=app_id,
        panel_id=panel_id,
        panel_name=panel_name,
        date=date,
        time=time,
        venue=venue,
        interviewers=interviewers,
        instructions=instructions
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Notify student about interview schedule
    db.add_notification(
        student_id=app.get("student_id"),
        title=f"📅 Interview Scheduled: {app.get('company_name')}",
        message=f"Your interview for {app.get('role_title')} at {app.get('company_name')} is scheduled on {date} at {time} in {venue}.",
        notif_type="INTERVIEW_SCHEDULED",
        link="/applications"
    )

    return {"status": "success", "application": app}

# ==================== BROADCAST NOTIFICATIONS ====================
@router.post("/notifications")
def send_broadcast_notification(
    payload: dict = Body(...),
    current_user: dict = Depends(officer_auth)
):
    recipient = payload.get("recipient", "ALL") # "ALL" or specific student_id
    title = payload.get("title")
    message = payload.get("message")
    notif_type = payload.get("type", "ANNOUNCEMENT")
    link = payload.get("link", "/applications")

    if not title or not message:
        raise HTTPException(status_code=400, detail="Title and message are required")

    notif = db.add_notification(
        student_id=recipient,
        title=title,
        message=message,
        notif_type=notif_type,
        link=link
    )
    return {"status": "success", "notification": notif}
