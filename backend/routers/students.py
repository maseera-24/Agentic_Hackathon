import os
import base64
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends, Body, UploadFile, File, Response
from fastapi.responses import FileResponse, StreamingResponse
from backend.data.db import db
from backend.agent.tools import agent_tools
from backend.routers.auth import get_current_user
from backend.services.excel_service import excel_service

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/sample-template")
def download_student_sample_template():
    """Download clean .xlsx template for student roster upload."""
    buf = excel_service.generate_sample_student_template()
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=Student_Roster_Template.xlsx"}
    )

@router.post("/upload")
async def upload_students_excel(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Placement Officer uploads student roster spreadsheet (.xlsx).
    Validates rows, detects duplicates/invalids, and persists to MongoDB Atlas.
    """
    if current_user.get("role") not in ["placement_officer", "tpo", "admin"]:
        raise HTTPException(status_code=403, detail="Forbidden: Only placement officers can upload student rosters.")

    filename = file.filename or ""
    if not (filename.lower().endswith(".xlsx") or filename.lower().endswith(".xls")):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a Microsoft Excel (.xlsx) file.")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded Excel file is empty.")

    existing_students = db.get_students()
    
    try:
        result = excel_service.parse_and_validate_student_excel(content, existing_students)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process Excel spreadsheet: {str(e)}")

    # Persist valid records to MongoDB Atlas
    added_students = result.get("added_students", [])
    updated_students = result.get("updated_students", [])
    
    if added_students or updated_students:
        db.add_students_batch(added_students, updated_students)
        
    db.add_audit_log(
        action="upload_students_excel",
        trigger=f"TPO uploaded student roster '{filename}' ({result['records_processed']} records)",
        ai_analysis=f"Parsed and validated {result['records_processed']} rows: {result['added']} added, {result['updated']} updated, {result['rejected']} rejected.",
        recommendation=f"{result['added'] + result['updated']} students synchronized to MongoDB.",
        confidence=0.99,
        approval_level="Officer Action",
        human_approval=current_user.get("name", "TPO Head"),
        status="Completed"
    )

    return {
        "status": "UPLOAD COMPLETE",
        "records_processed": result["records_processed"],
        "added": result["added"],
        "updated": result["updated"],
        "rejected": result["rejected"],
        "rejected_rows": result["rejected_rows"],
        "total_active_students": len(db.get_students())
    }

@router.get("/me")
def get_my_profile(current_user: dict = Depends(get_current_user)):
    """
    Get full profile of logged-in student.
    Calculates profile completion percentage.
    """
    if current_user.get("role") != "student":
        raise HTTPException(status_code=400, detail="User is not a student")
        
    student_id = current_user.get("student_id")
    student = db.get_student(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    # Calculate dynamic profile completion %
    fields = [
        bool(student.get("name")),
        bool(student.get("email")),
        bool(student.get("phone")),
        bool(student.get("branch")),
        bool(student.get("cgpa")),
        bool(student.get("graduation_year")),
        bool(student.get("technical_skills") and len(student.get("technical_skills")) > 0),
        bool(student.get("resume_filename") or student.get("resume_url")),
        bool(student.get("projects") and len(student.get("projects")) > 0),
        bool(student.get("certifications") and len(student.get("certifications")) > 0)
    ]
    completion_pct = int((sum(1 for f in fields if f) / len(fields)) * 100)
    student["profile_completion"] = completion_pct
    
    # Associated user records
    applications = db.get_applications(student_id=student_id)
    schedules = [s for s in db.get_schedules() if s.get("student_id") == student_id]
    
    return {
        "student": student,
        "profile_completion": completion_pct,
        "applications": applications,
        "schedules": schedules
    }

@router.put("/me")
def update_my_profile(
    payload: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Update student's own editable profile fields.
    Does not allow modifying sensitive fields like student ID or role.
    """
    if current_user.get("role") != "student":
        raise HTTPException(status_code=400, detail="User is not a student")
        
    student_id = current_user.get("student_id")
    
    # Filter only permitted editable fields
    permitted_fields = [
        "name", "phone", "department", "branch", "year",
        "cgpa", "graduation_year", "technical_skills", "preferred_skills",
        "certifications", "projects"
    ]
    clean_updates = {k: v for k, v in payload.items() if k in permitted_fields}
    
    if "cgpa" in clean_updates:
        try:
            clean_updates["cgpa"] = float(clean_updates["cgpa"])
        except ValueError:
            raise HTTPException(status_code=400, detail="CGPA must be a valid number")
            
    updated = db.update_student(student_id, clean_updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Student record not found")
        
    return {"status": "success", "student": updated}

@router.post("/me/resume")
async def upload_my_resume(
    file: Optional[UploadFile] = File(None),
    payload: Optional[dict] = Body(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload or replace PDF resume for the authenticated student.
    Supports both Multipart Form Upload and JSON Base64 Upload.
    Validates file size (<5MB) and PDF extension.
    """
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Only students can upload personal resumes")
        
    student_id = current_user.get("student_id")
    filename = "resume.pdf"
    content_bytes = b""
    
    if file:
        filename = file.filename or "resume.pdf"
        if not filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Invalid format. Only PDF files are accepted.")
        content_bytes = await file.read()
    elif payload and "base64_data" in payload:
        filename = payload.get("filename", "resume.pdf")
        if not filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Invalid format. Only PDF files are accepted.")
        raw_b64 = payload.get("base64_data", "")
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",", 1)[1]
        try:
            content_bytes = base64.b64decode(raw_b64)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 encoded data")
    else:
        raise HTTPException(status_code=400, detail="No resume file or data provided")
        
    if len(content_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum PDF size is 5MB.")
    if len(content_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty resume file provided")
        
    resume_info = db.save_student_resume(student_id, filename, content_bytes)
    return {
        "status": "success",
        "message": "Resume uploaded and verified successfully",
        "resume_info": resume_info
    }

@router.get("/me/resume")
def get_my_resume(current_user: dict = Depends(get_current_user)):
    """View/download own uploaded resume."""
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Forbidden")
        
    student_id = current_user.get("student_id")
    resume_path = db.get_student_resume_path(student_id)
    student = db.get_student(student_id)
    
    if resume_path and os.path.exists(resume_path):
        return FileResponse(
            resume_path,
            media_type="application/pdf",
            filename=student.get("resume_filename", f"{student.get('name', 'Student')}_Resume.pdf")
        )
        
    # Return placeholder simulated PDF content if no custom file uploaded
    demo_pdf_content = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"
    return Response(
        content=demo_pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={student.get('name', 'Student')}_Resume.pdf"}
    )

@router.delete("/me/resume")
def delete_my_resume(current_user: dict = Depends(get_current_user)):
    """Delete own uploaded resume."""
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Forbidden")
        
    student_id = current_user.get("student_id")
    db.delete_student_resume(student_id)
    return {"status": "success", "message": "Resume deleted successfully"}

@router.get("/{student_id}/resume")
def get_student_resume(
    student_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Secured resume download.
    Students can only download their own resume. Officers can download any.
    """
    if current_user.get("role") == "student":
        if current_user.get("student_id") != student_id:
            raise HTTPException(status_code=403, detail="Forbidden: You cannot access another student's resume.")
            
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
        
    # Return placeholder simulated PDF content if no custom file uploaded
    demo_pdf_content = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"
    return Response(
        content=demo_pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={student.get('name', 'Student')}_Resume.pdf"}
    )

@router.get("")
def list_students(branch: str = Query(None), min_cgpa: float = Query(None)):
    students = db.get_students()
    if branch and branch != "All":
        students = [s for s in students if s.get("branch") == branch]
    if min_cgpa is not None:
        students = [s for s in students if s.get("cgpa", 0) >= min_cgpa]
    return students

@router.get("/{student_id}")
def get_student_profile(student_id: str):
    student = db.get_student(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    schedules = [s for s in db.get_schedules() if s.get("student_id") == student_id]
    communications = db.get_communications(student_id)
    skill_gap = agent_tools.generate_skill_gap(student_id)
    action_plan = agent_tools.generate_action_plan(student_id)

    return {
        "student": student,
        "schedules": schedules,
        "communications": communications,
        "skill_gap": skill_gap,
        "action_plan": action_plan
    }

@router.get("/{student_id}/skill_gap")
def get_student_skill_gap(student_id: str, role: str = Query("Software Engineer")):
    return agent_tools.generate_skill_gap(student_id, target_role=role)

@router.get("/{student_id}/action_plan")
def get_student_action_plan(student_id: str, role: str = Query("Software Engineer")):
    return agent_tools.generate_action_plan(student_id, target_role=role)
