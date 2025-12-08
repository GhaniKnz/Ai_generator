"""Generation endpoints for text-to-image, text-to-video, etc."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..jobs import JobQueue
from ..schemas import (
    ImageToImageRequest,
    ImageToVideoRequest,
    InpaintingRequest,
    JobState,
    JobStatus,
    TextToImageRequest,
    TextToVideoRequest,
    UpscaleRequest,
)

router = APIRouter(prefix="/generate", tags=["generation"])


def get_queue():
    """Get job queue dependency - will be implemented properly later."""
    from ..main import queue
    return queue


@router.post("/text-to-image", response_model=JobState)
async def text_to_image(
    request: TextToImageRequest,
    queue: JobQueue = Depends(get_queue),
) -> JobState:
    """Generate images from text prompt."""
    return queue.create_text_to_image_job(request)


@router.post("/text-to-video", response_model=JobState)
async def text_to_video(
    request: TextToVideoRequest,
    queue: JobQueue = Depends(get_queue),
) -> JobState:
    """Generate video from text prompt."""
    return queue.create_text_to_video_job(request)


@router.post("/image-to-video", response_model=JobState)
async def image_to_video(
    request: ImageToVideoRequest,
    queue: JobQueue = Depends(get_queue),
) -> JobState:
    """Generate video from image."""
    return queue.create_image_to_video_job(request)


@router.post("/image-to-image", response_model=JobState)
async def image_to_image(
    request: ImageToImageRequest,
    queue: JobQueue = Depends(get_queue),
) -> JobState:
    """Transform image with prompt."""
    return queue.create_image_to_image_job(request)


@router.post("/inpaint", response_model=JobState)
async def inpaint(
    request: InpaintingRequest,
    queue: JobQueue = Depends(get_queue),
) -> JobState:
    """Inpaint image region."""
    return queue.create_inpainting_job(request)


@router.post("/upscale", response_model=JobState)
async def upscale(
    request: UpscaleRequest,
    queue: JobQueue = Depends(get_queue),
) -> JobState:
    """Upscale image."""
    return queue.create_upscale_job(request)


@router.get("/{job_id}", response_model=JobState)
async def get_job(
    job_id: str,
    queue: JobQueue = Depends(get_queue),
) -> JobState:
    """Get job status and results."""
    job = queue.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/", response_model=list[JobState])
async def list_jobs(
    status: JobStatus | None = None,
    queue: JobQueue = Depends(get_queue),
) -> list[JobState]:
    """List all jobs, optionally filtered by status."""
    jobs = list(queue.jobs.values())
    if status:
        jobs = [job for job in jobs if job.status == status]
    return sorted(jobs, key=lambda j: j.created_at, reverse=True)
