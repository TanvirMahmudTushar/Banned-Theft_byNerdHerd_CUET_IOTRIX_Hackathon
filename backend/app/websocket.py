"""
WebSocket Manager for Real-Time Updates
Broadcasts approval requests to connected manager dashboards
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
from datetime import datetime


class ConnectionManager:
    """Manages WebSocket connections for real-time updates"""
    
    def __init__(self):
        # Store active connections by role
        self.active_connections: Dict[str, List[WebSocket]] = {
            "manager": [],
            "admin": [],
            "student": []
        }
    
    async def connect(self, websocket: WebSocket, role: str = "manager"):
        """Accept and store new WebSocket connection"""
        await websocket.accept()
        if role not in self.active_connections:
            self.active_connections[role] = []
        self.active_connections[role].append(websocket)
        print(f"New {role} connection. Total: {len(self.active_connections[role])}")
    
    def disconnect(self, websocket: WebSocket, role: str = "manager"):
        """Remove WebSocket connection"""
        if role in self.active_connections and websocket in self.active_connections[role]:
            self.active_connections[role].remove(websocket)
            print(f"{role} disconnected. Total: {len(self.active_connections[role])}")
    
    async def broadcast_to_managers(self, message: dict):
        """Send message to all connected manager dashboards"""
        disconnected = []
        for connection in self.active_connections["manager"]:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending to manager: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn, "manager")
    
    async def broadcast_to_role(self, role: str, message: dict):
        """Send message to all connections of a specific role"""
        if role not in self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections[role]:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending to {role}: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn, role)
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to specific connection"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Error sending personal message: {e}")
    
    async def notify_new_approval(self, approval_data: dict):
        """Notify managers of new approval request from ESP32"""
        message = {
            "type": "new_approval",
            "data": approval_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_managers(message)
    
    async def notify_approval_resolved(self, approval_id: int, status: str, student_name: str):
        """Notify all clients when approval is resolved"""
        message = {
            "type": "approval_resolved",
            "data": {
                "approval_id": approval_id,
                "status": status,
                "student_name": student_name
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        # Notify both managers and admins
        await self.broadcast_to_managers(message)
        await self.broadcast_to_role("admin", message)
    
    async def notify_stats_update(self, stats: dict):
        """Notify managers and admins of updated statistics"""
        message = {
            "type": "stats_update",
            "data": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_managers(message)
        await self.broadcast_to_role("admin", message)


# Global connection manager instance
manager = ConnectionManager()
