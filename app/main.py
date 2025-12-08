from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import Settings, get_settings
from .database import init_db
from .jobs import JobQueue, build_job_queue
from .routers import generation, models, projects, workflows, datasets, training, data_collection


def create_app(settings: Settings, queue: JobQueue) -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description="Comprehensive AI Generation Platform for Images, Videos, and More",
        version="1.0.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(generation.router, prefix=settings.api_prefix)
    app.include_router(models.router, prefix=settings.api_prefix)
    app.include_router(projects.router, prefix=settings.api_prefix)
    app.include_router(workflows.router, prefix=settings.api_prefix)
    app.include_router(datasets.router, prefix=settings.api_prefix)
    app.include_router(training.router, prefix=settings.api_prefix)
    app.include_router(data_collection.router, prefix=settings.api_prefix)

    @app.on_event("startup")
    async def startup_event() -> None:
        # Initialize database
        await init_db()
        # Start job queue workers
        queue.start()

    @app.get("/health")
    async def health() -> dict:
        return {
            "status": "ok",
            "app": settings.app_name,
            "version": "1.0.0",
        }

    return app


settings = get_settings()
queue = build_job_queue()
app = create_app(settings, queue)
