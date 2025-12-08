"""Training jobs router for model fine-tuning."""
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/training", tags=["training"])


class TrainingConfig(BaseModel):
    """Training configuration."""
    learning_rate: float = 1e-4
    batch_size: int = 4
    num_epochs: int = 10
    max_steps: int | None = None
    lora_rank: int = 4
    lora_alpha: int = 32
    mixed_precision: str = "fp16"


class TrainingJobCreate(BaseModel):
    """Request to create a training job."""
    dataset_id: int
    base_model_id: int
    type: str  # lora, dreambooth, full
    config: TrainingConfig
    output_name: str


class TrainingJobResponse(BaseModel):
    """Training job information."""
    id: str
    dataset_id: int
    base_model_id: int
    type: str
    status: str  # pending, running, completed, failed
    progress: float
    current_epoch: int | None = None
    loss: float | None = None
    output_path: str | None = None
    created_at: str
    updated_at: str


# In-memory storage for demo
training_jobs_db = {}
job_id_counter = 1


@router.get("/", response_model=List[TrainingJobResponse])
async def list_training_jobs() -> List[TrainingJobResponse]:
    """List all training jobs."""
    return list(training_jobs_db.values())


@router.post("/", response_model=TrainingJobResponse)
async def create_training_job(request: TrainingJobCreate) -> TrainingJobResponse:
    """Create a new training job."""
    global job_id_counter
    
    job = TrainingJobResponse(
        id=f"train_{job_id_counter}",
        dataset_id=request.dataset_id,
        base_model_id=request.base_model_id,
        type=request.type,
        status="pending",
        progress=0.0,
        current_epoch=None,
        loss=None,
        output_path=None,
        created_at=datetime.utcnow().isoformat(),
        updated_at=datetime.utcnow().isoformat()
    )
    
    training_jobs_db[job.id] = job
    job_id_counter += 1
    
    return job


@router.get("/{job_id}", response_model=TrainingJobResponse)
async def get_training_job(job_id: str) -> TrainingJobResponse:
    """Get training job by ID."""
    if job_id not in training_jobs_db:
        raise HTTPException(status_code=404, detail="Training job not found")
    
    return training_jobs_db[job_id]


@router.post("/{job_id}/start")
async def start_training_job(job_id: str) -> dict:
    """Start a training job."""
    if job_id not in training_jobs_db:
        raise HTTPException(status_code=404, detail="Training job not found")
    
    job = training_jobs_db[job_id]
    
    if job.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot start job in {job.status} status"
        )
    
    # Mock start (in production, trigger actual training)
    job.status = "running"
    job.current_epoch = 1
    job.progress = 0.1
    job.updated_at = datetime.utcnow().isoformat()
    
    return {"status": "started", "job_id": job_id}


@router.post("/{job_id}/cancel")
async def cancel_training_job(job_id: str) -> dict:
    """Cancel a training job."""
    if job_id not in training_jobs_db:
        raise HTTPException(status_code=404, detail="Training job not found")
    
    job = training_jobs_db[job_id]
    
    if job.status == "completed":
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel completed job"
        )
    
    job.status = "cancelled"
    job.updated_at = datetime.utcnow().isoformat()
    
    return {"status": "cancelled", "job_id": job_id}


@router.get("/{job_id}/metrics")
async def get_training_metrics(job_id: str) -> dict:
    """Get training metrics for a job."""
    if job_id not in training_jobs_db:
        raise HTTPException(status_code=404, detail="Training job not found")
    
    job = training_jobs_db[job_id]
    
    # Mock metrics (in production, read from training logs)
    return {
        "job_id": job_id,
        "status": job.status,
        "progress": job.progress,
        "current_epoch": job.current_epoch,
        "total_epochs": 10,
        "loss": job.loss or 0.5,
        "metrics": {
            "train_loss": [0.8, 0.6, 0.5, 0.4],
            "val_loss": [0.85, 0.65, 0.55, 0.45],
            "learning_rate": [1e-4, 8e-5, 6e-5, 4e-5]
        }
    }


@router.post("/{job_id}/complete")
async def complete_training_job(job_id: str, output_path: str) -> dict:
    """Mark a training job as completed."""
    if job_id not in training_jobs_db:
        raise HTTPException(status_code=404, detail="Training job not found")
    
    job = training_jobs_db[job_id]
    job.status = "completed"
    job.progress = 1.0
    job.output_path = output_path
    job.updated_at = datetime.utcnow().isoformat()
    
    return {"status": "completed", "job_id": job_id, "output_path": output_path}
