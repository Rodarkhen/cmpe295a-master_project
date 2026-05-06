#!/bin/bash

# Always run from script location
cd "$(dirname "$0")"

# Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload &
BACKEND_PID=$!

# Frontend
cd ../dashboard
npm run dev &
FRONTEND_PID=$!

wait $BACKEND_PID $FRONTEND_PID