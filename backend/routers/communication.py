import os
import datetime
from fastapi import APIRouter, HTTPException, Body, Depends, Query
from backend.data.db import db
from backend.agent.tools import agent_tools
from backend.routers.auth import require_role
from backend.services.notification_service import notification_service

router = APIRouter(prefix="/communication", tags=["Communication Agent"])
officer_auth = require_role("placement_officer")

@router.get("/logs")
def get_communication_logs(student_id: str = Query(None)):
    """Retrieve communication dispatch audit trail from database."""
    return db.get_communications(student_id=student_id)

@router.post("/send")
def send_direct_message(payload: dict = Body(...)):
    """Direct single communication trigger."""
    student_id = payload.get("student_id")
    channel = payload.get("channel", "Email")
    subject = payload.get("subject", "Placement Update")
    message = payload.get("message", "")

    student = db.get_student(student_id)
    student_name = student.get("name", "Student") if student else "Student"
    recipient = student.get("email" if channel == "Email" else "phone", "") if student else ""

    if channel == "Email":
        res = notification_service.email_provider.send(recipient=recipient, subject=subject, body=message)
    elif channel == "SMS":
        res = notification_service.sms_provider.send(phone=recipient, message=message)
    elif channel == "App Notification":
        notif = db.add_notification(student_id, subject, message, notif_type="ANNOUNCEMENT")
        return notif
    elif channel == "AI Voice Call":
        return agent_tools.initiate_voice_call(student_id)
    else:
        raise HTTPException(status_code=400, detail="Invalid channel")

    comm = db.add_communication({
        "student_id": student_id,
        "student_name": student_name,
        "channel": channel,
        "recipient": recipient,
        "subject": subject,
        "message": message,
        "status": res.get("status"),
        "provider": res.get("provider"),
        "provider_id": res.get("provider_id"),
        "is_simulated": res.get("is_simulated", True),
        "timestamp": datetime.datetime.now().isoformat()
    })
    return comm

@router.get("/staged-notifications")
def get_staged_notifications(
    drive_id: str = Query(None),
    current_user: dict = Depends(officer_auth)
):
    """
    Shows notifications waiting for Placement Officer review and approval.
    Uses exact required notification templates.
    """
    apps = db.get_applications(drive_id=drive_id) if drive_id else db.get_applications()

    # Actionable results: status SELECTED or NOT_SELECTED
    actionable = [a for a in apps if a.get("status") in ["SELECTED", "NOT_SELECTED"]]

    staged = []
    for app in actionable:
        student = db.get_student(app.get("student_id")) or {}
        student_name = app.get("student_name", "Student")
        company = app.get("company_name", "Company")
        role = app.get("role_title", "Software Engineer")
        is_selected = (app.get("status") == "SELECTED")

        if is_selected:
            subject = f"Placement Selection Update - {company}"
            msg_body = (
                f"Congratulations {student_name}!\n\n"
                f"You have been selected for the {role} position at {company}.\n\n"
                f"Please visit your Student Portal for selection details and next steps.\n\n"
                f"- Office of Career Services"
            )
        else:
            subject = f"Placement Drive Update - {company}"
            msg_body = (
                f"Hello {student_name},\n\n"
                f"You were not selected for the {role} position in the {company} placement drive.\n\n"
                f"For the reason and detailed feedback, please visit your Student Portal.\n\n"
                f"- Office of Career Services"
            )

        staged.append({
            "app_id": app.get("id"),
            "student_id": app.get("student_id"),
            "student_name": student_name,
            "email": student.get("email", app.get("student_email", "")),
            "phone": student.get("phone", "+91 98401 23456"),
            "company": company,
            "role": role,
            "drive_id": app.get("drive_id"),
            "status": app.get("status"),
            "subject": subject,
            "message_preview": msg_body,
            "sms_preview": msg_body,
            "email_subject": subject,
            "email_preview": msg_body
        })

    return {
        "total_staged": len(staged),
        "selected_count": sum(1 for s in staged if s["status"] == "SELECTED"),
        "not_selected_count": sum(1 for s in staged if s["status"] == "NOT_SELECTED"),
        "notifications": staged
    }

@router.post("/approve_and_send")
def approve_and_send_notifications(
    payload: dict = Body(default={}),
    current_user: dict = Depends(officer_auth)
):
    """
    Placement Officer Human Approval Checkpoint:
    Dispatches SMS + Email to reviewed selected and not-selected candidates.
    Records clean delivery logs distinguishing live provider delivery from development simulation.
    """
    drive_id = payload.get("drive_id")
    target_app_ids = payload.get("app_ids", [])

    staged_data = get_staged_notifications(drive_id=drive_id, current_user=current_user)
    notifications = staged_data.get("notifications", [])

    if target_app_ids:
        notifications = [n for n in notifications if n["app_id"] in target_app_ids]

    if not notifications:
        raise HTTPException(status_code=400, detail="No pending notifications ready for approval and dispatch.")

    sent_records = []
    for item in notifications:
        sid = item["student_id"]
        phone = item["phone"]
        email = item["email"]
        company = item["company"]
        role = item["role"]
        status = item["status"]
        subject = item["subject"]
        message = item["message_preview"]
        app_drive_id = item.get("drive_id", drive_id)

        # 1. Dispatch Email via NotificationService
        email_res = notification_service.email_provider.send(recipient=email, subject=subject, body=message)
        email_comm = db.add_communication({
            "student_id": sid,
            "student_name": item["student_name"],
            "company": company,
            "role": role,
            "channel": "Email",
            "recipient": email,
            "subject": subject,
            "message": message,
            "status": email_res.get("status"),
            "provider": email_res.get("provider"),
            "provider_id": email_res.get("provider_id"),
            "is_simulated": email_res.get("is_simulated", True),
            "related_drive": app_drive_id,
            "related_selection": status,
            "timestamp": datetime.datetime.now().isoformat()
        })
        sent_records.append(email_comm)

        # 2. Dispatch SMS via NotificationService
        sms_res = notification_service.sms_provider.send(phone=phone, message=message)
        sms_comm = db.add_communication({
            "student_id": sid,
            "student_name": item["student_name"],
            "company": company,
            "role": role,
            "channel": "SMS",
            "recipient": phone,
            "subject": f"SMS Alert: {subject}",
            "message": message,
            "status": sms_res.get("status"),
            "provider": sms_res.get("provider"),
            "provider_id": sms_res.get("provider_id"),
            "is_simulated": sms_res.get("is_simulated", True),
            "related_drive": app_drive_id,
            "related_selection": status,
            "timestamp": datetime.datetime.now().isoformat()
        })
        sent_records.append(sms_comm)

        # 3. Create Portal In-App Notification
        db.add_notification(
            student_id=sid,
            title=subject,
            message=f"Official selection update for {company} ({role}): {status}. Visit your portal for complete details.",
            notif_type="SELECTION" if status == "SELECTED" else "RESULT",
            link="/applications"
        )

    # Record Human Approval Audit Log
    db.add_audit_log(
        action="approve_and_send_notifications",
        trigger=f"TPO approved batch notification release ({len(notifications)} students)",
        ai_analysis=f"Dispatched dual-channel notifications (SMS + Email): {len(sent_records)} messages queued. Selected candidates received congratulatory notification; non-selected candidates received portal review notification.",
        recommendation="All communication logs and delivery telemetry saved in database.",
        confidence=1.0,
        approval_level="Officer Approved",
        human_approval=current_user.get("name", "TPO Head"),
        status="Completed"
    )

    return {
        "status": "success",
        "message": f"Successfully approved and sent {len(sent_records)} notifications ({len(notifications)} students via SMS & Email).",
        "recipients_count": len(notifications),
        "total_dispatches": len(sent_records),
        "summary": {
            "sms_sent": len(notifications),
            "emails_sent": len(notifications),
            "mode": "Simulation (Live credentials available in .env)"
        }
    }

@router.post("/send-schedule-notifications")
def send_schedule_notifications(
    payload: dict = Body(default={}),
    current_user: dict = Depends(officer_auth)
):
    """Email every scheduled shortlisted candidate their assigned interview details."""
    drive_id = payload.get("drive_id")
    schedules = db.get_schedules(drive_id=drive_id) if drive_id else db.get_schedules()
    if not schedules:
        raise HTTPException(status_code=400, detail="No interview schedules are available to notify.")

    sent = []
    failed = []
    for schedule in schedules:
        student = db.get_student(schedule.get("student_id")) or {}
        recipient = schedule.get("student_email") or student.get("email")
        if not recipient:
            failed.append({"student_id": schedule.get("student_id"), "reason": "Student email missing"})
            continue

        company = schedule.get("company_name", "Placement Drive")
        subject = f"Interview Schedule - {company}"
        message = (
            f"Hello {schedule.get('student_name', 'Student')},\n\n"
            f"You have been shortlisted for the {schedule.get('role_title', 'interview')} position at {company}.\n\n"
            f"Interview details:\n"
            f"Date: {schedule.get('date', 'To be confirmed')}\n"
            f"Time: {schedule.get('start_time', 'To be confirmed')} - {schedule.get('end_time', '')}\n"
            f"Room: {schedule.get('room_name', schedule.get('room_id', 'To be confirmed'))}\n"
            f"Panel: {schedule.get('panel_name', 'Placement Interview Panel')}\n"
            f"Round: {schedule.get('round_name', 'Technical Interview')}\n\n"
            f"Please arrive 15 minutes early with your college ID and updated resume.\n\n"
            f"Apex Placement Portal"
        )
        result = notification_service.email_provider.send(recipient=recipient, subject=subject, body=message)
        db.add_communication({
            "student_id": schedule.get("student_id"),
            "student_name": schedule.get("student_name"),
            "channel": "Email",
            "recipient": recipient,
            "subject": subject,
            "message": message,
            "status": result.get("status"),
            "provider": result.get("provider"),
            "provider_id": result.get("provider_id"),
            "is_simulated": result.get("is_simulated", False),
            "related_drive": schedule.get("drive_id"),
            "timestamp": datetime.datetime.now().isoformat()
        })
        if result.get("status") == "Failed":
            failed.append({"student_id": schedule.get("student_id"), "reason": result.get("error", "Email delivery failed")})
        else:
            sent.append(schedule.get("student_id"))

    if failed and not sent:
        raise HTTPException(status_code=503, detail="No schedule emails were delivered. Check SMTP settings.")
    return {
        "status": "success",
        "message": f"Schedule emails sent to {len(sent)} of {len(schedules)} shortlisted students.",
        "sent_count": len(sent),
        "failed_count": len(failed),
        "failed": failed
    }

@router.post("/simulate_voice_call")
def simulate_voice_call_endpoint(payload: dict = Body(...)):
    """Secondary tool for interactive attendance verification simulation."""
    student_id = payload.get("student_id", "STU003")
    return agent_tools.initiate_voice_call(student_id)
