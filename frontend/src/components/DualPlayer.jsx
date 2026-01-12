import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX } from 'lucide-react';
import { formatDuration, getAudioStreamUrl } from '../services/api';

const DualPlayer = ({ currentSong, isPlaying, setIsPlaying, onNext, onPrevious }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const audioRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const intervalRef = useRef(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Handle song change
  useEffect(() => {
    if (!currentSong) return;

    setCurrentTime(0);
    setDuration(currentSong.duration || 0);

    if (currentSong.source === 'youtube') {
      // YouTube player
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      if (window.YT && window.YT.Player) {
        if (youtubePlayerRef.current) {
          youtubePlayerRef.current.loadVideoById(currentSong.videoId);
        } else {
          youtubePlayerRef.current = new window.YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: currentSong.videoId,
            playerVars: {
              autoplay: isPlaying ? 1 : 0,
              controls: 0,
            },
            events: {
              onReady: (event) => {
                if (isPlaying) {
                  event.target.playVideo();
                }
              },
              onStateChange: (event) => {
                if (event.data === window.YT.PlayerState.ENDED) {
                  handleEnded();
                }
              },
            },
          });
        }

        // Update time for YouTube
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime) {
            setCurrentTime(youtubePlayerRef.current.getCurrentTime());
          }
        }, 100);
      }
    } else {
      // Audio file
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.stopVideo();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (audioRef.current) {
        audioRef.current.src = getAudioStreamUrl(currentSong._id);
        audioRef.current.load();
        if (isPlaying) {
          audioRef.current.play().catch(e => console.log('Playback error:', e));
        }
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentSong]);

  // Handle play/pause
  useEffect(() => {
    if (!currentSong) return;

    if (currentSong.source === 'youtube' && youtubePlayerRef.current) {
      if (isPlaying) {
        youtubePlayerRef.current.playVideo();
      } else {
        youtubePlayerRef.current.pauseVideo();
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log('Playback error:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  const handleTimeUpdate = () => {
    if (audioRef.current && currentSong?.source !== 'youtube') {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);

    if (currentSong?.source === 'youtube' && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(seekTime, true);
    } else if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (currentSong?.source === 'youtube' && youtubePlayerRef.current) {
      youtubePlayerRef.current.setVolume(newVolume * 100);
    } else if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }

    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (currentSong?.source === 'youtube' && youtubePlayerRef.current) {
      if (newMuted) {
        youtubePlayerRef.current.mute();
      } else {
        youtubePlayerRef.current.unMute();
      }
    } else if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (currentSong?.source === 'youtube' && youtubePlayerRef.current) {
        youtubePlayerRef.current.seekTo(0);
        youtubePlayerRef.current.playVideo();
      } else if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      onNext();
    }
  };

  if (!currentSong) {
    return (
      <div className="h-24 bg-neutral-900 border-t border-neutral-800 flex items-center justify-center">
        <p className="text-neutral-500">Select a song to play</p>
      </div>
    );
  }

  return (
    <div className="h-24 bg-neutral-900 border-t border-neutral-800 px-4 flex items-center justify-between">
      {/* Hidden YouTube player */}
      <div id="youtube-player" style={{ display: 'none' }}></div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
      />

      {/* Current Song Info */}
      <div className="flex items-center gap-4 w-1/4">
        <img
          src={currentSong.coverImage}
          alt={currentSong.title}
          className="w-14 h-14 rounded"
        />
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">{currentSong.title}</p>
          <p className="text-neutral-400 text-xs truncate">{currentSong.artist}</p>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex flex-col items-center gap-2 w-2/4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsShuffled(!isShuffled)}
            className={`text-neutral-400 hover:text-white transition-colors ${
              isShuffled ? 'text-orange-500' : ''
            }`}
          >
            <Shuffle size={16} />
          </button>
          <button
            onClick={onPrevious}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button
            onClick={onNext}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button
            onClick={() => {
              const modes = ['off', 'all', 'one'];
              const currentIndex = modes.indexOf(repeatMode);
              const nextMode = modes[(currentIndex + 1) % modes.length];
              setRepeatMode(nextMode);
            }}
            className={`text-neutral-400 hover:text-white transition-colors ${
              repeatMode !== 'off' ? 'text-orange-500' : ''
            }`}
          >
            <Repeat size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-neutral-400 w-10 text-right">
            {formatDuration(Math.floor(currentTime))}
          </span>
          <input
            type="range"
            min="0"
            max={duration || currentSong.duration}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-neutral-600 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #FF9D42 0%, #FF9D42 ${(currentTime / (duration || currentSong.duration)) * 100}%, #4b5563 ${(currentTime / (duration || currentSong.duration)) * 100}%, #4b5563 100%)`
            }}
          />
          <span className="text-xs text-neutral-400 w-10">
            {formatDuration(duration || currentSong.duration)}
          </span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2 w-1/4 justify-end">
        <button onClick={toggleMute} className="text-neutral-400 hover:text-white transition-colors">
          {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-neutral-600 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #FF9D42 0%, #FF9D42 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
          }}
        />
      </div>
    </div>
  );
};

export default DualPlayer;
