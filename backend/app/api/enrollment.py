from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/enroll", tags=["enrollment"])

@router.post("/basic-info")
async def submit_basic_info(
    name: str,
    student_id: str,
    email: str,
    department: str,
    gender: str,
    db: Session = Depends(get_db)
):
    # Check if student already exists
    existing = db.query(models.Student).filter(
        models.Student.student_id == student_id
    ).first()
    if existing:
        return {"error": "Student ID already exists"}
    
    return {"status": "success", "message": "Basic info saved"}

@router.post("/face-data")
async def submit_face_data(student_id: str, db: Session = Depends(get_db)):
    return {"status": "success", "message": "Face data saved"}

@router.post("/rfid")
async def submit_rfid(student_id: str, rfid_uid: str, db: Session = Depends(get_db)):
    return {"status": "success", "message": "RFID registered"}

@router.post("/pin")
async def setup_pin(student_id: str, pin: str, db: Session = Depends(get_db)):
    return {"status": "success", "message": "PIN set"}

@router.post("/meal-plan")
async def assign_meal_plan(
    student_id: str,
    plan_type: str,
    db: Session = Depends(get_db)
):
    return {"status": "success", "message": "Meal plan assigned"}

@router.post("/confirm")
async def confirm_enrollment(
    name: str,
    student_id: str,
    email: str,
    department: str,
    gender: str,
    rfid_uid: str,
    pin: str,
    plan_type: str,
    db: Session = Depends(get_db)
):
    student = models.Student(
        name=name,
        student_id=student_id,
        email=email,
        department=department,
        gender=gender,
        rfid_uid=rfid_uid,
        pin_hash=pin,
        face_enrolled=True,
        is_active=True
    )
    db.add(student)
    db.commit()
    
    # Create meal plan
    plan = models.MealPlan(
        student_id=student.id,
        plan_type=plan_type,
        start_date=datetime.now().date(),
        end_date=(datetime.now() + timedelta(days=30)).date(),
        meals=["breakfast", "lunch", "dinner"],
        cost=2500.0 if plan_type == "monthly" else 7500.0,
        payment_status="paid",
        is_active=True
    )
    db.add(plan)
    db.commit()
    
    return {"status": "success", "student_id": student.id}
