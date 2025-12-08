# Quick Start - AI Generator

## 🚀 First Time Setup (5 minutes)

### 1. Clone & Setup Backend
```bash
git clone https://github.com/GhaniKnz/Ai_generator.git
cd Ai_generator

# Create fresh Python environment
python -m venv .venv

# Activate it
source .venv/bin/activate  # macOS/Linux
# OR
.venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Setup Frontend
```bash
cd frontend
npm install
cd ..
```

## ▶️ Run the Application

### Backend (Terminal 1)
```bash
# Make sure you're in the project root
source .venv/bin/activate  # macOS/Linux
# OR
.venv\Scripts\activate     # Windows

# Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

### Access the App
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔄 After Pulling Changes

If you don't see new changes:

```bash
# Backend - recreate virtual environment
rm -rf .venv
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate
pip install -r requirements.txt

# Frontend - reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json .next
npm install
```

## ⚡ Common Commands

```bash
# Check backend is working
curl http://localhost:8000/health

# Check API documentation
open http://localhost:8000/docs

# Generate an image (example)
curl -X POST http://localhost:8000/api/generate/text-to-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful sunset", "num_outputs": 1}'

# List all jobs
curl http://localhost:8000/api/generate/
```

## 🐳 Using Docker (Alternative)

```bash
# Build and run everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 📚 More Help

- **Full Setup Guide**: GETTING_STARTED.md
- **French Instructions**: SOLUTION_FR.md
- **Project Overview**: README.md
- **Troubleshooting**: GETTING_STARTED.md (section "Troubleshooting")

## 🆘 Still Having Issues?

1. Make sure Python 3.11+ is installed: `python --version`
2. Make sure Node.js 18+ is installed: `node --version`
3. Check no other apps are using ports 3000 or 8000
4. Delete and recreate your virtual environment
5. Check the Troubleshooting section in GETTING_STARTED.md
