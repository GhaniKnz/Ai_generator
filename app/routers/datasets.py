"""Dataset management router for training data."""
from typing import List
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

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


# In-memory storage for demo (replace with database in production)
datasets_db = {}
dataset_id_counter = 1


@router.get("/", response_model=List[DatasetResponse])
async def list_datasets() -> List[DatasetResponse]:
    """List all datasets."""
    return [
        DatasetResponse(
            id=ds["id"],
            name=ds["name"],
            description=ds["description"],
            type=ds["type"],
            num_items=ds["num_items"],
            tags=ds["tags"],
            created_at=ds["created_at"]
        )
        for ds in datasets_db.values()
    ]


@router.post("/", response_model=DatasetResponse)
async def create_dataset(request: DatasetCreate) -> DatasetResponse:
    """Create a new dataset."""
    global dataset_id_counter
    
    dataset = {
        "id": dataset_id_counter,
        "name": request.name,
        "description": request.description,
        "type": request.type,
        "num_items": 0,
        "tags": request.tags,
        "created_at": "2025-12-08T12:00:00Z",
        "items": []
    }
    
    datasets_db[dataset_id_counter] = dataset
    dataset_id_counter += 1
    
    return DatasetResponse(
        id=dataset["id"],
        name=dataset["name"],
        description=dataset["description"],
        type=dataset["type"],
        num_items=dataset["num_items"],
        tags=dataset["tags"],
        created_at=dataset["created_at"]
    )


@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(dataset_id: int) -> DatasetResponse:
    """Get dataset by ID."""
    if dataset_id not in datasets_db:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    ds = datasets_db[dataset_id]
    return DatasetResponse(
        id=ds["id"],
        name=ds["name"],
        description=ds["description"],
        type=ds["type"],
        num_items=ds["num_items"],
        tags=ds["tags"],
        created_at=ds["created_at"]
    )


@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: int) -> dict:
    """Delete a dataset."""
    if dataset_id not in datasets_db:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    del datasets_db[dataset_id]
    return {"status": "deleted", "id": dataset_id}


@router.post("/{dataset_id}/upload")
async def upload_to_dataset(
    dataset_id: int,
    file: UploadFile = File(...),
    prompt: str | None = None
) -> dict:
    """Upload a file to a dataset."""
    if dataset_id not in datasets_db:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Mock upload (in production, save file to storage)
    dataset = datasets_db[dataset_id]
    
    item = {
        "filename": file.filename,
        "prompt": prompt,
        "size": 0  # Would be file.size in production
    }
    
    dataset["items"].append(item)
    dataset["num_items"] = len(dataset["items"])
    
    return {
        "status": "uploaded",
        "dataset_id": dataset_id,
        "filename": file.filename,
        "total_items": dataset["num_items"]
    }


@router.get("/{dataset_id}/stats")
async def get_dataset_stats(dataset_id: int) -> dict:
    """Get dataset statistics."""
    if dataset_id not in datasets_db:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    ds = datasets_db[dataset_id]
    
    return {
        "id": dataset_id,
        "name": ds["name"],
        "total_items": ds["num_items"],
        "type": ds["type"],
        "storage_size_mb": ds["num_items"] * 2.5,  # Mock size
        "tags": ds["tags"]
    }
