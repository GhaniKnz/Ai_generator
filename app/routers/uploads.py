"""File upload router for handling various file types."""
import os
import shutil
import zipfile
import tarfile
import csv
import json
from pathlib import Path
from typing import List, Dict, Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from pydantic import BaseModel

router = APIRouter(prefix="/uploads", tags=["uploads"])

# Supported file extensions
SUPPORTED_IMAGE_FORMATS = {
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff', '.tif', 
    '.ico', '.svg', '.heic', '.heif', '.avif', '.jfif'
}

SUPPORTED_VIDEO_FORMATS = {
    '.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv', '.m4v',
    '.mpg', '.mpeg', '.3gp', '.ogv', '.vob', '.mts', '.m2ts'
}

SUPPORTED_AUDIO_FORMATS = {
    '.wav', '.mp3', '.aac', '.flac', '.ogg', '.m4a', '.wma', '.opus'
}

SUPPORTED_ARCHIVE_FORMATS = {
    '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz'
}

SUPPORTED_CSV_FORMATS = {
    '.csv', '.tsv', '.txt'
}

ALL_SUPPORTED_FORMATS = (
    SUPPORTED_IMAGE_FORMATS | 
    SUPPORTED_VIDEO_FORMATS | 
    SUPPORTED_AUDIO_FORMATS | 
    SUPPORTED_ARCHIVE_FORMATS |
    SUPPORTED_CSV_FORMATS
)

# Upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


class FileUploadResponse(BaseModel):
    """Response for file upload."""
    filename: str
    path: str
    size: int
    type: str
    extracted_files: List[str] = []
    csv_data: Optional[Dict] = None
    error: str | None = None


def get_file_type(filename: str) -> str:
    """Determine file type based on extension."""
    ext = Path(filename).suffix.lower()
    if ext in SUPPORTED_IMAGE_FORMATS:
        return "image"
    elif ext in SUPPORTED_VIDEO_FORMATS:
        return "video"
    elif ext in SUPPORTED_AUDIO_FORMATS:
        return "audio"
    elif ext in SUPPORTED_ARCHIVE_FORMATS:
        return "archive"
    elif ext in SUPPORTED_CSV_FORMATS:
        return "csv"
    else:
        return "other"


def extract_archive(archive_path: Path, extract_to: Path) -> List[str]:
    """Extract archive and return list of extracted files."""
    extracted_files = []
    extract_to.mkdir(parents=True, exist_ok=True)
    
    try:
        if archive_path.suffix.lower() == '.zip':
            with zipfile.ZipFile(archive_path, 'r') as zip_ref:
                zip_ref.extractall(extract_to)
                extracted_files = zip_ref.namelist()
        elif archive_path.suffix.lower() in {'.tar', '.gz', '.bz2', '.xz'}:
            with tarfile.open(archive_path, 'r:*') as tar_ref:
                tar_ref.extractall(extract_to)
                extracted_files = tar_ref.getnames()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract archive: {str(e)}")
    
    return extracted_files


def parse_csv_file(csv_path: Path) -> Dict:
    """Parse CSV file and extract image-label mappings."""
    # List of encodings to try, in order of likelihood
    encodings_to_try = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252', 'iso-8859-1', 'ascii']
    
    for encoding in encodings_to_try:
        try:
            with open(csv_path, 'r', encoding=encoding) as f:
                # Try to detect delimiter
                sample = f.read(1024)
                f.seek(0)
                sniffer = csv.Sniffer()
                try:
                    delimiter = sniffer.sniff(sample).delimiter
                except csv.Error:
                    delimiter = ','
                
                reader = csv.DictReader(f, delimiter=delimiter)
                rows = list(reader)
                
                # Try to identify image and label columns
                image_label_map = {}
                image_col = None
                label_col = None
                
                # Common column names for images
                image_column_names = ['image', 'filename', 'file', 'img', 'path', 'image_path', 'file_name']
                # Common column names for labels
                label_column_names = ['label', 'class', 'category', 'tag', 'description', 'caption', 'text']
                
                if len(rows) > 0:
                    columns = list(rows[0].keys())
                    
                    # Find image column
                    for col in columns:
                        if col.lower() in image_column_names:
                            image_col = col
                            break
                    if not image_col:
                        image_col = columns[0]  # Default to first column
                    
                    # Find label column
                    for col in columns:
                        if col.lower() in label_column_names:
                            label_col = col
                            break
                    if not label_col and len(columns) > 1:
                        label_col = columns[1]  # Default to second column
                    
                    # Build mapping
                    for row in rows:
                        if image_col in row and label_col in row:
                            image_name = row[image_col]
                            label = row[label_col]
                            if image_name and label:
                                image_label_map[image_name] = label
                
                return {
                    'total_rows': len(rows),
                    'image_column': image_col,
                    'label_column': label_col,
                    'mappings': image_label_map,
                    'columns': list(rows[0].keys()) if rows else [],
                    'encoding': encoding
                }
        except (UnicodeDecodeError, UnicodeError):
            # Try next encoding
            continue
        except csv.Error as e:
            raise HTTPException(
                status_code=400, 
                detail=f"CSV parsing error: {str(e)}. Please ensure your CSV file is properly formatted with consistent delimiters and quoted fields."
            )
        except Exception as e:
            raise HTTPException(
                status_code=400, 
                detail=f"Failed to parse CSV: {str(e)}. Common issues: invalid file format, corrupted file, or unsupported CSV structure."
            )
    
    # If all encodings failed
    raise HTTPException(
        status_code=400, 
        detail="Failed to decode CSV file. Please ensure the file is a valid CSV with UTF-8 or common encoding."
    )


@router.post("/", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    extract_archives: bool = Form(default=True),
    dataset_id: int = Form(default=None)
) -> FileUploadResponse:
    """
    Upload a file. Supports images, videos, audio, archives, and CSV files.
    
    If the file is an archive and extract_archives is True,
    it will be automatically extracted.
    
    If the file is a CSV, it will be parsed for image-label mappings.
    """
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALL_SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file_ext}. Supported formats: {', '.join(sorted(ALL_SUPPORTED_FORMATS))}"
        )
    
    # Determine file type
    file_type = get_file_type(file.filename)
    
    # Create type-specific directory
    type_dir = UPLOAD_DIR / file_type
    type_dir.mkdir(exist_ok=True)
    
    # If dataset_id is provided, organize by dataset
    if dataset_id:
        type_dir = type_dir / f"dataset_{dataset_id}"
        type_dir.mkdir(exist_ok=True)
    
    # Save file
    file_path = type_dir / file.filename
    
    # Handle duplicate filenames
    counter = 1
    original_path = file_path
    while file_path.exists():
        stem = original_path.stem
        suffix = original_path.suffix
        file_path = type_dir / f"{stem}_{counter}{suffix}"
        counter += 1
    
    # Write file
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        file_size = len(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Extract archives if requested
    extracted_files = []
    if file_type == "archive" and extract_archives:
        extract_dir = type_dir / file_path.stem
        extracted_files = extract_archive(file_path, extract_dir)
    
    # Parse CSV files
    csv_data = None
    if file_type == "csv":
        csv_data = parse_csv_file(file_path)
        
        # Save CSV metadata
        metadata_path = file_path.with_suffix('.json')
        with open(metadata_path, 'w') as f:
            json.dump(csv_data, f, indent=2)
    
    return FileUploadResponse(
        filename=file.filename,
        path=str(file_path),
        size=file_size,
        type=file_type,
        extracted_files=extracted_files,
        csv_data=csv_data
    )


@router.post("/batch", response_model=List[FileUploadResponse])
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    extract_archives: bool = Form(default=True),
    dataset_id: int = Form(default=None)
) -> List[FileUploadResponse]:
    """
    Upload multiple files at once.
    """
    results = []
    
    for file in files:
        try:
            result = await upload_file(file, extract_archives, dataset_id)
            results.append(result)
        except HTTPException as e:
            # Continue with other files even if one fails
            results.append(FileUploadResponse(
                filename=file.filename,
                path="",
                size=0,
                type="error",
                extracted_files=[],
                csv_data=None,
                error=e.detail
            ))
    
    return results


@router.get("/supported-formats")
async def get_supported_formats() -> dict:
    """Get list of all supported file formats."""
    return {
        "images": sorted(list(SUPPORTED_IMAGE_FORMATS)),
        "videos": sorted(list(SUPPORTED_VIDEO_FORMATS)),
        "audio": sorted(list(SUPPORTED_AUDIO_FORMATS)),
        "archives": sorted(list(SUPPORTED_ARCHIVE_FORMATS)),
        "csv": sorted(list(SUPPORTED_CSV_FORMATS)),
        "all": sorted(list(ALL_SUPPORTED_FORMATS))
    }


@router.delete("/{file_path:path}")
async def delete_file(file_path: str) -> dict:
    """Delete an uploaded file."""
    full_path = UPLOAD_DIR / file_path
    
    if not full_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        if full_path.is_file():
            full_path.unlink()
        elif full_path.is_dir():
            shutil.rmtree(full_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")
    
    return {"status": "deleted", "path": file_path}
