import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import DualPlayer from './components/DualPlayer';
import ImportModal from './components/ImportModal';
import ThemeCustomizer from './components/ThemeCustomizer';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { Toaster } from './components/ui/toaster';
import { getSongs, getPlaylists, createPlaylist } from './services/api';
import { toast } from './hooks/use-toast';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Data from API
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');

  // Load data on mount
  useEffect(() => {
    loadData();
    
    // Load and apply saved theme
    const savedTheme = localStorage.getItem('creator360_theme');
    if (savedTheme) {
      const theme = JSON.parse(savedTheme);
      document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
      document.documentElement.style.setProperty('--accent-color', theme.accentColor);
      document.documentElement.style.setProperty('--bg-color', theme.backgroundColor);
      
      if (theme.backgroundImage) {
        document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, ${1 - theme.backgroundOpacity}), rgba(0, 0, 0, ${1 - theme.backgroundOpacity})), url(${theme.backgroundImage})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
      }
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [songsData, playlistsData] = await Promise.all([
        getSongs(),
        getPlaylists()
      ]);
      setSongs(songsData);
      setPlaylists(playlistsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaySong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    
    // Set queue based on context
    if (selectedPlaylist) {
      const playlistSongs = songs.filter(s => selectedPlaylist.songs?.includes(s._id));
      setQueue(playlistSongs);
      setCurrentIndex(playlistSongs.findIndex(s => s._id === song._id));
    } else {
      setQueue(songs);
      setCurrentIndex(songs.findIndex(s => s._id === song._id));
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

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a playlist name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newPlaylist = await createPlaylist({
        name: newPlaylistName,
        description: newPlaylistDescription,
        coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'
      });

      setPlaylists([...playlists, newPlaylist]);
      setIsCreatePlaylistModalOpen(false);
      setNewPlaylistName('');
      setNewPlaylistDescription('');

      toast({
        title: 'Success!',
        description: `Playlist "${newPlaylist.name}" created.`,
      });

      // Select the new playlist
      setSelectedPlaylist(newPlaylist);
      setCurrentView(null);
    } catch (error) {
      console.error('Create playlist error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create playlist.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenImportModal = (playlistId = null) => {
    if (playlistId) {
      const playlist = playlists.find(p => p._id === playlistId);
      setSelectedPlaylist(playlist);
    }
    setIsImportModalOpen(true);
  };

  const handleImportSuccess = () => {
    loadData();
    setIsImportModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <img 
            src="https://customer-assets.emergentagent.com/job_spotify-clone-2606/artifacts/i5v8gv2g_IMG_20251226_200125.png" 
            alt="Creator360.Studio" 
            className="w-20 h-20 mx-auto mb-4 animate-pulse"
          />
          <p className="text-white text-lg">Loading Creator360.Studio...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage onGetStarted={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <Dashboard onLogout={() => setIsAuthenticated(false)} />
      <Toaster />
      {isCreatePlaylistModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg w-full max-w-md p-6">
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Playlist Name</label>
                <Input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My Awesome Playlist"
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Description (Optional)</label>
                <Input
                  type="text"
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Best songs ever..."
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreatePlaylistModalOpen(false);
                    setNewPlaylistName('');
                    setNewPlaylistDescription('');
                  }}
                  className="border-neutral-700 text-white hover:bg-neutral-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePlaylist}
                  className="bg-gradient-to-r from-orange-500 to-purple-500 hover:opacity-90"
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
	         </div>
					        )}
										  </>
										  
}

export default App;
