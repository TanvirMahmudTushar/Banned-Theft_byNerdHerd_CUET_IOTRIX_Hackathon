"""
Test Script - WebSocket and Fraud Detection Demo
Run this to test real-time manager dashboard updates
"""

import asyncio
import websockets
import json
import requests
import time
from datetime import datetime


# Configuration
BACKEND_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000/ws/manager"


async def test_websocket_connection():
    """Test WebSocket connection and listen for real-time updates"""
    print("🔌 Connecting to WebSocket...")
    
    try:
        async with websockets.connect(WS_URL) as websocket:
            print("✅ Connected to manager dashboard WebSocket")
            print("📡 Listening for real-time approval requests...\n")
            
            # Send heartbeat
            await websocket.send("ping")
            
            # Listen for messages
            while True:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=30.0)
                    data = json.loads(message)
                    
                    print(f"📬 Received: {data['type']}")
                    print(f"   Time: {datetime.now().strftime('%H:%M:%S')}")
                    
                    if data['type'] == 'new_approval':
                        approval = data['data']
                        print(f"   Student: {approval['student_name']}")
                        print(f"   Meal: {approval['requested_meal']}")
                        print(f"   Trust Score: {approval['trust_score']}%")
                        print(f"   Method: {approval['verification_method']}")
                    
                    elif data['type'] == 'approval_resolved':
                        result = data['data']
                        print(f"   Status: {result['status'].upper()}")
                        print(f"   Student: {result['student_name']}")
                    
                    print()
                    
                except asyncio.TimeoutError:
                    # Send heartbeat
                    await websocket.send("ping")
                    print("💓 Heartbeat sent")
                
    except Exception as e:
        print(f"❌ WebSocket error: {e}")


def test_fraud_detection():
    """Test fraud detection endpoint"""
    print("\n🕵️ Testing Fraud Detection System")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/admin/fraud-analytics")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Fraud detection working!")
            print(f"\n📊 Fraud Analytics:")
            print(f"   Duplicate RFID Cards: {data.get('duplicate_rfid_cards', 0)}")
            print(f"   Excessive Attempts: {data.get('excessive_attempts_today', 0)}")
            print(f"   Unusual Time Verifications: {data.get('unusual_time_verifications', 0)}")
            print(f"   Total Flags Today: {data.get('total_flags_today', 0)}")
            
            if data.get('duplicate_rfid_details'):
                print(f"\n⚠️ Duplicate RFID Cards Found:")
                for dup in data['duplicate_rfid_details'][:3]:
                    print(f"   Card: {dup['rfid_uid']}")
                    print(f"   Used by {dup['student_count']} students: {', '.join([s['name'] for s in dup['students']])}")
        else:
            print(f"❌ Error: {response.status_code}")
    
    except Exception as e:
        print(f"❌ Error testing fraud detection: {e}")


def test_api_endpoints():
    """Test main API endpoints"""
    print("\n🔧 Testing API Endpoints")
    print("=" * 50)
    
    endpoints = [
        ("/", "Health Check"),
        ("/api/manager/stats", "Manager Stats"),
        ("/api/manager/approvals", "Pending Approvals"),
        ("/api/admin/students?page=1&limit=5", "Student List"),
        ("/api/admin/analytics", "Analytics"),
    ]
    
    for endpoint, name in endpoints:
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}")
            status = "✅" if response.status_code == 200 else "❌"
            print(f"{status} {name}: {response.status_code}")
        except Exception as e:
            print(f"❌ {name}: Error - {e}")


def simulate_esp32_verification():
    """Simulate ESP32 sending verification request"""
    print("\n🤖 Simulating ESP32-CAM Verification Request")
    print("=" * 50)
    
    # Create a fake verification request
    payload = {
        "face_image": "fake_base64_image_data_for_testing",
        "verification_method": "rfid",
        "rfid_uid": "AA:BB:CC:DD",
        "device_id": "ESP32_TEST_01",
        "timestamp": int(time.time() * 1000)
    }
    
    try:
        print("📤 Sending verification request...")
        response = requests.post(
            f"{BACKEND_URL}/api/verify/face",
            json=payload
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Response received:")
            print(f"   Status: {data.get('status', 'unknown').upper()}")
            print(f"   Message: {data.get('message', 'N/A')}")
            if data.get('student_name'):
                print(f"   Student: {data['student_name']}")
            if data.get('meal_type'):
                print(f"   Meal: {data['meal_type']}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
    
    except Exception as e:
        print(f"❌ Error: {e}")


def main_menu():
    """Interactive test menu"""
    print("\n" + "=" * 60)
    print("🚀 Banned Theft - Backend Testing Suite")
    print("=" * 60)
    print("\nChoose a test:")
    print("1. Test WebSocket Real-Time Updates (Manager Dashboard)")
    print("2. Test Fraud Detection Analytics")
    print("3. Test All API Endpoints")
    print("4. Simulate ESP32 Verification Request")
    print("5. Run All Tests")
    print("6. Exit")
    
    choice = input("\nEnter choice (1-6): ").strip()
    
    if choice == "1":
        print("\nStarting WebSocket listener...")
        print("👉 Go to Manager Dashboard and approve/deny requests to see real-time updates")
        print("   Or run option 4 to simulate ESP32 request\n")
        asyncio.run(test_websocket_connection())
    
    elif choice == "2":
        test_fraud_detection()
        input("\nPress Enter to continue...")
        main_menu()
    
    elif choice == "3":
        test_api_endpoints()
        input("\nPress Enter to continue...")
        main_menu()
    
    elif choice == "4":
        simulate_esp32_verification()
        input("\nPress Enter to continue...")
        main_menu()
    
    elif choice == "5":
        test_api_endpoints()
        test_fraud_detection()
        simulate_esp32_verification()
        print("\n✅ All tests complete!")
        input("\nPress Enter to continue...")
        main_menu()
    
    elif choice == "6":
        print("\n👋 Goodbye!")
        return
    
    else:
        print("❌ Invalid choice")
        main_menu()


if __name__ == "__main__":
    print("🔍 Checking backend connection...")
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        if response.status_code == 200:
            print("✅ Backend is running!")
            main_menu()
        else:
            print("❌ Backend is not responding correctly")
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        print(f"   Make sure backend is running on {BACKEND_URL}")
