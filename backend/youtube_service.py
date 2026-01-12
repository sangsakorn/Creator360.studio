from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import os
import re
from typing import List, Dict
import isodate

YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY')

class YouTubeService:
    def __init__(self):
        self.youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

    def search_videos(self, query: str, max_results: int = 10) -> List[Dict]:
        try:
            # Search for videos
            search_response = self.youtube.search().list(
                q=query,
                part='id,snippet',
                maxResults=max_results,
                type='video',
                videoCategoryId='10'  # Music category
            ).execute()

            video_ids = [item['id']['videoId'] for item in search_response.get('items', [])]
            
            if not video_ids:
                return []

            # Get video details including duration
            videos_response = self.youtube.videos().list(
                part='contentDetails,snippet',
                id=','.join(video_ids)
            ).execute()

            results = []
            for item in videos_response.get('items', []):
                video_id = item['id']
                snippet = item['snippet']
                duration_iso = item['contentDetails']['duration']
                
                # Parse ISO 8601 duration
                duration_seconds = int(isodate.parse_duration(duration_iso).total_seconds())
                duration_formatted = self._format_duration(duration_seconds)
                
                # Extract artist and title from video title
                title_parts = self._parse_title(snippet['title'])
                
                results.append({
                    'videoId': video_id,
                    'title': title_parts['title'],
                    'artist': title_parts['artist'],
                    'thumbnail': snippet['thumbnails']['high']['url'],
                    'duration': duration_formatted,
                    'durationSeconds': duration_seconds
                })

            return results

        except HttpError as e:
            print(f"YouTube API error: {e}")
            return []

    def _parse_title(self, title: str) -> Dict[str, str]:
        # Try to extract artist and song from common patterns
        # Pattern: "Artist - Song"
        if ' - ' in title:
            parts = title.split(' - ', 1)
            return {'artist': parts[0].strip(), 'title': parts[1].strip()}
        
        # Pattern: "Artist: Song"
        if ': ' in title:
            parts = title.split(': ', 1)
            return {'artist': parts[0].strip(), 'title': parts[1].strip()}
        
        # Pattern: "Song by Artist"
        if ' by ' in title.lower():
            parts = re.split(r' by ', title, 1, re.IGNORECASE)
            return {'title': parts[0].strip(), 'artist': parts[1].strip()}
        
        # Default: use whole title
        return {'artist': 'Unknown Artist', 'title': title}

    def _format_duration(self, seconds: int) -> str:
        minutes = seconds // 60
        secs = seconds % 60
        return f"{minutes}:{secs:02d}"

youtube_service = YouTubeService()
