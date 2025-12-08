# AI Generator - Comprehensive AI Generation Platform

A full-featured AI generation platform for creating images, videos, and more, with support for custom models, LoRA fine-tuning, and a node-based workflow editor.

## Features

### 🎨 Image Generation
- **Text-to-Image**: Generate images from text descriptions
- **Image-to-Image**: Transform existing images with prompts
- **Inpainting/Outpainting**: Fill or extend image regions
- **Style Presets**: Cinematic, anime, realistic, illustration, concept art, and more
- **LoRA Support**: Use custom-trained LoRA models
- **Advanced Controls**: CFG scale, steps, schedulers, seed control
- **Multiple Outputs**: Generate up to 4 variations at once

### 🎬 Video Generation
- **Text-to-Video**: Create videos from text descriptions
- **Image-to-Video**: Animate static images
- **Camera Controls**: Pan, tilt, zoom, dolly movements
- **Style Options**: Cinematic, vlog, anime, music video, horror
- **Duration Control**: 1-30 seconds with customizable FPS

### 🔬 Lab Mode
- **Node-Based Canvas**: Visual workflow editor inspired by ComfyUI
- **Multi-Step Pipelines**: Chain text → image → video transformations
- **Reusable Graphs**: Save and load workflow templates
- **Branch & Merge**: Create complex generation workflows

### 🎯 Asset Management
- **Library**: Organize generated images and videos
- **Tagging**: Tag and filter assets
- **Projects**: Group assets into projects
- **History**: Reload previous prompts and parameters

### 🧠 Model Management
- **Base Models**: Stable Diffusion, SDXL, Stable Video Diffusion
- **LoRA Models**: Custom-trained adaptations
- **Model Registry**: Track and version models
- **Dynamic Loading**: Switch models on-the-fly

### 📚 Training & Datasets
- **Dataset Management**: Organize training data
- **LoRA Training**: Fine-tune models with your data
- **DreamBooth**: Person/object-specific training
- **Training Monitoring**: Track progress and metrics

## Architecture

### Backend (Python/FastAPI)
```
app/
├── main.py              # Application entry point
├── config.py            # Configuration settings
├── database.py          # Database setup
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── auth.py              # Authentication utilities
├── jobs.py              # Job queue management
└── routers/
    ├── generation.py    # Generation endpoints
    ├── models.py        # Model management
    └── projects.py      # Project/Lab mode
```

### Frontend (Next.js/React)
```
frontend/
├── pages/
│   ├── index.tsx        # Home page
│   ├── text-to-image.tsx
│   ├── text-to-video.tsx
│   ├── image-to-video.tsx
│   ├── lab.tsx          # Node-based canvas
│   ├── assets.tsx       # Asset library
│   └── models.tsx       # Model management
├── components/
│   ├── Layout.tsx
│   ├── GenerationForm.tsx
│   ├── JobStatus.tsx
│   └── NodeCanvas.tsx
└── lib/
    └── api.ts           # API client
```

## Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- GPU with CUDA support (recommended)
- 16GB+ RAM
- 20GB+ free disk space

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/GhaniKnz/Ai_generator.git
cd Ai_generator
```

2. Create virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```env
APP_NAME="AI Generator API"
API_PREFIX="/api"
OUTPUT_DIR="outputs"
MAX_PARALLEL_JOBS=1
MOCK_GENERATION_DELAY=0.5
```

5. Run the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Open http://localhost:3000

### Docker Setup

Build and run with Docker:
```bash
docker build -t ai-generator .
docker run -p 8000:8000 ai-generator
```

## API Endpoints

### Generation
- `POST /api/generate/text-to-image` - Generate images from text
- `POST /api/generate/text-to-video` - Generate videos from text
- `POST /api/generate/image-to-video` - Animate images
- `POST /api/generate/image-to-image` - Transform images
- `POST /api/generate/inpaint` - Inpaint image regions
- `POST /api/generate/upscale` - Upscale images
- `GET /api/generate/{job_id}` - Get job status
- `GET /api/generate/` - List all jobs

### Models
- `POST /api/models/` - Register new model
- `GET /api/models/` - List models
- `GET /api/models/{id}` - Get model details
- `PUT /api/models/{id}` - Update model
- `DELETE /api/models/{id}` - Delete model

### Projects (Lab Mode)
- `POST /api/projects/` - Create project
- `GET /api/projects/` - List projects
- `GET /api/projects/{id}` - Get project
- `PUT /api/projects/{id}` - Update project graph
- `DELETE /api/projects/{id}` - Delete project

## Usage Examples

### Text-to-Image
```python
import requests

response = requests.post("http://localhost:8000/api/generate/text-to-image", json={
    "prompt": "A serene forest landscape at sunset",
    "negative_prompt": "blurry, low quality",
    "num_outputs": 2,
    "width": 768,
    "height": 768,
    "cfg_scale": 7.5,
    "steps": 30,
    "style_preset": "cinematic",
    "model": "stable-diffusion-1.5"
})

job = response.json()
print(f"Job ID: {job['id']}, Status: {job['status']}")
```

### Text-to-Video
```python
response = requests.post("http://localhost:8000/api/generate/text-to-video", json={
    "prompt": "A drone flying over a mountain range",
    "duration": 5.0,
    "fps": 24,
    "width": 1024,
    "height": 576,
    "style_preset": "cinematic",
    "camera_movement": "dolly",
    "model": "stable-video-diffusion"
})
```

## Training Custom Models

### Preparing Datasets
1. Organize images in a folder:
```
datasets/my_dataset/
├── image1.jpg
├── image2.jpg
└── metadata.json
```

2. Create metadata file:
```json
{
  "images": [
    {
      "file": "image1.jpg",
      "prompt": "A red car in the city",
      "tags": ["car", "urban", "red"]
    }
  ]
}
```

### Training LoRA
```python
# Training configuration
config = {
    "dataset_id": 1,
    "base_model_id": 1,
    "type": "lora",
    "config": {
        "learning_rate": 1e-4,
        "batch_size": 4,
        "num_epochs": 10,
        "lora_rank": 4,
        "lora_alpha": 32
    }
}

# Start training
response = requests.post("http://localhost:8000/api/training/", json=config)
```

## Development Roadmap

### Phase 1: Core Architecture ✓
- [x] FastAPI backend structure
- [x] Database models
- [x] Job queue system
- [x] Basic API endpoints
- [x] Frontend scaffold

### Phase 2: Video Features (In Progress)
- [ ] Video generation backend integration
- [ ] Video player UI component
- [ ] Camera movement controls
- [ ] Text-to-video page
- [ ] Image-to-video page

### Phase 3: Lab Mode
- [ ] Node canvas component (React Flow)
- [ ] Node types (text, image, video, model)
- [ ] Graph execution engine
- [ ] Template save/load
- [ ] Multi-branch workflows

### Phase 4: Training Pipeline
- [ ] Dataset upload/management
- [ ] LoRA training backend
- [ ] Training progress monitoring
- [ ] Model versioning
- [ ] Auto-evaluation

### Phase 5: Advanced Features
- [ ] Internet data collection
- [ ] Vector search
- [ ] Upscaling/enhancement
- [ ] Face restoration
- [ ] Batch processing
- [ ] API authentication

### Phase 6: Polish & Optimization
- [ ] Performance optimization
- [ ] Caching layer
- [ ] Model quantization
- [ ] UI/UX improvements
- [ ] Documentation
- [ ] Testing

## Technology Stack

### Backend
- **Framework**: FastAPI 0.110+
- **Database**: SQLAlchemy + SQLite/PostgreSQL
- **Queue**: Async job queue
- **Auth**: JWT with python-jose
- **AI/ML**: PyTorch, Diffusers, Transformers

### Frontend
- **Framework**: Next.js 14
- **UI**: React 18, TailwindCSS
- **State**: React Query
- **Canvas**: React Flow
- **Icons**: Heroicons

### AI Models
- **Images**: Stable Diffusion, SDXL
- **Videos**: Stable Video Diffusion
- **Upscaling**: ESRGAN, Real-ESRGAN
- **Enhancement**: GFPGAN

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Stable Diffusion by Stability AI
- Hugging Face Diffusers library
- FastAPI framework
- Next.js and React community
