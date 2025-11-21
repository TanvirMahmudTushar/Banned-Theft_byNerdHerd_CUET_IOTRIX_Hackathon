from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from .. import models
from ..database import get_db

router = APIRouter(prefix="/api/student", tags=["student"])

class MealRequest(BaseModel):
    student_id: int
    student_name: str
    student_id_number: str
    token_id: str
    requested_meal: str
    face_confidence: float

@router.post("/request-meal")
async def request_meal(request: MealRequest, db: Session = Depends(get_db)):
    # Use name from request, not database
    approval = models.ApprovalQueue(
        student_id=request.student_id,
        student_name=request.student_name,
        student_id_number=request.student_id_number,
        token_id=request.token_id,
        requested_meal=request.requested_meal,
        face_confidence=request.face_confidence,
        verification_method="manual",
        status="pending"
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)
    
    return {"status": "success", "message": "Meal request sent to manager", "request_id": approval.id}

@router.post("/login")
async def login(student_id: str, pin: str, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(
        models.Student.student_id == student_id
    ).first()
    if not student:
        return {"error": "Student not found"}
    return {"status": "success", "student_id": student.student_id, "name": student.name}

@router.get("/profile")
async def get_profile(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(
        models.Student.id == student_id
    ).first()
    if not student:
        return {"error": "Student not found"}
    return {
        "id": student.id,
        "student_id": student.student_id,
        "name": student.name,
        "email": student.email,
        "department": student.department,
        "is_active": student.is_active,
        "face_enrolled": student.face_enrolled
    }
