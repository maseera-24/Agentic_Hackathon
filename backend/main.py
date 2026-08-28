from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.data.db import db
from backend.routers import (
    auth,
    students,
    drives,
    applications,
    notifications,
    officer,
    panels_rooms,
    conflicts,
    exceptions,
    simulator,
    communication,
    policies,
    audit,
    agent,
    demo,
    companies,
    evaluation
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Apex Institute of Technology - Autonomous AI Campus Placement & Interview Coordination Portal"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Placement Portal Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(students.router, prefix=settings.API_PREFIX)
app.include_router(drives.router, prefix=settings.API_PREFIX)
app.include_router(applications.router, prefix=settings.API_PREFIX)
app.include_router(notifications.router, prefix=settings.API_PREFIX)
app.include_router(officer.router, prefix=settings.API_PREFIX)

# Placement Operations & Intelligent Agent Routers
app.include_router(panels_rooms.router, prefix=settings.API_PREFIX)
app.include_router(conflicts.router, prefix=settings.API_PREFIX)
app.include_router(exceptions.router, prefix=settings.API_PREFIX)
app.include_router(simulator.router, prefix=settings.API_PREFIX)
app.include_router(communication.router, prefix=settings.API_PREFIX)
app.include_router(policies.router, prefix=settings.API_PREFIX)
app.include_router(audit.router, prefix=settings.API_PREFIX)
app.include_router(agent.router, prefix=settings.API_PREFIX)
app.include_router(companies.router, prefix=settings.API_PREFIX)
app.include_router(evaluation.router, prefix=settings.API_PREFIX)
app.include_router(demo.router, prefix=settings.API_PREFIX)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "college": settings.COLLEGE_NAME,
        "mode": "Live Hybrid Placement Portal"
    }

@app.get("/api/db-status")
def db_status():
    return db.get_connection_status()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
