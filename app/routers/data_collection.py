"""
Data Collection Router - Phase 5
Provides endpoints for collecting data from internet sources (Unsplash, Pexels, etc.)
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import asyncio

router = APIRouter(prefix="/api/data-collection", tags=["data-collection"])

# In-memory storage for demo (replace with database in production)
search_results_db: Dict[str, Dict] = {}
download_queue_db: Dict[str, Dict] = {}

# ============================================================================
# Pydantic Models
# ============================================================================

class ImageSource(BaseModel):
    """Image source information"""
    id: str
    source: str = Field(..., description="Source API (unsplash, pexels, etc.)")
    url: str
    thumbnail_url: str
    width: int
    height: int
    author: str
    author_url: Optional[str] = None
    description: Optional[str] = None
    tags: List[str] = []
    license: str = Field(..., description="License type (e.g., Unsplash License, Pexels License)")
    download_url: str
    

class SearchRequest(BaseModel):
    """Request to search for images/videos"""
    query: str = Field(..., min_length=1, max_length=200)
    source: str = Field("unsplash", description="API source (unsplash, pexels, both)")
    media_type: str = Field("image", description="Media type (image, video)")
    per_page: int = Field(20, ge=1, le=100)
    page: int = Field(1, ge=1)


class SearchResponse(BaseModel):
    """Response with search results"""
    search_id: str
    query: str
    total_results: int
    results: List[ImageSource]
    page: int
    per_page: int
    created_at: datetime


class DownloadRequest(BaseModel):
    """Request to download images to dataset"""
    image_ids: List[str] = Field(..., min_items=1)
    dataset_id: int
    add_tags: bool = Field(True, description="Add source tags to dataset")


class DownloadResponse(BaseModel):
    """Response for download request"""
    download_id: str
    status: str
    total_items: int
    dataset_id: int
    message: str


class DownloadStatus(BaseModel):
    """Download job status"""
    download_id: str
    status: str  # pending, downloading, completed, failed
    progress: int  # 0-100
    total_items: int
    downloaded_items: int
    failed_items: int
    dataset_id: int
    created_at: datetime
    completed_at: Optional[datetime] = None


# ============================================================================
# Mock API Functions (replace with real API calls in production)
# ============================================================================

async def mock_unsplash_search(query: str, page: int, per_page: int) -> List[ImageSource]:
    """Mock Unsplash API search"""
    # Simulate API delay
    await asyncio.sleep(0.5)
    
    results = []
    for i in range(min(per_page, 10)):  # Mock 10 results
        results.append(ImageSource(
            id=f"unsplash_{query}_{page}_{i}",
            source="unsplash",
            url=f"https://images.unsplash.com/photo-{i}?q={query}",
            thumbnail_url=f"https://images.unsplash.com/photo-{i}?q={query}&w=400",
            width=1920,
            height=1080,
            author=f"Photographer {i}",
            author_url=f"https://unsplash.com/@photographer{i}",
            description=f"Beautiful {query} image {i}",
            tags=[query, "nature", "landscape"],
            license="Unsplash License (Free to use)",
            download_url=f"https://unsplash.com/photos/{i}/download"
        ))
    return results


async def mock_pexels_search(query: str, page: int, per_page: int) -> List[ImageSource]:
    """Mock Pexels API search"""
    await asyncio.sleep(0.5)
    
    results = []
    for i in range(min(per_page, 8)):  # Mock 8 results
        results.append(ImageSource(
            id=f"pexels_{query}_{page}_{i}",
            source="pexels",
            url=f"https://images.pexels.com/photos/{i}/{query}.jpeg",
            thumbnail_url=f"https://images.pexels.com/photos/{i}/{query}.jpeg?w=400",
            width=1920,
            height=1280,
            author=f"Artist {i}",
            author_url=f"https://pexels.com/@artist{i}",
            description=f"Stunning {query} photo {i}",
            tags=[query, "stock", "free"],
            license="Pexels License (Free to use)",
            download_url=f"https://pexels.com/photo/{i}/download"
        ))
    return results


# ============================================================================
# API Endpoints
# ============================================================================

@router.post("/search", response_model=SearchResponse)
async def search_images(request: SearchRequest):
    """
    Search for images/videos from public APIs
    
    Supports:
    - Unsplash (free stock photos)
    - Pexels (free stock photos and videos)
    
    Returns results with proper licensing information.
    """
    results = []
    
    # Search from selected source(s)
    if request.source in ["unsplash", "both"]:
        unsplash_results = await mock_unsplash_search(
            request.query, request.page, request.per_page
        )
        results.extend(unsplash_results)
    
    if request.source in ["pexels", "both"]:
        pexels_results = await mock_pexels_search(
            request.query, request.page, request.per_page
        )
        results.extend(pexels_results)
    
    # Create search record
    search_id = f"search_{len(search_results_db) + 1}"
    search_record = SearchResponse(
        search_id=search_id,
        query=request.query,
        total_results=len(results),
        results=results,
        page=request.page,
        per_page=request.per_page,
        created_at=datetime.now()
    )
    
    search_results_db[search_id] = search_record.model_dump()
    
    return search_record


@router.get("/search/{search_id}", response_model=SearchResponse)
async def get_search_results(search_id: str):
    """Get previous search results by ID"""
    if search_id not in search_results_db:
        raise HTTPException(status_code=404, detail="Search not found")
    
    return SearchResponse(**search_results_db[search_id])


@router.post("/download", response_model=DownloadResponse)
async def download_to_dataset(request: DownloadRequest):
    """
    Download selected images to a dataset
    
    This endpoint:
    1. Validates the images exist
    2. Creates a download job
    3. Downloads images to local storage
    4. Adds them to the specified dataset
    5. Optionally adds source tags
    """
    download_id = f"download_{len(download_queue_db) + 1}"
    
    # Create download job
    download_job = {
        "download_id": download_id,
        "status": "pending",
        "progress": 0,
        "total_items": len(request.image_ids),
        "downloaded_items": 0,
        "failed_items": 0,
        "dataset_id": request.dataset_id,
        "image_ids": request.image_ids,
        "add_tags": request.add_tags,
        "created_at": datetime.now(),
        "completed_at": None
    }
    
    download_queue_db[download_id] = download_job
    
    # In production, this would:
    # 1. Queue the download job
    # 2. Process asynchronously
    # 3. Download images to storage
    # 4. Update dataset with new items
    
    return DownloadResponse(
        download_id=download_id,
        status="pending",
        total_items=len(request.image_ids),
        dataset_id=request.dataset_id,
        message=f"Download job created. Processing {len(request.image_ids)} items."
    )


@router.get("/download/{download_id}", response_model=DownloadStatus)
async def get_download_status(download_id: str):
    """Get status of a download job"""
    if download_id not in download_queue_db:
        raise HTTPException(status_code=404, detail="Download job not found")
    
    job = download_queue_db[download_id]
    
    # Mock progress for demo
    if job["status"] == "pending":
        job["status"] = "downloading"
        job["progress"] = 50
        job["downloaded_items"] = job["total_items"] // 2
    elif job["status"] == "downloading":
        job["status"] = "completed"
        job["progress"] = 100
        job["downloaded_items"] = job["total_items"]
        job["completed_at"] = datetime.now()
    
    return DownloadStatus(**job)


@router.post("/download/{download_id}/cancel")
async def cancel_download(download_id: str):
    """Cancel a download job"""
    if download_id not in download_queue_db:
        raise HTTPException(status_code=404, detail="Download job not found")
    
    job = download_queue_db[download_id]
    
    if job["status"] in ["completed", "failed"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel job with status: {job['status']}"
        )
    
    job["status"] = "cancelled"
    
    return {"message": "Download job cancelled", "download_id": download_id}


@router.get("/sources")
async def list_available_sources():
    """
    List available data sources
    
    Returns information about supported APIs and their licensing.
    """
    return {
        "sources": [
            {
                "id": "unsplash",
                "name": "Unsplash",
                "description": "Beautiful, free images from talented creators",
                "media_types": ["image"],
                "license": "Unsplash License - Free to use for commercial and non-commercial purposes",
                "attribution_required": False,
                "rate_limit": "50 requests/hour (demo)",
                "documentation": "https://unsplash.com/license"
            },
            {
                "id": "pexels",
                "name": "Pexels",
                "description": "Free stock photos and videos",
                "media_types": ["image", "video"],
                "license": "Pexels License - Free for personal and commercial use",
                "attribution_required": False,
                "rate_limit": "200 requests/hour (demo)",
                "documentation": "https://www.pexels.com/license/"
            }
        ],
        "total_sources": 2,
        "note": "Mock implementation. In production, use real API keys and respect rate limits."
    }
