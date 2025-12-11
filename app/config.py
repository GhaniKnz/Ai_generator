from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AI Generator API"
    api_prefix: str = "/api"
    output_dir: Path = Field(default=Path("outputs"))
    max_parallel_jobs: int = 1
    mock_generation_delay: float = 0.5
    
    # AI Generation Settings
    use_real_ai: bool = Field(default=True, description="Use real AI models instead of mock generation")
    models_cache_dir: str = Field(default="./models_cache", description="Directory to cache downloaded models")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
