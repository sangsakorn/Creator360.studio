import React from 'react';
import { Home, Search, Library, Plus, Heart } from 'lucide-react';
import { mockPlaylists } from '../data/mockData';

const Sidebar = ({ currentView, setCurrentView, selectedPlaylist, setSelectedPlaylist }) => {
  const menuItems = [
    { icon: Home, label: 'Home', view: 'home' },
    { icon: Search, label: 'Search', view: 'search' },
    { icon: Library, label: 'Your Library', view: 'library' }
  ];

  return (
    <div className="w-64 bg-black h-full flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-white text-2xl font-bold">Spotify</h1>
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
        <button className="flex items-center gap-4 w-full px-3 py-3 text-neutral-400 hover:text-white transition-colors">
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
        {mockPlaylists.map((playlist) => (
          <button
            key={playlist.id}
            onClick={() => {
              setSelectedPlaylist(playlist);
              setCurrentView(null);
            }}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              selectedPlaylist?.id === playlist.id
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
