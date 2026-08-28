import datetime
from fastapi import APIRouter, HTTPException, Depends, Body, Query
from backend.data.db import db
from backend.routers.auth import require_role

router = APIRouter(prefix="/companies", tags=["Company Management"])
officer_auth = require_role("placement_officer")

@router.get("")
def list_companies():
    """List all registered hiring partner companies from MongoDB."""
    companies = db.get_companies()
    drives = db.get_drives()

    # Attach active drives count to each company
    enriched = []
    for c in companies:
        c_copy = dict(c)
        c_name_lower = c.get("name", "").strip().lower()
        company_drives = [d for d in drives if d.get("company_name", "").strip().lower() == c_name_lower]
        c_copy["total_drives"] = len(company_drives)
        c_copy["drives"] = company_drives
        enriched.append(c_copy)
    return enriched

@router.get("/{company_id}")
def get_company(company_id: str):
    company = db.get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    drives = [d for d in db.get_drives() if d.get("company_name", "").lower() == company.get("name", "").lower()]
    return {
        "company": company,
        "drives": drives
    }

@router.post("")
def create_company(
    payload: dict = Body(...),
    current_user: dict = Depends(officer_auth)
):
    name = payload.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Company Name is required")

    company_data = {
        "name": name,
        "industry": payload.get("industry", "Technology & Software"),
        "tier": payload.get("tier", "Tier-1 (Dream Company)"),
        "location": payload.get("location", "Bengaluru / Hyderabad"),
        "website": payload.get("website", ""),
        "description": payload.get("description", ""),
        "contact_person": payload.get("contact_person", ""),
        "contact_email": payload.get("contact_email", ""),
        "contact_phone": payload.get("contact_phone", ""),
        "roles": payload.get("roles", [])
    }

    created = db.add_company(company_data)

    db.add_audit_log(
        action="create_company",
        trigger=f"TPO registered new company partner: {name}",
        ai_analysis=f"Registered corporate entity '{name}' in industry domain '{company_data['industry']}'.",
        recommendation="Company ready for job description ingestion and drive activation.",
        confidence=1.0,
        approval_level="Officer Action",
        human_approval=current_user.get("name", "TPO Head"),
        status="Completed"
    )

    return {"status": "success", "company": created}

@router.put("/{company_id}")
def update_company(
    company_id: str,
    payload: dict = Body(...),
    current_user: dict = Depends(officer_auth)
):
    updated = db.update_company(company_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"status": "success", "company": updated}

@router.delete("/{company_id}")
def delete_company(
    company_id: str,
    current_user: dict = Depends(officer_auth)
):
    deleted = db.delete_company(company_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"status": "success", "message": "Company deleted successfully"}

@router.post("/{company_id}/jds")
def add_company_jd(
    company_id: str,
    payload: dict = Body(...),
    current_user: dict = Depends(officer_auth)
):
    company = db.get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    role_title = payload.get("role_title") or payload.get("title")
    if not role_title:
        raise HTTPException(status_code=400, detail="Job Title is required")

    new_role = {
        "id": f"ROLE_{len(company.get('roles', [])) + 1:02d}",
        "title": role_title,
        "ctc": payload.get("ctc") or payload.get("package", "₹ 15.0 LPA"),
        "min_cgpa": float(payload.get("min_cgpa", 7.0)),
        "max_backlogs": int(payload.get("max_backlogs", 0)),
        "allowed_branches": payload.get("allowed_branches") or payload.get("branches") or ["Computer Science & Engineering", "Information Technology"],
        "graduation_year": int(payload.get("graduation_year", 2026)),
        "required_skills": payload.get("required_skills", ["Python", "SQL", "DSA"]),
        "preferred_skills": payload.get("preferred_skills", ["Cloud", "System Design"]),
        "description": payload.get("description", ""),
        "created_at": datetime.datetime.now().isoformat()
    }

    roles = company.get("roles", [])
    roles.append(new_role)
    db.update_company(company_id, {"roles": roles})

    return {"status": "success", "role": new_role, "company": company}
