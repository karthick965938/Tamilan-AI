from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from datetime import datetime
from typing import List, Optional, Dict, Any
import uvicorn
import os
import base64
import uuid
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Base URL Configuration
# Get from environment variable or use default
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
# Remove trailing slash if present
BASE_URL = BASE_URL.rstrip("/")

# Images Directory Setup
IMAGES_DIR = Path("uploads/images")
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# Database Setup
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./new_gemini_studio.db")
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Model
class GenerationRecord(Base):
    __tablename__ = "generations"

    id = Column(Integer, primary_key=True, index=True)
    function_id = Column(String, index=True)
    processing_time = Column(Float)
    timestamp = Column(String)
    inputs = Column(JSON)  # Stores list of input objects (images stored as URLs)
    outputs = Column(JSON) # Stores list of output objects (images stored as URLs)
    metadata_info = Column(JSON) # Stores additional metadata like panel counts
    created_at = Column(String, default=lambda: datetime.now().isoformat())

# Create Tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class InputData(BaseModel):
    type: str
    data: str
    name: Optional[str] = None

class OutputData(BaseModel):
    type: str
    data: str

class GenerationLogRequest(BaseModel):
    functionId: str
    processingTime: float
    timestamp: str
    inputs: List[InputData]
    outputs: List[OutputData]
    metadata: Dict[str, Any]

# FastAPI App
app = FastAPI(title="Gemini Studio Logger")

# Mount static files for serving images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS Configuration
# SECURITY: Restrict file access and API calls to trusted local origins only
# This prevents malicious websites from accessing your local backend
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000",
    "https://demo.tamilanai.com",
    "https://tamilanai.com",
    "https://api.tamilanai.com",
    "http://18.234.117.250:8000",
    "http://18.234.117.250:3000",
    "http://18.234.117.250:3001"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"], # Only allow necessary methods
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_base_url(request: Optional[Request] = None) -> str:
    """
    Get the base URL for constructing full image URLs.
    Uses request if available, otherwise falls back to environment variable or default.
    
    Args:
        request: FastAPI Request object (optional)
    
    Returns:
        Base URL string (e.g., "http://localhost:8000" or "https://api.tamilanai.com")
    """
    if request:
        # Get base URL from request
        base_url = str(request.base_url).rstrip("/")
        return base_url
    # Fall back to environment variable or default
    return BASE_URL

def save_base64_image(base64_data: str, image_type: str = "png", base_url: Optional[str] = None) -> str:
    """
    Save base64 image data to file and return the full URL.
    
    Args:
        base64_data: Base64 encoded image string (with or without data URL prefix)
        image_type: Image format (png, jpg, jpeg, webp). Defaults to png.
        base_url: Base URL for constructing full URL (optional, uses default if not provided)
    
    Returns:
        Full URL to the saved image (e.g., "http://localhost:8000/uploads/images/abc123.png")
    """
    try:
        # Remove data URL prefix if present (e.g., "data:image/png;base64,")
        if "," in base64_data:
            base64_data = base64_data.split(",", 1)[1]
        
        # Decode base64 data
        image_bytes = base64.b64decode(base64_data)
        
        # Generate unique filename
        unique_id = uuid.uuid4().hex
        filename = f"{unique_id}.{image_type}"
        file_path = IMAGES_DIR / filename
        
        # Save image to file
        with open(file_path, "wb") as f:
            f.write(image_bytes)
        
        # Get base URL
        url_base = base_url if base_url else BASE_URL
        
        # Return full URL
        return f"{url_base}/uploads/images/{filename}"
    except Exception as e:
        print(f"Error saving image: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

def convert_to_full_url(relative_url: str, base_url: Optional[str] = None) -> str:
    """
    Convert relative URL to full URL.
    
    Args:
        relative_url: Relative URL path (e.g., "/uploads/images/abc123.png")
        base_url: Base URL (optional, uses default if not provided)
    
    Returns:
        Full URL (e.g., "http://localhost:8000/uploads/images/abc123.png")
    """
    if not relative_url:
        return relative_url
    
    # If already a full URL, return as-is
    if relative_url.startswith("http://") or relative_url.startswith("https://"):
        return relative_url
    
    # Get base URL
    url_base = base_url if base_url else BASE_URL
    
    # Ensure relative URL starts with /
    if not relative_url.startswith("/"):
        relative_url = "/" + relative_url
    
    # Return full URL
    return f"{url_base}{relative_url}"

def detect_image_format(base64_data: str) -> str:
    """
    Detect image format from base64 data URL or default to png.
    
    Args:
        base64_data: Base64 encoded image string
    
    Returns:
        Image format string (png, jpg, jpeg, webp)
    """
    # Check if it's a data URL
    if base64_data.startswith("data:image/"):
        format_part = base64_data.split(";")[0].split("/")[1]
        # Normalize format names
        format_map = {"jpeg": "jpg", "jpg": "jpg", "png": "png", "webp": "webp", "gif": "gif"}
        return format_map.get(format_part.lower(), "png")
    # Default to png if format cannot be determined
    return "png"

@app.post("/api/log")
def log_generation(log: GenerationLogRequest, request: Request, db: Session = Depends(get_db)):
    try:
        # Get base URL from request
        base_url = get_base_url(request)
        
        # Process inputs: save images to files and replace base64 with full URLs
        inputs_data = []
        for i in log.inputs:
            item_dict = i.dict()
            if item_dict.get("type") == "image" and item_dict.get("data"):
                # Check if it's already a full URL
                if item_dict["data"].startswith(("http://", "https://")):
                    # Already a full URL, keep as is
                    pass
                elif item_dict["data"].startswith("/uploads"):
                    # It's a relative URL, convert to full URL
                    item_dict["data"] = convert_to_full_url(item_dict["data"], base_url)
                else:
                    # It's base64 data, save it and get full URL
                    image_format = detect_image_format(item_dict["data"])
                    image_url = save_base64_image(item_dict["data"], image_format, base_url)
                    item_dict["data"] = image_url
            inputs_data.append(item_dict)
        
        # Process outputs: save images to files and replace base64 with full URLs
        outputs_data = []
        for o in log.outputs:
            item_dict = o.dict()
            if item_dict.get("type") == "image" and item_dict.get("data"):
                # Check if it's already a full URL
                if item_dict["data"].startswith(("http://", "https://")):
                    # Already a full URL, keep as is
                    pass
                elif item_dict["data"].startswith("/uploads"):
                    # It's a relative URL, convert to full URL
                    item_dict["data"] = convert_to_full_url(item_dict["data"], base_url)
                else:
                    # It's base64 data, save it and get full URL
                    image_format = detect_image_format(item_dict["data"])
                    image_url = save_base64_image(item_dict["data"], image_format, base_url)
                    item_dict["data"] = image_url
            outputs_data.append(item_dict)
        
        db_record = GenerationRecord(
            function_id=log.functionId,
            processing_time=log.processingTime,
            timestamp=log.timestamp,
            inputs=inputs_data,
            outputs=outputs_data,
            metadata_info=log.metadata
        )
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        print(f"Successfully logged generation {db_record.id} for {log.functionId}")
        return {"status": "success", "id": db_record.id, "message": "Generation details saved to SQLite"}
    except Exception as e:
        print(f"Error saving log: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class LogPaginationRequest(BaseModel):
    page: int = 1
    size: int = 10

def normalize_image_data(item: dict, base_url: Optional[str] = None) -> dict:
    """
    Normalize image data: convert base64 to full URL if needed, or convert relative URL to full URL.
    This handles backward compatibility with old records that have base64 data.
    Also handles corrupted data where base64 prefix might be mixed with URLs.
    
    Args:
        item: Dictionary with 'type' and 'data' fields
        base_url: Base URL for constructing full URLs (optional)
    
    Returns:
        Dictionary with normalized image data (full URL instead of base64 or relative URL)
    """
    if item.get("type") == "image" and item.get("data"):
        data = str(item["data"]).strip()
        
        # Handle corrupted data: if URL is embedded in base64 prefix, extract it
        if "data:image/" in data and "/uploads/images/" in data:
            # Extract the URL part after the base64 prefix
            url_part = data.split("/uploads/images/")
            if len(url_part) > 1:
                # Reconstruct the relative URL
                data = "/uploads/images/" + url_part[1]
        
        # Check if it's already a full URL (starts with http)
        if data.startswith(("http://", "https://")):
            # Already a full URL, keep as is
            return item
        
        # Check if it's a relative URL (starts with /uploads)
        if data.startswith("/uploads"):
            # Convert relative URL to full URL
            normalized_item = item.copy()
            normalized_item["data"] = convert_to_full_url(data, base_url)
            return normalized_item
        
        # Check if it's base64 data (starts with data: or is long base64 string)
        if data.startswith("data:image/") or (len(data) > 100 and not data.startswith("/") and not data.startswith("http")):
            # It's base64 data, convert it to a full URL
            try:
                image_format = detect_image_format(data)
                image_url = save_base64_image(data, image_format, base_url)
                # Return new dict with full URL instead of base64
                normalized_item = item.copy()
                normalized_item["data"] = image_url
                return normalized_item
            except Exception as e:
                print(f"Warning: Failed to convert base64 image for log item: {e}")
                # Return original if conversion fails
                return item
    # Not an image or no data, return as-is
    return item

def serialize_log(log: GenerationRecord, base_url: Optional[str] = None) -> dict:
    """
    Convert SQLAlchemy GenerationRecord to dictionary for JSON serialization.
    Normalizes image data from base64 to full URLs for backward compatibility.
    
    Args:
        log: GenerationRecord SQLAlchemy model instance
        base_url: Base URL for constructing full URLs (optional)
    
    Returns:
        Dictionary representation of the log record with normalized full image URLs
    """
    # Normalize inputs: convert any base64 images to full URLs
    normalized_inputs = []
    if log.inputs:
        for input_item in log.inputs:
            normalized_inputs.append(normalize_image_data(input_item, base_url))
    
    # Normalize outputs: convert any base64 images to full URLs
    normalized_outputs = []
    if log.outputs:
        for output_item in log.outputs:
            normalized_outputs.append(normalize_image_data(output_item, base_url))
    
    return {
        "id": log.id,
        "function_id": log.function_id,
        "processing_time": log.processing_time,
        "timestamp": log.timestamp,
        "inputs": normalized_inputs,
        "outputs": normalized_outputs,
        "metadata_info": log.metadata_info,  # Already JSON, will be serialized as-is
        "created_at": log.created_at
    }

@app.post("/api/get_gcm_logs")
def get_logs(request: LogPaginationRequest, http_request: Request, db: Session = Depends(get_db)):
    try:
        skip = (request.page - 1) * request.size
        limit = request.size
        
        total_records = db.query(GenerationRecord).count()
        
        logs = db.query(GenerationRecord)\
            .order_by(GenerationRecord.id.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()
        
        # Get base URL from request
        base_url = get_base_url(http_request)
        
        # Serialize logs to dictionaries with full URLs for images
        serialized_logs = [serialize_log(log, base_url) for log in logs]
            
        return {
            "total_records": total_records,
            "page": request.page,
            "size": request.size,
            "logs": serialized_logs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def health_check():
    return {"status": "online", "service": "Gemini Studio Logger"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
