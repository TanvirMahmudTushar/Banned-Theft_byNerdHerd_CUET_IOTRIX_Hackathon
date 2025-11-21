from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from .. import crud
from ..database import get_db
from ..schemas import StudentResponse, AnalyticsResponse
from ..utils.fraud_detection import get_fraud_dashboard_stats

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/students")
async def list_students(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    students, total = crud.get_students(db, skip=(page - 1) * limit, limit=limit)
    return {
        "students": [
            {
                "id": s.id,
                "student_id": s.student_id,
                "name": s.name,
                "email": s.email,
                "department": s.department,
                "batch": s.batch,
                "is_active": s.is_active,
                "face_enrolled": s.face_enrolled,
                "created_at": s.created_at
            }
            for s in students
        ],
        "total": total
    }

@router.get("/students/{student_id}")
async def get_student(student_id: int, db: Session = Depends(get_db)):
    student = crud.get_student_by_id(db, student_id)
    if not student:
        return {"error": "Student not found"}
    return {
        "id": student.id,
        "student_id": student.student_id,
        "name": student.name,
        "email": student.email,
        "department": student.department,
        "batch": student.batch,
        "is_active": student.is_active,
        "face_enrolled": student.face_enrolled,
        "created_at": student.created_at
    }

@router.get("/analytics")
async def get_analytics(days: int = 7, db: Session = Depends(get_db)):
    analytics = crud.get_analytics(db, days)
    return analytics

@router.get("/activity")
async def get_activity(db: Session = Depends(get_db)):
    activity = crud.get_recent_activity(db, limit=10)
    return activity

@router.get("/fraud-analytics")
async def get_fraud_analytics(db: Session = Depends(get_db)):
    """Get fraud detection analytics for admin dashboard"""
    fraud_stats = get_fraud_dashboard_stats(db)
    return fraud_stats
