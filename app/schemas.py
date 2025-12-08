from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, validator


class JobType(str, Enum):
    text_to_image = "text_to_image"


class JobStatus(str, Enum):
    pending = "pending"
    running = "running"
    done = "done"
    failed = "failed"


class TextToImageRequest(BaseModel):
    prompt: str = Field(..., description="Main text prompt")
    negative_prompt: Optional[str] = Field(
        None, description="Things to avoid in the output"
    )
    num_outputs: int = Field(1, ge=1, le=4, description="How many images to generate")
    height: int = Field(768, ge=64, le=2048)
    width: int = Field(512, ge=64, le=2048)
    cfg_scale: float = Field(7.5, ge=0.0, le=20.0)
    steps: int = Field(30, ge=1, le=200)
    scheduler: Optional[str] = Field("ddim", description="Sampling scheduler name")
    seed: Optional[int] = Field(None, ge=0)
    model: str = Field("stable-diffusion-1.5", description="Model identifier")
    style_preset: Optional[str] = Field(None, description="Named style preset if any")

    @validator("prompt")
    def validate_prompt(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("prompt must not be empty")
        return cleaned


class JobOutput(BaseModel):
    index: int
    path: str


class JobState(BaseModel):
    id: str
    type: JobType
    status: JobStatus
    created_at: datetime
    updated_at: datetime
    progress: float = 0.0
    params: dict
    outputs: List[JobOutput] = Field(default_factory=list)
    error: Optional[str] = None
    logs: List[str] = Field(default_factory=list)

    class Config:
        allow_mutation = True
