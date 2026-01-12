import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Player from './components/Player';
import { mockSongs } from './data/mockData';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePlaySong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    
    // Set queue based on context
    if (selectedPlaylist) {
      const playlistSongs = mockSongs.filter(s => selectedPlaylist.songs.includes(s.id));
      setQueue(playlistSongs);
      setCurrentIndex(playlistSongs.findIndex(s => s.id === song.id));
    } else {
      setQueue(mockSongs);
      setCurrentIndex(mockSongs.findIndex(s => s.id === song.id));
    }
  };

  const handleNext = () => {
    if (queue.length === 0) return;
    const nextIndex = (currentIndex + 1) % queue.length;
    setCurrentIndex(nextIndex);
    setCurrentSong(queue[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (queue.length === 0) return;
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentSong(queue[prevIndex]);
    setIsPlaying(true);
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          selectedPlaylist={selectedPlaylist}
          setSelectedPlaylist={setSelectedPlaylist}
        />
        <MainContent
          currentView={currentView}
          selectedPlaylist={selectedPlaylist}
          onPlaySong={handlePlaySong}
          currentSong={currentSong}
        />
      </div>
      <Player
        currentSong={currentSong}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
}

export default App;
