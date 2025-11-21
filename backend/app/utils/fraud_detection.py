"""
Fraud Detection System
Detects suspicious patterns and potential fraud attempts
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from ..models import MealLog, Student, ApprovalQueue
from collections import defaultdict


class FraudDetector:
    """Detects suspicious verification patterns"""
    
    # Thresholds
    MAX_MEALS_PER_DAY = 3  # Breakfast, Lunch, Dinner
    MIN_TIME_BETWEEN_MEALS = 180  # 3 hours in minutes
    VELOCITY_THRESHOLD = 2  # Max attempts in 5 minutes
    SAME_CARD_MULTIPLE_USERS_THRESHOLD = 3  # Different users using same RFID
    
    def __init__(self, db: Session):
        self.db = db
        self.alerts = []
    
    def check_all_fraud_patterns(self, student_id: int, rfid_uid: Optional[str] = None) -> Dict:
        """
        Run all fraud detection checks
        Returns: {
            "is_suspicious": bool,
            "flags": List[str],
            "risk_level": "low" | "medium" | "high",
            "details": Dict
        }
        """
        flags = []
        details = {}
        
        # Check 1: Multiple meals in short time
        if self._check_rapid_meal_attempts(student_id):
            flags.append("rapid_meal_attempts")
            details["rapid_meals"] = "Multiple meal attempts within 3 hours"
        
        # Check 2: Exceeds daily meal limit
        if self._check_daily_meal_limit(student_id):
            flags.append("exceeds_daily_limit")
            details["daily_limit"] = f"More than {self.MAX_MEALS_PER_DAY} meals today"
        
        # Check 3: Same RFID used by multiple people
        if rfid_uid and self._check_shared_rfid(rfid_uid, student_id):
            flags.append("shared_rfid_card")
            details["shared_card"] = "RFID card used by multiple students"
        
        # Check 4: High velocity (too many attempts)
        if self._check_velocity_abuse(student_id):
            flags.append("velocity_abuse")
            details["velocity"] = "Too many verification attempts in 5 minutes"
        
        # Check 5: Unusual meal timing
        unusual_timing = self._check_unusual_timing()
        if unusual_timing:
            flags.append("unusual_timing")
            details["timing"] = unusual_timing
        
        # Determine risk level
        risk_level = self._calculate_risk_level(flags)
        
        return {
            "is_suspicious": len(flags) > 0,
            "flags": flags,
            "risk_level": risk_level,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _check_rapid_meal_attempts(self, student_id: int) -> bool:
        """Check if student has multiple meals within MIN_TIME_BETWEEN_MEALS"""
        recent_time = datetime.utcnow() - timedelta(minutes=self.MIN_TIME_BETWEEN_MEALS)
        
        recent_meals = self.db.query(MealLog).filter(
            MealLog.student_id == student_id,
            MealLog.served_at >= recent_time
        ).count()
        
        return recent_meals > 0
    
    def _check_daily_meal_limit(self, student_id: int) -> bool:
        """Check if student exceeds daily meal limit"""
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        today_meals = self.db.query(MealLog).filter(
            MealLog.student_id == student_id,
            MealLog.served_at >= today_start
        ).count()
        
        return today_meals >= self.MAX_MEALS_PER_DAY
    
    def _check_shared_rfid(self, rfid_uid: str, current_student_id: int) -> bool:
        """Check if same RFID card is registered to multiple students"""
        students_with_card = self.db.query(Student).filter(
            Student.rfid_uid == rfid_uid,
            Student.is_active == True
        ).count()
        
        return students_with_card > 1
    
    def _check_velocity_abuse(self, student_id: int) -> bool:
        """Check if too many verification attempts in short time"""
        recent_time = datetime.utcnow() - timedelta(minutes=5)
        
        recent_attempts = self.db.query(ApprovalQueue).filter(
            ApprovalQueue.student_id == student_id,
            ApprovalQueue.created_at >= recent_time
        ).count()
        
        return recent_attempts >= self.VELOCITY_THRESHOLD
    
    def _check_unusual_timing(self) -> Optional[str]:
        """Check if verification is happening at unusual hours"""
        current_hour = datetime.utcnow().hour
        
        # Define meal times (in 24-hour format)
        BREAKFAST_START, BREAKFAST_END = 6, 10
        LUNCH_START, LUNCH_END = 11, 15
        DINNER_START, DINNER_END = 17, 21
        
        is_meal_time = (
            (BREAKFAST_START <= current_hour < BREAKFAST_END) or
            (LUNCH_START <= current_hour < LUNCH_END) or
            (DINNER_START <= current_hour < DINNER_END)
        )
        
        if not is_meal_time:
            return f"Verification at unusual hour: {current_hour}:00"
        
        return None
    
    def _calculate_risk_level(self, flags: List[str]) -> str:
        """Calculate overall risk level based on flags"""
        high_risk_flags = ["shared_rfid_card", "velocity_abuse"]
        medium_risk_flags = ["exceeds_daily_limit", "rapid_meal_attempts"]
        
        if any(flag in high_risk_flags for flag in flags):
            return "high"
        elif any(flag in medium_risk_flags for flag in flags):
            return "medium"
        elif len(flags) > 0:
            return "low"
        
        return "none"
    
    def get_fraud_analytics(self) -> Dict:
        """Get fraud detection analytics for admin dashboard"""
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = datetime.utcnow() - timedelta(days=7)
        
        # Find duplicate RFID cards
        duplicate_rfids = self._find_duplicate_rfids()
        
        # Find students with excessive attempts
        excessive_attempts = self._find_excessive_attempts(today_start)
        
        # Find unusual time verifications
        unusual_time_logs = self.db.query(MealLog).filter(
            MealLog.served_at >= today_start
        ).all()
        
        unusual_count = sum(
            1 for log in unusual_time_logs
            if not self._is_normal_meal_time(log.served_at)
        )
        
        return {
            "duplicate_rfid_cards": len(duplicate_rfids),
            "duplicate_rfid_details": duplicate_rfids[:5],  # Top 5
            "excessive_attempts_today": len(excessive_attempts),
            "excessive_attempts_details": excessive_attempts[:5],
            "unusual_time_verifications": unusual_count,
            "total_flags_today": len(duplicate_rfids) + len(excessive_attempts) + unusual_count,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _find_duplicate_rfids(self) -> List[Dict]:
        """Find RFID cards used by multiple students"""
        all_students = self.db.query(Student).filter(
            Student.rfid_uid.isnot(None),
            Student.is_active == True
        ).all()
        
        rfid_to_students = defaultdict(list)
        for student in all_students:
            if student.rfid_uid:
                rfid_to_students[student.rfid_uid].append({
                    "student_id": student.student_id,
                    "name": student.name
                })
        
        duplicates = [
            {
                "rfid_uid": rfid,
                "student_count": len(students),
                "students": students
            }
            for rfid, students in rfid_to_students.items()
            if len(students) > 1
        ]
        
        return duplicates
    
    def _find_excessive_attempts(self, since: datetime) -> List[Dict]:
        """Find students with excessive verification attempts"""
        approvals = self.db.query(ApprovalQueue).filter(
            ApprovalQueue.created_at >= since
        ).all()
        
        student_attempts = defaultdict(int)
        for approval in approvals:
            student_attempts[approval.student_id] += 1
        
        excessive = [
            {
                "student_id": student_id,
                "attempts": count,
                "threshold": self.MAX_MEALS_PER_DAY * 2
            }
            for student_id, count in student_attempts.items()
            if count > self.MAX_MEALS_PER_DAY * 2
        ]
        
        return excessive
    
    def _is_normal_meal_time(self, timestamp: datetime) -> bool:
        """Check if timestamp is during normal meal hours"""
        hour = timestamp.hour
        return (6 <= hour < 10) or (11 <= hour < 15) or (17 <= hour < 21)


def check_fraud_on_verification(db: Session, student_id: int, rfid_uid: Optional[str] = None) -> Dict:
    """
    Convenience function to check fraud during verification
    Use this in ESP32 verification endpoint
    """
    detector = FraudDetector(db)
    return detector.check_all_fraud_patterns(student_id, rfid_uid)


def get_fraud_dashboard_stats(db: Session) -> Dict:
    """
    Get fraud analytics for admin dashboard
    """
    detector = FraudDetector(db)
    return detector.get_fraud_analytics()
