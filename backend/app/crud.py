from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from . import models, schemas
import random

def get_students(db: Session, skip: int = 0, limit: int = 10):
    students = db.query(models.Student).offset(skip).limit(limit).all()
    total = db.query(func.count(models.Student.id)).scalar()
    return students, total

def get_student_by_id(db: Session, student_id: int):
    return db.query(models.Student).filter(models.Student.id == student_id).first()

def get_pending_approvals(db: Session):
    return db.query(models.ApprovalQueue).filter(
        models.ApprovalQueue.status == "pending"
    ).all()

def approve_approval(db: Session, approval_id: int):
    approval = db.query(models.ApprovalQueue).filter(
        models.ApprovalQueue.id == approval_id
    ).first()
    if approval:
        approval.status = "approved"
        approval.resolved_at = datetime.utcnow()
        
        # Create meal log
        meal_log = models.MealLog(
            student_id=approval.student_id,
            meal_type=approval.requested_meal,
            verified_by="face",
            face_confidence=approval.face_confidence
        )
        db.add(meal_log)
        db.commit()
    return approval

def get_today_stats(db: Session):
    today = datetime.now().date()
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())
    
    approvals = db.query(func.count(models.ApprovalQueue.id)).filter(
        models.ApprovalQueue.status == "approved",
        models.ApprovalQueue.created_at >= today_start,
        models.ApprovalQueue.created_at <= today_end
    ).scalar()
    
    meals = db.query(func.count(models.MealLog.id)).filter(
        models.MealLog.created_at >= today_start,
        models.MealLog.created_at <= today_end
    ).scalar()
    
    pending = db.query(func.count(models.ApprovalQueue.id)).filter(
        models.ApprovalQueue.status == "pending"
    ).scalar()
    
    active = db.query(func.count(models.Student.id)).filter(
        models.Student.is_active == True
    ).scalar()
    
    return {
        "today_approvals": approvals or 0,
        "today_meals": meals or 0,
        "pending_requests": pending or 0,
        "active_students": active or 0
    }

def get_analytics(db: Session, days: int = 7):
    start_date = datetime.now() - timedelta(days=days)
    
    # Daily meal breakdown
    daily_data = []
    for i in range(days):
        date = (datetime.now() - timedelta(days=days-i-1)).date()
        day_start = datetime.combine(date, datetime.min.time())
        day_end = datetime.combine(date, datetime.max.time())
        
        breakfast = db.query(func.count(models.MealLog.id)).filter(
            models.MealLog.meal_type == "breakfast",
            models.MealLog.created_at >= day_start,
            models.MealLog.created_at <= day_end
        ).scalar() or 0
        
        lunch = db.query(func.count(models.MealLog.id)).filter(
            models.MealLog.meal_type == "lunch",
            models.MealLog.created_at >= day_start,
            models.MealLog.created_at <= day_end
        ).scalar() or 0
        
        dinner = db.query(func.count(models.MealLog.id)).filter(
            models.MealLog.meal_type == "dinner",
            models.MealLog.created_at >= day_start,
            models.MealLog.created_at <= day_end
        ).scalar() or 0
        
        daily_data.append({
            "date": date.strftime("%m/%d"),
            "breakfast": breakfast,
            "lunch": lunch,
            "dinner": dinner
        })
    
    total_meals = db.query(func.count(models.MealLog.id)).filter(
        models.MealLog.created_at >= start_date
    ).scalar() or 0
    
    unique_students = db.query(func.count(func.distinct(models.MealLog.student_id))).filter(
        models.MealLog.created_at >= start_date
    ).scalar() or 0
    
    avg_confidence = db.query(func.avg(models.MealLog.face_confidence)).filter(
        models.MealLog.created_at >= start_date
    ).scalar() or 0.9
    
    return {
        "total_meals": total_meals,
        "unique_students": unique_students,
        "avg_confidence": float(avg_confidence),
        "daily_meals": daily_data
    }

def get_recent_activity(db: Session, limit: int = 10):
    logs = db.query(models.MealLog).order_by(
        models.MealLog.created_at.desc()
    ).limit(limit).all()
    
    activity = []
    for log in logs:
        student = db.query(models.Student).filter(
            models.Student.id == log.student_id
        ).first()
        activity.append({
            "description": f"{student.name} had {log.meal_type.capitalize()}",
            "timestamp": log.created_at.strftime("%I:%M %p")
        })
    
    return activity
