#!/usr/bin/env python3
"""
Setup script to install AI dependencies for real image generation.

This script helps install PyTorch and related libraries with the appropriate
configuration (CPU vs GPU).
"""
import sys
import subprocess
import platform


def check_nvidia_gpu():
    """Check if NVIDIA GPU is available."""
    try:
        result = subprocess.run(
            ["nvidia-smi"], 
            capture_output=True, 
            text=True, 
            timeout=5
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def install_ai_dependencies():
    """Install AI dependencies with appropriate configuration."""
    print("=" * 70)
    print("AI Generator - Dependencies Installation")
    print("=" * 70)
    
    # Check for GPU
    has_gpu = check_nvidia_gpu()
    
    if has_gpu:
        print("\n✓ NVIDIA GPU detected!")
        print("Installing PyTorch with CUDA support...")
        install_type = "gpu"
    else:
        print("\n⚠ No NVIDIA GPU detected")
        print("Installing PyTorch for CPU (will be slower)...")
        install_type = "cpu"
    
    # Ask user for confirmation
    response = input(f"\nProceed with {install_type.upper()} installation? (y/n): ")
    if response.lower() != 'y':
        print("Installation cancelled.")
        return
    
    print("\n" + "=" * 70)
    print("Installing dependencies...")
    print("=" * 70)
    
    try:
        if install_type == "gpu":
            # Install PyTorch with CUDA
            print("\n1. Installing PyTorch with CUDA support...")
            subprocess.run([
                sys.executable, "-m", "pip", "install", 
                "torch", "torchvision", "--index-url", 
                "https://download.pytorch.org/whl/cu118"
            ], check=True)
        else:
            # Install PyTorch for CPU
            print("\n1. Installing PyTorch (CPU version)...")
            subprocess.run([
                sys.executable, "-m", "pip", "install", 
                "torch", "torchvision", "--index-url", 
                "https://download.pytorch.org/whl/cpu"
            ], check=True)
        
        # Install other AI libraries
        print("\n2. Installing Diffusers and dependencies...")
        subprocess.run([
            sys.executable, "-m", "pip", "install",
            "diffusers>=0.25.0",
            "transformers>=4.35.0",
            "accelerate>=0.25.0",
            "safetensors>=0.4.0",
        ], check=True)
        
        print("\n3. Installing optional dependencies...")
        subprocess.run([
            sys.executable, "-m", "pip", "install",
            "peft>=0.7.0",
            "compel>=2.0.0",
        ], check=True)
        
        print("\n" + "=" * 70)
        print("✓ Installation completed successfully!")
        print("=" * 70)
        
        # Test the installation
        print("\nTesting installation...")
        test_import()
        
        print("\n" + "=" * 70)
        print("Next steps:")
        print("=" * 70)
        print("1. Start the backend: uvicorn app.main:app --reload")
        print("2. Go to http://localhost:3000/text-to-image")
        print("3. Enter a prompt and generate real AI images!")
        print("\nNote: First generation will download model (~4GB) and may take a few minutes.")
        print("=" * 70)
        
    except subprocess.CalledProcessError as e:
        print(f"\n✗ Installation failed: {e}")
        print("\nTry installing manually:")
        if install_type == "gpu":
            print("  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118")
        else:
            print("  pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu")
        print("  pip install diffusers transformers accelerate safetensors")
        sys.exit(1)


def test_import():
    """Test if AI libraries can be imported."""
    try:
        import torch
        print(f"  ✓ PyTorch {torch.__version__}")
        print(f"    Device: {'CUDA' if torch.cuda.is_available() else 'CPU'}")
        
        import diffusers
        print(f"  ✓ Diffusers {diffusers.__version__}")
        
        import transformers
        print(f"  ✓ Transformers {transformers.__version__}")
        
        print("\n✓ All AI libraries imported successfully!")
        
    except ImportError as e:
        print(f"\n✗ Import test failed: {e}")
        print("Please check the installation and try again.")


def main():
    """Main entry point."""
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        print("Testing AI dependencies...")
        test_import()
        return
    
    install_ai_dependencies()


if __name__ == "__main__":
    main()
