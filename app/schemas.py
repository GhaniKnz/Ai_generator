from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any

from pydantic import BaseModel, Field, validator


# ============= Enums =============

class JobType(str, Enum):
    text_to_image = "text_to_image"
    text_to_video = "text_to_video"
    image_to_video = "image_to_video"
    image_to_image = "image_to_image"
    inpainting = "inpainting"
    outpainting = "outpainting"
    upscale = "upscale"


class JobStatus(str, Enum):
    pending = "pending"
    running = "running"
    done = "done"
    failed = "failed"


class AspectRatio(str, Enum):
    square = "1:1"
    portrait = "4:5"
    landscape = "16:9"
    vertical = "9:16"


class StylePreset(str, Enum):
    cinematic = "cinematic"
    anime = "anime"
    realistic = "realistic"
    illustration = "illustration"
    concept_art = "concept_art"
    horror = "horror"
    vlog = "vlog"
    music_video = "music_video"


class CameraMovement(str, Enum):
    static = "static"
    pan_left = "pan_left"
    pan_right = "pan_right"
    tilt_up = "tilt_up"
    tilt_down = "tilt_down"
    zoom_in = "zoom_in"
    zoom_out = "zoom_out"
    dolly = "dolly"


# ============= Request Models =============

class TextToImageRequest(BaseModel):
    prompt: str = Field(..., description="Main text prompt")
    negative_prompt: Optional[str] = Field(
        None, description="Things to avoid in the output"
    )
    num_outputs: int = Field(1, ge=1, le=4, description="How many images to generate")
    height: int = Field(768, ge=64, le=2048)
    width: int = Field(512, ge=64, le=2048)
    aspect_ratio: Optional[AspectRatio] = Field(None, description="Aspect ratio preset")
    cfg_scale: float = Field(7.5, ge=0.0, le=20.0)
    steps: int = Field(30, ge=1, le=200)
    scheduler: Optional[str] = Field("ddim", description="Sampling scheduler name")
    seed: Optional[int] = Field(None, ge=0)
    model: str = Field("stable-diffusion-1.5", description="Model identifier")
    style_preset: Optional[StylePreset] = Field(None, description="Named style preset")
    lora_models: Optional[List[str]] = Field(None, description="LoRA models to apply")
    lora_weights: Optional[List[float]] = Field(None, description="Weights for LoRA models")

    @validator("prompt")
    def validate_prompt(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("prompt must not be empty")
        return cleaned


class TextToVideoRequest(BaseModel):
    prompt: str = Field(..., description="Main text prompt for video")
    negative_prompt: Optional[str] = Field(None, description="Things to avoid")
    duration: float = Field(3.0, ge=1.0, le=30.0, description="Video duration in seconds")
    fps: int = Field(24, ge=8, le=60, description="Frames per second")
    height: int = Field(576, ge=64, le=1024)
    width: int = Field(1024, ge=64, le=1920)
    aspect_ratio: Optional[AspectRatio] = Field(None)
    cfg_scale: float = Field(7.5, ge=0.0, le=20.0)
    steps: int = Field(30, ge=1, le=100)
    seed: Optional[int] = Field(None, ge=0)
    model: str = Field("stable-video-diffusion", description="Video model identifier")
    style_preset: Optional[StylePreset] = Field(None)
    camera_movement: Optional[CameraMovement] = Field(None)
    motion_intensity: float = Field(0.5, ge=0.0, le=1.0)

    @validator("prompt")
    def validate_prompt(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("prompt must not be empty")
        return cleaned


class ImageToVideoRequest(BaseModel):
    image_path: str = Field(..., description="Path to input image")
    prompt: Optional[str] = Field(None, description="Optional prompt for guidance")
    duration: float = Field(3.0, ge=1.0, le=30.0)
    fps: int = Field(24, ge=8, le=60)
    cfg_scale: float = Field(7.5, ge=0.0, le=20.0)
    steps: int = Field(30, ge=1, le=100)
    seed: Optional[int] = Field(None, ge=0)
    model: str = Field("stable-video-diffusion")
    camera_movement: Optional[CameraMovement] = Field(None)
    motion_intensity: float = Field(0.5, ge=0.0, le=1.0)


class ImageToImageRequest(BaseModel):
    image_path: str = Field(..., description="Path to input image")
    prompt: str = Field(..., description="Transformation prompt")
    negative_prompt: Optional[str] = Field(None)
    strength: float = Field(0.75, ge=0.0, le=1.0, description="Transformation strength")
    cfg_scale: float = Field(7.5, ge=0.0, le=20.0)
    steps: int = Field(30, ge=1, le=200)
    seed: Optional[int] = Field(None, ge=0)
    model: str = Field("stable-diffusion-1.5")
    style_preset: Optional[StylePreset] = Field(None)


class InpaintingRequest(BaseModel):
    image_path: str = Field(..., description="Path to input image")
    mask_path: str = Field(..., description="Path to mask image")
    prompt: str = Field(..., description="Prompt for inpainting")
    negative_prompt: Optional[str] = Field(None)
    cfg_scale: float = Field(7.5, ge=0.0, le=20.0)
    steps: int = Field(30, ge=1, le=200)
    seed: Optional[int] = Field(None, ge=0)
    model: str = Field("stable-diffusion-inpaint")


class UpscaleRequest(BaseModel):
    image_path: str = Field(..., description="Path to input image")
    scale_factor: int = Field(2, ge=2, le=4, description="Upscale factor (2x or 4x)")
    model: str = Field("esrgan", description="Upscaling model")


# ============= Response Models =============

class JobOutput(BaseModel):
    index: int
    path: str
    thumbnail_path: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


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

    model_config = {"from_attributes": True}


# ============= User & Auth Models =============

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
    password: str = Field(..., min_length=8)


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# ============= Model Management =============

class ModelCreate(BaseModel):
    name: str
    type: str
    category: str
    path: str
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    version: Optional[str] = None


class ModelResponse(BaseModel):
    id: int
    name: str
    type: str
    category: str
    path: str
    description: Optional[str]
    is_active: bool
    version: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ============= Asset Management =============

class AssetResponse(BaseModel):
    id: int
    type: str
    path: str
    thumbnail_path: Optional[str]
    prompt: Optional[str]
    tags: List[str]
    width: Optional[int]
    height: Optional[int]
    duration: Optional[float]
    created_at: datetime

    model_config = {"from_attributes": True}


# ============= Project & Lab Mode =============

class NodeData(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]


class EdgeData(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class GraphData(BaseModel):
    nodes: List[NodeData]
    edges: List[EdgeData]


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    tags: Optional[List[str]] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    graph_data: Optional[GraphData] = None
    tags: Optional[List[str]] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    graph_data: Optional[Dict[str, Any]]
    tags: List[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ============= Training & Datasets =============

class DatasetCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: str
    path: str
    tags: Optional[List[str]] = None


class DatasetResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    type: str
    num_items: int
    tags: List[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class TrainingConfig(BaseModel):
    learning_rate: float = Field(1e-4, ge=1e-6, le=1e-2)
    batch_size: int = Field(4, ge=1, le=32)
    num_epochs: int = Field(10, ge=1, le=1000)
    max_steps: Optional[int] = Field(None, ge=1)
    gradient_accumulation_steps: int = Field(1, ge=1, le=32)
    mixed_precision: str = Field("fp16", pattern="^(no|fp16|bf16)$")
    use_8bit_adam: bool = Field(False)
    lora_rank: int = Field(4, ge=1, le=128)
    lora_alpha: int = Field(32, ge=1, le=256)


class TrainingJobCreate(BaseModel):
    dataset_id: int
    base_model_id: int
    type: str = Field("lora", pattern="^(lora|dreambooth|full)$")
    config: TrainingConfig


class TrainingJobResponse(BaseModel):
    id: str
    dataset_id: int
    base_model_id: int
    type: str
    status: str
    progress: float
    output_path: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
