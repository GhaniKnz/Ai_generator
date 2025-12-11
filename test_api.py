#!/usr/bin/env python3
"""
Quick test script to verify the API endpoints work correctly.
"""
import asyncio
import httpx
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_models_endpoint():
    """Test that we can fetch models."""
    print("Testing GET /api/models/ ...")
    response = client.get("/api/models/")
    print(f"  Status: {response.status_code}")
    
    if response.status_code == 200:
        models = response.json()
        print(f"  ✓ Found {len(models)} models")
        for model in models:
            print(f"    - {model['name']} (ID: {model['id']}, Type: {model['type']})")
        return True
    else:
        print(f"  ✗ Error: {response.text}")
        return False

def test_models_image_filter():
    """Test that we can filter models by category."""
    print("\nTesting GET /api/models/?category=image ...")
    response = client.get("/api/models/?category=image")
    print(f"  Status: {response.status_code}")
    
    if response.status_code == 200:
        models = response.json()
        print(f"  ✓ Found {len(models)} image models")
        for model in models:
            print(f"    - {model['name']} (Category: {model['category']})")
        return True
    else:
        print(f"  ✗ Error: {response.text}")
        return False

def test_datasets_endpoint():
    """Test datasets endpoint."""
    print("\nTesting GET /api/datasets/ ...")
    response = client.get("/api/datasets/")
    print(f"  Status: {response.status_code}")
    
    if response.status_code == 200:
        datasets = response.json()
        print(f"  ✓ Found {len(datasets)} datasets")
        if datasets:
            for dataset in datasets:
                print(f"    - {dataset['name']} (ID: {dataset['id']}, Items: {dataset['num_items']})")
        else:
            print("    (No datasets yet - create one via the UI)")
        return True
    else:
        print(f"  ✗ Error: {response.text}")
        return False

def test_text_to_image_endpoint():
    """Test text-to-image generation endpoint."""
    print("\nTesting POST /api/generate/text-to-image ...")
    response = client.post(
        "/api/generate/text-to-image",
        json={
            "prompt": "a beautiful sunset over mountains",
            "num_outputs": 1,
            "width": 512,
            "height": 512,
            "cfg_scale": 7.5,
            "steps": 30,
            "model": "stable-diffusion-1.5"
        }
    )
    print(f"  Status: {response.status_code}")
    
    if response.status_code == 200:
        job = response.json()
        print(f"  ✓ Job created: {job['id']}")
        print(f"    Status: {job['status']}")
        print(f"    Type: {job['type']}")
        return True
    else:
        print(f"  ✗ Error: {response.text}")
        return False

def main():
    print("=" * 60)
    print("API Integration Test")
    print("=" * 60)
    
    results = []
    
    results.append(("Models endpoint", test_models_endpoint()))
    results.append(("Models filter endpoint", test_models_image_filter()))
    results.append(("Datasets endpoint", test_datasets_endpoint()))
    results.append(("Text-to-image endpoint", test_text_to_image_endpoint()))
    
    print("\n" + "=" * 60)
    print("Test Results")
    print("=" * 60)
    
    for name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {name}")
    
    all_passed = all(r[1] for r in results)
    
    if all_passed:
        print("\n✓ All tests passed!")
        print("\nNext steps:")
        print("1. Start the backend: uvicorn app.main:app --reload")
        print("2. Start the frontend: cd frontend && npm run dev")
        print("3. Open http://localhost:3000/training")
        print("4. Create a dataset and start training!")
    else:
        print("\n✗ Some tests failed. Please check the errors above.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
