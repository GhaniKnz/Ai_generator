"""Training jobs router for model fine-tuning with real database integration."""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import TrainingJob, Dataset, Model
import uuid

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


@router.get("/", response_model=List[TrainingJobResponse])
async def list_training_jobs(db: AsyncSession = Depends(get_db)) -> List[TrainingJobResponse]:
    """List all training jobs from database."""
    result = await db.execute(select(TrainingJob).order_by(TrainingJob.created_at.desc()))
    jobs = result.scalars().all()
    
    return [
        TrainingJobResponse(
            id=job.id,
            dataset_id=job.dataset_id,
            base_model_id=job.base_model_id,
            type=job.type,
            status=job.status,
            progress=job.progress,
            current_epoch=job.metrics.get("current_epoch") if job.metrics else None,
            loss=job.metrics.get("loss") if job.metrics else None,
            output_path=job.output_path,
            created_at=job.created_at.isoformat(),
            updated_at=job.updated_at.isoformat()
        )
        for job in jobs
    ]


@router.post("/", response_model=TrainingJobResponse)
async def create_training_job(
    request: TrainingJobCreate,
    db: AsyncSession = Depends(get_db)
) -> TrainingJobResponse:
    """Create a new training job in database."""
    # Verify dataset exists
    dataset_result = await db.execute(
        select(Dataset).where(Dataset.id == request.dataset_id)
    )
    dataset = dataset_result.scalar_one_or_none()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Verify model exists
    model_result = await db.execute(
        select(Model).where(Model.id == request.base_model_id)
    )
    model = model_result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Base model not found")
    
    # Create training job
    job = TrainingJob(
        id=str(uuid.uuid4()),
        dataset_id=request.dataset_id,
        base_model_id=request.base_model_id,
        type=request.type,
        status="pending",
        progress=0.0,
        config=request.config.model_dump(),
        metrics={},
        logs=[]
    )
    
    db.add(job)
    await db.commit()
    await db.refresh(job)
    
    return TrainingJobResponse(
        id=job.id,
        dataset_id=job.dataset_id,
        base_model_id=job.base_model_id,
        type=job.type,
        status=job.status,
        progress=job.progress,
        current_epoch=None,
        loss=None,
        output_path=job.output_path,
        created_at=job.created_at.isoformat(),
        updated_at=job.updated_at.isoformat()
    )


@router.get("/{job_id}", response_model=TrainingJobResponse)
async def get_training_job(
    job_id: str,
    db: AsyncSession = Depends(get_db)
) -> TrainingJobResponse:
    """Get training job by ID from database."""
    result = await db.execute(
        select(TrainingJob).where(TrainingJob.id == job_id)
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Training job not found")
    
    return TrainingJobResponse(
        id=job.id,
        dataset_id=job.dataset_id,
        base_model_id=job.base_model_id,
        type=job.type,
        status=job.status,
        progress=job.progress,
        current_epoch=job.metrics.get("current_epoch") if job.metrics else None,
        loss=job.metrics.get("loss") if job.metrics else None,
        output_path=job.output_path,
        created_at=job.created_at.isoformat(),
        updated_at=job.updated_at.isoformat()
    )


@router.post("/{job_id}/start")
async def start_training_job(
    job_id: str,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Start a training job with real PyTorch training engine."""
    import asyncio
    from ..ml_training import start_training_background
    
    result = await db.execute(
        select(TrainingJob).where(TrainingJob.id == job_id)
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Training job not found")
    
    if job.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot start job in {job.status} status"
        )
    
    # Get dataset and model paths
    dataset_result = await db.execute(
        select(Dataset).where(Dataset.id == job.dataset_id)
    )
    dataset = dataset_result.scalar_one()
    
    model_result = await db.execute(
        select(Model).where(Model.id == job.base_model_id)
    )
    model = model_result.scalar_one()
    
    # Prepare output directory
    output_dir = f"./outputs/training/{job_id}"
    
    # Start training in background
    # Note: In production, use Celery or similar for proper background tasks
    asyncio.create_task(
        start_training_background(
            job_id=job_id,
            training_type=job.type,
            config=job.config,
            dataset_path=dataset.path,
            model_path=model.path,
            output_dir=output_dir,
            db_session=db
        )
    )
    
    return {
        "status": "started",
        "job_id": job_id,
        "message": "Training started in background. Check progress via GET /{job_id}"
    }


@router.post("/{job_id}/cancel")
async def cancel_training_job(
    job_id: str,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Cancel a training job."""
    from sqlalchemy import update
    
    result = await db.execute(
        select(TrainingJob).where(TrainingJob.id == job_id)
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Training job not found")
    
    if job.status == "completed":
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel completed job"
        )
    
    # Update status
    stmt = (
        update(TrainingJob)
        .where(TrainingJob.id == job_id)
        .values(status="cancelled", updated_at=datetime.utcnow())
    )
    await db.execute(stmt)
    await db.commit()
    
    return {"status": "cancelled", "job_id": job_id}


@router.get("/{job_id}/progress")
async def get_training_progress(
    job_id: str,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Get detailed real-time training progress including current image."""
    result = await db.execute(
        select(TrainingJob).where(TrainingJob.id == job_id)
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Training job not found")
    
    metrics = job.metrics or {}
    logs = job.logs or []
    
    return {
        "job_id": job.id,
        "status": job.status,
        "progress": job.progress,
        "current_epoch": metrics.get("current_epoch"),
        "current_step": metrics.get("current_step"),
        "loss": metrics.get("loss"),
        "current_image": metrics.get("current_image"),
        "last_update": metrics.get("last_update"),
        "recent_logs": logs[-10:],  # Last 10 log messages
        "config": job.config
    }


@router.get("/{job_id}/logs")
async def get_training_logs(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    limit: int = 50
) -> dict:
    """Get training logs."""
    result = await db.execute(
        select(TrainingJob).where(TrainingJob.id == job_id)
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Training job not found")
    
    logs = job.logs or []
    
    return {
        "job_id": job.id,
        "total_logs": len(logs),
        "logs": logs[-limit:]  # Return last N logs
    }

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
