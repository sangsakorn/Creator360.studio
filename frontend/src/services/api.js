import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// YouTube API
export const searchYouTube = async (query, maxResults = 10) => {
  const response = await axios.post(`${API}/youtube/search`, { query, maxResults });
  return response.data.results;
};

export const addYouTubeSong = async (songData) => {
  const response = await axios.post(`${API}/songs/add-youtube`, songData);
  return response.data;
};

// File Upload API
export const uploadAudioFile = async (formData, onProgress) => {
  const response = await axios.post(`${API}/upload/audio`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      if (onProgress) onProgress(percentCompleted);
    },
  });
  return response.data;
};

// Song API
export const getSongs = async () => {
  const response = await axios.get(`${API}/songs`);
  return response.data;
};

export const getSong = async (id) => {
  const response = await axios.get(`${API}/songs/${id}`);
  return response.data;
};

export const deleteSong = async (id) => {
  const response = await axios.delete(`${API}/songs/${id}`);
  return response.data;
};

export const getAudioStreamUrl = (songId) => {
  return `${API}/stream/audio/${songId}`;
};

// Playlist API
export const getPlaylists = async () => {
  const response = await axios.get(`${API}/playlists`);
  return response.data;
};

export const getPlaylist = async (id) => {
  const response = await axios.get(`${API}/playlists/${id}`);
  return response.data;
};

export const createPlaylist = async (playlistData) => {
  const response = await axios.post(`${API}/playlists`, playlistData);
  return response.data;
};

export const updatePlaylist = async (id, playlistData) => {
  const response = await axios.put(`${API}/playlists/${id}`, playlistData);
  return response.data;
};

export const deletePlaylist = async (id) => {
  const response = await axios.delete(`${API}/playlists/${id}`);
  return response.data;
};

export const addSongToPlaylist = async (playlistId, songId) => {
  const response = await axios.post(`${API}/playlists/${playlistId}/songs`, { songId });
  return response.data;
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
  const response = await axios.delete(`${API}/playlists/${playlistId}/songs/${songId}`);
  return response.data;
};

export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
