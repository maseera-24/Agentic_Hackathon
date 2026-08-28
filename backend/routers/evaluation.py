import os
import json
from fastapi import APIRouter, HTTPException, Depends
from backend.agent_evaluation.run_evaluation import run_evaluation_suite
from backend.routers.auth import require_role

router = APIRouter(prefix="/agent/evaluation", tags=["Agent Evaluation & Grounding"])
officer_auth = require_role("placement_officer")

@router.get("/report")
def get_evaluation_report():
    """Returns latest automated agent evaluation report and benchmark metrics."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    report_path = os.path.join(base_dir, "agent_evaluation", "evaluation_report.json")

    if os.path.exists(report_path):
        try:
            with open(report_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    # If not yet generated, run live evaluation
    return run_evaluation_suite()

@router.post("/run")
def trigger_agent_evaluation(current_user: dict = Depends(officer_auth)):
    """Executes live agent evaluation suite across all benchmark scenarios."""
    try:
        report = run_evaluation_suite()
        return {
            "status": "success",
            "message": "Evaluation suite executed successfully with calculated metrics.",
            "report": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")
