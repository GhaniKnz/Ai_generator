#!/usr/bin/env python3
"""
Seed script to populate the database with initial models and datasets.
"""
import asyncio
from app.database import AsyncSessionLocal, init_db
from app.models import Model, Dataset
from sqlalchemy import select


async def seed_database():
    """Add initial models and datasets to the database."""
    print("🌱 Seeding database...")
    
    # Initialize database tables
    await init_db()
    
    async with AsyncSessionLocal() as db:
        # Check if models already exist
        result = await db.execute(select(Model))
        existing_models = result.scalars().all()
        
        if len(existing_models) == 0:
            print("Adding base models...")
            
            # Add base models
            models_to_add = [
                Model(
                    name="stable-diffusion-1.5",
                    type="base_model",
                    category="image",
                    path="/models/stable-diffusion-v1-5",
                    description="Stable Diffusion 1.5 base model for text-to-image generation",
                    is_active=True,
                    version="1.5"
                ),
                Model(
                    name="stable-diffusion-xl",
                    type="base_model",
                    category="image",
                    path="/models/stable-diffusion-xl-base-1.0",
                    description="Stable Diffusion XL for higher quality image generation",
                    is_active=True,
                    version="1.0"
                ),
                Model(
                    name="stable-video-diffusion",
                    type="base_model",
                    category="video",
                    path="/models/stable-video-diffusion-img2vid-xt",
                    description="Stable Video Diffusion model for video generation",
                    is_active=True,
                    version="1.0"
                ),
            ]
            
            for model in models_to_add:
                db.add(model)
            
            await db.commit()
            print(f"✓ Added {len(models_to_add)} base models")
        else:
            print(f"✓ Database already has {len(existing_models)} models")
        
        # Check if datasets already exist
        result = await db.execute(select(Dataset))
        existing_datasets = result.scalars().all()
        
        if len(existing_datasets) == 0:
            print("Adding sample datasets...")
            
            # Add sample datasets
            datasets_to_add = [
                Dataset(
                    name="sample-images",
                    type="image",
                    path="./uploads/image",
                    description="Sample image dataset for testing",
                    num_items=0,
                    is_public=True
                ),
            ]
            
            for dataset in datasets_to_add:
                db.add(dataset)
            
            await db.commit()
            print(f"✓ Added {len(datasets_to_add)} datasets")
        else:
            print(f"✓ Database already has {len(existing_datasets)} datasets")
        
        print("\n✅ Database seeding complete!")
        
        # Print summary
        result = await db.execute(select(Model))
        all_models = result.scalars().all()
        print(f"\nTotal models in database: {len(all_models)}")
        for model in all_models:
            print(f"  - {model.name} ({model.type}, {model.category})")
        
        result = await db.execute(select(Dataset))
        all_datasets = result.scalars().all()
        print(f"\nTotal datasets in database: {len(all_datasets)}")
        for dataset in all_datasets:
            print(f"  - {dataset.name} ({dataset.type})")


if __name__ == "__main__":
    asyncio.run(seed_database())
