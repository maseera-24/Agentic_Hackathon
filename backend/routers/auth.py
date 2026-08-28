import json
import base64
import hmac
import hashlib
import time
<<<<<<< HEAD
import re
=======
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
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
            
    # Fallback to direct user header for testing if demo mode is active
    if not user and x_user_id:
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

@router.post("/login")
def login(payload: dict = Body(...)):
    """
    STEP 1: Validate credentials and initiate secure OTP verification session.
    """
    email_or_id = payload.get("email") or payload.get("student_id") or payload.get("username", "")
    password = payload.get("password", "")
<<<<<<< HEAD
    requested_role = payload.get("role", "student").lower()
    channel = payload.get("channel", "email").lower()
    
    if not email_or_id:
        raise HTTPException(status_code=400, detail="Email or Student ID is required")

    normalized_email = email_or_id.strip().lower()
    if requested_role not in {"student", "officer", "placement_officer"}:
        raise HTTPException(status_code=400, detail="Invalid access role")
    requested_role = "placement_officer" if requested_role == "officer" else requested_role

    if "@" not in normalized_email or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", normalized_email):
        if not password:
            raise HTTPException(status_code=400, detail="Please enter a valid email address")
        user = db.verify_user(email_or_id, password)
    else:
        is_officer_email = normalized_email in settings.OFFICER_EMAILS
        if requested_role == "placement_officer" and not is_officer_email:
            raise HTTPException(status_code=403, detail="This email is not authorized for placement-officer access")
        user = db.get_user_by_email(normalized_email)
        if user and user.get("role") == "placement_officer" and not is_officer_email:
            raise HTTPException(status_code=403, detail="This officer email is not authorized")
        if user and user.get("role") == "placement_officer" and requested_role != "placement_officer":
            raise HTTPException(status_code=403, detail="Choose Placement Officer access for this email")
        if user and user.get("role") == "student" and requested_role == "placement_officer":
            raise HTTPException(status_code=403, detail="This email is registered as a student account")
        if user and password and user.get("password") and user.get("password") != password:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if not user:
            user = db.get_or_create_email_user(normalized_email, requested_role)
        if is_officer_email and (not user or user.get("role") != "placement_officer"):
            raise HTTPException(status_code=403, detail="This email is not configured for placement-officer access")

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
=======
    channel = payload.get("channel", "email").lower()
    
    if not email_or_id or not password:
        raise HTTPException(status_code=400, detail="Email/Student ID and password are required")
        
    user = db.verify_user(email_or_id, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid Email/Student ID or password")
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
        
    # Generate OTP and create session
    session, raw_otp = otp_service.create_otp_session(user)
    
    # Destination
    destination = user.get("email", "")
    if channel == "sms" and user.get("role") == "student":
        student = db.get_student(user.get("student_id"))
        if student and student.get("phone"):
            destination = student.get("phone")
            
    # Dispatch OTP via decoupled notification service
<<<<<<< HEAD
    delivery = notification_service.send_otp(
=======
    notification_service.send_otp(
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
        destination=destination,
        otp=raw_otp,
        channel=channel,
        role=user.get("role", "user")
    )
<<<<<<< HEAD
    if delivery.get("status") == "Failed":
        otp_service.delete_session(session["session_id"])
        raise HTTPException(
            status_code=503,
            detail="We could not send the OTP email. Check the SMTP settings and try again."
        )
=======
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
    
    masked_email = otp_service.mask_destination(user.get("email", ""))
    
    response_data = {
        "status": "otp_required",
        "message": "OTP sent to your registered email/mobile. Please verify your account.",
        "session_id": session["session_id"],
        "role": user.get("role"),
        "email_masked": masked_email,
        "expires_in": settings.OTP_EXPIRY_SECONDS,
        "cooldown_seconds": settings.OTP_RESEND_COOLDOWN_SECONDS,
<<<<<<< HEAD
        "delivery": "email"
    }
=======
        "dev_mode": settings.DEMO_MODE,
        "dev_mode_message": "OTP delivery is in development mode." if settings.DEMO_MODE else None
    }
    
    # Expose raw OTP ONLY in development/demo mode for rapid demonstration
    if settings.DEMO_MODE:
        response_data["dev_otp"] = raw_otp
        
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
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
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")
        
    token = create_auth_token(user)
    
    # Safe user payload
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
            
<<<<<<< HEAD
    delivery = notification_service.send_otp(
=======
    notification_service.send_otp(
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
        destination=destination,
        otp=new_raw_otp,
        channel=channel,
        role=session.get("role", "user")
    )
<<<<<<< HEAD
    if delivery.get("status") == "Failed":
        raise HTTPException(
            status_code=503,
            detail="We could not resend the OTP email. Check the SMTP settings and try again."
        )
=======
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
    
    res_payload = {
        "status": "success",
        "message": "New OTP has been generated and sent.",
        "session_id": session_id,
        "expires_in": metadata.get("expires_in", settings.OTP_EXPIRY_SECONDS),
        "cooldown_seconds": metadata.get("cooldown_seconds", settings.OTP_RESEND_COOLDOWN_SECONDS),
        "email_masked": metadata.get("email_masked", ""),
<<<<<<< HEAD
        "delivery": "email"
    }
=======
        "dev_mode": settings.DEMO_MODE,
        "dev_mode_message": "OTP delivery is in development mode." if settings.DEMO_MODE else None
    }
    
    if settings.DEMO_MODE:
        res_payload["dev_otp"] = new_raw_otp
        
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
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
    """Provides demo credentials for quick hackathon evaluation."""
    return [
        {
            "role": "student",
            "label": "Student Demo Account",
            "email": "student@example.com",
            "password": "student123",
            "name": "Rahul Sharma (STU001 - CSE)",
            "description": "Candidate with applications across Google, Microsoft, TCS, Amazon, and Infosys."
        },
        {
            "role": "placement_officer",
            "label": "Placement Officer Demo Account",
            "email": "officer@example.com",
            "password": "officer123",
            "name": "Dr. Ramanathan S. (TPO Head)",
            "description": "Full placement operations access with drive creation, applicant shortlisting, and results."
        }
    ]
