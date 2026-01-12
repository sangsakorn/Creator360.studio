from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# Song Models
class SongBase(BaseModel):
    title: str
    artist: str
    album: Optional[str] = None
    duration: int  # in seconds
    coverImage: Optional[str] = None
    source: Literal["youtube", "upload"]

class YouTubeSong(SongBase):
    videoId: str
    source: Literal["youtube"] = "youtube"

class UploadedSong(SongBase):
    audioFileId: Optional[str] = None
    fileName: Optional[str] = None
    fileSize: Optional[int] = None
    source: Literal["upload"] = "upload"

class Song(SongBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    videoId: Optional[str] = None
    audioFileId: Optional[str] = None
    fileName: Optional[str] = None
    fileSize: Optional[int] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# Playlist Models
class PlaylistCreate(BaseModel):
    name: str
    description: Optional[str] = None
    coverImage: Optional[str] = None

class PlaylistUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    coverImage: Optional[str] = None

class Playlist(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    description: Optional[str] = None
    coverImage: Optional[str] = None
    songs: List[str] = Field(default_factory=list)  # List of song IDs
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# YouTube Search
class YouTubeSearchRequest(BaseModel):
    query: str
    maxResults: int = 10

class YouTubeSearchResult(BaseModel):
    videoId: str
    title: str
    artist: str
    thumbnail: str
    duration: str

class YouTubeSearchResponse(BaseModel):
    results: List[YouTubeSearchResult]

# Add Song to Playlist
class AddSongToPlaylist(BaseModel):
    songId: str
