from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import Settings, get_settings
from .jobs import JobQueue, build_job_queue
from .schemas import JobState, JobStatus, TextToImageRequest


def create_app(settings: Settings, queue: JobQueue) -> FastAPI:
    app = FastAPI(title=settings.app_name)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    async def startup_event() -> None:
        queue.start()

    @app.get("/health")
    async def health() -> dict:
        return {"status": "ok", "app": settings.app_name}

    @app.post(f"{settings.api_prefix}/jobs/text-to-image", response_model=JobState)
    async def create_text_to_image_job(
        body: TextToImageRequest,
    ) -> JobState:
        return queue.create_text_to_image_job(body)

    @app.get(f"{settings.api_prefix}/jobs/{{job_id}}", response_model=JobState)
    async def get_job(job_id: str) -> JobState:
        job = queue.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="job not found")
        return job

    @app.get(f"{settings.api_prefix}/jobs", response_model=list[JobState])
    async def list_jobs(status: JobStatus | None = None) -> list[JobState]:
        jobs = list(queue.jobs.values())
        if status:
            jobs = [job for job in jobs if job.status == status]
        return sorted(jobs, key=lambda j: j.created_at, reverse=True)

    return app


settings = get_settings()
queue = build_job_queue()
app = create_app(settings, queue)
