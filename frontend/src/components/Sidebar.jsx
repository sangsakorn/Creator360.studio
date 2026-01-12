import React from 'react';
import { Home, Search, Library, Plus, Heart } from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView, selectedPlaylist, setSelectedPlaylist, playlists, onCreatePlaylist }) => {
  const menuItems = [
    { icon: Home, label: 'Home', view: 'home' },
    { icon: Search, label: 'Search', view: 'search' },
    { icon: Library, label: 'Your Library', view: 'library' }
  ];

  return (
    <div className="w-64 bg-black h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <img 
          src="https://customer-assets.emergentagent.com/job_spotify-clone-2606/artifacts/i5v8gv2g_IMG_20251226_200125.png" 
          alt="Creator360.Studio" 
          className="w-10 h-10"
        />
        <h1 className="text-white text-xl font-bold">Creator360</h1>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 mb-6">
        {menuItems.map((item) => (
          <button
            key={item.view}
            onClick={() => {
              setCurrentView(item.view);
              setSelectedPlaylist(null);
            }}
            className={`flex items-center gap-4 w-full px-3 py-3 rounded-md transition-colors ${
              currentView === item.view && !selectedPlaylist
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <item.icon size={24} />
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Create Playlist */}
      <div className="px-3 mb-4">
        <button 
          onClick={onCreatePlaylist}
          className="flex items-center gap-4 w-full px-3 py-3 text-neutral-400 hover:text-white transition-colors"
        >
          <Plus size={24} />
          <span className="font-semibold">Create Playlist</span>
        </button>
        <button className="flex items-center gap-4 w-full px-3 py-3 text-neutral-400 hover:text-white transition-colors">
          <Heart size={24} />
          <span className="font-semibold">Liked Songs</span>
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-800 mx-6 mb-4"></div>

      {/* Playlists */}
      <div className="flex-1 overflow-y-auto px-3">
        {playlists.map((playlist) => (
          <button
            key={playlist._id}
            onClick={() => {
              setSelectedPlaylist(playlist);
              setCurrentView(null);
            }}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              selectedPlaylist?._id === playlist._id
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <p className="text-sm font-medium truncate">{playlist.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
