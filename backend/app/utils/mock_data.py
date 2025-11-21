from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from .. import models

def create_mock_data(db: Session):
    # Check if data already exists
    if db.query(models.Student).first():
        return
    
    # Create students
    departments = ["Computer Science", "Mechanical Engineering", "Civil Engineering", "Electronics"]
    names = [
        "Rajesh Kumar", "Priya Singh", "Amit Patel", "Neha Sharma", "Vikram Desai",
        "Ananya Gupta", "Karan Verma", "Shruti Iyer", "Rohan Malhotra", "Divya Nair",
        "Arjun Reddy", "Kavya Menon", "Aditya Kapoor", "Riya Bhat", "Sanjay Rao",
        "Meera Joshi", "Nikhil Pandey", "Sneha Kulkarni", "Varun Singh", "Zara Khan"
    ]
    
    students = []
    for i, name in enumerate(names):
        student = models.Student(
            student_id=f"21CS{i+1:03d}",
            name=name,
            email=f"{name.lower().replace(' ', '.')}@college.edu",
            phone=f"+91{random.randint(6000000000, 9999999999)}",
            department=random.choice(departments),
            batch=2021 + random.randint(0, 3),
            gender=random.choice(["male", "female"]),
            face_enrolled=True,
            rfid_uid=f"A1B2C3D4E5F{i:02d}",
            pin_hash="hashed_pin",
            is_active=True
        )
        students.append(student)
        db.add(student)
    
    db.commit()
    
    # Create meal plans
    for student in students:
        plan = models.MealPlan(
            student_id=student.id,
            plan_type=random.choice(["monthly", "semester"]),
            start_date=(datetime.now() - timedelta(days=30)).date(),
            end_date=(datetime.now() + timedelta(days=30)).date(),
            meals=["breakfast", "lunch", "dinner"],
            cost=random.choice([1500, 2500, 3500]),
            payment_status="paid",
            is_active=True
        )
        db.add(plan)
    
    db.commit()
    
    # Create meal logs for the past 7 days
    meals = ["breakfast", "lunch", "dinner"]
    for student in students:
        for day_offset in range(7):
            date = datetime.now() - timedelta(days=day_offset)
            # Each student has 1-2 meals per day
            num_meals = random.randint(1, 2)
            for _ in range(num_meals):
                log = models.MealLog(
                    student_id=student.id,
                    meal_type=random.choice(meals),
                    served_at=date - timedelta(hours=random.randint(1, 23), minutes=random.randint(0, 59)),
                    verified_by="face",
                    face_confidence=random.uniform(0.85, 0.99),
                    approval_time=random.randint(1, 5)
                )
                db.add(log)
    
    db.commit()
    
    # Create pending approvals
    for i in range(10):
        approval = models.ApprovalQueue(
            student_id=random.choice(students).id,
            student_name=random.choice(names),
            requested_meal=random.choice(meals),
            face_confidence=random.uniform(0.85, 0.99),
            trust_score=random.randint(70, 99),
            status="pending"
        )
        db.add(approval)
    
    db.commit()
