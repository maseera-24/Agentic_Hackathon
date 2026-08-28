from fastapi import APIRouter, Body
from backend.data.db import db
from backend.agent.tools import agent_tools

router = APIRouter(prefix="/demo", tags=["20-Step Live Demo Scenario"])

DEMO_STEPS = [
    {
        "step": 1,
        "title": "Select Company Job Description",
        "description": "TPO selects or pastes Google India SDE-1 Job Description.",
        "component_target": "drives",
        "action_type": "view_jd",
        "auto_data": {"company": "Google India", "role": "Software Development Engineer - I (SDE-1)"}
    },
    {
        "step": 2,
        "title": "AI Requirements Extraction",
        "description": "Agent extracts structured requirements: CGPA >= 7.5, 0 backlogs, CSE/IT/ECE/AI&DS, 6 technical skills.",
        "component_target": "drives",
        "action_type": "extract_jd"
    },
    {
        "step": 3,
        "title": "Automated Eligibility Check",
        "description": "AI verifies all 50 students against Google criteria.",
        "component_target": "eligibility",
        "action_type": "run_eligibility"
    },
    {
        "step": 4,
        "title": "Show Eligible Candidates",
        "description": "Displays 34 eligible candidates, with 'Why?' explainability for non-eligible candidates.",
        "component_target": "eligibility",
        "action_type": "view_eligible"
    },
    {
        "step": 5,
        "title": "Skill-Based Role Fit Matching",
        "description": "AI computes role-fit match % (Tech, Coding, Aptitude, Projects, Comm) with explainable reasoning.",
        "component_target": "matching",
        "action_type": "run_matching"
    },
    {
        "step": 6,
        "title": "TPO Approves Shortlist",
        "description": "Human-in-the-loop: TPO approves top 22 candidates for Technical Interview Rounds.",
        "component_target": "matching",
        "action_type": "approve_shortlist"
    },
    {
        "step": 7,
        "title": "Smart Multi-Panel Scheduling",
        "description": "AI generates conflict-free schedule minimizing idle time to < 12 minutes.",
        "component_target": "schedule",
        "action_type": "generate_schedule"
    },
    {
        "step": 8,
        "title": "Panel & Room Allocation",
        "description": "Panels 1, 2, 3, 4, 5 and 8 mapped to Interview Rooms 101-105 & 203.",
        "component_target": "facilities",
        "action_type": "view_allocations"
    },
    {
        "step": 9,
        "title": "Personalized Notifications Dispatched",
        "description": "Personalized email invites sent to all 22 shortlisted candidates with venue and time details.",
        "component_target": "communication",
        "action_type": "send_notifications"
    },
    {
        "step": 10,
        "title": "Simulate Live Incident: Panel 2 Unavailable",
        "description": "Emergency trigger: Panel 2 interviewer reports illness right before 10:00 AM round.",
        "component_target": "exceptions",
        "action_type": "trigger_panel_failure"
    },
    {
        "step": 11,
        "title": "Exception Agent Impact Detection",
        "description": "AI Agent identifies 18 scheduled candidates affected by Panel 2 unavailability.",
        "component_target": "exceptions",
        "action_type": "detect_impact"
    },
    {
        "step": 12,
        "title": "AI Recovery Plan Generation",
        "description": "Agent formulates Plan A: Reallocate 10 candidates to Panel 4 and 8 to Panel 5.",
        "component_target": "exceptions",
        "action_type": "view_recovery_plan"
    },
    {
        "step": 13,
        "title": "Human-in-the-Loop Gating: Approve Recovery?",
        "description": "TPO presented with side-by-side recovery diff and impact analysis.",
        "component_target": "exceptions",
        "action_type": "prompt_approval"
    },
    {
        "step": 14,
        "title": "TPO Approves Recovery Plan",
        "description": "TPO clicks 'Approve Plan A' to execute automated re-slotting.",
        "component_target": "exceptions",
        "action_type": "approve_recovery"
    },
    {
        "step": 15,
        "title": "Schedule Dynamically Re-Synced",
        "description": "Active schedule automatically updates with zero room conflicts.",
        "component_target": "schedule",
        "action_type": "view_updated_schedule"
    },
    {
        "step": 16,
        "title": "Affected Students Re-Notified",
        "description": "Real-time venue & slot update push notifications delivered to affected candidates.",
        "component_target": "communication",
        "action_type": "view_reschedule_comms"
    },
    {
        "step": 17,
        "title": "Unconfirmed Candidate Detected",
        "description": "Monitoring agent flags candidate Amit Patel (STU003) for non-response.",
        "component_target": "communication",
        "action_type": "flag_unconfirmed"
    },
    {
        "step": 18,
        "title": "Context-Aware Communication Escalation",
        "description": "Agent escalates: Email → App Push → Autonomous AI Voice Call with interactive audio simulation.",
        "component_target": "communication",
        "action_type": "trigger_voice_escalation"
    },
    {
        "step": 19,
        "title": "Operations Dashboard & Audit Trail",
        "description": "Dashboard reflects resolved exceptions, green risk radar, and complete agent reasoning audit trail.",
        "component_target": "dashboard",
        "action_type": "view_dashboard"
    },
    {
        "step": 20,
        "title": "What-If Placement Simulator",
        "description": "TPO asks: 'What happens if 30 more candidates are shortlisted?' AI forecasts impacts & solutions.",
        "component_target": "simulator",
        "action_type": "run_whatif"
    }
]

@router.get("/steps")
def get_demo_steps():
    return DEMO_STEPS

@router.post("/reset")
def reset_demo_state():
    db.reset_to_seed()
    return {"status": "Reset Successful", "message": "All drives, students, panels, and exceptions reset to initial state."}

@router.post("/execute_step/{step_num}")
def execute_demo_step(step_num: int):
    if step_num == 10:
        agent_tools.generate_recovery_plan("PANEL_02")
    elif step_num == 14:
        exceptions = db.get_exceptions()
        if exceptions:
            exc_id = exceptions[0]["id"]
            agent_tools.execute_tool_directly("approve_recovery_plan", {"exception_id": exc_id})
    elif step_num == 18:
        agent_tools.initiate_voice_call("STU003")
    return {"step": step_num, "status": "Executed"}
