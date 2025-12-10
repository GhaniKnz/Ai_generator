# Quick Start Guide - After Fixes

## What Was Fixed

✅ **Increased upload limit from 100MB to 5GB**
✅ **Added CSV support for image-label mapping** 
✅ **Fixed training monitor to show real-time progress**
✅ **Synchronized datasets with training tasks**
✅ **Fixed service worker Response.clone() error**

## Quick Start

### Option 1: Using the Start Script (Recommended)

```bash
./start.sh
```

This will:
- Check and install dependencies
- Start backend on port 8000
- Start frontend on port 3000
- Create necessary directories

### Option 2: Manual Start

#### Terminal 1 - Backend:
```bash
source .venv/bin/activate  # or: . .venv/Scripts/activate on Windows
cd app
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Testing the New Features

### 1. Upload Large Files (>100MB)
1. Go to http://localhost:3000/datasets
2. Create a new dataset
3. Click "Upload" and select large files (up to 5GB)
4. Watch the upload progress percentage

### 2. Upload CSV with Labels
1. Create a CSV file:
```csv
filename,label
image1.jpg,badminton
image2.jpg,football
image3.jpg,basketball
```
2. Upload the CSV file along with images
3. See the mapping count in the success message

### 3. Monitor Training
1. Go to http://localhost:3000/training
2. Create a new training job
3. Go to http://localhost:3000/training-monitor
4. Select your job from the dropdown
5. Watch real-time progress updates

## Troubleshooting

### Service Worker Error Still Appears?
1. Open DevTools (F12)
2. Go to Application → Service Workers
3. Click "Unregister" on any listed workers
4. Go to Application → Clear Storage
5. Click "Clear site data"
6. Refresh the page

### API Returns 404?
- Make sure backend is running: `curl http://localhost:8000/health`
- Check backend terminal for errors
- Verify you're using the correct URL

### Upload Fails?
- Check `uploads/` directory exists and is writable
- Check backend logs for error messages
- Verify file size is under 5GB

## Documentation

See `FIXES_APPLIED.md` for detailed documentation of all changes.
