"""Model management endpoints."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Model
from ..schemas import ModelCreate, ModelResponse

router = APIRouter(prefix="/models", tags=["models"])


@router.post("/", response_model=ModelResponse)
async def create_model(
    model_data: ModelCreate,
    db: AsyncSession = Depends(get_db),
) -> Model:
    """Register a new AI model."""
    model = Model(**model_data.dict())
    db.add(model)
    await db.commit()
    await db.refresh(model)
    return model


@router.get("/", response_model=List[ModelResponse])
async def list_models(
    category: str | None = None,
    type: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> List[Model]:
    """List all models, optionally filtered by category or type."""
    query = select(Model).where(Model.is_active == True)
    
    if category:
        query = query.where(Model.category == category)
    if type:
        query = query.where(Model.type == type)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{model_id}", response_model=ModelResponse)
async def get_model(
    model_id: int,
    db: AsyncSession = Depends(get_db),
) -> Model:
    """Get model details by ID."""
    result = await db.execute(select(Model).where(Model.id == model_id))
    model = result.scalar_one_or_none()
    
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return model


@router.put("/{model_id}", response_model=ModelResponse)
async def update_model(
    model_id: int,
    updates: dict,
    db: AsyncSession = Depends(get_db),
) -> Model:
    """Update model configuration."""
    result = await db.execute(select(Model).where(Model.id == model_id))
    model = result.scalar_one_or_none()
    
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    for key, value in updates.items():
        if hasattr(model, key):
            setattr(model, key, value)
    
    await db.commit()
    await db.refresh(model)
    return model


@router.delete("/{model_id}")
async def delete_model(
    model_id: int,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Soft delete a model (set is_active to False)."""
    result = await db.execute(select(Model).where(Model.id == model_id))
    model = result.scalar_one_or_none()
    
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    model.is_active = False
    await db.commit()
    
    return {"message": "Model deleted successfully"}
