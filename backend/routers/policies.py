from fastapi import APIRouter, Body
from backend.data.db import db
from backend.agent.tools import agent_tools

router = APIRouter(prefix="/policies", tags=["Placement Policy Knowledge Agent"])

@router.get("")
def list_policies():
    return db.get_policies()

@router.post("/query")
def query_policy_knowledge_base(payload: dict = Body(...)):
    query_text = payload.get("query", "")
    return agent_tools.get_college_policy(query_text)
