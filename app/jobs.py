import asyncio
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from uuid import uuid4

from .config import get_settings
from .schemas import (
    ImageToImageRequest,
    ImageToVideoRequest,
    InpaintingRequest,
    JobOutput,
    JobState,
    JobStatus,
    JobType,
    TextToImageRequest,
    TextToVideoRequest,
    UpscaleRequest,
)

logger = logging.getLogger(__name__)


class JobQueue:
    def __init__(self, output_dir: Path, max_parallel_jobs: int = 1, delay: float = 0.5):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.max_parallel_jobs = max(1, max_parallel_jobs)
        self.delay = delay

        self.jobs: Dict[str, JobState] = {}
        self.queue: asyncio.Queue[str] = asyncio.Queue()
        self.workers: List[asyncio.Task] = []
        self._started = False

    def start(self) -> None:
        if self._started:
            return
        for _ in range(self.max_parallel_jobs):
            self.workers.append(asyncio.create_task(self._worker()))
        self._started = True

    def _create_job(self, job_type: JobType, payload) -> JobState:
        """Common job creation logic."""
        job_id = str(uuid4())
        now = datetime.utcnow()
        job = JobState(
            id=job_id,
            type=job_type,
            status=JobStatus.pending,
            created_at=now,
            updated_at=now,
            progress=0.0,
            params=payload.dict(),
            outputs=[],
            logs=[],
            error=None,
        )
        self.jobs[job_id] = job
        self.queue.put_nowait(job_id)
        return job

    def create_text_to_image_job(self, payload: TextToImageRequest) -> JobState:
        return self._create_job(JobType.text_to_image, payload)

    def create_text_to_video_job(self, payload: TextToVideoRequest) -> JobState:
        return self._create_job(JobType.text_to_video, payload)

    def create_image_to_video_job(self, payload: ImageToVideoRequest) -> JobState:
        return self._create_job(JobType.image_to_video, payload)

    def create_image_to_image_job(self, payload: ImageToImageRequest) -> JobState:
        return self._create_job(JobType.image_to_image, payload)

    def create_inpainting_job(self, payload: InpaintingRequest) -> JobState:
        return self._create_job(JobType.inpainting, payload)

    def create_upscale_job(self, payload: UpscaleRequest) -> JobState:
        return self._create_job(JobType.upscale, payload)

    def get_job(self, job_id: str) -> Optional[JobState]:
        return self.jobs.get(job_id)

    async def _worker(self) -> None:
        while True:
            job_id = await self.queue.get()
            job = self.jobs.get(job_id)
            if not job:
                self.queue.task_done()
                continue
            job.status = JobStatus.running
            job.updated_at = datetime.utcnow()
            try:
                if job.type == JobType.text_to_image:
                    await self._run_text_to_image(job)
                elif job.type == JobType.text_to_video:
                    await self._run_text_to_video(job)
                elif job.type == JobType.image_to_video:
                    await self._run_image_to_video(job)
                elif job.type == JobType.image_to_image:
                    await self._run_image_to_image(job)
                elif job.type == JobType.inpainting:
                    await self._run_inpainting(job)
                elif job.type == JobType.upscale:
                    await self._run_upscale(job)
                job.status = JobStatus.done
                job.progress = 1.0
            except Exception as exc:  # pragma: no cover - defensive
                job.status = JobStatus.failed
                job.error = str(exc)
            finally:
                job.updated_at = datetime.utcnow()
                self.queue.task_done()

    async def _run_text_to_image(self, job: JobState) -> None:
        params = job.params
        num_outputs = params.get("num_outputs", 1)
        outputs: List[JobOutput] = []
        
        # Try to use real AI generation if available
        try:
            from .ai_generator import get_ai_generator, check_ai_available, MODEL_MAPPING, DEFAULT_MODEL
            
            if check_ai_available():
                logger.info(f"Using real AI generation for job {job.id}")
                
                # Get the AI generator
                generator = get_ai_generator()
                
                # Get model name from params
                model_name = params.get('model', 'stable-diffusion-1.5')
                
                # Map to HuggingFace model path
                model_path = MODEL_MAPPING.get(model_name, None)
                
                # Check if it's a trained model (starts with "Trained-")
                if model_name.startswith('Trained-'):
                    # For trained models, we'd load from the path in the database
                    # For now, we'll use the base model as a fallback
                    logger.warning(f"Trained model {model_name} requested, using base model as fallback")
                    model_path = DEFAULT_MODEL
                elif model_path is None:
                    # Unknown model, use default
                    logger.warning(f"Unknown model {model_name}, using default {DEFAULT_MODEL}")
                    model_path = DEFAULT_MODEL
                
                # Generate images using real AI
                images = generator.generate_images(
                    prompt=params.get('prompt', ''),
                    negative_prompt=params.get('negative_prompt'),
                    model_path=model_path,
                    num_outputs=num_outputs,
                    width=params.get('width', 512),
                    height=params.get('height', 512),
                    num_inference_steps=params.get('steps', 30),
                    guidance_scale=params.get('cfg_scale', 7.5),
                    scheduler=params.get('scheduler', 'ddim'),
                    seed=params.get('seed'),
                )
                
                # Save generated images
                for idx, image in enumerate(images):
                    outfile = self.output_dir / f"{job.id}-{idx + 1}.png"
                    image.save(outfile)
                    
                    # Convert to relative URL path
                    relative_path = f"/outputs/{outfile.name}"
                    
                    outputs.append(JobOutput(index=idx, path=relative_path))
                    job.progress = (idx + 1) / num_outputs
                    job.updated_at = datetime.utcnow()
                
                job.outputs = outputs
                logger.info(f"Real AI generation completed for job {job.id}")
                return
                
        except ImportError as e:
            logger.warning(f"AI libraries not available, falling back to placeholder: {e}")
        except Exception as e:
            logger.error(f"AI generation failed, falling back to placeholder: {e}")
        
        # Fallback to placeholder generation if AI is not available
        logger.info(f"Using placeholder generation for job {job.id}")
        
        from PIL import Image, ImageDraw, ImageFont
        import random
        
        for idx in range(num_outputs):
            outfile = self.output_dir / f"{job.id}-{idx + 1}.png"
            
            # Create a simple image
            width = params.get('width', 768)
            height = params.get('height', 768)
            
            # Generate random gradient-like background
            color1 = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
            color2 = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
            
            img = Image.new('RGB', (width, height), color1)
            draw = ImageDraw.Draw(img)
            
            # Draw some shapes
            for _ in range(10):
                x = random.randint(0, width)
                y = random.randint(0, height)
                r = random.randint(20, 100)
                draw.ellipse((x-r, y-r, x+r, y+r), fill=color2, outline=None)
            
            # Add text
            try:
                # Try to load a default font, otherwise use default
                font = ImageFont.load_default()
            except:
                font = None
                
            text = f"AI Not Available - Placeholder\nPrompt: {params.get('prompt')[:30]}...\nModel: {params.get('model', 'Unknown')}\nSize: {width}x{height}"
            draw.text((20, 20), text, fill=(255, 255, 255), font=font)
            
            # Save image
            img.save(outfile)
            
            # Convert absolute path to relative URL path for frontend
            relative_path = f"/outputs/{outfile.name}"
            
            await asyncio.sleep(self.delay)
            outputs.append(JobOutput(index=idx, path=relative_path))
            job.progress = (idx + 1) / num_outputs
            job.updated_at = datetime.utcnow()
        job.outputs = outputs

    async def _run_text_to_video(self, job: JobState) -> None:
        params = job.params
        outfile = self.output_dir / f"{job.id}-video.txt"
        content = (
            f"Mock video for job {job.id}\n"
            f"Type: Text-to-Video\n"
            f"prompt: {params.get('prompt')}\n"
            f"duration: {params.get('duration')}s at {params.get('fps')} fps\n"
            f"model: {params.get('model')}\n"
            f"style_preset: {params.get('style_preset')}\n"
            f"camera_movement: {params.get('camera_movement')}\n"
            f"motion_intensity: {params.get('motion_intensity')}\n"
            f"size: {params.get('width')}x{params.get('height')}\n"
        )
        outfile.write_text(content, encoding="utf-8")
        await asyncio.sleep(self.delay * 3)  # Videos take longer
        job.outputs = [JobOutput(index=0, path=str(outfile))]
        job.progress = 1.0

    async def _run_image_to_video(self, job: JobState) -> None:
        params = job.params
        outfile = self.output_dir / f"{job.id}-video.txt"
        content = (
            f"Mock video for job {job.id}\n"
            f"Type: Image-to-Video\n"
            f"input_image: {params.get('image_path')}\n"
            f"prompt: {params.get('prompt')}\n"
            f"duration: {params.get('duration')}s at {params.get('fps')} fps\n"
            f"camera_movement: {params.get('camera_movement')}\n"
            f"motion_intensity: {params.get('motion_intensity')}\n"
        )
        outfile.write_text(content, encoding="utf-8")
        await asyncio.sleep(self.delay * 3)
        job.outputs = [JobOutput(index=0, path=str(outfile))]
        job.progress = 1.0

    async def _run_image_to_image(self, job: JobState) -> None:
        params = job.params
        outfile = self.output_dir / f"{job.id}-img.txt"
        content = (
            f"Mock image for job {job.id}\n"
            f"Type: Image-to-Image\n"
            f"input_image: {params.get('image_path')}\n"
            f"prompt: {params.get('prompt')}\n"
            f"strength: {params.get('strength')}\n"
            f"style_preset: {params.get('style_preset')}\n"
        )
        outfile.write_text(content, encoding="utf-8")
        await asyncio.sleep(self.delay)
        job.outputs = [JobOutput(index=0, path=str(outfile))]
        job.progress = 1.0

    async def _run_inpainting(self, job: JobState) -> None:
        params = job.params
        outfile = self.output_dir / f"{job.id}-inpaint.txt"
        content = (
            f"Mock inpainted image for job {job.id}\n"
            f"Type: Inpainting\n"
            f"input_image: {params.get('image_path')}\n"
            f"mask: {params.get('mask_path')}\n"
            f"prompt: {params.get('prompt')}\n"
        )
        outfile.write_text(content, encoding="utf-8")
        await asyncio.sleep(self.delay)
        job.outputs = [JobOutput(index=0, path=str(outfile))]
        job.progress = 1.0

    async def _run_upscale(self, job: JobState) -> None:
        params = job.params
        outfile = self.output_dir / f"{job.id}-upscaled.txt"
        content = (
            f"Mock upscaled image for job {job.id}\n"
            f"Type: Upscale\n"
            f"input_image: {params.get('image_path')}\n"
            f"scale_factor: {params.get('scale_factor')}x\n"
            f"model: {params.get('model')}\n"
        )
        outfile.write_text(content, encoding="utf-8")
        await asyncio.sleep(self.delay * 2)
        job.outputs = [JobOutput(index=0, path=str(outfile))]
        job.progress = 1.0


def build_job_queue() -> JobQueue:
    settings = get_settings()
    return JobQueue(
        output_dir=settings.output_dir,
        max_parallel_jobs=settings.max_parallel_jobs,
        delay=settings.mock_generation_delay,
    )
