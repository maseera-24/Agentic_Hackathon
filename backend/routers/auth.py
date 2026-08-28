import json
import base64
import hmac
import hashlib
import time
import re
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header, Body
from backend.config import settings
from backend.data.db import db
from backend.services.otp_service import otp_service
from backend.services.notification_service import notification_service

router = APIRouter(prefix="/auth", tags=["Authentication & Roles"])

def create_auth_token(user_data: dict) -> str:
    """Create a secure signed session token for the user."""
    payload = {
        "user_id": user_data.get("id"),
        "email": user_data.get("email"),
        "role": user_data.get("role"),
        "student_id": user_data.get("student_id"),
        "exp": int(time.time()) + (86400 * 7) # 7 days
    }
    payload_bytes = json.dumps(payload).encode("utf-8")
    payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode("utf-8").rstrip("=")
    sig = hmac.new(settings.SECRET_KEY.encode("utf-8"), payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"

def decode_auth_token(token_str: str) -> Optional[dict]:
    """Decode and verify signed session token."""
    if not token_str or "." not in token_str:
        return None
    try:
        payload_b64, sig = token_str.split(".", 1)
        expected_sig = hmac.new(settings.SECRET_KEY.encode("utf-8"), payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None

        # Add padding back if necessary
        padding = 4 - (len(payload_b64) % 4)
        if padding != 4:
            payload_b64 += "=" * padding

        payload_json = base64.urlsafe_b64decode(payload_b64.encode("utf-8")).decode("utf-8")
        payload = json.loads(payload_json)

        if payload.get("exp", 0) < int(time.time()):
            return None # Expired

        return payload
    except Exception:
        return None

def get_current_user(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None),
    auth: Optional[str] = None,
    token: Optional[str] = None
):
    """
    Security Dependency: Resolves authenticated user strictly from verified Bearer token, User ID, or signed auth query parameter.
    """
    user = None
    token_str = None

    if authorization and authorization.startswith("Bearer "):
        token_str = authorization[7:].strip()
    elif auth:
        token_str = auth.strip()
    elif token:
        token_str = token.strip()

    if token_str:
        payload = decode_auth_token(token_str)
        if payload:
            user = db.get_user_by_id(payload.get("user_id"))
            if not user and payload.get("email"):
                user = db.get_user_by_email(payload.get("email"))

    # Fallback to direct user header for testing if demo mode is active
    if not user and x_user_id and settings.DEMO_MODE:
        user = db.get_user_by_id(x_user_id) or db.get_user_by_email(x_user_id)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please login with valid credentials."
        )
    return user

def require_role(role: str):
    """Dependency factory ensuring user has the exact required role."""
    def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")
        if user_role != role:
            raise HTTPException(
                status_code=403,
                detail=f"Access forbidden: requires '{role}' authorization."
            )
        return current_user
    return role_checker

OFFICER_NAME_MAP = {
    "vu.241fa04a54@gmail.com": "Maseera Sk",
    "vu.241fa04a56@gmail.com": "Sai Kiran L",
    "vu.241fa04a98@gmail.com": "Pavan Kumar Ch",
    "vu.241fa04611@gmail.com": "K Anirudh",
    "vu.241fa04b04@gmail.com": "K Seshagiri"
}

@router.post("/login")
def login(payload: dict = Body(...)):
    """
    STEP 1: Validate email/role and initiate secure OTP verification session (Password-Free).
    """
    email_or_id = payload.get("email") or payload.get("student_id") or payload.get("username", "")
    raw_role = str(payload.get("role", "student")).lower()
    requested_role = "placement_officer" if raw_role in {"officer", "placement_officer"} else "student"
    channel = str(payload.get("channel", "email")).lower()

    if not email_or_id:
        raise HTTPException(status_code=400, detail="Email Address or Student ID is required")

    normalized_input = str(email_or_id).strip()
    normalized_email = normalized_input.lower()

    user = None

    if requested_role == "placement_officer":
        # Check against authorized placement officer email whitelist
        officer_emails_clean = [e.strip().lower() for e in settings.OFFICER_EMAILS if e.strip()]
        if normalized_email not in officer_emails_clean:
            raise HTTPException(
                status_code=403,
                detail="This email is not authorized for Placement Officer access."
            )

        user = db.get_user_by_email(normalized_email)
        officer_name = OFFICER_NAME_MAP.get(normalized_email, "Placement Officer")
        if not user:
            user = db.add_user({
                "id": f"USR_{normalized_email.split('@')[0]}",
                "email": normalized_email,
                "name": officer_name,
                "role": "placement_officer",
                "designation": "Placement Officer",
                "department": "Office of Career Services & Placement"
            })
        else:
            # Ensure name and role are strictly updated to configured officer profile
            if normalized_email in OFFICER_NAME_MAP:
                user["name"] = officer_name
                user["role"] = "placement_officer"
                db.save_to_disk()
    else:
        # Student authentication: Lookup by Student ID, email, or user account
        student_record = db.get_student_by_email(normalized_email) or db.get_student(normalized_input.upper())
        user = db.get_user_by_email(normalized_email) or db.get_user_by_email(normalized_input.upper())

        if not user and student_record:
            # Auto-create user login for registered student record
            user = db.add_user({
                "id": f"USR_{student_record.get('id')}",
                "email": student_record.get("email", normalized_email).lower(),
                "student_id": student_record.get("id"),
                "name": student_record.get("name", "Student"),
                "role": "student"
            })
        elif not user and "@" in normalized_email and re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", normalized_email):
            user = db.get_or_create_email_user(normalized_email, role="student")

        if not user and not student_record:
            raise HTTPException(
                status_code=401,
                detail="No registered student found with this email or Student ID."
            )

    if not user:
        raise HTTPException(status_code=401, detail="Authentication failed. Account not found.")

    # Generate OTP and create session
    session, raw_otp = otp_service.create_otp_session(user)

    # Destination
    destination = user.get("email", "")
    if channel == "sms" and user.get("role") == "student":
        student = db.get_student(user.get("student_id"))
        if student and student.get("phone"):
            destination = student.get("phone")

    # Dispatch OTP via decoupled notification service
    delivery = notification_service.send_otp(
        destination=destination,
        otp=raw_otp,
        channel=channel,
        role=user.get("role", "user")
    )

    if delivery.get("status") == "Failed" and not settings.DEMO_MODE:
        otp_service.delete_session(session["session_id"])
        raise HTTPException(
            status_code=503,
            detail="We could not send the OTP email. Check the SMTP settings and try again."
        )

    masked_email = otp_service.mask_destination(user.get("email", ""))

    response_data = {
        "status": "otp_required",
        "message": "OTP sent to your registered email/mobile. Please verify your account.",
        "session_id": session["session_id"],
        "role": user.get("role"),
        "email_masked": masked_email,
        "expires_in": settings.OTP_EXPIRY_SECONDS,
        "cooldown_seconds": settings.OTP_RESEND_COOLDOWN_SECONDS,
        "delivery": channel,
        "dev_mode": settings.DEMO_MODE,
        "dev_mode_message": "OTP delivery is in development mode." if settings.DEMO_MODE else None
    }

    if settings.DEMO_MODE:
        response_data["dev_otp"] = raw_otp

    return response_data

@router.post("/verify-otp")
def verify_otp(payload: dict = Body(...)):
    """
    STEP 2: Verify 6-digit OTP and issue authenticated session token.
    """
    session_id = payload.get("session_id", "")
    entered_otp = payload.get("otp", "")

    if not session_id or not entered_otp:
        raise HTTPException(status_code=400, detail="Session ID and 6-digit OTP are required")

    is_valid, message, user_info = otp_service.verify_otp(session_id, entered_otp)

    if not is_valid:
        raise HTTPException(status_code=400, detail=message)

    user = db.get_user_by_id(user_info["id"])
    if not user and user_info.get("email"):
        user = db.get_user_by_email(user_info["email"])
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")

    # Role authorization check: Placement Officer role must be strictly whitelisted
    if user.get("role") == "placement_officer":
        officer_emails_clean = [e.strip().lower() for e in settings.OFFICER_EMAILS if e.strip()]
        if user.get("email", "").lower() not in officer_emails_clean:
            raise HTTPException(
                status_code=403,
                detail="This email is not authorized for Placement Officer access."
            )

    token = create_auth_token(user)

    # Safe user payload (never leak password)
    safe_user = {k: v for k, v in user.items() if k != "password"}

    # Attach student profile if applicable
    if user.get("role") == "student":
        student_id = user.get("student_id")
        student_profile = db.get_student(student_id)
        if student_profile:
            safe_user["student_profile"] = student_profile

    return {
        "status": "success",
        "message": "Account verified successfully",
        "token": token,
        "user": safe_user
    }

@router.post("/resend-otp")
def resend_otp(payload: dict = Body(...)):
    """
    Resend OTP for an active session with cooldown enforcement.
    """
    session_id = payload.get("session_id", "")
    channel = payload.get("channel", "email").lower()

    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID is required")

    success, message, new_raw_otp, metadata = otp_service.resend_otp(session_id)

    if not success:
        raise HTTPException(status_code=400, detail=message)

    session = otp_service.get_session(session_id)
    destination = session.get("email", "")
    if channel == "sms" and session.get("role") == "student":
        student = db.get_student(session.get("student_id"))
        if student and student.get("phone"):
            destination = student.get("phone")

    delivery = notification_service.send_otp(
        destination=destination,
        otp=new_raw_otp,
        channel=channel,
        role=session.get("role", "user")
    )

    if delivery.get("status") == "Failed" and not settings.DEMO_MODE:
        raise HTTPException(
            status_code=503,
            detail="We could not resend the OTP email. Check the SMTP settings and try again."
        )

    res_payload = {
        "status": "success",
        "message": "New OTP has been generated and sent.",
        "session_id": session_id,
        "expires_in": metadata.get("expires_in", settings.OTP_EXPIRY_SECONDS),
        "cooldown_seconds": metadata.get("cooldown_seconds", settings.OTP_RESEND_COOLDOWN_SECONDS),
        "email_masked": metadata.get("email_masked", ""),
        "delivery": channel,
        "dev_mode": settings.DEMO_MODE,
        "dev_mode_message": "OTP delivery is in development mode." if settings.DEMO_MODE else None
    }

    if settings.DEMO_MODE:
        res_payload["dev_otp"] = new_raw_otp

    return res_payload

@router.get("/me")
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    safe_user = {k: v for k, v in current_user.items() if k != "password"}
    if current_user.get("role") == "student":
        student_id = current_user.get("student_id")
        student_profile = db.get_student(student_id)
        if student_profile:
            safe_user["student_profile"] = student_profile
    return safe_user

@router.post("/logout")
def logout():
    return {"status": "success", "message": "Successfully logged out"}

@router.get("/demo-accounts")
def get_demo_accounts():
    """Provides demo accounts for quick evaluation."""
    return [
        {
            "role": "student",
            "label": "Student Candidate (Ch Venkata)",
            "email": "pavankumar.1280@gmail.com",
            "name": "Ch Venkata (STU1280 - CSE)",
            "description": "Student candidate portal with application tracking, job drives, and AI placement agent."
        },
        {
            "role": "student",
            "label": "Student Candidate (STU001)",
            "email": "student@example.com",
            "name": "Rahul Sharma (STU001 - CSE)",
            "description": "Student candidate portal with application tracking, job drives, and AI placement agent."
        },
        {
            "role": "placement_officer",
            "label": "Placement Officer (Maseera Sk)",
            "email": "vu.241fa04a54@gmail.com",
            "name": "Maseera Sk",
            "description": "Authorized Placement Officer with drive management, shortlisting, and scheduling access."
        },
        {
            "role": "placement_officer",
            "label": "Placement Officer (Sai Kiran L)",
            "email": "vu.241fa04a56@gmail.com",
            "name": "Sai Kiran L",
            "description": "Authorized Placement Officer with drive management, shortlisting, and scheduling access."
        },
        {
            "role": "placement_officer",
            "label": "Placement Officer (Pavan Kumar Ch)",
            "email": "vu.241fa04a98@gmail.com",
            "name": "Pavan Kumar Ch",
            "description": "Authorized Placement Officer with drive management, shortlisting, and scheduling access."
        },
        {
            "role": "placement_officer",
            "label": "Placement Officer (K Anirudh)",
            "email": "vu.241fa04611@gmail.com",
            "name": "K Anirudh",
            "description": "Authorized Placement Officer with drive management, shortlisting, and scheduling access."
        },
        {
            "role": "placement_officer",
            "label": "Placement Officer (K Seshagiri)",
            "email": "vu.241fa04b04@gmail.com",
            "name": "K Seshagiri",
            "description": "Authorized Placement Officer with drive management, shortlisting, and scheduling access."
        }
    ]
