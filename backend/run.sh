#!/bin/bash
# Start the FastAPI backend server

cd "$(dirname "$0")"
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
