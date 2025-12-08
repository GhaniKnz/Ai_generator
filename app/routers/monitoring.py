"""
Monitoring & Analytics Router - Phase 6
Provides system monitoring, statistics, and analytics with real database integration
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ..database import get_db
from ..models import Job, TrainingJob, Asset, Dataset, User

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

class SystemStats(BaseModel):
    total_jobs: int
    jobs_completed: int
    jobs_failed: int
    jobs_pending: int
    avg_generation_time: float
    uptime_seconds: float

class UsageStats(BaseModel):
    total_images_generated: int
    total_videos_generated: int
    total_workflows_executed: int
    total_datasets_created: int
    total_training_jobs: int
    total_downloads: int

# In-memory statistics (ready for database integration)
START_TIME = time.time()
STATS_DB = {
    "jobs": {"total": 0, "completed": 0, "failed": 0, "pending": 0, "total_time": 0.0},
    "usage": {
        "images": 0,
        "videos": 0,
        "workflows": 0,
        "datasets": 0,
        "training": 0,
        "downloads": 0,
    },
    "endpoints": {},  # Track endpoint usage
    "errors": [],  # Recent errors
}

@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    uptime = time.time() - START_TIME
    return {
        "status": "healthy",
        "uptime_seconds": uptime,
        "uptime_formatted": str(timedelta(seconds=int(uptime))),
        "timestamp": datetime.utcnow().isoformat(),
    }

@router.get("/stats/system", response_model=SystemStats)
async def get_system_stats(db: AsyncSession = Depends(get_db)):
    """Get overall system statistics from database"""
    # Count all jobs
    total_jobs_query = await db.execute(select(func.count(Job.id)))
    total_jobs = total_jobs_query.scalar() or 0
    
    # Count completed jobs
    completed_query = await db.execute(
        select(func.count(Job.id)).where(Job.status == "completed")
    )
    jobs_completed = completed_query.scalar() or 0
    
    # Count failed jobs
    failed_query = await db.execute(
        select(func.count(Job.id)).where(Job.status == "failed")
    )
    jobs_failed = failed_query.scalar() or 0
    
    # Count pending jobs
    pending_query = await db.execute(
        select(func.count(Job.id)).where(Job.status == "pending")
    )
    jobs_pending = pending_query.scalar() or 0
    
    # Calculate average generation time from completed jobs with timing data
    completed_jobs = await db.execute(
        select(Job).where(Job.status == "completed")
    )
    completed_list = completed_jobs.scalars().all()
    
    total_time = 0.0
    count_with_time = 0
    for job in completed_list:
        if job.created_at and job.updated_at:
            delta = (job.updated_at - job.created_at).total_seconds()
            if delta > 0:
                total_time += delta
                count_with_time += 1
    
    avg_time = total_time / count_with_time if count_with_time > 0 else 0.0
    
    return SystemStats(
        total_jobs=total_jobs,
        jobs_completed=jobs_completed,
        jobs_failed=jobs_failed,
        jobs_pending=jobs_pending,
        avg_generation_time=avg_time,
        uptime_seconds=time.time() - START_TIME,
    )

@router.get("/stats/usage", response_model=UsageStats)
async def get_usage_stats(db: AsyncSession = Depends(get_db)):
    """Get usage statistics across all features from database"""
    # Count images generated
    images_query = await db.execute(
        select(func.count(Asset.id)).where(Asset.type == "image")
    )
    total_images = images_query.scalar() or 0
    
    # Count videos generated
    videos_query = await db.execute(
        select(func.count(Asset.id)).where(Asset.type == "video")
    )
    total_videos = videos_query.scalar() or 0
    
    # Count workflows executed (jobs with type 'workflow')
    workflows_query = await db.execute(
        select(func.count(Job.id)).where(Job.type.like("%workflow%"))
    )
    total_workflows = workflows_query.scalar() or 0
    
    # Count datasets created
    datasets_query = await db.execute(select(func.count(Dataset.id)))
    total_datasets = datasets_query.scalar() or 0
    
    # Count training jobs
    training_query = await db.execute(select(func.count(TrainingJob.id)))
    total_training = training_query.scalar() or 0
    
    # Count total assets as downloads metric
    downloads_query = await db.execute(select(func.count(Asset.id)))
    total_downloads = downloads_query.scalar() or 0
    
    return UsageStats(
        total_images_generated=total_images,
        total_videos_generated=total_videos,
        total_workflows_executed=total_workflows,
        total_datasets_created=total_datasets,
        total_training_jobs=total_training,
        total_downloads=total_downloads,
    )

@router.get("/stats/endpoints")
async def get_endpoint_stats():
    """Get statistics for API endpoint usage"""
    # Sort by usage count
    sorted_endpoints = sorted(
        STATS_DB["endpoints"].items(),
        key=lambda x: x[1]["count"],
        reverse=True
    )
    
    return {
        "total_requests": sum(e[1]["count"] for e in sorted_endpoints),
        "endpoints": [
            {
                "path": path,
                "count": data["count"],
                "avg_response_time": data["total_time"] / data["count"] if data["count"] > 0 else 0,
                "last_accessed": data["last_access"],
            }
            for path, data in sorted_endpoints[:20]  # Top 20
        ]
    }

@router.get("/errors/recent")
async def get_recent_errors(limit: int = 50):
    """Get recent errors and exceptions"""
    errors = STATS_DB["errors"][-limit:]
    return {
        "total_errors": len(STATS_DB["errors"]),
        "recent_errors": errors,
    }

@router.post("/track/job")
async def track_job_event(
    event_type: str,  # "created", "completed", "failed"
    job_type: str,  # "text-to-image", "text-to-video", etc.
    duration: Optional[float] = None
):
    """Track job-related events for analytics"""
    STATS_DB["jobs"]["total"] += 1
    
    if event_type == "completed":
        STATS_DB["jobs"]["completed"] += 1
        if duration:
            STATS_DB["jobs"]["total_time"] += duration
        
        # Track by job type
        if "image" in job_type.lower():
            STATS_DB["usage"]["images"] += 1
        elif "video" in job_type.lower():
            STATS_DB["usage"]["videos"] += 1
    
    elif event_type == "failed":
        STATS_DB["jobs"]["failed"] += 1
        STATS_DB["errors"].append({
            "timestamp": datetime.utcnow().isoformat(),
            "type": "job_failed",
            "job_type": job_type,
        })
    
    elif event_type == "created":
        STATS_DB["jobs"]["pending"] += 1
    
    return {"status": "tracked", "event": event_type, "job_type": job_type}

@router.post("/track/endpoint")
async def track_endpoint_usage(path: str, response_time: float):
    """Track endpoint usage for analytics"""
    if path not in STATS_DB["endpoints"]:
        STATS_DB["endpoints"][path] = {
            "count": 0,
            "total_time": 0.0,
            "last_access": None,
        }
    
    STATS_DB["endpoints"][path]["count"] += 1
    STATS_DB["endpoints"][path]["total_time"] += response_time
    STATS_DB["endpoints"][path]["last_access"] = datetime.utcnow().isoformat()
    
    return {"status": "tracked"}

@router.get("/dashboard")
async def get_dashboard_data(db: AsyncSession = Depends(get_db)):
    """Get comprehensive dashboard data with real database queries"""
    system = await get_system_stats(db)
    usage = await get_usage_stats(db)
    uptime = time.time() - START_TIME
    
    # Recent activity - real data from database
    recent_jobs = await db.execute(
        select(Job).order_by(Job.updated_at.desc()).limit(10)
    )
    recent_jobs_list = recent_jobs.scalars().all()
    
    recent_activity = []
    for job in recent_jobs_list:
        # Calculate time ago
        time_diff = datetime.utcnow() - job.updated_at
        if time_diff.seconds < 60:
            time_ago = f"{time_diff.seconds} seconds ago"
        elif time_diff.seconds < 3600:
            time_ago = f"{time_diff.seconds // 60} minutes ago"
        else:
            time_ago = f"{time_diff.seconds // 3600} hours ago"
        
        # Determine type
        job_type = "image" if "image" in job.type else ("video" if "video" in job.type else "workflow")
        
        recent_activity.append({
            "type": job_type,
            "status": job.status,
            "time": time_ago
        })
    
    # Popular presets - could be tracked in a separate table, for now use job params frequency
    jobs_with_params = await db.execute(
        select(Job).where(Job.status == "completed")
    )
    jobs_list = jobs_with_params.scalars().all()
    
    # Count preset usage (simplified)
    preset_counts = {}
    for job in jobs_list:
        if job.params and isinstance(job.params, dict):
            preset_name = job.params.get("preset", "Custom")
            preset_counts[preset_name] = preset_counts.get(preset_name, 0) + 1
    
    # Get top 5 presets
    popular_presets = [
        {"name": name, "usage": count}
        for name, count in sorted(preset_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    ]
    
    if not popular_presets:
        # Default if no data
        popular_presets = [
            {"name": "Cinematic Portrait", "usage": 0},
            {"name": "Anime Style", "usage": 0},
            {"name": "Photorealistic", "usage": 0},
        ]
    
    return {
        "system": system.model_dump(),
        "usage": usage.model_dump(),
        "uptime_formatted": str(timedelta(seconds=int(uptime))),
        "recent_activity": recent_activity,
        "popular_presets": popular_presets,
        "timestamp": datetime.utcnow().isoformat(),
    }

@router.post("/reset-stats")
async def reset_statistics():
    """Reset all statistics (admin only in production)"""
    STATS_DB["jobs"] = {"total": 0, "completed": 0, "failed": 0, "pending": 0, "total_time": 0.0}
    STATS_DB["usage"] = {
        "images": 0,
        "videos": 0,
        "workflows": 0,
        "datasets": 0,
        "training": 0,
        "downloads": 0,
    }
    STATS_DB["endpoints"] = {}
    STATS_DB["errors"] = []
    
    return {"status": "success", "message": "All statistics reset"}
