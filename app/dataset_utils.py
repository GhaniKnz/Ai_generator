"""Utility functions for dataset management."""
from pathlib import Path

# File extensions to exclude when counting dataset items
METADATA_EXTENSIONS = {'.json', '.txt', '.md'}


def get_dataset_path(dataset_id: int, dataset_type: str) -> Path:
    """Get the file system path for a dataset.
    
    Args:
        dataset_id: The dataset ID
        dataset_type: The dataset type (image, video, mixed)
    
    Returns:
        Path object for the dataset directory
    """
    return Path("uploads") / dataset_type / f"dataset_{dataset_id}"


def count_dataset_files(dataset_path: Path) -> int:
    """Count files in a dataset directory, excluding metadata files.
    
    Args:
        dataset_path: Path to the dataset directory
    
    Returns:
        Number of data files (excluding metadata)
    """
    if not dataset_path.exists():
        return 0
    
    count = 0
    for file in dataset_path.rglob("*"):
        if file.is_file() and file.suffix.lower() not in METADATA_EXTENSIONS:
            count += 1
    return count


def count_total_dataset_items(dataset_id: int) -> int:
    """Count files for a dataset across all upload directories.
    
    Args:
        dataset_id: The dataset ID
        
    Returns:
        Total number of files
    """
    upload_dir = Path("uploads")
    if not upload_dir.exists():
        return 0
        
    total_count = 0
    # Check all type directories (image, video, archive, etc.)
    for type_dir in upload_dir.iterdir():
        if type_dir.is_dir():
            dataset_dir = type_dir / f"dataset_{dataset_id}"
            if dataset_dir.exists():
                total_count += count_dataset_files(dataset_dir)
                
    return total_count
