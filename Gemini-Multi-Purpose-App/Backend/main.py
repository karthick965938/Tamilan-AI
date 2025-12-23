from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from datetime import datetime
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

# Database Setup
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gemini_studio.db")
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
    inputs = Column(JSON)  # Stores list of input objects with base64 data
    outputs = Column(JSON) # Stores list of output objects
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

@app.post("/api/log")
def log_generation(log: GenerationLogRequest, db: Session = Depends(get_db)):
    try:
        # Convert Pydantic models to dicts for JSON storage
        inputs_data = [i.dict() for i in log.inputs]
        outputs_data = [o.dict() for o in log.outputs]
        
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
            
        return {
            "total_records": total_records,
            "page": request.page,
            "size": request.size,
            "logs": logs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def health_check():
    return {"status": "online", "service": "Gemini Studio Logger"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
