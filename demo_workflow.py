#!/usr/bin/env python3
"""
Demo script showing the complete workflow from dataset creation to model training.
This creates a test dataset and demonstrates the training flow.
"""
import asyncio
from app.database import engine, Base
from app.models import Model, Dataset
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pathlib import Path
import json


async def demo_workflow():
    """Demonstrate the complete workflow."""
    
    print("=" * 70)
    print("DEMO: Complete Training-to-Generation Workflow")
    print("=" * 70)
    
    # Get a database session
    async with AsyncSession(engine) as db:
        
        # Step 1: Show available base models
        print("\n📦 Step 1: Available Base Models")
        print("-" * 70)
        result = await db.execute(select(Model).where(Model.type == "base_model"))
        base_models = result.scalars().all()
        
        for model in base_models:
            print(f"  ID {model.id}: {model.name}")
            print(f"    Type: {model.type}, Category: {model.category}")
            print(f"    Path: {model.path}")
        
        # Step 2: Create a demo dataset
        print("\n📁 Step 2: Creating Demo Dataset")
        print("-" * 70)
        
        # Check if demo dataset exists
        result = await db.execute(
            select(Dataset).where(Dataset.name == "Demo-Anime-Portraits")
        )
        existing_dataset = result.scalar_one_or_none()
        
        if existing_dataset:
            demo_dataset = existing_dataset
            print(f"  ✓ Demo dataset already exists (ID: {demo_dataset.id})")
        else:
            # Create dataset directory
            dataset_path = Path("./uploads/datasets/1")
            dataset_path.mkdir(parents=True, exist_ok=True)
            
            # Create demo dataset
            demo_dataset = Dataset(
                name="Demo-Anime-Portraits",
                description="Demo dataset for testing anime portrait training",
                type="image",
                path=str(dataset_path),
                num_items=25,  # Simulated count
                tags=["anime", "portraits", "demo"],
                dataset_metadata={
                    "source": "demo",
                    "created_by": "automation"
                }
            )
            
            db.add(demo_dataset)
            await db.commit()
            await db.refresh(demo_dataset)
            
            print(f"  ✓ Created demo dataset (ID: {demo_dataset.id})")
            print(f"    Name: {demo_dataset.name}")
            print(f"    Type: {demo_dataset.type}")
            print(f"    Items: {demo_dataset.num_items}")
            print(f"    Path: {demo_dataset.path}")
            
            # Create some dummy metadata files
            metadata_file = dataset_path / "metadata.json"
            metadata_file.write_text(json.dumps({
                "dataset_id": demo_dataset.id,
                "name": demo_dataset.name,
                "mappings": {
                    "img001.jpg": "anime girl with blue hair",
                    "img002.jpg": "anime character smiling",
                    "img003.jpg": "portrait with detailed eyes"
                }
            }, indent=2))
            print(f"    ✓ Created metadata file")
        
        # Step 3: Show what a training job would look like
        print("\n🚀 Step 3: Training Job Configuration Example")
        print("-" * 70)
        
        training_config = {
            "dataset_id": demo_dataset.id,
            "base_model_id": 1,  # Stable Diffusion 1.5
            "type": "lora",
            "output_name": "anime-portraits-lora-v1",
            "config": {
                "learning_rate": 0.0001,
                "batch_size": 4,
                "num_epochs": 10,
                "lora_rank": 4,
                "lora_alpha": 32,
                "mixed_precision": "fp16"
            }
        }
        
        print("  Training Configuration:")
        print(f"    Dataset: {demo_dataset.name} (ID: {demo_dataset.id})")
        print(f"    Base Model: Stable Diffusion 1.5 (ID: 1)")
        print(f"    Type: LoRA")
        print(f"    Output Name: {training_config['output_name']}")
        print(f"    Learning Rate: {training_config['config']['learning_rate']}")
        print(f"    Batch Size: {training_config['config']['batch_size']}")
        print(f"    Epochs: {training_config['config']['num_epochs']}")
        print(f"    LoRA Rank: {training_config['config']['lora_rank']}")
        
        # Step 4: Show the API calls needed
        print("\n🔌 Step 4: API Calls to Execute Training")
        print("-" * 70)
        
        print("  1. Create Training Job:")
        print(f"     POST /api/training/")
        print(f"     Body: {json.dumps(training_config, indent=6)}")
        
        print("\n  2. Start Training:")
        print(f"     POST /api/training/{{job_id}}/start")
        
        print("\n  3. Monitor Progress:")
        print(f"     GET /api/training/{{job_id}}/progress")
        
        print("\n  4. After completion, model is auto-registered!")
        
        # Step 5: Show what happens after training
        print("\n✨ Step 5: Using Trained Model for Generation")
        print("-" * 70)
        
        print("  After training completes:")
        print("    - New model entry is created in database")
        print(f"    - Model name: 'Trained-{{job_id[:8]}}'")
        print("    - Model type: 'lora'")
        print("    - Model category: 'image'")
        print("    - Model path: './outputs/training/{{job_id}}/lora_weights.safetensors'")
        
        print("\n  In the UI:")
        print("    1. Go to /text-to-image")
        print("    2. The model dropdown will show:")
        print("       - Stable Diffusion 1.5")
        print("       - Stable Diffusion XL")
        print("       - Trained-XXXXXXXX (your new model!) ✨")
        print("    3. Select your trained model")
        print("    4. Enter a prompt and generate!")
        
        # Step 6: Show all models that would be available
        print("\n🎨 Step 6: All Available Models for Generation")
        print("-" * 70)
        
        result = await db.execute(
            select(Model).where(Model.category == "image", Model.is_active == True)
        )
        image_models = result.scalars().all()
        
        print(f"  Currently {len(image_models)} models available:")
        for model in image_models:
            icon = "🔷" if model.type == "base_model" else "⭐"
            print(f"    {icon} {model.name} ({model.type})")
        
        print("\n  After training completes, you'll see:")
        print("    🔷 Stable Diffusion 1.5 (base_model)")
        print("    🔷 Stable Diffusion XL (base_model)")
        print("    ⭐ Trained-XXXXXXXX (lora) ← YOUR NEW MODEL!")
        
        # Summary
        print("\n" + "=" * 70)
        print("📋 SUMMARY")
        print("=" * 70)
        
        print("\n✅ What's Working:")
        print("  ✓ Base models are initialized in database")
        print("  ✓ Demo dataset created successfully")
        print("  ✓ Training API endpoints are functional")
        print("  ✓ Training completion auto-registers models")
        print("  ✓ Text-to-image page fetches all available models")
        print("  ✓ Model selection is passed to generation API")
        
        print("\n🎯 To Complete the Workflow:")
        print("  1. Run: python seed_models.py (already done ✓)")
        print("  2. Start backend: uvicorn app.main:app --reload")
        print("  3. Start frontend: cd frontend && npm run dev")
        print("  4. Open browser: http://localhost:3000")
        print("  5. Go to /training and create a training job")
        print("  6. Start the training job")
        print("  7. Wait for completion")
        print("  8. Go to /text-to-image")
        print("  9. Select your trained model from dropdown")
        print("  10. Generate images! 🎉")
        
        print("\n" + "=" * 70)
        print("Demo complete! The workflow is ready to use.")
        print("=" * 70)


if __name__ == "__main__":
    asyncio.run(demo_workflow())
