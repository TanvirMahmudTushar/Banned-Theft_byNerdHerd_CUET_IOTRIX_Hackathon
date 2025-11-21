import sqlite3
import os
from pathlib import Path

# Get the database path in the project root
DB_PATH = Path(__file__).parent.parent.parent.parent / "auth.db"

def init_db():
    """Initialize the database with users table"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('student', 'manager', 'admin'))
        )
    ''')
    
    # Insert default users if table is empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        default_users = [
            ("John Manager", "manager@test.com", "password123", "manager"),
            ("Admin User", "admin@test.com", "password123", "admin"),
            ("Sarah Student", "student@test.com", "password123", "student"),
        ]
        cursor.executemany(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            default_users
        )
    
    conn.commit()
    conn.close()

def get_user(email: str, password: str, role: str):
    """Get user by email, password, and role"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM users WHERE email = ? AND password = ? AND role = ?",
        (email, password, role)
    )
    
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return dict(user)
    return None

def create_user(name: str, email: str, password: str, role: str):
    """Create a new user"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            (name, email, password, role)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return {
            "id": str(user_id),
            "name": name,
            "email": email,
            "role": role
        }
    except sqlite3.IntegrityError:
        conn.close()
        return None

def user_exists(email: str) -> bool:
    """Check if user exists"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM users WHERE email = ?", (email,))
    exists = cursor.fetchone()[0] > 0
    
    conn.close()
    return exists

# Initialize database on import
init_db()
