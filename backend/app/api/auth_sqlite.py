from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sqlite3
from pathlib import Path

router = APIRouter()

# Database path
DB_PATH = Path(__file__).parent.parent.parent.parent / "auth.db"

def init_db():
    """Initialize the database with users table"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('student', 'manager', 'admin'))
        )
    ''')
    
    # No default users - all users must sign up
    conn.commit()
    conn.close()

# Initialize on import
init_db()

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str

@router.post("/login")
async def login(request: LoginRequest):
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Login with email and password only - role is retrieved from DB
    cursor.execute(
        "SELECT * FROM users WHERE email = ? AND password = ?",
        (request.email, request.password)
    )
    
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_dict = dict(user)
    token = f"token-{user_dict['id']}-{user_dict['role']}"
    
    return {
        "token": token,
        "role": user_dict["role"],
        "user": {
            "id": str(user_dict["id"]),
            "name": user_dict["name"],
            "email": user_dict["email"],
            "role": user_dict["role"]
        }
    }

@router.post("/signup")
async def signup(request: SignupRequest):
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT COUNT(*) FROM users WHERE email = ?", (request.email,))
    if cursor.fetchone()[0] > 0:
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    try:
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            (request.name, request.email, request.password, request.role)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        token = f"token-{user_id}-{request.role}"
        
        return {
            "token": token,
            "role": request.role,
            "user": {
                "id": str(user_id),
                "name": request.name,
                "email": request.email,
                "role": request.role
            }
        }
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Failed to create user: {str(e)}")
