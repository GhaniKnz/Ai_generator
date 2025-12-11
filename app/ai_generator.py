"""
Real AI image generation using Stable Diffusion and related models.
This module handles actual image generation with PyTorch and Diffusers.
"""
import logging
import torch
from pathlib import Path
from typing import List, Optional
from PIL import Image
import gc

logger = logging.getLogger(__name__)


class AIImageGenerator:
    """
    Manages AI models for image generation.
    Supports Stable Diffusion and custom trained models (LoRA).
    """
    
    def __init__(self, cache_dir: str = "./models_cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.current_pipeline = None
        self.current_model_name = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        logger.info(f"AI Generator initialized on device: {self.device}")
        if self.device == "cpu":
            logger.warning("GPU not available. Image generation will be slower on CPU.")
    
    def _load_pipeline(self, model_name: str, model_path: Optional[str] = None):
        """Load a Stable Diffusion pipeline."""
        from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
        
        # Don't reload if already loaded
        if self.current_model_name == model_name and self.current_pipeline is not None:
            return self.current_pipeline
        
        # Clear previous pipeline
        if self.current_pipeline is not None:
            del self.current_pipeline
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        
        try:
            # Determine model identifier
            if model_path and Path(model_path).exists():
                # Load from local path (for trained models)
                logger.info(f"Loading model from local path: {model_path}")
                model_id = model_path
            else:
                # Map common model names to Hugging Face model IDs
                model_mapping = {
                    "stable-diffusion-1.5": "runwayml/stable-diffusion-v1-5",
                    "stable-diffusion-xl": "stabilityai/stable-diffusion-xl-base-1.0",
                    "sdxl": "stabilityai/stable-diffusion-xl-base-1.0",
                }
                model_id = model_mapping.get(model_name, "runwayml/stable-diffusion-v1-5")
                logger.info(f"Loading model: {model_name} -> {model_id}")
            
            # Load pipeline
            pipeline = StableDiffusionPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                cache_dir=str(self.cache_dir),
                safety_checker=None,  # Disable safety checker for faster generation
            )
            
            # Use DPM++ solver for faster generation
            pipeline.scheduler = DPMSolverMultistepScheduler.from_config(
                pipeline.scheduler.config
            )
            
            # Move to device
            pipeline = pipeline.to(self.device)
            
            # Enable memory optimizations
            if self.device == "cuda":
                pipeline.enable_attention_slicing()
                # Enable xformers if available for better performance
                try:
                    pipeline.enable_xformers_memory_efficient_attention()
                except Exception:
                    logger.info("xformers not available, using standard attention")
            
            self.current_pipeline = pipeline
            self.current_model_name = model_name
            
            logger.info(f"Model {model_name} loaded successfully")
            return pipeline
            
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}", exc_info=True)
            raise
    
    async def generate_images(
        self,
        prompt: str,
        model_name: str = "stable-diffusion-1.5",
        model_path: Optional[str] = None,
        negative_prompt: Optional[str] = None,
        num_outputs: int = 1,
        width: int = 512,
        height: int = 512,
        num_inference_steps: int = 30,
        guidance_scale: float = 7.5,
        seed: Optional[int] = None,
    ) -> List[Image.Image]:
        """
        Generate images using Stable Diffusion.
        
        Args:
            prompt: Text description of the image to generate
            model_name: Name of the model to use
            model_path: Optional path to local model
            negative_prompt: Things to avoid in the image
            num_outputs: Number of images to generate
            width: Image width in pixels
            height: Image height in pixels
            num_inference_steps: Number of denoising steps
            guidance_scale: How strictly to follow the prompt (CFG scale)
            seed: Random seed for reproducibility
            
        Returns:
            List of PIL Image objects
        """
        try:
            # Load the pipeline
            pipeline = self._load_pipeline(model_name, model_path)
            
            # Set up generator for reproducibility
            generator = None
            if seed is not None:
                generator = torch.Generator(device=self.device).manual_seed(seed)
            
            logger.info(f"Generating {num_outputs} image(s) with prompt: '{prompt[:50]}...'")
            
            # Generate images
            images = []
            for i in range(num_outputs):
                # Use a different seed for each image if seed is provided
                current_generator = generator
                if seed is not None and i > 0:
                    current_generator = torch.Generator(device=self.device).manual_seed(seed + i)
                
                result = pipeline(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    width=width,
                    height=height,
                    num_inference_steps=num_inference_steps,
                    guidance_scale=guidance_scale,
                    generator=current_generator,
                )
                
                images.append(result.images[0])
                logger.info(f"Generated image {i+1}/{num_outputs}")
            
            return images
            
        except Exception as e:
            logger.error(f"Image generation failed: {e}", exc_info=True)
            raise
    
    def cleanup(self):
        """Clean up resources."""
        if self.current_pipeline is not None:
            del self.current_pipeline
            self.current_pipeline = None
            self.current_model_name = None
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            logger.info("AI Generator cleaned up")


# Global instance
_generator = None


def get_ai_generator() -> AIImageGenerator:
    """Get or create the global AI generator instance."""
    global _generator
    if _generator is None:
        _generator = AIImageGenerator()
    return _generator
