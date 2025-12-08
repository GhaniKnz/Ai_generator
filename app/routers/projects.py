"""Project management endpoints for Lab mode."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Project
from ..schemas import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


# Mock user ID for now - will be replaced with actual auth
def get_current_user_id() -> int:
    return 1


@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> Project:
    """Create a new project."""
    project = Project(
        user_id=user_id,
        **project_data.dict(),
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> List[Project]:
    """List all projects for current user."""
    result = await db.execute(
        select(Project).where(Project.user_id == user_id)
    )
    return result.scalars().all()


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> Project:
    """Get project details."""
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == user_id,
        )
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    updates: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> Project:
    """Update project details or graph data."""
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == user_id,
        )
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(project, key):
            if key == "graph_data" and value:
                # Convert Pydantic model to dict for JSON storage
                setattr(project, key, value.dict() if hasattr(value, 'dict') else value)
            else:
                setattr(project, key, value)
    
    await db.commit()
    await db.refresh(project)
    return project


@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> dict:
    """Delete a project."""
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == user_id,
        )
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await db.delete(project)
    await db.commit()
    
    return {"message": "Project deleted successfully"}
