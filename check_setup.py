import sys
import os
from pathlib import Path

def check_setup():
    print("Checking setup...")
    
    # Check Pillow
    try:
        import PIL
        print("✅ Pillow (PIL) is installed.")
    except ImportError:
        print("❌ Pillow is NOT installed. Please run: pip install pillow")
        return

    # Check outputs directory
    outputs_dir = Path("outputs")
    if not outputs_dir.exists():
        print("⚠️ 'outputs' directory does not exist. Creating it...")
        outputs_dir.mkdir(parents=True, exist_ok=True)
        print("✅ 'outputs' directory created.")
    else:
        print("✅ 'outputs' directory exists.")

    print("\nAnalysis complete.")
    print("Please RESTART your backend and frontend servers to apply the changes.")
    print("1. Stop the current servers (Ctrl+C).")
    print("2. Run the backend: uvicorn app.main:app --reload")
    print("3. Run the frontend: npm run dev")

if __name__ == "__main__":
    check_setup()
