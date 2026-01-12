import React from 'react';
import { Play, Clock } from 'lucide-react';
import { mockPlaylists, mockSongs, mockArtists, formatDuration } from '../data/mockData';

const MainContent = ({ currentView, selectedPlaylist, onPlaySong, currentSong }) => {
  const renderHome = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Good afternoon</h2>
        <div className="grid grid-cols-3 gap-4">
          {mockPlaylists.slice(0, 6).map((playlist) => (
            <div
              key={playlist.id}
              className="bg-neutral-800 rounded flex items-center gap-4 overflow-hidden group hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              <img src={playlist.coverImage} alt={playlist.name} className="w-20 h-20" />
              <span className="text-white font-semibold flex-1 truncate">{playlist.name}</span>
              <button className="opacity-0 group-hover:opacity-100 bg-green-500 rounded-full p-3 mr-4 hover:scale-105 transition-all">
                <Play size={20} fill="currentColor" className="text-black" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Your top mixes</h2>
        <div className="grid grid-cols-5 gap-4">
          {mockPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-neutral-800 p-4 rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer group"
            >
              <div className="relative mb-4">
                <img
                  src={playlist.coverImage}
                  alt={playlist.name}
                  className="w-full aspect-square object-cover rounded-md shadow-lg"
                />
                <button className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:scale-105">
                  <Play size={20} fill="currentColor" className="text-black" />
                </button>
              </div>
              <h3 className="text-white font-semibold mb-2 truncate">{playlist.name}</h3>
              <p className="text-neutral-400 text-sm line-clamp-2">{playlist.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Popular artists</h2>
        <div className="grid grid-cols-5 gap-4">
          {mockArtists.map((artist) => (
            <div
              key={artist.id}
              className="bg-neutral-800 p-4 rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer group"
            >
              <div className="relative mb-4">
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-full aspect-square object-cover rounded-full shadow-lg"
                />
                <button className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:scale-105">
                  <Play size={20} fill="currentColor" className="text-black" />
                </button>
              </div>
              <h3 className="text-white font-semibold text-center truncate">{artist.name}</h3>
              <p className="text-neutral-400 text-sm text-center">Artist</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Search</h2>
      <input
        type="text"
        placeholder="What do you want to listen to?"
        className="w-full bg-white text-black px-4 py-3 rounded-full focus:outline-none"
      />
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Browse all</h3>
        <div className="grid grid-cols-4 gap-4">
          {['Pop', 'Hip-Hop', 'Rock', 'Jazz', 'Electronic', 'Classical', 'R&B', 'Country'].map((genre, index) => (
            <div
              key={genre}
              className="aspect-square rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
              style={{
                background: `linear-gradient(135deg, ${[
                  '#E13300', '#1E3264', '#8D67AB', '#477D95',
                  '#1E3264', '#477D95', '#8D67AB', '#E13300'
                ][index]}, ${[
                  '#FF6B35', '#2E5090', '#BA5D99', '#5B9FB8',
                  '#2E5090', '#5B9FB8', '#BA5D99', '#FF6B35'
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
      <h2 className="text-2xl font-bold text-white mb-4">Your Library</h2>
      <div className="grid grid-cols-5 gap-4">
        {mockPlaylists.map((playlist) => (
          <div
            key={playlist.id}
            className="bg-neutral-800 p-4 rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <img
              src={playlist.coverImage}
              alt={playlist.name}
              className="w-full aspect-square object-cover rounded-md shadow-lg mb-4"
            />
            <h3 className="text-white font-semibold mb-1 truncate">{playlist.name}</h3>
            <p className="text-neutral-400 text-sm">Playlist • {playlist.songs.length} songs</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlaylist = () => {
    if (!selectedPlaylist) return null;

    const playlistSongs = mockSongs.filter(song => selectedPlaylist.songs.includes(song.id));

    return (
      <div className="space-y-6">
        {/* Playlist Header */}
        <div className="flex items-end gap-6 bg-gradient-to-b from-green-800 to-neutral-900 p-8 -m-8 mb-0">
          <img
            src={selectedPlaylist.coverImage}
            alt={selectedPlaylist.name}
            className="w-56 h-56 shadow-2xl rounded"
          />
          <div>
            <p className="text-sm font-semibold text-white mb-2">PLAYLIST</p>
            <h1 className="text-7xl font-bold text-white mb-6">{selectedPlaylist.name}</h1>
            <p className="text-neutral-300 mb-4">{selectedPlaylist.description}</p>
            <p className="text-sm text-white">
              <span className="font-semibold">Spotify</span> • {playlistSongs.length} songs
            </p>
          </div>
        </div>

        {/* Play Button */}
        <div className="flex items-center gap-8 px-8">
          <button
            onClick={() => playlistSongs.length > 0 && onPlaySong(playlistSongs[0])}
            className="bg-green-500 text-black rounded-full p-4 hover:scale-105 hover:bg-green-400 transition-all"
          >
            <Play size={28} fill="currentColor" />
          </button>
        </div>

        {/* Songs Table */}
        <div className="px-8">
          <div className="grid grid-cols-[16px_4fr_3fr_2fr_1fr] gap-4 px-4 py-2 text-neutral-400 text-sm border-b border-neutral-800">
            <div>#</div>
            <div>TITLE</div>
            <div>ALBUM</div>
            <div>DATE ADDED</div>
            <div className="flex justify-end">
              <Clock size={16} />
            </div>
          </div>
          {playlistSongs.map((song, index) => (
            <div
              key={song.id}
              onClick={() => onPlaySong(song)}
              className={`grid grid-cols-[16px_4fr_3fr_2fr_1fr] gap-4 px-4 py-3 rounded hover:bg-neutral-800 transition-colors cursor-pointer group ${
                currentSong?.id === song.id ? 'bg-neutral-800' : ''
              }`}
            >
              <div className="text-neutral-400 flex items-center">
                {currentSong?.id === song.id ? (
                  <div className="text-green-500">▶</div>
                ) : (
                  <span className="group-hover:hidden">{index + 1}</span>
                )}
                <Play size={16} className="hidden group-hover:block text-white" />
              </div>
              <div className="flex items-center gap-3">
                <img src={song.coverImage} alt={song.title} className="w-10 h-10 rounded" />
                <div>
                  <p className={`font-medium ${
                    currentSong?.id === song.id ? 'text-green-500' : 'text-white'
                  }`}>{song.title}</p>
                  <p className="text-sm text-neutral-400">{song.artist}</p>
                </div>
              </div>
              <div className="flex items-center text-neutral-400">{song.album}</div>
              <div className="flex items-center text-neutral-400">2 days ago</div>
              <div className="flex items-center justify-end text-neutral-400">
                {formatDuration(song.duration)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-neutral-900 to-black overflow-y-auto p-8">
      {selectedPlaylist ? renderPlaylist() : (
        currentView === 'home' ? renderHome() :
        currentView === 'search' ? renderSearch() :
        currentView === 'library' ? renderLibrary() :
        renderHome()
      )}
    </div>
  );
};

export default MainContent;
