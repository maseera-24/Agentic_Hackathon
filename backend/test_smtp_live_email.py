import os
import sys
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.config import settings

def test_live_email(recipient="pavankumar.1280@gmail.com"):
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "placements1108@gmail.com")
    smtp_pass = os.getenv("SMTP_PASS", "")
    email_from = os.getenv("EMAIL_FROM", "placements1108@gmail.com")

    print("=" * 70)
    print("LIVE GMAIL SMTP CONNECTION & DELIVERY DIAGNOSTIC")
    print("=" * 70)
    print(f"SMTP Host:   {smtp_host}:{smtp_port}")
    print(f"Sender:      {smtp_user}")
    print(f"Recipient:   {recipient}")
    print(f"App Password Configured: {'YES (Length: ' + str(len(smtp_pass)) + ')' if smtp_pass else 'NO (EMPTY)'}")

    if not smtp_pass:
        print("\n[!] ERROR: SMTP_PASS is empty in your .env file.")
        print("    Gmail requires a 16-character App Password to allow sending emails.")
        print("\n    How to generate it in 1 minute:")
        print("    1. Log in to https://myaccount.google.com with placements1108@gmail.com")
        print("    2. Go to 'Security' -> Enable '2-Step Verification' (if not already on)")
        print("    3. Search for 'App passwords' (or go to https://myaccount.google.com/apppasswords)")
        print("    4. Name it 'Placement Portal' and click 'Create'")
        print("    5. Copy the 16-character code (e.g. 'abcd efgh ijkl mnop') and paste into .env:")
        print('       SMTP_PASS="abcdefghijklmnop"')
        print("=" * 70)
        return False

    try:
        print("\n[*] Connecting to smtp.gmail.com:587...")
        with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
            server.set_debuglevel(1)
            print("[*] Initiating STARTTLS...")
            server.starttls()
            print(f"[*] Logging in as {smtp_user}...")
            server.login(smtp_user, smtp_pass)
            print("[*] Authentication successful!")

            msg = EmailMessage()
            msg["Subject"] = "Apex Placement Portal — Live Verification Test"
            msg["From"] = formataddr(("Apex Placement Portal", email_from))
            msg["To"] = recipient
            msg.set_content(f"This is a test email sent from {email_from} to verify live OTP delivery.")

            print(f"[*] Sending message to {recipient}...")
            server.sendmail(email_from, [recipient], msg.as_string())
            print(f"\n[+] SUCCESS! Live email delivered to {recipient} from {email_from}.")
            print("=" * 70)
            return True
    except smtplib.SMTPAuthenticationError as e:
        print("\n[!] SMTP AUTHENTICATION FAILED:")
        print("    Google rejected the credentials. Ensure you are using a 16-character Google 'App Password', not your standard account password.")
        print(f"    Details: {e}")
        return False
    except Exception as e:
        print(f"\n[!] Delivery failed: {e}")
        return False

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "pavankumar.1280@gmail.com"
    test_live_email(target)
