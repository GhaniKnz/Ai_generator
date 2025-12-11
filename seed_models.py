"""
Seed script to populate the database with initial base models.
Run this script to add base models for training.
"""
import asyncio
from app.database import engine, Base
from app.models import Model, Dataset
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


async def seed_base_models():
    """Add base models to the database."""
    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Get a database session
    async with AsyncSession(engine) as db:
        # Check if models already exist
        result = await db.execute(select(Model))
        existing_models = result.scalars().all()
        
        if existing_models:
            print(f"Database already has {len(existing_models)} models")
            for model in existing_models:
                print(f"  - {model.name} (ID: {model.id}, Type: {model.type})")
        else:
            print("Seeding base models...")
            
            # Create base models
            base_models = [
                Model(
                    name="Stable Diffusion 1.5",
                    type="base_model",
                    category="image",
                    path="stabilityai/stable-diffusion-1-5",
                    description="Stable Diffusion v1.5 - Base model for image generation",
                    config={"resolution": 512},
                    is_active=True,
                    version="1.5"
                ),
                Model(
                    name="Stable Diffusion XL",
                    type="base_model",
                    category="image",
                    path="stabilityai/stable-diffusion-xl-base-1.0",
                    description="Stable Diffusion XL - High resolution base model",
                    config={"resolution": 1024},
                    is_active=True,
                    version="1.0"
                ),
                Model(
                    name="Stable Video Diffusion",
                    type="base_model",
                    category="video",
                    path="stabilityai/stable-video-diffusion-img2vid",
                    description="Stable Video Diffusion - Image to video model",
                    config={"fps": 24, "duration": 3},
                    is_active=True,
                    version="1.0"
                ),
            ]
            
            for model in base_models:
                db.add(model)
            
            await db.commit()
            print(f"✓ Added {len(base_models)} base models")
            
            # Refresh to get IDs
            for model in base_models:
                await db.refresh(model)
                print(f"  - {model.name} (ID: {model.id})")
        
        # Check datasets
        result = await db.execute(select(Dataset))
        existing_datasets = result.scalars().all()
        
        if existing_datasets:
            print(f"\nDatabase has {len(existing_datasets)} datasets")
            for dataset in existing_datasets:
                print(f"  - {dataset.name} (ID: {dataset.id}, Items: {dataset.num_items})")
        else:
            print("\nNo datasets found. Create datasets via the web UI at /datasets")
        
        print("\n✓ Database initialization complete!")
        print("\nNext steps:")
        print("1. Create a dataset via the web UI at /datasets")
        print("2. Upload images to your dataset")
        print("3. Start a training job at /training")
        print("4. Once training completes, the trained model will appear in /text-to-image")


if __name__ == "__main__":
    asyncio.run(seed_base_models())
