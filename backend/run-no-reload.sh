#!/bin/bash
# Start the FastAPI backend without auto-reload (for production)

cd "$(dirname "$0")"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
