from fastapi import APIRouter
from backend.data.db import db

router = APIRouter(prefix="/audit", tags=["Agent Audit Trail"])

@router.get("")
def list_audit_trail():
    return db.get_audit_logs()
