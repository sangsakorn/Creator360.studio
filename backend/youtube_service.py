import os
import re
import requests
from typing import List, Dict

YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY')
YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

class YouTubeService:
    def search_videos(self, query: str, max_results: int = 10) -> List[Dict]:
        try:
            print(f"[DEBUG] Searching YouTube: {query}")
            
            # Search for videos using REST API directly
            search_url = f"{YOUTUBE_API_BASE}/search"
            search_params = {
                'key': YOUTUBE_API_KEY,
                'q': query,
                'part': 'id,snippet',
                'maxResults': max_results,
                'type': 'video'
            }
            
            search_response = requests.get(search_url, params=search_params, timeout=10)
            search_response.raise_for_status()
            search_data = search_response.json()
            
            video_ids = [item['id']['videoId'] for item in search_data.get('items', [])]
            
            if not video_ids:
                print("[DEBUG] No videos found")
                return []
            
            # Get video details including duration
            videos_url = f"{YOUTUBE_API_BASE}/videos"
            videos_params = {
                'key': YOUTUBE_API_KEY,
                'part': 'contentDetails,snippet',
                'id': ','.join(video_ids)
            }
            
            videos_response = requests.get(videos_url, params=videos_params, timeout=10)
            videos_response.raise_for_status()
            videos_data = videos_response.json()
            
            results = []
            for item in videos_data.get('items', []):
                video_id = item['id']
                snippet = item['snippet']
                duration_str = item['contentDetails']['duration']
                
                # Parse ISO 8601 duration (PT4M13S format)
                duration_seconds = self._parse_duration(duration_str)
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
            
            print(f"[DEBUG] Found {len(results)} videos")
            return results
            
        except requests.exceptions.RequestException as e:
            print(f"YouTube API request error: {e}")
            return []
        except Exception as e:
            print(f"YouTube API error: {e}")
            return []
    
    def _parse_duration(self, duration_str: str) -> int:
        """Parse ISO 8601 duration (PT4M13S) to seconds"""
        # Remove PT prefix
        duration_str = duration_str.replace('PT', '')
        
        hours = 0
        minutes = 0
        seconds = 0
        
        # Extract hours
        if 'H' in duration_str:
            hours = int(duration_str.split('H')[0])
            duration_str = duration_str.split('H')[1]
        
        # Extract minutes
        if 'M' in duration_str:
            minutes = int(duration_str.split('M')[0])
            duration_str = duration_str.split('M')[1]
        
        # Extract seconds
        if 'S' in duration_str:
            seconds = int(duration_str.replace('S', ''))
        
        return hours * 3600 + minutes * 60 + seconds
    
    def _parse_title(self, title: str) -> Dict[str, str]:
        """Try to extract artist and song from common patterns"""
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
        """Format seconds to MM:SS"""
        minutes = seconds // 60
        secs = seconds % 60
        return f"{minutes}:{secs:02d}"

youtube_service = YouTubeService()
