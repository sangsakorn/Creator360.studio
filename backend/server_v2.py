import logging
from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
import sqlite3
import os
import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
import time

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("/home/ubuntu/creator360_prod.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("Creator360")

app = FastAPI(title="Creator360.Studio Permanent API")
DB_PATH = "/home/ubuntu/creator360_permanent.db"
UPLOAD_DIR = "/home/ubuntu/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Connection Pool (Simplified)
def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# Models
class ProjectCreate(BaseModel):
    product_name: str
    product_url: str
    user_id: str = "WEB_USER"

# Initialize Tables if not exist
def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS projects_v2 (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            product_name TEXT,
            product_url TEXT,
            status TEXT,
            script TEXT,
            video_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}

@app.post("/api/v2/projects")
async def create_project(project: ProjectCreate, background_tasks: BackgroundTasks):
    project_id = str(uuid.uuid4())
    logger.info(f"Creating project {project_id} for user {project.user_id}")
    
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        INSERT INTO projects_v2 (id, user_id, product_name, product_url, status)
        VALUES (?, ?, ?, ?, ?)
    """, (project_id, project.user_id, project.product_name, project.product_url, "processing"))
    conn.commit()
    conn.close()
    
    # Simulate background processing
    background_tasks.add_task(process_video_task, project_id)
    
    return {"project_id": project_id, "status": "queued"}

async def process_video_task(project_id: str):
    logger.info(f"Starting background processing for {project_id}")
    # In reality, this calls video_engine.py
    time.sleep(10) # Simulate AI work
    
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        UPDATE projects_v2 
        SET status = ?, script = ?, video_url = ?
        WHERE id = ?
    """, ("completed", "AI Generated Script Content...", "https://8080-iz6w8w490tqm21gwvi1m3-1e655f4f.sg1.manus.computer/videos/sample.mp4", project_id))
    conn.commit()
    conn.close()
    logger.info(f"Project {project_id} completed successfully")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
