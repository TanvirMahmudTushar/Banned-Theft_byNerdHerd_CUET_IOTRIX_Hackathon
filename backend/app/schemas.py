from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class StudentBase(BaseModel):
    student_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    batch: Optional[int] = None
    gender: Optional[str] = None

class StudentCreate(StudentBase):
    pin: str

class StudentResponse(StudentBase):
    id: int
    face_enrolled: bool
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ApprovalQueueResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    student_id_number: str | None = None
    token_id: str | None = None
    requested_meal: str
    face_confidence: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class MealLogResponse(BaseModel):
    id: int
    student_id: int
    meal_type: str
    served_at: datetime
    face_confidence: float
    
    class Config:
        from_attributes = True

class ManagerStatsResponse(BaseModel):
    today_approvals: int
    today_meals: int
    pending_requests: int
    active_students: int

class AnalyticsResponse(BaseModel):
    total_meals: int
    unique_students: int
    avg_confidence: float
    daily_meals: List[dict]
