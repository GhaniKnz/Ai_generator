"""
Real AI image generation using Stable Diffusion models.
This module handles loading and running actual AI models for image generation.
"""
import os
import logging
from pathlib import Path
from typing import Optional, List, TYPE_CHECKING, Any

logger = logging.getLogger(__name__)

# Check if AI libraries are available
try:
    import torch
    from diffusers import (
        StableDiffusionPipeline,
        DPMSolverMultistepScheduler,
        EulerAncestralDiscreteScheduler,
        DDIMScheduler,
    )
    from PIL import Image
    AI_AVAILABLE = True
except ImportError as e:
    logger.warning(f"AI libraries not available: {e}")
    AI_AVAILABLE = False
    torch = None
    StableDiffusionPipeline = None
    DPMSolverMultistepScheduler = None
    EulerAncestralDiscreteScheduler = None
    DDIMScheduler = None
    Image = None
    
# Type hint compatibility
if TYPE_CHECKING:
    from PIL import Image as PILImage
else:
    PILImage = Any


class AIImageGenerator:
    """Manages AI model loading and image generation."""
    
    def __init__(self, device: Optional[str] = None, cache_dir: Optional[str] = None):
        """
        Initialize the AI image generator.
        
        Args:
            device: Device to use ('cuda', 'cpu', or None for auto-detect)
            cache_dir: Directory to cache downloaded models
        """
        if not AI_AVAILABLE:
            raise ImportError(
                "AI libraries not installed. Install with: pip install torch diffusers transformers"
            )
        
        # Auto-detect device if not specified
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
            
        self.cache_dir = cache_dir or "./models_cache"
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # Model cache (pipeline name -> loaded pipeline)
        self._pipelines = {}
        
        logger.info(f"AI Generator initialized on device: {self.device}")
        if self.device == "cpu":
            logger.warning("Running on CPU - generation will be slow. Consider using a GPU.")
    
    def _get_scheduler(self, scheduler_name: str, config):
        """Get the appropriate scheduler based on name."""
        schedulers = {
            "ddim": DDIMScheduler,
            "dpm": DPMSolverMultistepScheduler,
            "euler": EulerAncestralDiscreteScheduler,
        }
        
        scheduler_class = schedulers.get(scheduler_name.lower(), DDIMScheduler)
        return scheduler_class.from_config(config)
    
    def load_pipeline(self, model_path: str, force_reload: bool = False) -> StableDiffusionPipeline:
        """
        Load a Stable Diffusion pipeline.
        
        Args:
            model_path: Path or HuggingFace model ID (e.g., 'stabilityai/stable-diffusion-1-5')
            force_reload: Force reload even if already cached
            
        Returns:
            Loaded pipeline ready for generation
        """
        # Check cache
        if not force_reload and model_path in self._pipelines:
            logger.info(f"Using cached pipeline for {model_path}")
            return self._pipelines[model_path]
        
        logger.info(f"Loading model: {model_path} on {self.device}")
        
        try:
            # Load the pipeline
            pipe = StableDiffusionPipeline.from_pretrained(
                model_path,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                cache_dir=self.cache_dir,
                safety_checker=None,  # Disable for faster loading
                requires_safety_checker=False,
            )
            
            # Move to device
            pipe = pipe.to(self.device)
            
            # Enable memory optimizations
            if self.device == "cuda":
                # Enable attention slicing for lower VRAM usage
                pipe.enable_attention_slicing()
                # Try to enable xformers if available
                try:
                    pipe.enable_xformers_memory_efficient_attention()
                    logger.info("xformers memory efficient attention enabled")
                except Exception:
                    logger.info("xformers not available, using standard attention")
            
            # Cache the pipeline
            self._pipelines[model_path] = pipe
            
            logger.info(f"Model loaded successfully: {model_path}")
            return pipe
            
        except Exception as e:
            logger.error(f"Failed to load model {model_path}: {e}")
            raise
    
    def generate_images(
        self,
        prompt: str,
        model_path: str = "stabilityai/stable-diffusion-1-5",
        negative_prompt: Optional[str] = None,
        num_outputs: int = 1,
        width: int = 512,
        height: int = 512,
        num_inference_steps: int = 30,
        guidance_scale: float = 7.5,
        scheduler: str = "ddim",
        seed: Optional[int] = None,
    ) -> List[Any]:  # Changed from List[Image.Image]
        """
        Generate images using Stable Diffusion.
        
        Args:
            prompt: Text description of desired image
            model_path: Path to model (HuggingFace ID or local path)
            negative_prompt: Things to avoid in the image
            num_outputs: Number of images to generate
            width: Image width (must be multiple of 8)
            height: Image height (must be multiple of 8)
            num_inference_steps: Number of denoising steps (more = better quality, slower)
            guidance_scale: How closely to follow the prompt (7-12 recommended)
            scheduler: Sampling scheduler ("ddim", "dpm", "euler")
            seed: Random seed for reproducibility
            
        Returns:
            List of generated PIL Images
        """
        # Ensure dimensions are multiples of 8
        width = (width // 8) * 8
        height = (height // 8) * 8
        
        logger.info(f"Generating {num_outputs} image(s): {prompt[:50]}...")
        logger.info(f"Model: {model_path}, Size: {width}x{height}, Steps: {num_inference_steps}")
        
        # Load the pipeline
        pipe = self.load_pipeline(model_path)
        
        # Set scheduler if different from default
        if scheduler and scheduler.lower() != "ddim":
            pipe.scheduler = self._get_scheduler(scheduler, pipe.scheduler.config)
        
        # Set seed if provided
        generator = None
        if seed is not None:
            generator = torch.Generator(device=self.device).manual_seed(seed)
            logger.info(f"Using seed: {seed}")
        
        # Generate images
        results = []
        for i in range(num_outputs):
            logger.info(f"Generating image {i+1}/{num_outputs}...")
            
            # Generate with current seed
            output = pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                width=width,
                height=height,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                generator=generator,
            )
            
            # Get the image
            image = output.images[0]
            results.append(image)
            
            # Increment seed for next image if seed was set
            if seed is not None:
                seed += 1
                generator = torch.Generator(device=self.device).manual_seed(seed)
        
        logger.info(f"Successfully generated {len(results)} image(s)")
        return results
    
    def unload_pipeline(self, model_path: str):
        """Unload a pipeline from memory to free up resources."""
        if model_path in self._pipelines:
            del self._pipelines[model_path]
            
            # Clear CUDA cache if on GPU
            if self.device == "cuda":
                torch.cuda.empty_cache()
            
            logger.info(f"Unloaded pipeline: {model_path}")
    
    def unload_all_pipelines(self):
        """Unload all pipelines from memory."""
        self._pipelines.clear()
        
        if self.device == "cuda":
            torch.cuda.empty_cache()
        
        logger.info("All pipelines unloaded")


# Global generator instance
_generator: Optional[AIImageGenerator] = None


def get_ai_generator() -> AIImageGenerator:
    """Get or create the global AI generator instance."""
    global _generator
    if _generator is None:
        _generator = AIImageGenerator()
    return _generator


def check_ai_available() -> bool:
    """Check if AI generation is available (dependencies installed)."""
    return AI_AVAILABLE
