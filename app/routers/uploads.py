"""File upload router for handling various file types."""
import os
import shutil
import zipfile
import tarfile
from pathlib import Path
from typing import List
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

ALL_SUPPORTED_FORMATS = (
    SUPPORTED_IMAGE_FORMATS | 
    SUPPORTED_VIDEO_FORMATS | 
    SUPPORTED_AUDIO_FORMATS | 
    SUPPORTED_ARCHIVE_FORMATS
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


@router.post("/", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    extract_archives: bool = Form(default=True)
) -> FileUploadResponse:
    """
    Upload a file. Supports images, videos, audio, and archives.
    
    If the file is an archive and extract_archives is True,
    it will be automatically extracted.
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
    
    return FileUploadResponse(
        filename=file.filename,
        path=str(file_path),
        size=file_size,
        type=file_type,
        extracted_files=extracted_files
    )


@router.post("/batch", response_model=List[FileUploadResponse])
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    extract_archives: bool = Form(default=True)
) -> List[FileUploadResponse]:
    """
    Upload multiple files at once.
    """
    results = []
    
    for file in files:
        try:
            result = await upload_file(file, extract_archives)
            results.append(result)
        except HTTPException as e:
            # Continue with other files even if one fails
            results.append(FileUploadResponse(
                filename=file.filename,
                path="",
                size=0,
                type="error",
                extracted_files=[],
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
