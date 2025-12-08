"""
Style Presets Router - Phase 6
Provides predefined style presets for generation tasks
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from enum import Enum

router = APIRouter(prefix="/presets", tags=["presets"])

class PresetCategory(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    GENERAL = "general"

class StylePreset(BaseModel):
    id: str
    name: str
    category: PresetCategory
    description: str
    prompt_template: str
    negative_prompt: str
    parameters: Dict[str, Any]
    tags: List[str]
    thumbnail_url: Optional[str] = None

# In-memory presets storage (ready for database integration)
PRESETS_DB: Dict[str, StylePreset] = {
    # Image Presets
    "cinematic_portrait": StylePreset(
        id="cinematic_portrait",
        name="Cinematic Portrait",
        category=PresetCategory.IMAGE,
        description="Professional cinematic portrait with dramatic lighting",
        prompt_template="{prompt}, cinematic lighting, dramatic shadows, film grain, bokeh, professional photography, 85mm lens, f/1.4",
        negative_prompt="amateur, overexposed, underexposed, flat lighting, snapshop, low quality",
        parameters={
            "cfg_scale": 7.5,
            "steps": 30,
            "width": 768,
            "height": 1024,
        },
        tags=["portrait", "cinematic", "professional"]
    ),
    "anime_style": StylePreset(
        id="anime_style",
        name="Anime Style",
        category=PresetCategory.IMAGE,
        description="High-quality anime/manga illustration style",
        prompt_template="{prompt}, anime art style, manga, detailed, vibrant colors, clean lines, cel shading",
        negative_prompt="realistic, photographic, 3d render, blurry, low quality, western cartoon",
        parameters={
            "cfg_scale": 8.0,
            "steps": 28,
            "width": 832,
            "height": 1216,
        },
        tags=["anime", "illustration", "manga"]
    ),
    "photorealistic": StylePreset(
        id="photorealistic",
        name="Photorealistic",
        category=PresetCategory.IMAGE,
        description="Ultra-realistic photographic quality",
        prompt_template="{prompt}, photorealistic, ultra detailed, 8k uhd, dslr, high quality, film grain, sharp focus",
        negative_prompt="illustration, painting, drawing, art, sketch, low quality, blurry",
        parameters={
            "cfg_scale": 7.0,
            "steps": 35,
            "width": 1024,
            "height": 1024,
        },
        tags=["realistic", "photo", "detailed"]
    ),
    "concept_art": StylePreset(
        id="concept_art",
        name="Concept Art",
        category=PresetCategory.IMAGE,
        description="Digital concept art style for games and films",
        prompt_template="{prompt}, concept art, digital painting, artstation, highly detailed, fantasy art, matte painting",
        negative_prompt="photo, realistic, low detail, amateur, simple",
        parameters={
            "cfg_scale": 8.5,
            "steps": 32,
            "width": 1024,
            "height": 576,
        },
        tags=["concept art", "digital art", "fantasy"]
    ),
    "oil_painting": StylePreset(
        id="oil_painting",
        name="Oil Painting",
        category=PresetCategory.IMAGE,
        description="Traditional oil painting aesthetic",
        prompt_template="{prompt}, oil painting, canvas, brushstrokes, classical art, museum quality, fine art",
        negative_prompt="digital, photo, modern, low quality, sketch",
        parameters={
            "cfg_scale": 9.0,
            "steps": 40,
            "width": 896,
            "height": 1152,
        },
        tags=["painting", "traditional", "classical"]
    ),
    # Video Presets
    "cinematic_video": StylePreset(
        id="cinematic_video",
        name="Cinematic Video",
        category=PresetCategory.VIDEO,
        description="Hollywood-style cinematic video with smooth camera movements",
        prompt_template="{prompt}, cinematic, film quality, smooth motion, professional cinematography, color graded",
        negative_prompt="shaky, amateur, low fps, stuttering, blurry",
        parameters={
            "duration": 5.0,
            "fps": 24,
            "motion_intensity": 0.7,
        },
        tags=["cinematic", "film", "professional"]
    ),
    "vlog_style": StylePreset(
        id="vlog_style",
        name="Vlog Style",
        category=PresetCategory.VIDEO,
        description="Casual vlog-style video with natural movements",
        prompt_template="{prompt}, vlog style, handheld feel, natural lighting, casual, authentic",
        negative_prompt="cinematic, dramatic, artificial, overly polished",
        parameters={
            "duration": 3.0,
            "fps": 30,
            "motion_intensity": 0.5,
        },
        tags=["vlog", "casual", "authentic"]
    ),
    "time_lapse": StylePreset(
        id="time_lapse",
        name="Time Lapse",
        category=PresetCategory.VIDEO,
        description="Time-lapse style with accelerated motion",
        prompt_template="{prompt}, time lapse, fast motion, dynamic changes, smooth transitions",
        negative_prompt="static, slow, normal speed",
        parameters={
            "duration": 4.0,
            "fps": 30,
            "motion_intensity": 0.9,
        },
        tags=["time lapse", "dynamic", "fast"]
    ),
}

@router.get("/", response_model=List[StylePreset])
async def list_presets(category: Optional[PresetCategory] = None):
    """List all style presets, optionally filtered by category"""
    presets = list(PRESETS_DB.values())
    if category:
        presets = [p for p in presets if p.category == category]
    return presets

@router.get("/{preset_id}", response_model=StylePreset)
async def get_preset(preset_id: str):
    """Get a specific style preset by ID"""
    if preset_id not in PRESETS_DB:
        raise HTTPException(status_code=404, detail="Preset not found")
    return PRESETS_DB[preset_id]

@router.post("/", response_model=StylePreset)
async def create_preset(preset: StylePreset):
    """Create a new custom style preset"""
    if preset.id in PRESETS_DB:
        raise HTTPException(status_code=400, detail="Preset ID already exists")
    PRESETS_DB[preset.id] = preset
    return preset

@router.delete("/{preset_id}")
async def delete_preset(preset_id: str):
    """Delete a custom style preset"""
    if preset_id not in PRESETS_DB:
        raise HTTPException(status_code=404, detail="Preset not found")
    # Prevent deletion of built-in presets
    built_in_ids = ["cinematic_portrait", "anime_style", "photorealistic", 
                    "concept_art", "oil_painting", "cinematic_video", "vlog_style", "time_lapse"]
    if preset_id in built_in_ids:
        raise HTTPException(status_code=400, detail="Cannot delete built-in presets")
    del PRESETS_DB[preset_id]
    return {"status": "success", "message": f"Preset {preset_id} deleted"}

@router.post("/apply/{preset_id}")
async def apply_preset(preset_id: str, user_prompt: str):
    """Apply a preset to a user's prompt and return the enhanced parameters"""
    if preset_id not in PRESETS_DB:
        raise HTTPException(status_code=404, detail="Preset not found")
    
    preset = PRESETS_DB[preset_id]
    
    # Replace {prompt} placeholder in template
    enhanced_prompt = preset.prompt_template.replace("{prompt}", user_prompt)
    
    return {
        "preset_id": preset_id,
        "preset_name": preset.name,
        "enhanced_prompt": enhanced_prompt,
        "negative_prompt": preset.negative_prompt,
        "parameters": preset.parameters,
        "tags": preset.tags,
    }
