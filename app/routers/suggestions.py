"""
Prompt Suggestions Router - Phase 6
Provides auto-completion and suggestions for prompts
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import re

router = APIRouter(prefix="/suggestions", tags=["suggestions"])

class PromptSuggestion(BaseModel):
    text: str
    category: str
    description: str
    usage_count: int = 0

# Common prompt building blocks organized by category
SUGGESTION_DATABASE = {
    "subjects": [
        PromptSuggestion(text="portrait of a woman", category="subjects", description="Human portrait"),
        PromptSuggestion(text="landscape with mountains", category="subjects", description="Nature scene"),
        PromptSuggestion(text="futuristic cityscape", category="subjects", description="Urban environment"),
        PromptSuggestion(text="fantasy castle", category="subjects", description="Fantasy architecture"),
        PromptSuggestion(text="still life with flowers", category="subjects", description="Still life"),
        PromptSuggestion(text="character design", category="subjects", description="Character concept"),
        PromptSuggestion(text="interior room design", category="subjects", description="Interior space"),
        PromptSuggestion(text="abstract composition", category="subjects", description="Abstract art"),
    ],
    "styles": [
        PromptSuggestion(text="oil painting", category="styles", description="Traditional oil painting"),
        PromptSuggestion(text="watercolor", category="styles", description="Watercolor painting"),
        PromptSuggestion(text="digital art", category="styles", description="Digital artwork"),
        PromptSuggestion(text="anime style", category="styles", description="Anime/manga style"),
        PromptSuggestion(text="photorealistic", category="styles", description="Photo-realistic"),
        PromptSuggestion(text="concept art", category="styles", description="Concept art style"),
        PromptSuggestion(text="3d render", category="styles", description="3D rendering"),
        PromptSuggestion(text="sketch", category="styles", description="Pencil sketch"),
        PromptSuggestion(text="cinematic", category="styles", description="Cinematic style"),
        PromptSuggestion(text="isometric", category="styles", description="Isometric view"),
    ],
    "lighting": [
        PromptSuggestion(text="golden hour lighting", category="lighting", description="Warm sunset light"),
        PromptSuggestion(text="dramatic lighting", category="lighting", description="High contrast light"),
        PromptSuggestion(text="soft diffused light", category="lighting", description="Soft even lighting"),
        PromptSuggestion(text="volumetric lighting", category="lighting", description="Light rays/god rays"),
        PromptSuggestion(text="neon lights", category="lighting", description="Neon/colorful lights"),
        PromptSuggestion(text="natural sunlight", category="lighting", description="Outdoor daylight"),
        PromptSuggestion(text="studio lighting", category="lighting", description="Professional studio"),
        PromptSuggestion(text="moonlight", category="lighting", description="Night/moon lighting"),
    ],
    "camera": [
        PromptSuggestion(text="wide angle lens", category="camera", description="Wide field of view"),
        PromptSuggestion(text="macro lens", category="camera", description="Close-up detail"),
        PromptSuggestion(text="telephoto lens", category="camera", description="Compressed perspective"),
        PromptSuggestion(text="fisheye lens", category="camera", description="Ultra wide distortion"),
        PromptSuggestion(text="tilt-shift", category="camera", description="Miniature effect"),
        PromptSuggestion(text="bokeh background", category="camera", description="Blurred background"),
        PromptSuggestion(text="sharp focus", category="camera", description="Clear sharp detail"),
        PromptSuggestion(text="depth of field", category="camera", description="Focal plane control"),
    ],
    "quality": [
        PromptSuggestion(text="8k uhd", category="quality", description="Ultra high definition"),
        PromptSuggestion(text="highly detailed", category="quality", description="Rich in details"),
        PromptSuggestion(text="masterpiece", category="quality", description="Highest quality"),
        PromptSuggestion(text="professional", category="quality", description="Professional quality"),
        PromptSuggestion(text="trending on artstation", category="quality", description="Popular art style"),
        PromptSuggestion(text="award winning", category="quality", description="Award quality"),
        PromptSuggestion(text="intricate details", category="quality", description="Complex details"),
    ],
    "mood": [
        PromptSuggestion(text="peaceful atmosphere", category="mood", description="Calm and serene"),
        PromptSuggestion(text="dramatic mood", category="mood", description="Intense and dramatic"),
        PromptSuggestion(text="mysterious ambiance", category="mood", description="Mysterious feeling"),
        PromptSuggestion(text="vibrant energy", category="mood", description="Energetic and lively"),
        PromptSuggestion(text="melancholic tone", category="mood", description="Sad or reflective"),
        PromptSuggestion(text="epic grandeur", category="mood", description="Grand and epic"),
    ],
    "colors": [
        PromptSuggestion(text="vibrant colors", category="colors", description="Bright saturated colors"),
        PromptSuggestion(text="muted tones", category="colors", description="Desaturated palette"),
        PromptSuggestion(text="warm color palette", category="colors", description="Warm colors"),
        PromptSuggestion(text="cool color palette", category="colors", description="Cool colors"),
        PromptSuggestion(text="monochromatic", category="colors", description="Single color scheme"),
        PromptSuggestion(text="pastel colors", category="colors", description="Soft pastel tones"),
    ],
}

@router.get("/autocomplete")
async def autocomplete(query: str, category: Optional[str] = None, limit: int = 10):
    """
    Get autocomplete suggestions based on partial query
    Args:
        query: Partial text to search for
        category: Optional category filter (subjects, styles, lighting, etc.)
        limit: Maximum number of suggestions to return
    """
    query_lower = query.lower().strip()
    if not query_lower:
        return []
    
    results = []
    
    # Determine which categories to search
    categories_to_search = [category] if category else SUGGESTION_DATABASE.keys()
    
    for cat in categories_to_search:
        if cat not in SUGGESTION_DATABASE:
            continue
        
        for suggestion in SUGGESTION_DATABASE[cat]:
            # Check if query matches the beginning of the suggestion
            if suggestion.text.lower().startswith(query_lower):
                results.append({
                    "text": suggestion.text,
                    "category": suggestion.category,
                    "description": suggestion.description,
                    "match_type": "prefix"
                })
            # Also check for word-level matches within the suggestion
            elif query_lower in suggestion.text.lower():
                results.append({
                    "text": suggestion.text,
                    "category": suggestion.category,
                    "description": suggestion.description,
                    "match_type": "contains"
                })
    
    # Sort by match type (prefix first) and limit results
    results.sort(key=lambda x: (x["match_type"] != "prefix", x["text"]))
    return results[:limit]

@router.get("/categories")
async def list_categories():
    """List all available suggestion categories"""
    return {
        "categories": [
            {"name": "subjects", "count": len(SUGGESTION_DATABASE["subjects"])},
            {"name": "styles", "count": len(SUGGESTION_DATABASE["styles"])},
            {"name": "lighting", "count": len(SUGGESTION_DATABASE["lighting"])},
            {"name": "camera", "count": len(SUGGESTION_DATABASE["camera"])},
            {"name": "quality", "count": len(SUGGESTION_DATABASE["quality"])},
            {"name": "mood", "count": len(SUGGESTION_DATABASE["mood"])},
            {"name": "colors", "count": len(SUGGESTION_DATABASE["colors"])},
        ]
    }

@router.get("/by-category/{category}")
async def get_suggestions_by_category(category: str):
    """Get all suggestions for a specific category"""
    if category not in SUGGESTION_DATABASE:
        return {"error": "Category not found", "available": list(SUGGESTION_DATABASE.keys())}
    
    return {
        "category": category,
        "suggestions": SUGGESTION_DATABASE[category]
    }

@router.post("/enhance")
async def enhance_prompt(prompt: str, add_quality: bool = True, add_style: bool = False):
    """
    Enhance a user prompt with quality and style modifiers
    Args:
        prompt: Original user prompt
        add_quality: Add quality modifiers
        add_style: Add style suggestions
    """
    enhanced = prompt.strip()
    additions = []
    
    if add_quality:
        # Add quality if not already present
        quality_terms = ["detailed", "8k", "uhd", "professional", "masterpiece"]
        has_quality = any(term in prompt.lower() for term in quality_terms)
        if not has_quality:
            additions.append("highly detailed, professional quality")
    
    if add_style:
        # Suggest adding a style if none detected
        style_terms = ["oil painting", "watercolor", "digital art", "anime", "photorealistic", "3d render"]
        has_style = any(term in prompt.lower() for term in style_terms)
        if not has_style:
            additions.append("cinematic style")
    
    if additions:
        enhanced = f"{enhanced}, {', '.join(additions)}"
    
    return {
        "original": prompt,
        "enhanced": enhanced,
        "additions": additions,
    }

@router.get("/random")
async def get_random_prompts(count: int = 5):
    """Get random prompt suggestions for inspiration"""
    import random
    
    prompts = []
    for _ in range(count):
        subject = random.choice(SUGGESTION_DATABASE["subjects"])
        style = random.choice(SUGGESTION_DATABASE["styles"])
        lighting = random.choice(SUGGESTION_DATABASE["lighting"])
        quality = random.choice(SUGGESTION_DATABASE["quality"])
        
        prompt = f"{subject.text}, {style.text}, {lighting.text}, {quality.text}"
        prompts.append({
            "prompt": prompt,
            "components": {
                "subject": subject.text,
                "style": style.text,
                "lighting": lighting.text,
                "quality": quality.text,
            }
        })
    
    return {"prompts": prompts}
