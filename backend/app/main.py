from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import Student, MealPlan, MealLog, ApprovalQueue, Manager
from .utils.mock_data import create_mock_data
from .api import manager, admin, student, enrollment, esp32, auth, auth_sqlite
from .websocket import manager as ws_manager

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize mock data
db = SessionLocal()
create_mock_data(db)
db.close()

app = FastAPI(title="Banned Theft API", description="Tokenless Dining Management System")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_sqlite.router, prefix="/api/auth", tags=["auth"])  # SQLite Authentication
app.include_router(esp32.router)  # ESP32-CAM verification endpoint
app.include_router(manager.router)
app.include_router(admin.router)
app.include_router(student.router)
app.include_router(enrollment.router)

@app.get("/")
async def root():
    return {"message": "Banned Theft API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.websocket("/ws/{role}")
async def websocket_endpoint(websocket: WebSocket, role: str = "manager"):
    """
    WebSocket endpoint for real-time updates
    Usage: ws://localhost:8000/ws/manager
    """
    await ws_manager.connect(websocket, role)
    try:
        while True:
            # Keep connection alive and listen for messages
            data = await websocket.receive_text()
            # Echo back for heartbeat
            await ws_manager.send_personal_message(
                {"type": "pong", "message": "Connection alive"},
                websocket
            )
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, role)
        print(f"{role} WebSocket disconnected")
