"""
Authentication endpoints for Manager and Admin users
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Literal
import bcrypt
from datetime import datetime, timedelta
import secrets

router = APIRouter(prefix="/api/auth", tags=["authentication"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: Literal["manager", "admin"]


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["manager", "admin"]


class AuthResponse(BaseModel):
    token: str
    role: str
    user: dict


# Mock manager/admin database (in production, use proper database)
MOCK_MANAGERS = {
    "manager@test.com": {
        "id": "1",
        "name": "John Manager",
        "email": "manager@test.com",
        "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyMcFqV9gqfO",  # password123
        "role": "manager",
    },
    "admin@test.com": {
        "id": "2",
        "name": "Admin User",
        "email": "admin@test.com",
        "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyMcFqV9gqfO",  # password123
        "role": "admin",
    },
}


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    # For demo, simple comparison (in production use bcrypt)
    return plain_password == "password123" or bcrypt.checkpw(
        plain_password.encode(), hashed_password.encode()
    )


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def generate_token() -> str:
    """Generate secure random token"""
    return f"bearer-{secrets.token_urlsafe(32)}-{int(datetime.utcnow().timestamp())}"


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Manager/Admin login endpoint
    
    Credentials for demo:
    - Manager: manager@test.com / password123
    - Admin: admin@test.com / password123
    """
    
    user = MOCK_MANAGERS.get(request.email)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user["role"] != request.role:
        raise HTTPException(status_code=401, detail="Invalid role for this account")
    
    # Verify password (simple check for demo)
    if request.password != "password123":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate token
    token = generate_token()
    
    return AuthResponse(
        token=token,
        role=user["role"],
        user={
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        }
    )


@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    """
    Manager/Admin signup endpoint
    """
    
    # Check if email already exists
    if request.email in MOCK_MANAGERS:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_id = str(len(MOCK_MANAGERS) + 1)
    hashed_pwd = hash_password(request.password)
    
    new_user = {
        "id": new_id,
        "name": request.name,
        "email": request.email,
        "password": hashed_pwd,
        "role": request.role,
    }
    
    MOCK_MANAGERS[request.email] = new_user
    
    # Generate token
    token = generate_token()
    
    return AuthResponse(
        token=token,
        role=new_user["role"],
        user={
            "id": new_user["id"],
            "name": new_user["name"],
            "email": new_user["email"],
            "role": new_user["role"],
        }
    )


@router.get("/me")
async def get_current_user(token: str):
    """Get current user from token"""
    # In production, validate JWT token and return user
    return {"message": "Token validation endpoint"}
