from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from models import (
    Song, YouTubeSong, UploadedSong, Playlist, PlaylistCreate, 
    PlaylistUpdate, YouTubeSearchRequest, YouTubeSearchResponse,
    YouTubeSearchResult, AddSongToPlaylist
)
from youtube_service import youtube_service
from file_service import FileService


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# File service
file_service = FileService(db)

# Create the main app without a prefix
app = FastAPI(title="Creator360.Studio API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============== YouTube Routes ==============

@api_router.post("/youtube/search", response_model=YouTubeSearchResponse)
async def search_youtube(request: YouTubeSearchRequest):
    """Search YouTube for music videos"""
    results = youtube_service.search_videos(request.query, request.maxResults)
    return YouTubeSearchResponse(results=[YouTubeSearchResult(**r) for r in results])


@api_router.post("/songs/add-youtube", response_model=Song)
async def add_youtube_song(song: YouTubeSong):
    """Add a YouTube video as a song to the library"""
    song_dict = song.dict()
    song_dict['createdAt'] = datetime.utcnow()
    
    result = await db.songs.insert_one(song_dict)
    song_dict['_id'] = str(result.inserted_id)
    
    return Song(**song_dict)


# ============== File Upload Routes ==============

@api_router.post("/upload/audio", response_model=Song)
async def upload_audio(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    artist: Optional[str] = Form(None),
    album: Optional[str] = Form(None),
    coverImage: Optional[str] = Form(None)
):
    """Upload an audio file"""
    # Validate file type
    allowed_types = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'audio/flac']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: MP3, WAV, M4A, FLAC")
    
    # Upload file to GridFS
    upload_result = await file_service.upload_audio_file(file)
    
    # Use provided metadata or extracted metadata
    metadata = upload_result['metadata']
    song_dict = {
        'title': title or metadata['title'],
        'artist': artist or metadata['artist'],
        'album': album or metadata['album'],
        'duration': metadata['duration'],
        'coverImage': coverImage or 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop',
        'source': 'upload',
        'audioFileId': upload_result['fileId'],
        'fileName': upload_result['fileName'],
        'fileSize': upload_result['fileSize'],
        'createdAt': datetime.utcnow()
    }
    
    result = await db.songs.insert_one(song_dict)
    song_dict['_id'] = str(result.inserted_id)
    
    return Song(**song_dict)


@api_router.get("/stream/audio/{song_id}")
async def stream_audio(song_id: str):
    """Stream an uploaded audio file"""
    # Get song from database
    song = await db.songs.find_one({'_id': ObjectId(song_id)})
    if not song or song.get('source') != 'upload':
        raise HTTPException(status_code=404, detail="Song not found")
    
    # Stream file from GridFS
    try:
        grid_out = await file_service.stream_audio_file(song['audioFileId'])
        
        async def stream_generator():
            while True:
                chunk = await grid_out.read(1024 * 1024)  # 1MB chunks
                if not chunk:
                    break
                yield chunk
        
        return StreamingResponse(
            stream_generator(),
            media_type='audio/mpeg',
            headers={
                'Content-Disposition': f'inline; filename="{song.get("fileName", "audio.mp3")}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============== Song Routes ==============

@api_router.get("/songs", response_model=List[Song])
async def get_songs():
    """Get all songs"""
    songs = await db.songs.find().to_list(1000)
    return [Song(**{**song, '_id': str(song['_id'])}) for song in songs]


@api_router.get("/songs/{song_id}", response_model=Song)
async def get_song(song_id: str):
    """Get song by ID"""
    song = await db.songs.find_one({'_id': ObjectId(song_id)})
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return Song(**{**song, '_id': str(song['_id'])})


@api_router.delete("/songs/{song_id}")
async def delete_song(song_id: str):
    """Delete a song"""
    song = await db.songs.find_one({'_id': ObjectId(song_id)})
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    
    # Delete audio file if it's an uploaded song
    if song.get('source') == 'upload' and song.get('audioFileId'):
        await file_service.delete_audio_file(song['audioFileId'])
    
    # Delete song from database
    await db.songs.delete_one({'_id': ObjectId(song_id)})
    
    # Remove from all playlists
    await db.playlists.update_many(
        {},
        {'$pull': {'songs': song_id}}
    )
    
    return {"message": "Song deleted successfully"}


# ============== Playlist Routes ==============

@api_router.post("/playlists", response_model=Playlist)
async def create_playlist(playlist: PlaylistCreate):
    """Create a new playlist"""
    playlist_dict = playlist.dict()
    playlist_dict['songs'] = []
    playlist_dict['createdAt'] = datetime.utcnow()
    playlist_dict['updatedAt'] = datetime.utcnow()
    
    result = await db.playlists.insert_one(playlist_dict)
    playlist_dict['_id'] = str(result.inserted_id)
    
    return Playlist(**playlist_dict)


@api_router.get("/playlists", response_model=List[Playlist])
async def get_playlists():
    """Get all playlists"""
    playlists = await db.playlists.find().to_list(1000)
    return [Playlist(**{**p, '_id': str(p['_id'])}) for p in playlists]


@api_router.get("/playlists/{playlist_id}", response_model=Playlist)
async def get_playlist(playlist_id: str):
    """Get playlist by ID"""
    playlist = await db.playlists.find_one({'_id': ObjectId(playlist_id)})
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return Playlist(**{**playlist, '_id': str(playlist['_id'])})


@api_router.put("/playlists/{playlist_id}", response_model=Playlist)
async def update_playlist(playlist_id: str, update: PlaylistUpdate):
    """Update playlist metadata"""
    playlist = await db.playlists.find_one({'_id': ObjectId(playlist_id)})
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    update_dict = {k: v for k, v in update.dict().items() if v is not None}
    update_dict['updatedAt'] = datetime.utcnow()
    
    await db.playlists.update_one(
        {'_id': ObjectId(playlist_id)},
        {'$set': update_dict}
    )
    
    updated_playlist = await db.playlists.find_one({'_id': ObjectId(playlist_id)})
    return Playlist(**{**updated_playlist, '_id': str(updated_playlist['_id'])})


@api_router.delete("/playlists/{playlist_id}")
async def delete_playlist(playlist_id: str):
    """Delete a playlist"""
    result = await db.playlists.delete_one({'_id': ObjectId(playlist_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return {"message": "Playlist deleted successfully"}


@api_router.post("/playlists/{playlist_id}/songs")
async def add_song_to_playlist(playlist_id: str, data: AddSongToPlaylist):
    """Add a song to a playlist"""
    playlist = await db.playlists.find_one({'_id': ObjectId(playlist_id)})
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    song = await db.songs.find_one({'_id': ObjectId(data.songId)})
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    
    # Check if song already in playlist
    if data.songId in playlist.get('songs', []):
        raise HTTPException(status_code=400, detail="Song already in playlist")
    
    await db.playlists.update_one(
        {'_id': ObjectId(playlist_id)},
        {
            '$push': {'songs': data.songId},
            '$set': {'updatedAt': datetime.utcnow()}
        }
    )
    
    return {"message": "Song added to playlist"}


@api_router.delete("/playlists/{playlist_id}/songs/{song_id}")
async def remove_song_from_playlist(playlist_id: str, song_id: str):
    """Remove a song from a playlist"""
    result = await db.playlists.update_one(
        {'_id': ObjectId(playlist_id)},
        {
            '$pull': {'songs': song_id},
            '$set': {'updatedAt': datetime.utcnow()}
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Playlist or song not found")
    
    return {"message": "Song removed from playlist"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()