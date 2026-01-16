import React, { useEffect, useState } from 'react';
import { Play, Clock, Plus, Search as SearchIcon } from 'lucide-react';
import { getSongs, formatDuration } from '../services/api';
import AIStudio from './AIStudio';

const MainContent = ({
  currentView,
  selectedPlaylist,
  onPlaySong,
  currentSong,
  playlists,
  songs,
  onOpenImportModal,
  onRefreshData
}) => {
  const renderHome = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Good {getGreeting()}</h2>
        <div className="grid grid-cols-3 gap-4">
          {playlists.slice(0, 6).map((playlist) => (
            <div
              key={playlist._id}
              className="bg-neutral-800 rounded flex items-center gap-4 overflow-hidden group hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              <img
                src={playlist.coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'}
                alt={playlist.name}
                className="w-20 h-20 object-cover"
              />
              <span className="text-white font-semibold flex-1 truncate">{playlist.name}</span>
              <button className="opacity-0 group-hover:opacity-100 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full p-3 mr-4 hover:scale-105 transition-all">
                <Play size={20} fill="currentColor" className="text-black" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
          <button
            onClick={onOpenImportModal}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 text-white rounded-full hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus size={16} />
            Import Music
          </button>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="bg-neutral-800 p-4 rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer group"
            >
              <div className="relative mb-4">
                <img
                  src={playlist.coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'}
                  alt={playlist.name}
                  className="w-full aspect-square object-cover rounded-md shadow-lg"
                />
                <button className="absolute bottom-2 right-2 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:scale-105">
                  <Play size={20} fill="currentColor" className="text-white" />
                </button>
              </div>
              <h3 className="text-white font-semibold mb-2 truncate">{playlist.name}</h3>
              <p className="text-neutral-400 text-sm line-clamp-2">
                {playlist.description || `${playlist.songs?.length || 0} songs`}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Recent Songs</h2>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {songs.slice(0, 10).map((song) => (
            <div
              key={song._id}
              onClick={() => onPlaySong(song)}
              className="bg-neutral-800 p-4 rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer group"
            >
              <div className="relative mb-4">
                <img
                  src={song.coverImage}
                  alt={song.title}
                  className="w-full aspect-square object-cover rounded-md shadow-lg"
                />
                <button className="absolute bottom-2 right-2 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:scale-105">
                  <Play size={20} fill="currentColor" className="text-white" />
                </button>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1 truncate">{song.title}</h3>
              <p className="text-neutral-400 text-xs truncate">{song.artist}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Search</h2>
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
        <input
          type="text"
          placeholder="What do you want to listen to?"
          className="w-full bg-white text-black pl-12 pr-4 py-3 rounded-full focus:outline-none"
        />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Browse all</h3>
        <div className="grid grid-cols-4 gap-4">
          {['Pop', 'Hip-Hop', 'Rock', 'Jazz', 'Electronic', 'Classical', 'R&B', 'Country'].map((genre, index) => (
            <div
              key={genre}
              className="aspect-square rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
              style={{
                background: `linear-gradient(135deg, ${[
                  '#FF9D42', '#B24FD6', '#4FB4D6', '#FF6B9D',
                  '#4FB4D6', '#B24FD6', '#FF9D42', '#FF6B9D'
                ][index]}, ${[
                  '#FFB976', '#C879E8', '#7AC5E0', '#FF8AB3',
                  '#7AC5E0', '#C879E8', '#FFB976', '#FF8AB3'
                ][index]})`
              }}
            >
              <h3 className="text-white text-2xl font-bold">{genre}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your Library</h2>
        <button
          onClick={onOpenImportModal}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 text-white rounded-full hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus size={16} />
          Import Music
        </button>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist._id}
            className="bg-neutral-800 p-4 rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <img
              src={playlist.coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'}
              alt={playlist.name}
              className="w-full aspect-square object-cover rounded-md shadow-lg mb-4"
            />
            <h3 className="text-white font-semibold mb-1 truncate">{playlist.name}</h3>
            <p className="text-neutral-400 text-sm">Playlist • {playlist.songs?.length || 0} songs</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlaylist = () => {
    if (!selectedPlaylist) return null;

    // Get songs for this playlist
    const playlistSongs = songs.filter(song => 
      selectedPlaylist.songs?.includes(song._id)
    );

    return (
      <div className="space-y-6">
        {/* Playlist Header */}
        <div className="flex items-end gap-6 bg-gradient-to-b from-purple-800 via-purple-700 to-neutral-900 p-8 -m-8 mb-0 rounded-t-lg">
          <img
            src={selectedPlaylist.coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'}
            alt={selectedPlaylist.name}
            className="w-56 h-56 shadow-2xl rounded"
          />
          <div>
            <p className="text-sm font-semibold text-white mb-2">PLAYLIST</p>
            <h1 className="text-7xl font-bold text-white mb-6">{selectedPlaylist.name}</h1>
            <p className="text-neutral-300 mb-4">{selectedPlaylist.description}</p>
            <p className="text-sm text-white">
              <span className="font-semibold">Creator360.Studio</span> • {playlistSongs.length} songs
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-8 px-8">
          <button
            onClick={() => playlistSongs.length > 0 && onPlaySong(playlistSongs[0])}
            className="bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-full p-4 hover:scale-105 transition-all"
            disabled={playlistSongs.length === 0}
          >
            <Play size={28} fill="currentColor" />
          </button>
          <button
            onClick={() => onOpenImportModal(selectedPlaylist._id)}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <Plus size={32} />
          </button>
        </div>

        {/* Songs Table */}
        <div className="px-8">
          {playlistSongs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-400 mb-4">No songs in this playlist yet</p>
              <button
                onClick={() => onOpenImportModal(selectedPlaylist._id)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-full hover:opacity-90 transition-opacity"
              >
                Add Songs
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[16px_4fr_3fr_2fr_1fr] gap-4 px-4 py-2 text-neutral-400 text-sm border-b border-neutral-800">
                <div>#</div>
                <div>TITLE</div>
                <div>ALBUM</div>
                <div>SOURCE</div>
                <div className="flex justify-end">
                  <Clock size={16} />
                </div>
              </div>
              {playlistSongs.map((song, index) => (
                <div
                  key={song._id}
                  onClick={() => onPlaySong(song)}
                  className={`grid grid-cols-[16px_4fr_3fr_2fr_1fr] gap-4 px-4 py-3 rounded hover:bg-neutral-800 transition-colors cursor-pointer group ${
                    currentSong?._id === song._id ? 'bg-neutral-800' : ''
                  }`}
                >
                  <div className="text-neutral-400 flex items-center">
                    {currentSong?._id === song._id ? (
                      <div className="text-orange-500">▶</div>
                    ) : (
                      <span className="group-hover:hidden">{index + 1}</span>
                    )}
                    <Play size={16} className="hidden group-hover:block text-white" />
                  </div>
                  <div className="flex items-center gap-3">
                    <img src={song.coverImage} alt={song.title} className="w-10 h-10 rounded" />
                    <div>
                      <p className={`font-medium ${
                        currentSong?._id === song._id ? 'text-orange-500' : 'text-white'
                      }`}>{song.title}</p>
                      <p className="text-sm text-neutral-400">{song.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-neutral-400">{song.album || 'Unknown Album'}</div>
                  <div className="flex items-center text-neutral-400 capitalize">
                    {song.source === 'youtube' ? 'YouTube' : 'Uploaded'}
                  </div>
                  <div className="flex items-center justify-end text-neutral-400">
                    {formatDuration(song.duration)}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-neutral-900 to-black overflow-y-auto p-8">
      {selectedPlaylist ? renderPlaylist() : (
        currentView === 'home' ? renderHome() :
        currentView === 'search' ? renderSearch() :
        currentView === 'library' ? renderLibrary() :
        currentView === 'ai-studio' ? <AIStudio /> :
        renderHome()
      )}
    </div>
  );
};

export default MainContent;
