import datetime

class CommunicationEngine:
    def generate_personalized_message(self, student, drive_or_schedule, channel="Email", msg_type="Shortlist"):
        """
        Generates context-rich personalized communication tailored to the candidate and specific drive round.
        """
        name = student.get("name", "Student")
        company = drive_or_schedule.get("company_name", "the recruiting company")
        role = drive_or_schedule.get("role_title", "Software Engineer")
        round_name = drive_or_schedule.get("round_name") or drive_or_schedule.get("stage", "Technical Assessment")
        date = drive_or_schedule.get("date", "Tomorrow")
        time = drive_or_schedule.get("start_time", "10:00 AM")
        room = drive_or_schedule.get("room_name", "Placement Hall Block A")

        if msg_type == "Shortlist" or msg_type == "Interview Invitation":
            if channel == "Email":
                subject = f"Official Shortlist & Schedule: {company} - {role}"
                body = (
                    f"Dear {name},\n\n"
                    f"Congratulations! You have been shortlisted for the {round_name} round with {company} for the {role} position.\n\n"
                    f"📅 Date: {date}\n"
                    f"⏰ Slot: {time}\n"
                    f"📍 Venue: {room}\n\n"
                    f"Mandatory Instructions:\n"
                    f"1. Please arrive at least 15 minutes prior to your scheduled slot.\n"
                    f"2. Bring 2 printed copies of your updated resume and your physical College ID card.\n"
                    f"3. Strictly adhere to formal college dress code.\n\n"
                    f"Please confirm your attendance in the Placement Portal immediately.\n\n"
                    f"Best Regards,\nTraining & Placement Cell\nApex Institute of Technology"
                )
            elif channel == "App Notification":
                subject = f"🎯 {company} Interview Scheduled"
                body = f"Hi {name}, your {round_name} with {company} is confirmed for {date} at {time} in {room}. Tap to view details and confirm."
            else: # AI Voice Call Script
                subject = f"AI Voice Dispatch: {company} Interview"
                body = (
                    f"Hello {name}, this is the autonomous Placement Coordination Assistant from Apex Institute. "
                    f"Congratulations on advancing in the {company} placement drive! "
                    f"Your {round_name} is confirmed for {date} at {time} in {room}. "
                    f"Please carry your college ID card and updated resume. We wish you the very best!"
                )

        elif msg_type == "Reschedule Alert":
            subject = f"IMPORTANT: Venue / Schedule Update for {company}"
            body = (
                f"Dear {name},\n\n"
                f"Please note an operational update regarding your interview with {company}.\n\n"
                f"Your {round_name} slot has been re-assigned to:\n"
                f"⏰ New Time: {time}\n"
                f"📍 New Venue: {room}\n\n"
                f"Our AI operations agent made this change to prevent panel delays and ensure your interview proceeds seamlessly."
            )

        elif msg_type == "Reminder":
            subject = f"URGENT REMINDER: Action Required for {company}"
            body = (
                f"Dear {name}, our records show you have not yet confirmed attendance for the upcoming {company} drive round. "
                f"Please confirm within the next 60 minutes to prevent automatic forfeiture and debarment under Policy AIT-PL-03."
            )

        else:
            subject = f"Placement Notification: {company}"
            body = f"Hello {name}, you have a new update regarding {company} placement operations."

        return {
            "channel": channel,
            "subject": subject,
            "body": body,
            "recipient": student.get("email") if channel == "Email" else student.get("phone", ""),
            "student_id": student.get("id"),
            "student_name": name,
            "timestamp": datetime.datetime.now().isoformat()
        }

    def simulate_ai_voice_call(self, student, schedule_info):
        """
        Generates simulated interactive voice call session data for frontend visualizer and audio player.
        """
        msg = self.generate_personalized_message(student, schedule_info, channel="AI Voice Call", msg_type="Interview Invitation")

        simulated_transcript = [
            {"speaker": "AI Voice Agent", "time": "00:01", "text": f"Connecting to {student.get('name')} at {student.get('phone', '+91 98765 43210')}..."},
            {"speaker": "AI Voice Agent", "time": "00:03", "text": msg["body"]},
            {"speaker": "Student (Simulated)", "time": "00:14", "text": "Yes, I acknowledge. I will be present at the venue on time. Thank you!"},
            {"speaker": "AI Voice Agent", "time": "00:18", "text": "Thank you for confirming. Your attendance status is now updated in the TPO dashboard. Have a great interview!"}
        ]

        return {
            "call_id": f"CALL_{datetime.datetime.now().strftime('%H%M%S')}",
            "student_id": student.get("id"),
            "student_name": student.get("name"),
            "phone": student.get("phone", "+91 98765 43210"),
            "duration_seconds": 22,
            "status": "Call Completed (Student Confirmed Attendance)",
            "transcript": simulated_transcript,
            "escalation_outcome": "Resolved - Attendance Verified"
        }

communication_engine = CommunicationEngine()
