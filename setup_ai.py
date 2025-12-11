#!/usr/bin/env python3
"""
Installation script for AI models and dependencies.
Run this after installing requirements.txt to verify the AI setup.
"""
import sys
import subprocess


def check_torch():
    """Check if PyTorch is installed and detect GPU."""
    print("🔍 Checking PyTorch installation...")
    try:
        import torch
        print(f"✅ PyTorch version: {torch.__version__}")
        
        if torch.cuda.is_available():
            print(f"✅ CUDA available: {torch.cuda.get_device_name(0)}")
            print(f"   CUDA version: {torch.version.cuda}")
            print(f"   GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
            return "cuda"
        else:
            print("⚠️  GPU not detected. Will use CPU (slower generation)")
            return "cpu"
    except ImportError:
        print("❌ PyTorch not installed")
        print("\nInstall with:")
        print("  GPU: pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118")
        print("  CPU: pip install torch torchvision")
        return None


def check_diffusers():
    """Check if diffusers is installed."""
    print("\n🔍 Checking Diffusers library...")
    try:
        import diffusers
        print(f"✅ Diffusers version: {diffusers.__version__}")
        return True
    except ImportError:
        print("❌ Diffusers not installed")
        print("\nInstall with: pip install diffusers transformers accelerate")
        return False


def check_other_deps():
    """Check other required dependencies."""
    print("\n🔍 Checking other dependencies...")
    deps = {
        "transformers": "Transformers",
        "accelerate": "Accelerate",
        "PIL": "Pillow",
        "compel": "Compel",
    }
    
    all_ok = True
    for module, name in deps.items():
        try:
            __import__(module)
            print(f"✅ {name} installed")
        except ImportError:
            print(f"❌ {name} not installed")
            all_ok = False
    
    return all_ok


def test_model_download():
    """Test downloading a small model."""
    print("\n🔍 Testing model download (this may take a few minutes)...")
    print("   Downloading a small test model to verify Hugging Face access...")
    
    try:
        from diffusers import DiffusionPipeline
        import torch
        
        # Use a very small model for testing
        model_id = "hf-internal-testing/tiny-stable-diffusion-torch"
        
        print(f"   Downloading: {model_id}")
        pipe = DiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float32,
        )
        print("✅ Model download successful!")
        print("   Hugging Face access is working correctly")
        
        del pipe
        return True
        
    except Exception as e:
        print(f"⚠️  Model download test failed: {e}")
        print("   This is OK - models will download on first use")
        return False


def estimate_requirements(device):
    """Estimate system requirements."""
    print("\n📊 System Requirements:")
    
    if device == "cuda":
        print("✅ GPU Mode (Recommended)")
        print("   - Expected speed: 5-15 seconds per image")
        print("   - RAM needed: 8-16 GB")
        print("   - Disk space: ~10 GB for models")
        print("   - First generation: 10-30 min (one-time model download)")
    else:
        print("⚠️  CPU Mode (Slower)")
        print("   - Expected speed: 2-5 minutes per image")
        print("   - RAM needed: 8-16 GB")
        print("   - Disk space: ~10 GB for models")
        print("   - First generation: 10-30 min (one-time model download)")
        print("\n   💡 Consider using a GPU for better performance")


def main():
    """Run all checks."""
    print("="*60)
    print("AI Generator - Installation Verification")
    print("="*60)
    
    # Check PyTorch
    device = check_torch()
    if device is None:
        print("\n❌ PyTorch is required. Please install it first.")
        sys.exit(1)
    
    # Check Diffusers
    if not check_diffusers():
        print("\n❌ Diffusers is required. Please install it first.")
        sys.exit(1)
    
    # Check other dependencies
    if not check_other_deps():
        print("\n⚠️  Some dependencies are missing. Install with:")
        print("   pip install -r requirements.txt")
    
    # Test model download (optional)
    print("\nWould you like to test model downloading? (y/n)")
    print("This will download a small test model (~100 MB)")
    response = input("> ").lower().strip()
    
    if response in ['y', 'yes']:
        test_model_download()
    
    # Show requirements
    estimate_requirements(device)
    
    print("\n" + "="*60)
    print("✅ Setup verification complete!")
    print("="*60)
    print("\nNext steps:")
    print("1. Start the backend: uvicorn app.main:app --reload --port 8000")
    print("2. Start the frontend: cd frontend && npm run dev")
    print("3. Go to http://localhost:3000/text-to-image")
    print("4. Try generating an image!")
    print("\n💡 First generation will download models (~4-5 GB)")
    print("   Subsequent generations will be much faster.")
    print("\n📖 See ACTIVATION_MODE_IA.md for detailed usage guide")


if __name__ == "__main__":
    main()
