from fastapi import APIRouter, Body
from backend.agent.tools import agent_tools

router = APIRouter(prefix="/simulator", tags=["What-If Placement Simulator"])

@router.post("/run")
def run_what_if_scenario(payload: dict = Body(...)):
    scenario_type = payload.get("scenario_type", "more_candidates")
    params = payload.get("params", {})
    return agent_tools.simulate_placement_change(scenario_type, params)
