#!/bin/bash

# Quick Start Script for AI Generator
# This script helps you start both backend and frontend servers

set -e

echo "🚀 Starting AI Generator..."
echo ""

# Check if we're in the right directory
if [ ! -f "app/main.py" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Check Python
echo -e "${BLUE}Checking Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}✓ Found $PYTHON_VERSION${NC}"
echo ""

# Check Node.js
echo -e "${BLUE}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Found Node.js $NODE_VERSION${NC}"
echo ""

# Install Python dependencies if needed
if [ ! -d ".venv" ]; then
    echo -e "${BLUE}Creating Python virtual environment...${NC}"
    python3 -m venv .venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

echo -e "${BLUE}Activating virtual environment...${NC}"
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
    echo -e "${GREEN}✓ Virtual environment activated (Unix)${NC}"
elif [ -f ".venv/Scripts/activate" ]; then
    source .venv/Scripts/activate
    echo -e "${GREEN}✓ Virtual environment activated (Windows)${NC}"
else
    echo -e "${YELLOW}⚠ Could not find virtual environment activation script${NC}"
    echo -e "${YELLOW}Please create a virtual environment first: python3 -m venv .venv${NC}"
    exit 1
fi

# Verify activation worked
if [ -z "$VIRTUAL_ENV" ]; then
    echo -e "${YELLOW}⚠ Virtual environment may not be activated properly${NC}"
    echo -e "${YELLOW}Refusing to continue to avoid installing packages globally${NC}"
    exit 1
fi

if [ ! -f ".venv/installed" ]; then
    echo -e "${BLUE}Installing Python dependencies...${NC}"
    pip install -r requirements.txt
    touch .venv/installed
    echo -e "${GREEN}✓ Python dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Python dependencies already installed${NC}"
fi
echo ""

# Install Node.js dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${BLUE}Installing Node.js dependencies...${NC}"
    cd frontend
    npm install
    cd ..
    echo -e "${GREEN}✓ Node.js dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Node.js dependencies already installed${NC}"
fi
echo ""

# Create necessary directories
echo -e "${BLUE}Creating upload directories...${NC}"
mkdir -p uploads/{image,video,audio,archive,csv}
echo -e "${GREEN}✓ Upload directories created${NC}"
echo ""

# Check if ports are available
echo -e "${BLUE}Checking ports...${NC}"
if check_port 8000; then
    echo -e "${YELLOW}⚠ Port 8000 is already in use (backend)${NC}"
    read -p "Do you want to kill the process? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        PID=$(lsof -t -i:8000 2>/dev/null)
        if [ -n "$PID" ]; then
            echo -e "${BLUE}Attempting graceful shutdown...${NC}"
            kill -TERM $PID 2>/dev/null || true
            sleep 2
            # Check if still running
            if kill -0 $PID 2>/dev/null; then
                echo -e "${YELLOW}Forcing shutdown...${NC}"
                kill -KILL $PID 2>/dev/null || true
            fi
        fi
    fi
fi

if check_port 3000; then
    echo -e "${YELLOW}⚠ Port 3000 is already in use (frontend)${NC}"
    read -p "Do you want to kill the process? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        PID=$(lsof -t -i:3000 2>/dev/null)
        if [ -n "$PID" ]; then
            echo -e "${BLUE}Attempting graceful shutdown...${NC}"
            kill -TERM $PID 2>/dev/null || true
            sleep 2
            # Check if still running
            if kill -0 $PID 2>/dev/null; then
                echo -e "${YELLOW}Forcing shutdown...${NC}"
                kill -KILL $PID 2>/dev/null || true
            fi
        fi
    fi
fi
echo ""

# Start backend
echo -e "${BLUE}Starting backend server on port 8000...${NC}"
cd app
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo ""

# Wait a moment for backend to start
sleep 2

# Test backend
echo -e "${BLUE}Testing backend...${NC}"
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✓ Backend is responding${NC}"
else
    echo -e "${YELLOW}⚠ Backend may not be ready yet${NC}"
fi
echo ""

# Start frontend
echo -e "${BLUE}Starting frontend server on port 3000...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo ""

# Display info
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 AI Generator is starting!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Backend:${NC}  http://localhost:8000"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "${BLUE}API Docs:${NC} http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${BLUE}Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✓ Servers stopped${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Wait for processes
wait
