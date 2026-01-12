# Creator360.Studio - API Contracts & Implementation Plan

## Overview
Transform Spotify clone into Creator360.Studio with:
- YouTube music search & playback
- Audio file upload system
- Full playlist management
- Dual player support (YouTube + HTML5 audio)

## Branding Changes
- App Name: **Creator360.Studio**
- Theme Colors: Orange (#FF9D42) → Purple (#B24FD6) → Blue (#4FB4D6)
- Logo: Gradient C logo (provided by user)

---

## Backend APIs

### 1. YouTube Integration

#### POST /api/youtube/search
Search YouTube videos by query
```json
Request: {
  "query": "song name artist",
  "maxResults": 10
}

Response: {
  "results": [
    {
      "videoId": "abc123",
      "title": "Song Title",
      "artist": "Artist Name",
      "thumbnail": "url",
      "duration": "3:45"
    }
  ]
}
```

#### POST /api/songs/add-youtube
Add YouTube video as song to database
```json
Request: {
  "videoId": "abc123",
  "title": "Song Title",
  "artist": "Artist Name",
  "thumbnail": "url",
  "duration": 225
}

Response: {
  "id": "song_id",
  "source": "youtube",
  "videoId": "abc123",
  ...
}
```

### 2. File Upload

#### POST /api/upload/audio
Upload audio file with metadata
- Supports: MP3, WAV, M4A, FLAC
- Chunked upload for large files
- Store in GridFS (MongoDB)

```json
Request (multipart/form-data): {
  "file": <binary>,
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "coverImage": "url or file"
}

Response: {
  "id": "song_id",
  "source": "upload",
  "audioUrl": "/api/stream/audio/song_id",
  "title": "...",
  ...
}
```

#### GET /api/stream/audio/{song_id}
Stream uploaded audio file

### 3. Playlist Management

#### POST /api/playlists
Create new playlist
```json
Request: {
  "name": "My Playlist",
  "description": "Description",
  "coverImage": "url"
}

Response: {
  "id": "playlist_id",
  "name": "...",
  "songs": [],
  "createdAt": "..."
}
```

#### GET /api/playlists
Get all playlists

#### GET /api/playlists/{id}
Get playlist by ID with songs

#### PUT /api/playlists/{id}
Update playlist metadata

#### DELETE /api/playlists/{id}
Delete playlist

#### POST /api/playlists/{id}/songs
Add song to playlist
```json
Request: {
  "songId": "song_id"
}
```

#### DELETE /api/playlists/{id}/songs/{song_id}
Remove song from playlist

### 4. Song Management

#### GET /api/songs
Get all songs

#### GET /api/songs/{id}
Get song by ID

#### DELETE /api/songs/{id}
Delete song

---

## MongoDB Models

### Song Model
```python
{
  "_id": ObjectId,
  "title": str,
  "artist": str,
  "album": str,
  "duration": int (seconds),
  "coverImage": str (url),
  "source": "youtube" | "upload",
  
  # YouTube specific
  "videoId": str (optional),
  
  # Upload specific
  "audioFileId": ObjectId (GridFS, optional),
  "fileName": str (optional),
  "fileSize": int (optional),
  
  "createdAt": datetime
}
```

### Playlist Model
```python
{
  "_id": ObjectId,
  "name": str,
  "description": str,
  "coverImage": str (url),
  "songs": [ObjectId] (references to Song),
  "createdAt": datetime,
  "updatedAt": datetime
}
```

---

## Frontend Integration Plan

### 1. Replace Mock Data
- Remove mockData.js
- Fetch playlists from /api/playlists
- Fetch songs from /api/songs

### 2. Import Modal Component
- Tab 1: YouTube Search
  - Search input
  - Results list with "Add to Library" button
  - Add to specific playlist option
- Tab 2: File Upload
  - Drag & drop zone
  - File browser
  - Metadata form (title, artist, album)
  - Upload progress indicator

### 3. Dual Player Component
- Detect song source (YouTube vs upload)
- YouTube: Use YouTube IFrame Player API
- Upload: Use HTML5 Audio element
- Unified playback controls

### 4. Create Playlist Flow
- Modal with form (name, description, cover image)
- Save to backend via POST /api/playlists

### 5. Edit Playlist Flow
- Add/remove songs
- Update via PUT /api/playlists/{id}

---

## Implementation Steps

1. **Backend Setup**
   - Install dependencies: youtube-dl, gridfs
   - Add YouTube API key to .env
   - Create models (Song, Playlist)
   - Implement YouTube search endpoint
   - Implement file upload with GridFS
   - Implement playlist CRUD endpoints

2. **Frontend Updates**
   - Update branding (name, logo, colors)
   - Create ImportModal component
   - Create YouTubeSearch component
   - Create FileUpload component
   - Update Player for dual playback
   - Integrate with backend APIs
   - Replace mock data with API calls

3. **Testing**
   - Test YouTube search & playback
   - Test file upload & playback
   - Test playlist creation & management
   - Test player switching between sources
