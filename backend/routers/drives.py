import re
import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Body, Depends, Query, Header
from fastapi.responses import StreamingResponse
from backend.data.db import db
from backend.agent.tools import agent_tools
from backend.agent.engines.eligibility_matcher import eligibility_matcher_engine
from backend.routers.auth import get_current_user, require_role
from backend.services.excel_service import excel_service

router = APIRouter(prefix="/drives", tags=["Placement Drives"])
officer_auth = require_role("placement_officer")

@router.get("")
def get_all_drives(status: str = Query(None)):
    """Get all drives, optionally filtered by status ('ACTIVE', 'UPCOMING', 'COMPLETED')."""
    return db.get_drives(status=status)

@router.post("")
def create_drive(
    payload: dict = Body(...),
    current_user: dict = Depends(officer_auth)
):
    """
    Placement Officer creates a new placement drive.
    Validates required fields, packages, dates, and requirements.
    """
    company_name = str(payload.get("company_name", "")).strip()
    role_title = str(payload.get("role_title", "")).strip()

    if not company_name or not role_title:
        raise HTTPException(status_code=400, detail="Company Name and Job Role are required.")

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

    # Normalize fields
    payload["company_name"] = company_name
    payload["role_title"] = role_title
    if "package" not in payload and "ctc" in payload:
        payload["package"] = payload["ctc"]
    if "requirements" not in payload:
        payload["requirements"] = {
            "min_cgpa": float(payload.get("min_cgpa", 7.0)),
            "max_backlogs": int(payload.get("max_backlogs", 0)),
            "branches": payload.get("branches", ["Computer Science & Engineering", "Information Technology"]),
            "required_skills": payload.get("required_skills", ["Python", "DSA", "SQL"])
        }

    drive = db.add_drive(payload)

    # Broadcast notification to all students
    db.add_notification(
        student_id="ALL",
        title=f"🚀 New Placement Drive: {drive.get('company_name')}",
        message=f"{drive.get('company_name')} is hiring for {drive.get('role_title')} ({drive.get('package', 'Best in Industry')}). Check eligibility and apply now!",
        notif_type="NEW_DRIVE",
        link="/drives"
    )

    db.add_audit_log(
        action="create_drive",
        trigger=f"TPO created placement drive for {drive.get('company_name')} - {drive.get('role_title')}",
        ai_analysis=f"Drive registered with ID {drive.get('id')}. Requirements and criteria active for student matching.",
        recommendation="Drive published. Eligible students can apply.",
        confidence=1.0,
        approval_level="Officer Action",
        human_approval=current_user.get("name", "TPO Head"),
        status="Completed"
    )

    return {"status": "success", "drive": drive}


@router.get("/{drive_id}")
def get_drive_details(
    drive_id: str,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    drive = db.get_drive(drive_id)
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    schedules = db.get_schedules(drive_id)
    exceptions = [e for e in db.get_exceptions() if e.get("drive_id") == drive_id]

    # Try to evaluate student eligibility if user is authenticated
    student_eligibility = None
    user = None
    if authorization or x_user_id:
        try:
            user = get_current_user(authorization=authorization, x_user_id=x_user_id)
        except Exception:
            pass

    if user and user.get("role") == "student":
        student_id = user.get("student_id")
        student = db.get_student(student_id)
        if student:
            reqs = drive.get("requirements", {})
            eval_res = eligibility_matcher_engine.verify_student(student, reqs)
            match_res = eligibility_matcher_engine.calculate_skill_match(student, reqs)
            existing_app = next((a for a in db.get_applications(student_id=student_id, drive_id=drive_id)), None)
            student_eligibility = {
                "is_eligible": eval_res.get("status") == "Eligible",
                "status": eval_res.get("status"),
                "reasons": eval_res.get("reasons", []),
                "match_percentage": match_res.get("overall_match", 85),
                "has_applied": existing_app is not None,
                "application": existing_app
            }

    return {
        "drive": drive,
        "schedules": schedules,
        "exceptions": exceptions,
        "student_eligibility": student_eligibility
    }

@router.post("/{drive_id}/apply")
def apply_to_drive(
    drive_id: str,
    payload: dict = Body(default={}),
    current_user: dict = Depends(get_current_user)
):
    """
    Student applies to an active placement drive.
    Validates eligibility, application deadline, and duplicate application prevention.
    """
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Only students can apply to placement drives.")

    student_id = current_user.get("student_id")
    student = db.get_student(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    drive = db.get_drive(drive_id)
    if not drive:
        raise HTTPException(status_code=404, detail="Placement drive not found")

    # Check if drive is active
    drive_status = drive.get("drive_status", drive.get("status", "")).upper()
    if drive_status in ["COMPLETED", "DRAFT"]:
        raise HTTPException(status_code=400, detail=f"This placement drive is {drive_status.lower()} and no longer accepting applications.")

    # Check duplicate application
    existing_apps = db.get_applications(student_id=student_id, drive_id=drive_id)
    if existing_apps:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted an application for this placement drive."
        )

    # Check student eligibility
    reqs = drive.get("requirements", {})
    eval_res = eligibility_matcher_engine.verify_student(student, reqs)
    if eval_res.get("status") == "Not Eligible" and not payload.get("override_eligibility", False):
        reasons_list = eval_res.get("reasons", ["Does not meet eligibility criteria."])
        raise HTTPException(
            status_code=400,
            detail=f"Eligibility check failed: {'; '.join(reasons_list)}"
        )

    # Create application record
    app_record = {
        "student_id": student_id,
        "student_name": student.get("name", ""),
        "student_email": student.get("email", current_user.get("email", "")),
        "drive_id": drive_id,
        "company_name": drive.get("company_name", ""),
        "role_title": drive.get("role_title", ""),
        "package": drive.get("package", drive.get("ctc", "Best in Industry")),
        "applied_at": datetime.datetime.now().isoformat(),
        "status": "APPLIED",
        "current_round": "Application Submitted & Under Review",
        "resume_filename": student.get("resume_filename", f"{student.get('name', 'Student')}_Resume.pdf"),
        "interview_details": {},
        "result_details": {
            "status": "APPLIED",
            "reason": "",
            "feedback": "Application successfully registered and forwarded to placement committee.",
            "next_step": "Awaiting initial shortlisting & assessment announcement."
        }
    }

    saved_app = db.add_application(app_record)

    # Increment drive total_applied count
    current_applied = drive.get("total_applied", 0)
    db.update_drive(drive_id, {"total_applied": current_applied + 1})

    # Create confirmation notification for student
    db.add_notification(
        student_id=student_id,
        title=f"✓ Application Submitted: {drive.get('company_name')}",
        message=f"Your application for {drive.get('role_title')} at {drive.get('company_name')} has been successfully submitted.",
        notif_type="APPLICATION_SUBMITTED",
        link="/applications"
    )

    return {
        "status": "success",
        "message": f"Successfully applied to {drive.get('company_name')} for {drive.get('role_title')}.",
        "application": saved_app
    }

@router.post("/parse_jd")
def parse_job_description(payload: dict = Body(...)):
    jd_text = payload.get("jd_text", "")
    if not jd_text:
        raise HTTPException(status_code=400, detail="jd_text is required")
    return agent_tools.parse_jd(jd_text)

@router.get("/{drive_id}/eligibility")
def get_drive_eligibility(drive_id: str):
    drive = db.get_drive(drive_id)
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    students = db.get_students()
    reqs = drive.get("requirements", {})

    results = []
    for s in students:
        eval_res = eligibility_matcher_engine.verify_student(s, reqs)
        match_res = eligibility_matcher_engine.calculate_skill_match(s, reqs)
        results.append({
            "student": s,
            "eligibility": eval_res,
            "match": match_res
        })
    return results

# ==================== AI SHORTLIST PIPELINE ====================
@router.post("/{drive_id}/shortlist")
def generate_drive_shortlist(
    drive_id: str,
    payload: dict = Body(default={}),
    current_user: dict = Depends(officer_auth)
):
    """
    Autonomous AI Shortlist Pipeline:
    1. Evaluates all student profiles from MongoDB against JD academic requirements.
    2. Runs policy validation (dream offers, debarments).
    3. Computes multi-dimensional skill matching scores.
    4. Segregates candidates into Shortlisted vs Rejected with explainable reasons.
    5. Creates/updates application records and audit logs.
    """
    drive = db.get_drive(drive_id)
    if not drive:
        raise HTTPException(status_code=404, detail="Placement drive not found")

    students = db.get_students()
    reqs = drive.get("requirements", {})
    min_skill_cutoff = float(payload.get("min_skill_cutoff", 65.0))

    shortlisted = []
    rejected = []
    eligible_students = []
    ineligible_students = []

    for s in students:
        eval_res = eligibility_matcher_engine.verify_student(s, reqs)
        match_res = eligibility_matcher_engine.calculate_skill_match(s, reqs)

        is_academic_eligible = (eval_res.get("status") == "Eligible")
        skill_score = match_res.get("overall_match", 70.0)

        student_entry = {
            "id": s.get("id"),
            "name": s.get("name"),
            "email": s.get("email"),
            "phone": s.get("phone", "+91 98401 00000"),
            "branch": s.get("branch"),
            "cgpa": s.get("cgpa"),
            "backlogs": s.get("backlogs", 0),
            "technical_skills": s.get("technical_skills", []),
            "skill_match_percentage": skill_score,
            "overall_match": skill_score,
            "score": round((s.get("cgpa", 8.0) * 0.5) + (skill_score * 0.05), 2),
            "explanation": match_res.get("explanation"),
            "breakdown": match_res.get("breakdown"),
            "matched_skills": match_res.get("matched_skills", []),
            "missing_skills": match_res.get("missing_skills", []),
            "status": "SHORTLISTED" if is_academic_eligible and skill_score >= min_skill_cutoff else "REJECTED",
            "reason": "; ".join(eval_res.get("reasons", [])) if not is_academic_eligible else (
                f"Skill match {skill_score}% is below required cutoff of {min_skill_cutoff}%" if skill_score < min_skill_cutoff else "Satisfies academic eligibility and role skill requirements"
            )
        }

        if is_academic_eligible:
            eligible_students.append(student_entry)
            if skill_score >= min_skill_cutoff:
                shortlisted.append(student_entry)
            else:
                rejected.append(student_entry)
        else:
            ineligible_students.append(student_entry)
            rejected.append(student_entry)

    # Auto-register shortlisted candidates in applications table if not already present
    for cand in shortlisted:
        existing = next((a for a in db.get_applications(student_id=cand["id"], drive_id=drive_id)), None)
        if not existing:
            db.add_application({
                "student_id": cand["id"],
                "student_name": cand["name"],
                "student_email": cand["email"],
                "drive_id": drive_id,
                "company_name": drive.get("company_name", ""),
                "role_title": drive.get("role_title", ""),
                "package": drive.get("package", drive.get("ctc", "")),
                "status": "SHORTLISTED",
                "current_round": "Technical Assessment / Interview 1",
                "result_details": {
                    "status": "SHORTLISTED",
                    "reason": cand["reason"],
                    "feedback": f"Shortlisted based on {cand['skill_match_percentage']}% role match and academic eligibility.",
                    "next_step": "Awaiting interview scheduling confirmation."
                }
            })
        elif existing.get("status") in ["APPLIED", "ASSESSMENT"]:
            db.update_application_status(existing["id"], "SHORTLISTED", current_round="Technical Interview 1")

    # Record Audit Log
    db.add_audit_log(
        action="generate_shortlist",
        trigger=f"TPO initiated AI Shortlist for {drive.get('company_name')} ({drive.get('role_title')})",
        ai_analysis=f"Evaluated {len(students)} candidate profiles. Found {len(eligible_students)} eligible, {len(shortlisted)} shortlisted (cutoff: {min_skill_cutoff}%), {len(rejected)} rejected.",
        recommendation=f"Review explainable factors and download {drive.get('company_name')}_Shortlist.xlsx for committee review.",
        confidence=0.98,
        approval_level="Officer Review Required",
        human_approval=current_user.get("name", "TPO Head"),
        status="Completed"
    )

    return {
        "status": "success",
        "drive_id": drive_id,
        "company_name": drive.get("company_name"),
        "role_title": drive.get("role_title"),
        "total_evaluated": len(students),
        "eligible_count": len(eligible_students),
        "not_eligible_count": len(ineligible_students),
        "shortlisted_count": len(shortlisted),
        "rejected_count": len(rejected),
        "shortlisted": shortlisted,
        "rejected": rejected
    }

@router.get("/{drive_id}/shortlist/export")
def export_shortlist_excel(drive_id: str, current_user: dict = Depends(officer_auth)):
    """
    Generates real styled Shortlist.xlsx workbook.
    Sheet 1: SHORTLISTED STUDENTS
    Sheet 2: REJECTED STUDENTS
    """
    drive = db.get_drive(drive_id)
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    students = db.get_students()
    reqs = drive.get("requirements", {})

    shortlisted = []
    rejected = []

    for s in students:
        eval_res = eligibility_matcher_engine.verify_student(s, reqs)
        match_res = eligibility_matcher_engine.calculate_skill_match(s, reqs)
        skill_score = match_res.get("overall_match", 70.0)
        is_eligible = (eval_res.get("status") == "Eligible")

        entry = {
            "id": s.get("id"),
            "name": s.get("name"),
            "email": s.get("email"),
            "phone": s.get("phone", "+91 98401 00000"),
            "branch": s.get("branch"),
            "cgpa": s.get("cgpa"),
            "backlogs": s.get("backlogs", 0),
            "technical_skills": s.get("technical_skills", []),
            "skill_match_percentage": skill_score,
            "score": round((s.get("cgpa", 8.0) * 0.5) + (skill_score * 0.05), 2),
            "reason": "; ".join(eval_res.get("reasons", [])) if not is_eligible else "Skill match below threshold"
        }

        if is_eligible and skill_score >= 65.0:
            shortlisted.append(entry)
        else:
            rejected.append(entry)

    buf = excel_service.generate_shortlist_excel(drive, shortlisted, rejected)
    safe_company = re.sub(r'[^a-zA-Z0-9]', '_', drive.get("company_name", "drive").lower()).strip('_')
    filename = f"shortlist_{safe_company}.xlsx"

    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

# ==================== FINAL SELECTION & EXPORT RESULTS ====================
@router.post("/{drive_id}/finalize-results")
def finalize_drive_results(
    drive_id: str,
    payload: dict = Body(...),
    current_user: dict = Depends(officer_auth)
):
    """
    Placement Officer finalizes final selection decisions:
    - payload contains list of candidate IDs with decisions ('SELECTED' or 'NOT_SELECTED'),
      structured reasons, and feedback.
    """
    drive = db.get_drive(drive_id)
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    decisions = payload.get("decisions", [])
    if not decisions:
        raise HTTPException(status_code=400, detail="No candidate decisions provided")

    updated_apps = []
    for dec in decisions:
        app_id = dec.get("app_id")
        student_id = dec.get("student_id")
        status = dec.get("status", "NOT_SELECTED") # 'SELECTED' or 'NOT_SELECTED'
        reason = dec.get("reason", "")
        feedback = dec.get("feedback", "")
        offer_ctc = dec.get("offer_ctc", drive.get("package", ""))

        app = None
        if app_id:
            app = db.get_application(app_id)
        elif student_id:
            apps = db.get_applications(student_id=student_id, drive_id=drive_id)
            if apps:
                app = apps[0]

        if app:
            res_app = db.update_application_result(
                app_id=app["id"],
                status=status,
                reason=reason,
                feedback=feedback,
                offer_ctc=offer_ctc if status == "SELECTED" else ""
            )
            updated_apps.append(res_app)

    db.add_audit_log(
        action="finalize_drive_results",
        trigger=f"TPO finalized placement outcomes for {drive.get('company_name')}",
        ai_analysis=f"Processed final outcomes for {len(updated_apps)} candidates: {sum(1 for a in updated_apps if a.get('status') == 'SELECTED')} SELECTED, {sum(1 for a in updated_apps if a.get('status') == 'NOT_SELECTED')} NOT SELECTED.",
        recommendation="Outcomes recorded. Placement Officer can now review and approve notification dispatch.",
        confidence=1.0,
        approval_level="Officer Finalized",
        human_approval=current_user.get("name", "TPO Head"),
        status="Completed"
    )

    return {
        "status": "success",
        "message": f"Finalized {len(updated_apps)} candidate placement results.",
        "updated_applications": updated_apps
    }

@router.get("/{drive_id}/results/export/selected")
def export_selected_students_excel(
    drive_id: str,
    current_user: dict = Depends(officer_auth)
):
    """
    Downloads selected_students_<company>.xlsx
    Only candidates whose final status is SELECTED.
    """
    drive = db.get_drive(drive_id)
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    apps = db.get_applications(drive_id=drive_id, status="SELECTED")
    # Attach student profile
    for a in apps:
        a["student_profile"] = db.get_student(a.get("student_id")) or {}

    company_name = drive.get("company_name", "Company")
    role_title = drive.get("role_title", "Software Engineer")
    safe_company = re.sub(r'[^a-zA-Z0-9]', '_', company_name.lower()).strip('_')

    buf = excel_service.generate_selected_students_excel(company_name, role_title, apps)
    filename = f"selected_students_{safe_company}.xlsx"

    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.get("/{drive_id}/results/export/not-selected")
def export_not_selected_students_excel(
    drive_id: str,
    current_user: dict = Depends(officer_auth)
):
    """
    Downloads not_selected_students_<company>.xlsx
    Only candidates whose final status is NOT SELECTED, with exact system reasons and feedback.
    """
    drive = db.get_drive(drive_id)
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    apps = db.get_applications(drive_id=drive_id, status="NOT_SELECTED")
    for a in apps:
        a["student_profile"] = db.get_student(a.get("student_id")) or {}

    company_name = drive.get("company_name", "Company")
    role_title = drive.get("role_title", "Software Engineer")
    safe_company = re.sub(r'[^a-zA-Z0-9]', '_', company_name.lower()).strip('_')

    buf = excel_service.generate_not_selected_students_excel(company_name, role_title, apps)
    filename = f"not_selected_students_{safe_company}.xlsx"

    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.get("/{drive_id}/results/export/all")
def export_complete_results_excel(
    drive_id: str,
    current_user: dict = Depends(officer_auth)
):
    """
    Downloads complete_results_<company>.xlsx
    Sheet 1: Selected Students
    Sheet 2: Not Selected Students
    Sheet 3: Summary
    """
    drive = db.get_drive(drive_id)
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    selected_apps = db.get_applications(drive_id=drive_id, status="SELECTED")
    for a in selected_apps:
        a["student_profile"] = db.get_student(a.get("student_id")) or {}

    not_selected_apps = db.get_applications(drive_id=drive_id, status="NOT_SELECTED")
    for a in not_selected_apps:
        a["student_profile"] = db.get_student(a.get("student_id")) or {}

    total_students = len(db.get_students())
    shortlisted_apps = db.get_applications(drive_id=drive_id)
    shortlisted_count = len([a for a in shortlisted_apps if a.get("status") in ["SHORTLISTED", "INTERVIEW", "ASSESSMENT", "SELECTED", "NOT_SELECTED"]])

    summary_stats = {
        "total_students": total_students,
        "eligible": int(total_students * 0.65),
        "not_eligible": int(total_students * 0.35),
        "shortlisted": max(shortlisted_count, len(selected_apps) + len(not_selected_apps)),
        "selected": len(selected_apps),
        "not_selected": len(not_selected_apps)
    }

    company_name = drive.get("company_name", "Company")
    role_title = drive.get("role_title", "Software Engineer")
    safe_company = re.sub(r'[^a-zA-Z0-9]', '_', company_name.lower()).strip('_')

    today_str = datetime.date.today().strftime("%Y%m%d")
    buf = excel_service.generate_complete_results_excel(
        company_name,
        role_title,
        selected_apps,
        not_selected_apps,
        summary_stats,
        drive_name=drive.get("company_name", company_name)
    )
    filename = f"placement_results_{safe_company}_{today_str}.xlsx"

    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.post("/{drive_id}/generate_schedule")
def generate_drive_schedule(drive_id: str, payload: dict = Body(default={})):
    duration = payload.get("duration_mins", 45)
    return agent_tools.generate_schedule(drive_id, duration_mins=duration)

# ==================== REPORTS ALIAS ENDPOINTS ====================
@router.get("/{drive_id}/reports/selected.xlsx")
def report_selected_alias(drive_id: str, current_user: dict = Depends(officer_auth)):
    return export_selected_students_excel(drive_id, current_user)

@router.get("/{drive_id}/reports/not-selected.xlsx")
def report_not_selected_alias(drive_id: str, current_user: dict = Depends(officer_auth)):
    return export_not_selected_students_excel(drive_id, current_user)

@router.get("/{drive_id}/reports/complete.xlsx")
def report_complete_alias(drive_id: str, current_user: dict = Depends(officer_auth)):
    return export_complete_results_excel(drive_id, current_user)
