"""
Monitoring & Analytics Router - Phase 6
Provides system monitoring, statistics, and analytics
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import time

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
async def get_system_stats():
    """Get overall system statistics"""
    jobs = STATS_DB["jobs"]
    avg_time = jobs["total_time"] / jobs["completed"] if jobs["completed"] > 0 else 0.0
    
    return SystemStats(
        total_jobs=jobs["total"],
        jobs_completed=jobs["completed"],
        jobs_failed=jobs["failed"],
        jobs_pending=jobs["pending"],
        avg_generation_time=avg_time,
        uptime_seconds=time.time() - START_TIME,
    )

@router.get("/stats/usage", response_model=UsageStats)
async def get_usage_stats():
    """Get usage statistics across all features"""
    usage = STATS_DB["usage"]
    return UsageStats(
        total_images_generated=usage["images"],
        total_videos_generated=usage["videos"],
        total_workflows_executed=usage["workflows"],
        total_datasets_created=usage["datasets"],
        total_training_jobs=usage["training"],
        total_downloads=usage["downloads"],
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
async def get_dashboard_data():
    """Get comprehensive dashboard data"""
    system = await get_system_stats()
    usage = await get_usage_stats()
    uptime = time.time() - START_TIME
    
    # Recent activity (mock data - replace with real DB queries)
    recent_activity = [
        {"type": "image", "status": "completed", "time": "2 minutes ago"},
        {"type": "video", "status": "completed", "time": "5 minutes ago"},
        {"type": "workflow", "status": "running", "time": "8 minutes ago"},
    ]
    
    # Popular presets (mock data)
    popular_presets = [
        {"name": "Cinematic Portrait", "usage": 45},
        {"name": "Anime Style", "usage": 38},
        {"name": "Photorealistic", "usage": 32},
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
