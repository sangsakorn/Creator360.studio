import os
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from fastapi import UploadFile
from bson import ObjectId
import aiofiles
from mutagen import File as MutagenFile
from mutagen.mp3 import MP3
from mutagen.wave import WAVE
from mutagen.mp4 import MP4
from mutagen.flac import FLAC
from typing import Dict, Optional
import tempfile

class FileService:
    def __init__(self, db):
        self.db = db
        self.fs = AsyncIOMotorGridFSBucket(db)

    async def upload_audio_file(self, file: UploadFile) -> Dict:
        try:
            # Read file content
            content = await file.read()
            
            # Save to GridFS
            file_id = await self.fs.upload_from_stream(
                file.filename,
                content,
                metadata={
                    'contentType': file.content_type,
                    'size': len(content)
                }
            )

            # Extract metadata from audio file
            metadata = await self._extract_metadata(content, file.filename)

            return {
                'fileId': str(file_id),
                'fileName': file.filename,
                'fileSize': len(content),
                'metadata': metadata
            }

        except Exception as e:
            print(f"File upload error: {e}")
            raise

    async def _extract_metadata(self, content: bytes, filename: str) -> Dict:
        try:
            # Save to temp file to use mutagen
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as tmp:
                tmp.write(content)
                tmp_path = tmp.name

            try:
                audio = MutagenFile(tmp_path, easy=True)
                
                if audio is None:
                    return self._default_metadata(filename)

                # Extract common tags
                title = self._get_tag(audio, ['title', 'TIT2'])
                artist = self._get_tag(audio, ['artist', 'TPE1', 'artist'])
                album = self._get_tag(audio, ['album', 'TALB'])
                
                # Get duration
                duration = 0
                if hasattr(audio.info, 'length'):
                    duration = int(audio.info.length)

                return {
                    'title': title or os.path.splitext(filename)[0],
                    'artist': artist or 'Unknown Artist',
                    'album': album or 'Unknown Album',
                    'duration': duration
                }

            finally:
                # Clean up temp file
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)

        except Exception as e:
            print(f"Metadata extraction error: {e}")
            return self._default_metadata(filename)

    def _get_tag(self, audio, tag_names: list) -> Optional[str]:
        for tag in tag_names:
            if tag in audio:
                value = audio[tag]
                if isinstance(value, list) and len(value) > 0:
                    return str(value[0])
                elif isinstance(value, str):
                    return value
        return None

    def _default_metadata(self, filename: str) -> Dict:
        return {
            'title': os.path.splitext(filename)[0],
            'artist': 'Unknown Artist',
            'album': 'Unknown Album',
            'duration': 0
        }

    async def stream_audio_file(self, file_id: str):
        try:
            grid_out = await self.fs.open_download_stream(ObjectId(file_id))
            return grid_out
        except Exception as e:
            print(f"Stream error: {e}")
            raise

    async def delete_audio_file(self, file_id: str):
        try:
            await self.fs.delete(ObjectId(file_id))
        except Exception as e:
            print(f"Delete error: {e}")
            raise
