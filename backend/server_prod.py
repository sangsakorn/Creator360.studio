from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from starlette.middleware.cors import CORSMiddleware
import sqlite3
import os
import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
import json

app = FastAPI(title="Creator360.Studio Production API")
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

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Models
class Song(BaseModel):
    id: str
    title: str
    artist: str
    album: Optional[str] = None
    duration: int
    coverImage: Optional[str] = None
    source: str
    videoId: Optional[str] = None
    createdAt: str

@app.get("/api/songs", response_model=List[Song])
async def get_songs():
    conn = get_db()
    rows = conn.execute("SELECT * FROM songs ORDER BY createdAt DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/upload/audio")
async def upload_audio(
    file: UploadFile = File(...),
    title: str = Form(...),
    artist: str = Form(...)
):
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_ext}")
    
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    conn = get_db()
    song_id = str(uuid.uuid4())
    conn.execute("""
        INSERT INTO songs (id, title, artist, source, audioFileId, fileName, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (song_id, title, artist, "upload", file_id, file.filename, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()
    
    return {"id": song_id, "title": title}

@app.get("/api/playlists")
async def get_playlists():
    conn = get_db()
    playlists = conn.execute("SELECT * FROM playlists").fetchall()
    result = []
    for p in playlists:
        p_dict = dict(p)
        songs = conn.execute("SELECT song_id FROM playlist_songs WHERE playlist_id = ?", (p['id'],)).fetchall()
        p_dict['songs'] = [s['song_id'] for s in songs]
        result.append(p_dict)
    conn.close()
    return result

@app.get("/api/user/credits")
async def get_user_credits(user_id: str = "WEB_USER"):
    conn = get_db()
    # Check if user exists in shared db (using the shared db path for user credits)
    SHARED_DB = "/home/ubuntu/creator360_shared.db"
    s_conn = sqlite3.connect(SHARED_DB)
    s_conn.row_factory = sqlite3.Row
    user = s_conn.execute("SELECT credits FROM users WHERE line_user_id = ?", (user_id,)).fetchone()
    s_conn.close()
    conn.close()
    if user:
        return {"credits": user['credits']}
    return {"credits": 0}

@app.post("/api/user/add-credits")
async def add_credits(amount: int, user_id: str = "WEB_USER"):
    SHARED_DB = "/home/ubuntu/creator360_shared.db"
    s_conn = sqlite3.connect(SHARED_DB)
    s_conn.execute("UPDATE users SET credits = credits + ? WHERE line_user_id = ?", (amount, user_id))
    s_conn.commit()
    s_conn.close()
    return {"status": "success", "new_amount": amount}

# AI Studio Integration
@app.post("/api/ai/generate")
async def ai_generate(product_url: str, background_tasks: BackgroundTasks):
    # This would trigger the video_engine.py logic
    # For now, return a tracking ID
    job_id = str(uuid.uuid4())
    return {"job_id": job_id, "status": "processing"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
