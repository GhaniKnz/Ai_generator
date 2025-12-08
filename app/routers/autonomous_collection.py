"""
Autonomous Data Collection System with File Type Recognition
Automatically fetches, validates, and categorizes images/videos from internet sources
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
import asyncio
import mimetypes
from pathlib import Path

router = APIRouter(prefix="/api/autonomous-collection", tags=["autonomous-collection"])

# File type recognition rules
FILE_TYPE_RULES = {
    'image': {
        'extensions': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.svg'],
        'mime_types': ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml'],
        'max_size_mb': 50,
        'min_dimensions': (256, 256),
        'recommended_dimensions': (1024, 1024)
    },
    'video': {
        'extensions': ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv'],
        'mime_types': ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'],
        'max_size_mb': 500,
        'min_duration_sec': 1,
        'max_duration_sec': 60,
        'recommended_fps': 24
    }
}

# In-memory storage
collection_jobs_db: Dict[str, Dict] = {}
collected_files_db: Dict[str, List[Dict]] = {}

# ============================================================================
# Pydantic Models
# ============================================================================

class FileValidationResult(BaseModel):
    """Result of file validation"""
    is_valid: bool
    file_type: Literal['image', 'video', 'unknown']
    mime_type: Optional[str] = None
    extension: Optional[str] = None
    size_mb: Optional[float] = None
    dimensions: Optional[tuple[int, int]] = None
    duration_sec: Optional[float] = None
    issues: List[str] = []
    recommendations: List[str] = []


class CollectionSource(BaseModel):
    """Data source configuration"""
    name: str
    type: Literal['unsplash', 'pexels', 'pixabay', 'custom_url']
    enabled: bool = True
    api_key: Optional[str] = None
    rate_limit_per_hour: int = 50
    priority: int = 1  # Higher = processed first


class AutoCollectionConfig(BaseModel):
    """Configuration for autonomous collection"""
    keywords: List[str] = Field(..., min_items=1, description="Keywords to search for")
    file_types: List[Literal['image', 'video']] = ['image']
    sources: List[CollectionSource]
    max_files_per_keyword: int = Field(100, ge=1, le=1000)
    auto_validate: bool = True
    auto_categorize: bool = True
    quality_threshold: float = Field(0.7, ge=0.0, le=1.0, description="Minimum quality score (0-1)")
    target_dataset_id: Optional[int] = None


class CollectionJobCreate(BaseModel):
    """Request to create autonomous collection job"""
    name: str = Field(..., min_length=1, max_length=200)
    config: AutoCollectionConfig
    schedule: Optional[str] = Field(None, description="Cron expression for scheduled runs")


class CollectedFile(BaseModel):
    """Information about a collected file"""
    id: str
    source: str
    original_url: HttpUrl
    local_path: str
    file_type: str
    mime_type: str
    size_mb: float
    dimensions: Optional[tuple[int, int]] = None
    duration_sec: Optional[float] = None
    quality_score: float
    keywords: List[str]
    metadata: Dict[str, Any]
    collected_at: datetime
    validated: bool
    validation_result: Optional[FileValidationResult] = None


class CollectionJobStatus(BaseModel):
    """Status of collection job"""
    job_id: str
    name: str
    status: Literal['pending', 'running', 'paused', 'completed', 'failed']
    progress: float  # 0-100
    total_keywords: int
    processed_keywords: int
    total_files_collected: int
    total_files_validated: int
    total_files_rejected: int
    current_keyword: Optional[str] = None
    current_source: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    errors: List[str] = []


# ============================================================================
# File Type Recognition Functions
# ============================================================================

def detect_file_type(filename: str, mime_type: Optional[str] = None) -> str:
    """
    Detect file type based on extension and MIME type
    Returns: 'image', 'video', or 'unknown'
    """
    ext = Path(filename).suffix.lower()
    
    # Check by extension first
    if ext in FILE_TYPE_RULES['image']['extensions']:
        return 'image'
    if ext in FILE_TYPE_RULES['video']['extensions']:
        return 'video'
    
    # Check by MIME type
    if mime_type:
        if mime_type in FILE_TYPE_RULES['image']['mime_types']:
            return 'image'
        if mime_type in FILE_TYPE_RULES['video']['mime_types']:
            return 'video'
    
    # Try to guess MIME type from extension
    guessed_mime, _ = mimetypes.guess_type(filename)
    if guessed_mime:
        if guessed_mime.startswith('image/'):
            return 'image'
        if guessed_mime.startswith('video/'):
            return 'video'
    
    return 'unknown'


async def validate_file(
    file_info: Dict[str, Any],
    file_type: str
) -> FileValidationResult:
    """
    Validate file against rules for its type
    """
    issues = []
    recommendations = []
    is_valid = True
    
    if file_type not in ['image', 'video']:
        return FileValidationResult(
            is_valid=False,
            file_type='unknown',
            issues=["Unknown file type"]
        )
    
    rules = FILE_TYPE_RULES[file_type]
    
    # Validate extension
    ext = file_info.get('extension', '').lower()
    if ext and ext not in rules['extensions']:
        issues.append(f"Unsupported extension: {ext}")
        is_valid = False
    
    # Validate MIME type
    mime = file_info.get('mime_type', '')
    if mime and mime not in rules['mime_types']:
        issues.append(f"Unsupported MIME type: {mime}")
        is_valid = False
    
    # Validate size
    size_mb = file_info.get('size_mb', 0)
    if size_mb > rules['max_size_mb']:
        issues.append(f"File too large: {size_mb}MB (max: {rules['max_size_mb']}MB)")
        is_valid = False
    
    # Type-specific validation
    if file_type == 'image':
        dimensions = file_info.get('dimensions')
        if dimensions:
            width, height = dimensions
            min_w, min_h = rules['min_dimensions']
            if width < min_w or height < min_h:
                issues.append(f"Dimensions too small: {width}x{height} (min: {min_w}x{min_h})")
                is_valid = False
            
            rec_w, rec_h = rules['recommended_dimensions']
            if width < rec_w or height < rec_h:
                recommendations.append(f"Recommended dimensions: {rec_w}x{rec_h} for best quality")
    
    elif file_type == 'video':
        duration = file_info.get('duration_sec', 0)
        if duration:
            if duration < rules['min_duration_sec']:
                issues.append(f"Video too short: {duration}s (min: {rules['min_duration_sec']}s)")
                is_valid = False
            if duration > rules['max_duration_sec']:
                issues.append(f"Video too long: {duration}s (max: {rules['max_duration_sec']}s)")
                is_valid = False
    
    return FileValidationResult(
        is_valid=is_valid,
        file_type=file_type,
        mime_type=mime,
        extension=ext,
        size_mb=size_mb,
        dimensions=file_info.get('dimensions'),
        duration_sec=file_info.get('duration_sec'),
        issues=issues,
        recommendations=recommendations
    )


# ============================================================================
# Autonomous Collection Functions
# ============================================================================

async def collect_from_source(
    source: CollectionSource,
    keyword: str,
    file_type: str,
    max_files: int
) -> List[Dict[str, Any]]:
    """
    Collect files from a specific source
    Mock implementation - replace with real API calls in production
    """
    await asyncio.sleep(0.5)  # Simulate API call
    
    collected = []
    for i in range(min(max_files, 10)):  # Mock: collect up to 10 files
        file_info = {
            'id': f"{source.name}_{keyword}_{i}",
            'source': source.name,
            'url': f"https://{source.name}.com/photos/{keyword}-{i}.jpg",
            'extension': '.jpg',
            'mime_type': 'image/jpeg',
            'size_mb': 2.5 + (i * 0.1),
            'dimensions': (1920, 1080),
            'quality_score': 0.8 + (i * 0.01),
            'keywords': [keyword],
            'metadata': {
                'author': f"Photographer {i}",
                'license': f"{source.name} License",
                'description': f"Beautiful {keyword} image"
            }
        }
        collected.append(file_info)
    
    return collected


async def process_collection_job(job_id: str, config: AutoCollectionConfig):
    """
    Background task to process collection job
    """
    job = collection_jobs_db[job_id]
    job['status'] = 'running'
    job['started_at'] = datetime.now()
    
    all_collected = []
    
    try:
        # Process each keyword
        for idx, keyword in enumerate(config.keywords):
            job['processed_keywords'] = idx
            job['current_keyword'] = keyword
            
            # Collect from each source
            for source in sorted(config.sources, key=lambda s: s.priority, reverse=True):
                if not source.enabled:
                    continue
                
                job['current_source'] = source.name
                
                for file_type in config.file_types:
                    # Collect files
                    files = await collect_from_source(
                        source,
                        keyword,
                        file_type,
                        config.max_files_per_keyword
                    )
                    
                    # Validate if enabled
                    for file in files:
                        job['total_files_collected'] += 1
                        
                        if config.auto_validate:
                            file_type_detected = detect_file_type(
                                file.get('url', ''),
                                file.get('mime_type')
                            )
                            
                            validation = await validate_file(file, file_type_detected)
                            file['validation_result'] = validation.model_dump()
                            
                            if validation.is_valid and file.get('quality_score', 0) >= config.quality_threshold:
                                job['total_files_validated'] += 1
                                all_collected.append(file)
                            else:
                                job['total_files_rejected'] += 1
                        else:
                            all_collected.append(file)
                
                # Update progress
                job['progress'] = ((idx + 1) / len(config.keywords)) * 100
        
        # Store collected files
        collected_files_db[job_id] = all_collected
        
        # Mark as completed
        job['status'] = 'completed'
        job['completed_at'] = datetime.now()
        job['processed_keywords'] = len(config.keywords)
        job['progress'] = 100.0
        
    except Exception as e:
        job['status'] = 'failed'
        job['errors'].append(str(e))


# ============================================================================
# API Endpoints
# ============================================================================

@router.post("/jobs", response_model=CollectionJobStatus)
async def create_collection_job(
    request: CollectionJobCreate,
    background_tasks: BackgroundTasks
):
    """
    Create a new autonomous collection job
    """
    job_id = f"collection_{len(collection_jobs_db) + 1}"
    
    job = {
        'job_id': job_id,
        'name': request.name,
        'status': 'pending',
        'progress': 0.0,
        'total_keywords': len(request.config.keywords),
        'processed_keywords': 0,
        'total_files_collected': 0,
        'total_files_validated': 0,
        'total_files_rejected': 0,
        'current_keyword': None,
        'current_source': None,
        'created_at': datetime.now(),
        'started_at': None,
        'completed_at': None,
        'errors': [],
        'config': request.config.model_dump()
    }
    
    collection_jobs_db[job_id] = job
    
    # Start background processing
    background_tasks.add_task(process_collection_job, job_id, request.config)
    
    return CollectionJobStatus(**job)


@router.get("/jobs/{job_id}", response_model=CollectionJobStatus)
async def get_collection_job(job_id: str):
    """Get status of a collection job"""
    if job_id not in collection_jobs_db:
        raise HTTPException(status_code=404, detail="Collection job not found")
    
    return CollectionJobStatus(**collection_jobs_db[job_id])


@router.get("/jobs", response_model=List[CollectionJobStatus])
async def list_collection_jobs():
    """List all collection jobs"""
    return [CollectionJobStatus(**job) for job in collection_jobs_db.values()]


@router.get("/jobs/{job_id}/files", response_model=List[CollectedFile])
async def get_collected_files(job_id: str):
    """Get files collected by a job"""
    if job_id not in collected_files_db:
        raise HTTPException(status_code=404, detail="No files found for this job")
    
    files = collected_files_db[job_id]
    return [
        CollectedFile(
            id=f['id'],
            source=f['source'],
            original_url=f['url'],
            local_path=f.get('local_path', f['url']),
            file_type=f.get('validation_result', {}).get('file_type', 'unknown'),
            mime_type=f.get('mime_type', ''),
            size_mb=f.get('size_mb', 0),
            dimensions=f.get('dimensions'),
            duration_sec=f.get('duration_sec'),
            quality_score=f.get('quality_score', 0),
            keywords=f.get('keywords', []),
            metadata=f.get('metadata', {}),
            collected_at=datetime.now(),
            validated=f.get('validation_result', {}).get('is_valid', False),
            validation_result=FileValidationResult(**f['validation_result']) if f.get('validation_result') else None
        )
        for f in files
    ]


@router.post("/validate-file")
async def validate_single_file(file_info: Dict[str, Any]):
    """
    Validate a single file
    Useful for testing file type recognition rules
    """
    file_type = detect_file_type(
        file_info.get('filename', ''),
        file_info.get('mime_type')
    )
    
    validation = await validate_file(file_info, file_type)
    
    return {
        'detected_type': file_type,
        'validation': validation.model_dump()
    }


@router.get("/file-type-rules")
async def get_file_type_rules():
    """
    Get file type recognition rules
    Returns all rules for images and videos
    """
    return {
        'rules': FILE_TYPE_RULES,
        'description': 'File type recognition rules for autonomous collection',
        'supported_types': list(FILE_TYPE_RULES.keys())
    }


@router.post("/jobs/{job_id}/pause")
async def pause_collection_job(job_id: str):
    """Pause a running collection job"""
    if job_id not in collection_jobs_db:
        raise HTTPException(status_code=404, detail="Collection job not found")
    
    job = collection_jobs_db[job_id]
    if job['status'] != 'running':
        raise HTTPException(status_code=400, detail="Job is not running")
    
    job['status'] = 'paused'
    return {"message": "Job paused", "job_id": job_id}


@router.post("/jobs/{job_id}/resume")
async def resume_collection_job(job_id: str, background_tasks: BackgroundTasks):
    """Resume a paused collection job"""
    if job_id not in collection_jobs_db:
        raise HTTPException(status_code=404, detail="Collection job not found")
    
    job = collection_jobs_db[job_id]
    if job['status'] != 'paused':
        raise HTTPException(status_code=400, detail="Job is not paused")
    
    # Resume processing
    config = AutoCollectionConfig(**job['config'])
    background_tasks.add_task(process_collection_job, job_id, config)
    
    return {"message": "Job resumed", "job_id": job_id}
