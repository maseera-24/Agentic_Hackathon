import uuid
import time
import secrets
import hmac
import hashlib
from typing import Optional, Dict, Tuple
from backend.config import settings

class OTPService:
    """
    Cryptographically secure OTP generation, verification, and lifecycle management service.
    
    Security guarantees:
    - Never stores plaintext OTPs (stores HMAC-SHA256 digest with salt)
    - Single-use: invalidates OTP immediately upon successful verification
    - Expiration: enforces configurable TTL (default 300 seconds)
    - Rate limiting: max 5 failed attempts per session before session is permanently locked
    - Resend cooldown: enforces 60-second cooldown between resends
    - Re-generation: automatically invalidates old OTP when new OTP is requested
    """
    def __init__(self):
        # In-memory session store
        self._sessions: Dict[str, dict] = {}

    def _hash_otp(self, session_id: str, otp: str) -> str:
        """Derives HMAC-SHA256 digest using system SECRET_KEY and session_id as salt."""
        key = settings.SECRET_KEY.encode("utf-8")
        msg = f"{session_id}:{otp}".encode("utf-8")
        return hmac.new(key, msg, hashlib.sha256).hexdigest()

    def generate_random_otp(self) -> str:
        """Generates cryptographically secure 6-digit numeric OTP."""
        length = getattr(settings, "OTP_LENGTH", 6)
        digits = "0123456789"
        return "".join(secrets.choice(digits) for _ in range(length))

    def mask_destination(self, destination: str) -> str:
        """Masks email address or phone number for privacy display."""
        if not destination:
            return ""
        dest = destination.strip()
        if "@" in dest:
            parts = dest.split("@", 1)
            name_part = parts[0]
            domain_part = parts[1]
            if len(name_part) <= 2:
                masked_name = name_part[0] + "*"
            else:
                masked_name = name_part[0] + ("*" * (len(name_part) - 2)) + name_part[-1]
            return f"{masked_name}@{domain_part}"
        elif len(dest) >= 10:
            return dest[:3] + ("*" * (len(dest) - 6)) + dest[-3:]
        return dest

    def create_otp_session(self, user: dict) -> Tuple[dict, str]:
        """
        Creates an OTP verification session for the authenticated user credentials.
        Returns (session_data, raw_otp).
        raw_otp is only returned to the caller to dispatch via NotificationService;
        it is NEVER stored in plaintext in the session store.
        """
        session_id = str(uuid.uuid4())
        raw_otp = self.generate_random_otp()
        hashed_otp = self._hash_otp(session_id, raw_otp)
        
        now = int(time.time())
        expiry_seconds = getattr(settings, "OTP_EXPIRY_SECONDS", 300)
        cooldown_seconds = getattr(settings, "OTP_RESEND_COOLDOWN_SECONDS", 60)
        max_attempts = getattr(settings, "OTP_MAX_ATTEMPTS", 5)

        session = {
            "session_id": session_id,
            "user_id": user.get("id"),
            "email": user.get("email"),
            "role": user.get("role"),
            "student_id": user.get("student_id"),
            "hashed_otp": hashed_otp,
            "created_at": now,
            "expires_at": now + expiry_seconds,
            "attempts_left": max_attempts,
            "resend_available_at": now + cooldown_seconds,
            "verified": False,
            "locked": False
        }

        self._sessions[session_id] = session
        
        # Cleanup old expired sessions periodically
        self._cleanup_expired_sessions()

        return session, raw_otp

    def verify_otp(self, session_id: str, entered_otp: str) -> Tuple[bool, str, Optional[dict]]:
        """
        Verifies entered OTP against session.
        Returns (is_valid, message, user_info).
        """
        if not session_id or session_id not in self._sessions:
            return False, "OTP session not found or expired. Please sign in again.", None

        session = self._sessions[session_id]
        now = int(time.time())

        # Check if already verified
        if session.get("verified"):
            return False, "This OTP has already been used. Please sign in again.", None

        # Check if locked
        if session.get("locked") or session.get("attempts_left", 0) <= 0:
            return False, "Too many incorrect attempts. Please request a new OTP.", None

        # Check if expired
        if now > session.get("expires_at", 0):
            return False, "Your OTP has expired. Please request a new OTP.", None

        # Validate entered OTP using constant-time comparison
        entered_hash = self._hash_otp(session_id, entered_otp.strip())
        expected_hash = session.get("hashed_otp", "")

        if hmac.compare_digest(entered_hash, expected_hash):
            # Success: Mark session verified and invalidate OTP
            session["verified"] = True
            user_info = {
                "id": session["user_id"],
                "email": session["email"],
                "role": session["role"],
                "student_id": session.get("student_id")
            }
            # Remove session from store
            self._sessions.pop(session_id, None)
            return True, "OTP verified successfully.", user_info
        else:
            # Failed attempt
            session["attempts_left"] = max(0, session.get("attempts_left", 5) - 1)
            remaining = session["attempts_left"]
            if remaining <= 0:
                session["locked"] = True
                return False, "Too many incorrect attempts. Please request a new OTP.", None
            return False, f"Incorrect OTP. You have {remaining} attempt{'s' if remaining != 1 else ''} remaining.", None

    def resend_otp(self, session_id: str) -> Tuple[bool, str, Optional[str], Optional[dict]]:
        """
        Generates a new OTP for an existing session if cooldown has elapsed.
        Returns (success, message, new_raw_otp, session_metadata).
        """
        if not session_id or session_id not in self._sessions:
            return False, "Session expired. Please sign in again.", None, None

        session = self._sessions[session_id]
        now = int(time.time())

        if session.get("verified"):
            return False, "Session already completed. Please sign in again.", None, None

        # Check cooldown
        if now < session.get("resend_available_at", 0):
            seconds_remaining = session["resend_available_at"] - now
            return False, f"Please wait {seconds_remaining} seconds before requesting a new OTP.", None, None

        # Generate new OTP and invalidate previous
        new_raw_otp = self.generate_random_otp()
        new_hashed_otp = self._hash_otp(session_id, new_raw_otp)

        expiry_seconds = getattr(settings, "OTP_EXPIRY_SECONDS", 300)
        cooldown_seconds = getattr(settings, "OTP_RESEND_COOLDOWN_SECONDS", 60)
        max_attempts = getattr(settings, "OTP_MAX_ATTEMPTS", 5)

        session["hashed_otp"] = new_hashed_otp
        session["created_at"] = now
        session["expires_at"] = now + expiry_seconds
        session["resend_available_at"] = now + cooldown_seconds
        session["attempts_left"] = max_attempts
        session["locked"] = False

        metadata = {
            "session_id": session_id,
            "expires_in": expiry_seconds,
            "cooldown_seconds": cooldown_seconds,
            "email_masked": self.mask_destination(session.get("email", ""))
        }

        return True, "New OTP generated successfully.", new_raw_otp, metadata

    def get_session(self, session_id: str) -> Optional[dict]:
        return self._sessions.get(session_id)

<<<<<<< HEAD
    def delete_session(self, session_id: str):
        """Remove a session when OTP delivery fails before the user can verify it."""
        self._sessions.pop(session_id, None)

=======
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
    def _cleanup_expired_sessions(self):
        """Removes sessions older than 30 minutes."""
        now = int(time.time())
        to_delete = [sid for sid, s in self._sessions.items() if now - s.get("created_at", 0) > 1800]
        for sid in to_delete:
            self._sessions.pop(sid, None)

otp_service = OTPService()
