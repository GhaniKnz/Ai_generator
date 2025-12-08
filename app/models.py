"""Database models for AI Generator."""
from datetime import datetime
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    """User model for authentication."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    jobs = relationship("Job", back_populates="user", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")


class Job(Base):
    """Job model for tracking generation tasks."""

    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)  # text_to_image, text_to_video, etc.
    status = Column(String(20), nullable=False, default="pending")
    progress = Column(Float, default=0.0)
    params = Column(JSON, nullable=False)
    outputs = Column(JSON, default=list)
    logs = Column(JSON, default=list)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="jobs")


class Model(Base):
    """Model registry for AI models and LoRA."""

    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    type = Column(String(50), nullable=False)  # base_model, lora, vae, etc.
    category = Column(String(50), nullable=False)  # image, video, audio
    path = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    config = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    version = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Asset(Base):
    """Asset model for storing generated images/videos."""

    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=True)
    type = Column(String(20), nullable=False)  # image, video, audio
    path = Column(String(500), nullable=False)
    thumbnail_path = Column(String(500), nullable=True)
    prompt = Column(Text, nullable=True)
    asset_metadata = Column(JSON, default=dict)  # Renamed from metadata
    tags = Column(JSON, default=list)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    duration = Column(Float, nullable=True)  # for videos
    file_size = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="assets")


class Project(Base):
    """Project model for organizing work."""

    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    graph_data = Column(JSON, nullable=True)  # For Lab mode node graphs
    assets = Column(JSON, default=list)  # Asset IDs
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="projects")


class Dataset(Base):
    """Dataset model for training data management."""

    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String(50), nullable=False)  # image, video, mixed
    path = Column(String(500), nullable=False)
    num_items = Column(Integer, default=0)
    dataset_metadata = Column(JSON, default=dict)  # Renamed from metadata
    tags = Column(JSON, default=list)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)



class TrainingJob(Base):
    """Training job model for fine-tuning/LoRA training."""

    __tablename__ = "training_jobs"

    id = Column(String(36), primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    base_model_id = Column(Integer, ForeignKey("models.id"), nullable=False)
    type = Column(String(50), nullable=False)  # lora, dreambooth, full
    status = Column(String(20), nullable=False, default="pending")
    progress = Column(Float, default=0.0)
    config = Column(JSON, nullable=False)
    output_path = Column(String(500), nullable=True)
    logs = Column(JSON, default=list)
    metrics = Column(JSON, default=dict)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
