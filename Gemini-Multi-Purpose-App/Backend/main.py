from fastapi import FastAPI, HTTPException, Depends
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

def save_base64_image(base64_data: str, image_type: str = "png") -> str:
    """
    Save base64 image data to file and return the URL path.
    
    Args:
        base64_data: Base64 encoded image string (with or without data URL prefix)
        image_type: Image format (png, jpg, jpeg, webp). Defaults to png.
    
    Returns:
        URL path to the saved image (e.g., "/uploads/images/abc123.png")
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
        
        # Return URL path
        return f"/uploads/images/{filename}"
    except Exception as e:
        print(f"Error saving image: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

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
def log_generation(log: GenerationLogRequest, db: Session = Depends(get_db)):
    try:
        # Process inputs: save images to files and replace base64 with URLs
        inputs_data = []
        for i in log.inputs:
            item_dict = i.dict()
            if item_dict.get("type") == "image" and item_dict.get("data"):
                # Detect image format
                image_format = detect_image_format(item_dict["data"])
                # Save image and get URL
                image_url = save_base64_image(item_dict["data"], image_format)
                # Replace base64 data with URL
                item_dict["data"] = image_url
            inputs_data.append(item_dict)
        
        # Process outputs: save images to files and replace base64 with URLs
        outputs_data = []
        for o in log.outputs:
            item_dict = o.dict()
            if item_dict.get("type") == "image" and item_dict.get("data"):
                # Check if it's already a URL (starts with /uploads or http)
                if item_dict["data"].startswith(("/uploads", "http")):
                    # Already a URL, keep as is
                    pass
                else:
                    # It's base64 data, save it
                    image_format = detect_image_format(item_dict["data"])
                    image_url = save_base64_image(item_dict["data"], image_format)
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

def serialize_log(log: GenerationRecord) -> dict:
    """
    Convert SQLAlchemy GenerationRecord to dictionary for JSON serialization.
    
    Args:
        log: GenerationRecord SQLAlchemy model instance
    
    Returns:
        Dictionary representation of the log record
    """
    return {
        "id": log.id,
        "function_id": log.function_id,
        "processing_time": log.processing_time,
        "timestamp": log.timestamp,
        "inputs": log.inputs,  # Already JSON, will be serialized as-is
        "outputs": log.outputs,  # Already JSON, will be serialized as-is
        "metadata_info": log.metadata_info,  # Already JSON, will be serialized as-is
        "created_at": log.created_at
    }

@app.post("/api/get_gcm_logs")
def get_logs(request: LogPaginationRequest, db: Session = Depends(get_db)):
    try:
        skip = (request.page - 1) * request.size
        limit = request.size
        
        total_records = db.query(GenerationRecord).count()
        
        logs = db.query(GenerationRecord)\
            .order_by(GenerationRecord.id.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()
        
        # Serialize logs to dictionaries (images are already stored as URLs)
        serialized_logs = [serialize_log(log) for log in logs]
            
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
