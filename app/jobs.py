import asyncio
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from uuid import uuid4

from .config import get_settings
from .schemas import JobOutput, JobState, JobStatus, JobType, TextToImageRequest


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

    def create_text_to_image_job(self, payload: TextToImageRequest) -> JobState:
        job_id = str(uuid4())
        now = datetime.utcnow()
        job = JobState(
            id=job_id,
            type=JobType.text_to_image,
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
        for idx in range(num_outputs):
            outfile = self.output_dir / f"{job.id}-{idx + 1}.txt"
            content = (
                f"Mock image for job {job.id}\n"
                f"prompt: {params.get('prompt')}\n"
                f"negative_prompt: {params.get('negative_prompt')}\n"
                f"model: {params.get('model')}\n"
                f"cfg_scale: {params.get('cfg_scale')}, steps: {params.get('steps')}\n"
                f"size: {params.get('width')}x{params.get('height')}\n"
            )
            outfile.write_text(content, encoding="utf-8")
            await asyncio.sleep(self.delay)
            outputs.append(JobOutput(index=idx, path=str(outfile)))
            job.progress = (idx + 1) / num_outputs
            job.updated_at = datetime.utcnow()
        job.outputs = outputs


def build_job_queue() -> JobQueue:
    settings = get_settings()
    return JobQueue(
        output_dir=settings.output_dir,
        max_parallel_jobs=settings.max_parallel_jobs,
        delay=settings.mock_generation_delay,
    )
