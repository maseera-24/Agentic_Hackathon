import os
import datetime
from typing import Dict, Any, Optional
from email.message import EmailMessage
from email.utils import formataddr
from backend.config import settings

class EmailProvider:
    """
    Email provider abstraction supporting SMTP, Sendgrid, or controlled dev simulation.
    Other developers can easily integrate actual provider credentials here without modifying auth logic.
    """
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "placements1108@gmail.com")
        self.smtp_pass = os.getenv("SMTP_PASS", "")
        self.email_from = os.getenv("EMAIL_FROM", "placements1108@gmail.com")

    def is_configured(self) -> bool:
        return bool(self.smtp_host and self.smtp_user and self.smtp_pass)

    def send(self, recipient: str, subject: str, body: str, html_body: Optional[str] = None) -> Dict[str, Any]:
        if self.is_configured():
            try:
                import smtplib
                msg = EmailMessage()
                msg["Subject"] = subject
                msg["From"] = formataddr(("Apex Placement Portal", self.email_from))
                msg["To"] = recipient
                msg["Reply-To"] = self.email_from
                msg["Auto-Submitted"] = "auto-generated"
                msg["X-Auto-Response-Suppress"] = "All"
                msg.set_content(body)
                if html_body:
                    msg.add_alternative(html_body, subtype="html")

                with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=10) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_pass)
                    server.sendmail(self.email_from, [recipient], msg.as_string())
                return {
                    "status": "Delivered (Live)",
                    "channel": "Email",
                    "recipient": recipient,
                    "provider": "SMTP",
                    "provider_id": f"SMTP_{datetime.datetime.now().strftime('%H%M%S%f')[:10]}",
                    "is_simulated": False
                }
            except Exception as e:
                print(f"[NotificationService] [SMTP ERROR] Could not send live email to {recipient}: {e}")
                return {
                    "status": "Failed",
                    "channel": "Email",
                    "recipient": recipient,
                    "provider": "SMTP",
                    "error": str(e),
                    "is_simulated": False
                }

        # Controlled Development / Demo Simulation Mode
        return {
            "status": "Delivered (Simulation / Dev Mode)",
            "channel": "Email",
            "recipient": recipient,
            "provider": "Development Mode",
            "provider_id": f"DEV_MAIL_{datetime.datetime.now().strftime('%H%M%S%f')[:10]}",
            "is_simulated": True
        }


class SMSProvider:
    """
    SMS provider abstraction supporting Twilio or controlled dev simulation.
    Other developers can easily integrate actual SMS gateways without modifying auth logic.
    """
    def __init__(self):
        self.twilio_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        self.twilio_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        self.twilio_from = os.getenv("TWILIO_PHONE_NUMBER", "")

    def is_configured(self) -> bool:
        return bool(self.twilio_sid and self.twilio_token and self.twilio_from)

    def send(self, phone: str, message: str) -> Dict[str, Any]:
        if self.is_configured():
            try:
                from twilio.rest import Client
                client = Client(self.twilio_sid, self.twilio_token)
                msg = client.messages.create(body=message, from_=self.twilio_from, to=phone)
                return {
                    "status": "Delivered (Live)",
                    "channel": "SMS",
                    "recipient": phone,
                    "provider": "Twilio",
                    "provider_id": msg.sid,
                    "is_simulated": False
                }
            except Exception as e:
                return {
                    "status": "Failed",
                    "channel": "SMS",
                    "recipient": phone,
                    "provider": "Twilio",
                    "error": str(e),
                    "is_simulated": False
                }

        # Controlled Development / Demo Simulation Mode
        return {
            "status": "Delivered (Simulation / Dev Mode)",
            "channel": "SMS",
            "recipient": phone,
            "provider": "Development Mode",
            "provider_id": f"DEV_SMS_{datetime.datetime.now().strftime('%H%M%S%f')[:10]}",
            "is_simulated": True
        }


class NotificationService:
    """
    Universal Notification & Communication Service.
    Decoupled from specific delivery channels and third-party vendors.
    """
    def __init__(self):
        self.email_provider = EmailProvider()
        self.sms_provider = SMSProvider()

    def send_otp(self, destination: str, otp: str, channel: str = "email", role: str = "user") -> Dict[str, Any]:
        """
        Dispatches OTP code to the requested destination without coupling authentication to a specific channel.
        """
        subject = f"Your Verification OTP — {settings.PROJECT_NAME}"
        message = (
            f"Your one-time login verification code is: {otp}\n\n"
            f"This code will expire in {getattr(settings, 'OTP_EXPIRY_SECONDS', 300) // 60} minutes. "
            f"Do not share this OTP with anyone.\n\n"
            f"- Apex Career Services Team"
        )

        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B1020; color: #F8FAFC; margin: 0; padding: 20px; }}
                .container {{ max-width: 520px; margin: 0 auto; background: #151C32; border: 1px solid #27324A; border-radius: 16px; padding: 32px; }}
                .header {{ text-align: center; margin-bottom: 24px; }}
                .logo {{ font-size: 20px; font-weight: bold; color: #A78BFA; }}
                .sub {{ font-size: 12px; color: #94A3B8; margin-top: 4px; }}
                .otp-box {{ background: #111827; border: 2px dashed #7C3AED; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }}
                .otp-code {{ font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38BDF8; font-family: monospace; }}
                .meta {{ font-size: 13px; color: #CBD5E1; line-height: 1.6; }}
                .warning {{ font-size: 12px; color: #F59E0B; margin-top: 16px; border-top: 1px solid #27324A; padding-top: 16px; }}
                .footer {{ text-align: center; font-size: 11px; color: #64748B; margin-top: 24px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">Apex Institute of Technology</div>
                    <div class="sub">Office of Career Services & Placement &middot; Secure Portal Access</div>
                </div>
                <div class="meta">
                    Hello,<br><br>
                    Use the one-time verification code below to complete your login to the <strong>AI Campus Placement Platform</strong>.
                </div>
                <div class="otp-box">
                    <div style="font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your Verification Code</div>
                    <div class="otp-code">{otp}</div>
                </div>
                <div class="meta">
                    This OTP is valid for <strong>{getattr(settings, 'OTP_EXPIRY_SECONDS', 300) // 60} minutes</strong>. Please enter this code on the verification screen to proceed.
                </div>
                <div class="warning">
                    ⚠️ <strong>Security Notice:</strong> Do not share this OTP with anyone. The Placement Office will never ask for your verification code.
                </div>
                <div class="footer">
                    &copy; 2026 Apex Institute of Technology &middot; Sent automatically via placements1108@gmail.com
                </div>
            </div>
        </body>
        </html>
        """

        if channel == "sms":
            res = self.sms_provider.send(phone=destination, message=f"Your Apex Placement login OTP is {otp}. Valid for 5 minutes.")
        else:
            res = self.email_provider.send(recipient=destination, subject=subject, body=message, html_body=html_message)

        # Log cleanly for development visibility if in demo mode
        if settings.DEMO_MODE:
            print(f"[NotificationService] [DEV MODE OTP] Destination: {destination} | Channel: {channel.upper()} | Role: {role} | OTP: {otp}")

        return res

    def notify_student_selection(
        self,
        student_name: str,
        student_email: str,
        student_phone: str,
        company_name: str,
        role_title: str
    ) -> Dict[str, Any]:
        """
        Dispatches standardized student SELECTION notifications across Email and SMS channels.
        """
        email_subject = f"Placement Selection Update - {company_name}"
        email_message = (
            f"Congratulations {student_name}!\n\n"
            f"You have been selected for the {role_title} position at {company_name}.\n\n"
            f"Please visit your Student Portal for selection details and next steps.\n\n"
            f"- Office of Career Services"
        )

        sms_message = (
            f"Congratulations {student_name}! You have been selected for the {role_title} position at {company_name}. "
            f"Please visit your Student Portal for selection details and next steps. - Office of Career Services"
        )

        email_res = self.email_provider.send(recipient=student_email, subject=email_subject, body=email_message)
        sms_res = self.sms_provider.send(phone=student_phone, message=sms_message)

        return {
            "email_result": email_res,
            "sms_result": sms_res,
            "email_subject": email_subject,
            "email_body": email_message,
            "sms_body": sms_message
        }

    def notify_student_rejection(
        self,
        student_name: str,
        student_email: str,
        student_phone: str,
        company_name: str,
        role_title: str
    ) -> Dict[str, Any]:
        """
        Dispatches standardized student NOT SELECTED notifications across Email and SMS channels.
        """
        email_subject = f"Placement Drive Update - {company_name}"
        email_message = (
            f"Hello {student_name},\n\n"
            f"You were not selected for the {role_title} position in the {company_name} placement drive.\n\n"
            f"For the reason and detailed feedback, please visit your Student Portal.\n\n"
            f"- Office of Career Services"
        )

        sms_message = (
            f"Hello {student_name}, you were not selected for the {role_title} position in the {company_name} drive. "
            f"For the reason and detailed feedback, please visit your Student Portal. - Office of Career Services"
        )

        email_res = self.email_provider.send(recipient=student_email, subject=email_subject, body=email_message)
        sms_res = self.sms_provider.send(phone=student_phone, message=sms_message)

        return {
            "email_result": email_res,
            "sms_result": sms_res,
            "email_subject": email_subject,
            "email_body": email_message,
            "sms_body": sms_message
        }

    def notify_schedule_change(
        self,
        student_name: str,
        student_email: str,
        student_phone: str,
        company_name: str,
        date: str,
        time: str,
        venue: str
    ) -> Dict[str, Any]:
        """
        Dispatches standardized interview SCHEDULE CHANGE notifications across Email and SMS channels.
        """
        email_subject = f"Interview Schedule Update - {company_name}"
        email_message = (
            f"Hello {student_name},\n\n"
            f"Your interview schedule has been updated.\n\n"
            f"Company: {company_name}\n"
            f"Date: {date}\n"
            f"Time: {time}\n"
            f"Venue: {venue}\n\n"
            f"Please check your Student Portal for details and instructions.\n\n"
            f"- Office of Career Services"
        )

        sms_message = (
            f"Your interview schedule has been updated. Company: {company_name}, Date: {date}, Time: {time}, Venue: {venue}. "
            f"Please check your Student Portal for details. - Office of Career Services"
        )

        email_res = self.email_provider.send(recipient=student_email, subject=email_subject, body=email_message)
        sms_res = self.sms_provider.send(phone=student_phone, message=sms_message)

        return {
            "email_result": email_res,
            "sms_result": sms_res,
            "email_subject": email_subject,
            "email_body": email_message,
            "sms_body": sms_message
        }

notification_service = NotificationService()
