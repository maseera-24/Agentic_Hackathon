import os
from dotenv import load_dotenv

# Load .env file from project root or backend directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

class Settings:
    PROJECT_NAME: str = "Apex Institute Placement Management Portal"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "apex_campus_placement_super_secret_key_2026")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    COLLEGE_NAME: str = "Apex Institute of Technology & Engineering"
    DATA_FILE: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "data_store.json")
    RESUME_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "resumes")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # MongoDB Atlas Configuration
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DATABASE", os.getenv("MONGODB_DB_NAME", "placement_db"))

    # OTP Security Configuration
    OTP_EXPIRY_SECONDS: int = int(os.getenv("OTP_EXPIRY_SECONDS", "300"))
    OTP_LENGTH: int = int(os.getenv("OTP_LENGTH", "6"))
    OTP_MAX_ATTEMPTS: int = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))
    OTP_RESEND_COOLDOWN_SECONDS: int = int(os.getenv("OTP_RESEND_COOLDOWN_SECONDS", "60"))

<<<<<<< HEAD
    # Comma-separated addresses allowed to enter the placement-officer portal.
    OFFICER_EMAILS: list[str] = [
        email.strip().lower()
        for email in os.getenv(
            "OFFICER_EMAILS",
            "officer@example.com,tpo@apex.edu,tpo@apexinstitute.edu"
        ).split(",")
        if email.strip()
    ]

=======
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
settings = Settings()
