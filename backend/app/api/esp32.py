"""
ESP32-CAM Integration Endpoints
Handles face verification requests from ESP32-CAM hardware
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
import base64
from datetime import datetime
import io
from PIL import Image
import numpy as np

from ..database import get_db
from ..models import Student, MealLog, ApprovalQueue
from .. import schemas
from ..websocket import manager as ws_manager
from ..utils.fraud_detection import check_fraud_on_verification

router = APIRouter(prefix="/api/verify", tags=["ESP32 Verification"])


class VerificationRequest(BaseModel):
    """Request from ESP32-CAM device"""
    face_image: str  # Base64 encoded image
    verification_method: str  # "rfid" or "pin"
    rfid_uid: Optional[str] = None
    pin: Optional[str] = None
    device_id: str
    timestamp: int


class VerificationResponse(BaseModel):
    """Response to ESP32-CAM"""
    status: str  # "approved", "denied", "pending"
    message: str
    student_name: Optional[str] = None
    student_id: Optional[str] = None
    meal_type: Optional[str] = None


@router.post("/face", response_model=VerificationResponse)
async def verify_face(
    request: VerificationRequest,
    db: Session = Depends(get_db)
):
    """
    Main verification endpoint for ESP32-CAM
    
    Process:
    1. Decode face image from Base64
    2. Find student by RFID or PIN
    3. Verify face match (simplified for hackathon)
    4. Check meal eligibility
    5. Create approval request
    6. Return response to ESP32
    """
    
    try:
        # Step 1: Decode face image
        face_image_data = decode_base64_image(request.face_image)
        
        # Step 2: Find student by secondary auth (RFID or PIN)
        student = None
        
        if request.verification_method == "rfid" and request.rfid_uid:
            student = db.query(Student).filter(
                Student.rfid_uid == request.rfid_uid.upper()
            ).first()
        
        elif request.verification_method == "pin" and request.pin:
            # In production, use proper password hashing
            # For hackathon, simple match
            student = db.query(Student).filter(
                Student.pin_hash == request.pin
            ).first()
        
        if not student:
            return VerificationResponse(
                status="denied",
                message="Student not found",
                student_name=None,
                student_id=None
            )
        
        # Step 3: Face verification (simplified for hackathon)
        # In production, use DeepFace or face_recognition library
        face_match_confidence = verify_face_simplified(
            face_image_data, 
            student.face_embeddings
        )
        
        if face_match_confidence < 0.7:  # 70% threshold
            return VerificationResponse(
                status="denied",
                message="Face does not match",
                student_name=student.name,
                student_id=student.student_id
            )
        
        # Step 4: Check meal eligibility
        eligibility = check_meal_eligibility(student, db)
        
        if not eligibility["eligible"]:
            return VerificationResponse(
                status="denied",
                message=eligibility["reason"],
                student_name=student.name,
                student_id=student.student_id
            )
        
        # Step 4.5: Fraud detection check
        fraud_check = check_fraud_on_verification(db, student.id, request.rfid_uid)
        
        if fraud_check["is_suspicious"] and fraud_check["risk_level"] == "high":
            return VerificationResponse(
                status="denied",
                message=f"Suspicious activity detected: {', '.join(fraud_check['flags'])}",
                student_name=student.name,
                student_id=student.student_id
            )
        
        # Step 5: Create approval request (for manager dashboard)
        # Adjust trust score based on fraud detection
        trust_score_adjustment = 0
        if fraud_check["is_suspicious"]:
            if fraud_check["risk_level"] == "medium":
                trust_score_adjustment = -15
            elif fraud_check["risk_level"] == "low":
                trust_score_adjustment = -5
        
        approval = ApprovalQueue(
            student_id=student.id,
            student_name=student.name,
            face_image=request.face_image[:1000],  # Store truncated for demo
            verification_method=f"face+{request.verification_method}",
            face_confidence=face_match_confidence,
            trust_score=max(0, int(face_match_confidence * 100) + trust_score_adjustment),
            rfid_uid=request.rfid_uid,
            requested_meal=eligibility["meal_type"],
            status="pending",
            created_at=datetime.utcnow()
        )
        
        db.add(approval)
        db.commit()
        db.refresh(approval)
        
        # Broadcast to manager dashboard in real-time
        await ws_manager.notify_new_approval({
            "id": approval.id,
            "student_name": student.name,
            "student_id": student.student_id,
            "face_confidence": face_match_confidence,
            "trust_score": approval.trust_score,
            "verification_method": approval.verification_method,
            "requested_meal": eligibility["meal_type"],
            "created_at": approval.created_at.isoformat()
        })
        
        # Step 6: Return pending status (manager will approve)
        return VerificationResponse(
            status="pending",
            message="Awaiting manager approval",
            student_name=student.name,
            student_id=student.student_id,
            meal_type=eligibility["meal_type"]
        )
        
    except Exception as e:
        print(f"Verification error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Verification failed: {str(e)}"
        )


@router.post("/enroll-face", response_model=dict)
async def enroll_face_from_esp32(
    request: VerificationRequest,
    db: Session = Depends(get_db)
):
    """
    Enroll face images from ESP32-CAM during registration
    Called multiple times to capture 10-15 face samples
    """
    
    try:
        # Find student by RFID or student ID
        student = db.query(Student).filter(
            Student.rfid_uid == request.rfid_uid
        ).first()
        
        if not student:
            return {
                "success": False,
                "message": "Student not found"
            }
        
        # Decode and process face image
        face_image_data = decode_base64_image(request.face_image)
        
        # Extract face embedding (simplified for hackathon)
        # In production, use DeepFace or face_recognition
        face_embedding = extract_face_embedding_simplified(face_image_data)
        
        # Add to student's face embeddings
        if student.face_embeddings:
            embeddings = student.face_embeddings
            embeddings.append(face_embedding)
            student.face_embeddings = embeddings
        else:
            student.face_embeddings = [face_embedding]
        
        student.face_enrolled = True
        db.commit()
        
        return {
            "success": True,
            "message": "Face sample enrolled",
            "total_samples": len(student.face_embeddings)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Enrollment failed: {str(e)}"
        )


# ==================== Helper Functions ====================

def decode_base64_image(base64_string: str) -> np.ndarray:
    """Convert Base64 string to image array"""
    try:
        # Remove data URL prefix if present
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        
        # Decode Base64
        image_bytes = base64.b64decode(base64_string)
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to numpy array
        image_array = np.array(image)
        
        return image_array
        
    except Exception as e:
        print(f"Image decode error: {str(e)}")
        raise ValueError("Invalid image data")


def verify_face_simplified(face_image: np.ndarray, stored_embeddings: list) -> float:
    """
    Simplified face verification for hackathon
    In production, use DeepFace or face_recognition library
    
    Returns confidence score (0.0 - 1.0)
    """
    
    if not stored_embeddings or len(stored_embeddings) == 0:
        return 0.0
    
    # For hackathon demo: return high confidence if student has face enrolled
    # In production: Calculate cosine similarity between embeddings
    
    # Simulate face matching with random confidence (85-95%)
    import random
    confidence = 0.85 + (random.random() * 0.10)
    
    return confidence


def extract_face_embedding_simplified(face_image: np.ndarray) -> list:
    """
    Extract face embedding from image (simplified for hackathon)
    In production, use DeepFace.represent() or face_recognition.face_encodings()
    
    Returns 128-dimensional face embedding
    """
    
    # For hackathon: return dummy embedding
    # In production: Use actual face recognition model
    import random
    embedding = [random.random() for _ in range(128)]
    
    return embedding


def check_meal_eligibility(student: Student, db: Session) -> dict:
    """
    Check if student is eligible for a meal
    
    Checks:
    1. Active meal plan
    2. Not already eaten this meal
    3. Within meal time window
    """
    
    from datetime import datetime, time
    
    # Determine current meal type based on time
    current_time = datetime.now().time()
    
    if time(6, 0) <= current_time < time(10, 0):
        meal_type = "breakfast"
    elif time(12, 0) <= current_time < time(15, 0):
        meal_type = "lunch"
    elif time(18, 0) <= current_time < time(21, 0):
        meal_type = "dinner"
    else:
        return {
            "eligible": False,
            "reason": "Outside meal hours",
            "meal_type": None
        }
    
    # Check if already eaten this meal today
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    existing_meal = db.query(MealLog).filter(
        MealLog.student_id == student.id,
        MealLog.meal_type == meal_type,
        MealLog.served_at >= today_start
    ).first()
    
    if existing_meal:
        return {
            "eligible": False,
            "reason": f"Already had {meal_type} today",
            "meal_type": meal_type
        }
    
    # Check meal plan status (simplified)
    # In production: check MealPlan table
    if not student.is_active:
        return {
            "eligible": False,
            "reason": "Inactive meal plan",
            "meal_type": meal_type
        }
    
    return {
        "eligible": True,
        "reason": "Eligible",
        "meal_type": meal_type
    }


@router.get("/test-connection")
async def test_connection():
    """Simple endpoint to test ESP32 connectivity"""
    return {
        "status": "ok",
        "message": "Backend is reachable",
        "timestamp": datetime.utcnow().isoformat()
    }
