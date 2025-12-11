"""Dataset management router for training data with database integration."""
from typing import List
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime
from ..database import get_db
from ..models import Dataset
from ..dataset_utils import get_dataset_path, count_dataset_files

router = APIRouter(prefix="/datasets", tags=["datasets"])


class DatasetCreate(BaseModel):
    """Request to create a new dataset."""
    name: str
    description: str | None = None
    type: str  # image, video, mixed
    tags: List[str] = []


class DatasetResponse(BaseModel):
    """Dataset information."""
    id: int
    name: str
    description: str | None
    type: str
    num_items: int
    tags: List[str]
    created_at: str
    
    model_config = {"from_attributes": True}


class DatasetItemUpload(BaseModel):
    """Request to add items to dataset."""
    prompt: str | None = None
    tags: List[str] = []


@router.get("/", response_model=List[DatasetResponse])
async def list_datasets(db: AsyncSession = Depends(get_db)) -> List[DatasetResponse]:
    """List all datasets from database."""
    result = await db.execute(select(Dataset).order_by(Dataset.created_at.desc()))
    datasets = result.scalars().all()
    
    return [
        DatasetResponse(
            id=dataset.id,
            name=dataset.name,
            description=dataset.description,
            type=dataset.type,
            num_items=dataset.num_items,
            tags=dataset.tags,
            created_at=dataset.created_at.isoformat()
        )
        for dataset in datasets
    ]


@router.post("/", response_model=DatasetResponse)
async def create_dataset(
    request: DatasetCreate,
    db: AsyncSession = Depends(get_db)
) -> DatasetResponse:
    """Create a new dataset in database."""
    # Create dataset in database (without path initially)
    dataset = Dataset(
        name=request.name,
        description=request.description,
        type=request.type,
        path="",  # Will be updated after we have the ID
        num_items=0,
        tags=request.tags,
        dataset_metadata={}
    )
    
    db.add(dataset)
    await db.commit()
    await db.refresh(dataset)
    
    # Now create the directory with the actual dataset ID using utility function
    dataset_path = get_dataset_path(dataset.id, dataset.type)
    dataset_path.mkdir(parents=True, exist_ok=True)
    
    # Update the path in database
    dataset.path = str(dataset_path)
    await db.commit()
    await db.refresh(dataset)
    
    return DatasetResponse(
        id=dataset.id,
        name=dataset.name,
        description=dataset.description,
        type=dataset.type,
        num_items=dataset.num_items,
        tags=dataset.tags,
        created_at=dataset.created_at.isoformat()
    )


@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(
    dataset_id: int,
    db: AsyncSession = Depends(get_db)
) -> DatasetResponse:
    """Get dataset by ID from database."""
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    return DatasetResponse(
        id=dataset.id,
        name=dataset.name,
        description=dataset.description,
        type=dataset.type,
        num_items=dataset.num_items,
        tags=dataset.tags,
        created_at=dataset.created_at.isoformat()
    )


@router.delete("/{dataset_id}")
async def delete_dataset(
    dataset_id: int,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Delete a dataset from database."""
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    await db.delete(dataset)
    await db.commit()
    
    return {"status": "deleted", "id": dataset_id}


@router.post("/{dataset_id}/upload")
async def upload_to_dataset(
    dataset_id: int,
    file: UploadFile = File(...),
    prompt: str | None = None,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Upload a file to a dataset (deprecated - use /api/uploads/ instead)."""
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # This endpoint is deprecated in favor of /api/uploads/
    # But we keep it for backward compatibility
    return {
        "status": "deprecated",
        "message": "Please use /api/uploads/ endpoint with dataset_id parameter",
        "dataset_id": dataset_id
    }


@router.get("/{dataset_id}/stats")
async def get_dataset_stats(
    dataset_id: int,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Get dataset statistics from database."""
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    return {
        "id": dataset_id,
        "name": dataset.name,
        "total_items": dataset.num_items,
        "type": dataset.type,
        "storage_size_mb": dataset.num_items * 2.5,  # Approximate size
        "tags": dataset.tags
    }


@router.post("/{dataset_id}/refresh")
async def refresh_dataset_count(
    dataset_id: int,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Refresh dataset item count by scanning the upload directory."""
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Count files in dataset directory using utility function
    dataset_path = get_dataset_path(dataset_id, dataset.type)
    file_count = count_dataset_files(dataset_path)
    
    # Update database
    stmt = (
        update(Dataset)
        .where(Dataset.id == dataset_id)
        .values(num_items=file_count, updated_at=datetime.utcnow())
    )
    await db.execute(stmt)
    await db.commit()
    
    return {
        "dataset_id": dataset_id,
        "num_items": file_count,
        "status": "refreshed"
    }
