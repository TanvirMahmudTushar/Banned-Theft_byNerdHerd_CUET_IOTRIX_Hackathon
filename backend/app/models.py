from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Date, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Manager(Base):
    __tablename__ = "managers"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="manager")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True)
    student_id = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True)
    phone = Column(String)
    department = Column(String)
    batch = Column(Integer)
    gender = Column(String)
    photo = Column(String)
    face_enrolled = Column(Boolean, default=False)
    face_embeddings = Column(JSON, default=list)
    rfid_uid = Column(String, unique=True)
    rfid_card_type = Column(String, default="Mifare Classic 1K")
    pin_hash = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MealPlan(Base):
    __tablename__ = "meal_plans"
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    plan_type = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    meals = Column(JSON, default=list)
    cost = Column(Float)
    payment_status = Column(String, default="paid")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class MealLog(Base):
    __tablename__ = "meal_logs"
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    meal_type = Column(String)
    served_at = Column(DateTime, default=datetime.utcnow)
    verified_by = Column(String)
    manager_id = Column(Integer)
    device_id = Column(String)
    face_confidence = Column(Float)
    approval_time = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

class ApprovalQueue(Base):
    __tablename__ = "approval_queue"
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    student_name = Column(String)
    student_id_number = Column(String)
    token_id = Column(String)
    face_image = Column(String)
    verification_method = Column(String, default="face")
    face_confidence = Column(Float)
    trust_score = Column(Integer)
    rfid_uid = Column(String)
    requested_meal = Column(String)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)
