"""
Enhanced Manager API with meal tracking
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, models
from ..database import get_db
from ..schemas import ManagerStatsResponse, ApprovalQueueResponse
from ..websocket import manager as ws_manager
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/manager", tags=["manager"])

@router.get("/stats", response_model=ManagerStatsResponse)
async def get_stats(db: Session = Depends(get_db)):
    stats = crud.get_today_stats(db)
    return stats

@router.get("/approvals", response_model=List[ApprovalQueueResponse])
async def get_approvals(db: Session = Depends(get_db)):
    approvals = crud.get_pending_approvals(db)
    return approvals

@router.get("/meal-logs/today")
async def get_today_meal_logs(db: Session = Depends(get_db)):
    """Get all meals served today"""
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    logs = db.query(models.MealLog).filter(
        models.MealLog.served_at >= today_start
    ).order_by(models.MealLog.served_at.desc()).all()
    
    result = []
    for log in logs:
        student = db.query(models.Student).filter(models.Student.id == log.student_id).first()
        if student:
            result.append({
                "id": log.id,
                "student_id": log.student_id,
                "student_name": student.name,
                "meal_type": log.meal_type,
                "served_at": log.served_at.isoformat(),
                "face_confidence": log.face_confidence or 0.0,
                "verified_by": log.verified_by or "face"
            })
    
    return result

@router.post("/approve/{approval_id}")
async def approve_request(approval_id: int, db: Session = Depends(get_db)):
    approval = crud.approve_approval(db, approval_id)
    
    # Broadcast approval to all connected clients
    await ws_manager.notify_approval_resolved(
        approval_id=approval.id,
        status="approved",
        student_name=approval.student_name or "Unknown"
    )
    
    return {"status": "approved", "approval_id": approval.id}

@router.post("/deny/{approval_id}")
async def deny_request(approval_id: int, db: Session = Depends(get_db)):
    approval = db.query(models.ApprovalQueue).filter(
        models.ApprovalQueue.id == approval_id
    ).first()
    if approval:
        approval.status = "denied"
        approval.resolved_at = datetime.utcnow()
        db.commit()
        
        # Broadcast denial to all connected clients
        await ws_manager.notify_approval_resolved(
            approval_id=approval.id,
            status="denied",
            student_name=approval.student_name or "Unknown"
        )
    
    return {"status": "denied", "approval_id": approval.id}
