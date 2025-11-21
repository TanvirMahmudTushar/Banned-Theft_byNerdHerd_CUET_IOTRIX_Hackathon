# Banned-Theft by NerdHerd CUET IOTRIX Hackathon

## Project Overview
This project is a full-stack meal management and anti-theft system for CUET IOTRIX Hackathon, built by NerdHerd. It features:
- FastAPI backend (Python)
- Next.js frontend (React)
- SQLite database
- Real-time meal approval and duplicate detection

## Prerequisites
- Python 3.10+
- Node.js 18+
- npm (comes with Node.js)
- Git

## Step-by-Step Local Setup

### 1. Clone the Repository
```
git clone https://github.com/TanvirMahmudTushar/Banned-Theft_byNerdHerd_CUET_IOTRIX_Hackathon.git
cd Banned-Theft_byNerdHerd_CUET_IOTRIX_Hackathon/banned-theft-system
```

### 2. Set Up Python Backend
```
cd backend
python -m venv venv
venv\Scripts\activate   # On Windows
pip install -r requirements.txt
```

#### (If requirements.txt is missing, install manually:)
```
pip install fastapi uvicorn sqlalchemy pydantic
```

### 3. Set Up Database
- The backend uses SQLite by default. The database file will be created automatically on first run.
- If you need to reset, delete the `backend/app/db.sqlite3` file.

### 4. Start Backend Server
```
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

### 5. Set Up Frontend
```
cd ../
npm install
```

### 6. Start Frontend Server
```
npm run dev
```

### 7. Access the App
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)

## Notes
- Make sure both servers are running for full functionality.
- For troubleshooting, check terminal output for errors.
- No other markdown files are included in this repo.

---
If you have any issues, please open an issue on GitHub or contact the project maintainer.
