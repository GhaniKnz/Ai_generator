# AI Generator - Getting Started Guide

## Important: First Time Setup

⚠️ **If you just cloned the repository or pulled changes**, you need to set up your local environment properly.

### Initial Setup Steps

1. **Create a new Python virtual environment** (don't use the old one):
```bash
# Remove old virtual environment if it exists
rm -rf .venv

# Create new virtual environment
python -m venv .venv

# Activate it
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate
```

2. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

3. **For the frontend**, install Node.js dependencies:
```bash
cd frontend
npm install
cd ..
```

## Quick Start

### Running the Backend

1. Activate your virtual environment:
```bash
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate
```

2. Start the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Start the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. Access the API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Running the Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:3000

## API Usage Examples

### Text to Image

```bash
curl -X POST http://localhost:8000/api/generate/text-to-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A serene mountain landscape at sunset",
    "negative_prompt": "blurry, low quality",
    "num_outputs": 2,
    "width": 768,
    "height": 768,
    "cfg_scale": 7.5,
    "steps": 30,
    "style_preset": "cinematic"
  }'
```

Response:
```json
{
  "id": "uuid-here",
  "type": "text_to_image",
  "status": "pending",
  "params": { ... },
  "outputs": [],
  "progress": 0.0
}
```

### Text to Video

```bash
curl -X POST http://localhost:8000/api/generate/text-to-video \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A drone flying over mountain peaks",
    "duration": 5.0,
    "fps": 24,
    "width": 1024,
    "height": 576,
    "style_preset": "cinematic",
    "camera_movement": "dolly",
    "motion_intensity": 0.5
  }'
```

### Check Job Status

```bash
curl http://localhost:8000/api/generate/{job_id}
```

Response:
```json
{
  "id": "uuid-here",
  "status": "done",
  "progress": 1.0,
  "outputs": [
    {
      "index": 0,
      "path": "outputs/uuid-here-1.txt"
    }
  ]
}
```

### List All Jobs

```bash
curl http://localhost:8000/api/generate/
```

Filter by status:
```bash
curl http://localhost:8000/api/generate/?status=done
```

## Features

### Text to Image
- Generate 1-4 images per request
- Custom dimensions (64-2048 pixels)
- Style presets (cinematic, anime, realistic, etc.)
- LoRA model support
- CFG scale and steps control
- Seed control for reproducibility

### Text to Video
- Generate videos from text descriptions
- Duration control (1-30 seconds)
- Camera movement options (pan, tilt, zoom, dolly)
- Style presets for different video types
- Motion intensity control
- FPS configuration

### Image to Video
- Animate static images
- Same camera and style controls as text-to-video
- Maintain image composition

### Model Management
- Register and manage AI models
- Support for base models and LoRA
- Version tracking
- Active/inactive status

### Projects (Lab Mode)
- Node-based workflow editor
- Multi-step generation pipelines
- Save and load graphs
- Reusable templates

## Development

### Project Structure

```
Ai_generator/
├── app/                    # Backend
│   ├── main.py            # FastAPI app
│   ├── config.py          # Settings
│   ├── database.py        # DB setup
│   ├── models.py          # SQLAlchemy models
│   ├── schemas.py         # Pydantic schemas
│   ├── jobs.py            # Job queue
│   ├── auth.py            # Authentication
│   └── routers/           # API routes
│       ├── generation.py
│       ├── models.py
│       └── projects.py
├── frontend/              # Next.js app
│   ├── pages/
│   ├── components/
│   ├── styles/
│   └── lib/
├── outputs/               # Generated files
├── models/                # AI model weights
└── datasets/              # Training data
```

### Database Schema

The application uses SQLAlchemy with SQLite by default. Main tables:

- **users**: User accounts
- **jobs**: Generation jobs
- **models**: AI model registry
- **assets**: Generated files
- **projects**: Lab mode projects
- **datasets**: Training datasets
- **training_jobs**: Model training tasks

### Environment Variables

Create a `.env` file:

```env
APP_NAME="AI Generator API"
API_PREFIX="/api"
OUTPUT_DIR="outputs"
MAX_PARALLEL_JOBS=1
MOCK_GENERATION_DELAY=0.5
```

## Docker Deployment

### Build and Run

```bash
docker-compose up -d
```

This starts:
- Backend on port 8000
- Frontend on port 3000

### Stop

```bash
docker-compose down
```

## Troubleshooting

### Changes not appearing after pulling from GitHub

**Problem**: You pulled changes from GitHub but don't see them when running the app locally.

**Solution**: 
1. Delete your old virtual environment and create a fresh one:
```bash
rm -rf .venv
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

2. For frontend, reinstall dependencies:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

3. Clear any cached data:
```bash
# Delete database to start fresh (if needed)
rm -f ai_generator.db

# Delete output files (if needed)
rm -rf outputs/*
```

### Backend won't start
- Check Python version (3.11+)
- Make sure virtual environment is activated
- Install all dependencies: `pip install -r requirements.txt`
- Check port 8000 is not in use

### Frontend won't start
- Check Node version (18+)
- Run `npm install` in frontend directory
- Check port 3000 is not in use
- Try deleting `node_modules` and `.next` folders and reinstalling

### Database errors
- Delete `ai_generator.db` to reset
- Check file permissions in project directory

### Import errors or module not found
- Make sure you activated your virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`

## Next Steps

1. **Add Real AI Models**: Currently using mock generation. Integrate Stable Diffusion and other models.

2. **Implement Lab Mode**: Build the node-based canvas UI with React Flow.

3. **Add Training**: Implement LoRA/DreamBooth training pipelines.

4. **Enhance UI**: Add more interactive features, real-time previews, and asset management.

5. **Authentication**: Implement full JWT authentication system.

6. **Performance**: Add Redis for job queue, caching, and scaling.

## Support

For issues and questions:
- GitHub Issues: https://github.com/GhaniKnz/Ai_generator/issues
- Documentation: README.md

## License

MIT License - See LICENSE file for details
