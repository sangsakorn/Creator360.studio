import React, { useState } from 'react';
import { X, Search, Upload, Loader2, Music, Plus } from 'lucide-react';
import { searchYouTube, addYouTubeSong, uploadAudioFile, addSongToPlaylist } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from '../hooks/use-toast';

const ImportModal = ({ isOpen, onClose, onSuccess, currentPlaylistId = null }) => {
  const [activeTab, setActiveTab] = useState('youtube');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({});

  const handleYouTubeSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchYouTube(searchQuery, 10);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'Failed to search YouTube. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddYouTubeSong = async (result) => {
    setIsAdding({ [result.videoId]: true });
    try {
      const songData = {
        videoId: result.videoId,
        title: result.title,
        artist: result.artist,
        duration: result.durationSeconds,
        coverImage: result.thumbnail,
        source: 'youtube',
      };

      const song = await addYouTubeSong(songData);
      
      // Add to playlist if currentPlaylistId is provided
      if (currentPlaylistId) {
        await addSongToPlaylist(currentPlaylistId, song._id);
      }

      toast({
        title: 'Song added!',
        description: `"${result.title}" added successfully.`,
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Add song error:', error);
      toast({
        title: 'Failed to add song',
        description: error.response?.data?.detail || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding({ [result.videoId]: false });
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'audio/flac'];
    const invalidFiles = files.filter(f => !allowedTypes.includes(f.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: 'Invalid file type',
        description: `${invalidFiles.length} file(s) skipped. Please upload MP3, WAV, M4A, or FLAC files.`,
        variant: 'destructive',
      });
      
      // Remove invalid files
      const validFiles = files.filter(f => allowedTypes.includes(f.type));
      if (validFiles.length === 0) return;
    }

    setIsUploading(true);
    setUploadingFiles(files.map(f => f.name));
    
    // Initialize status for each file
    const initialStatus = {};
    files.forEach(f => {
      initialStatus[f.name] = { progress: 0, status: 'uploading' };
    });
    setUploadStatus(initialStatus);

    // Upload files in parallel (max 3 at a time)
    const uploadPromises = files.map(async (file) => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const song = await uploadAudioFile(formData, (progress) => {
          setUploadStatus(prev => ({
            ...prev,
            [file.name]: { progress, status: 'uploading' }
          }));
        });

        // Add to playlist if currentPlaylistId is provided
        if (currentPlaylistId) {
          await addSongToPlaylist(currentPlaylistId, song._id);
        }

        setUploadStatus(prev => ({
          ...prev,
          [file.name]: { progress: 100, status: 'complete' }
        }));

        return { success: true, file: file.name };
      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error);
        setUploadStatus(prev => ({
          ...prev,
          [file.name]: { progress: 0, status: 'error' }
        }));
        return { success: false, file: file.name, error };
      }
    });

    const results = await Promise.all(uploadPromises);
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (successCount > 0) {
      toast({
        title: 'Upload complete!',
        description: `${successCount} file(s) uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}.`,
      });

      if (onSuccess) onSuccess();
    } else {
      toast({
        title: 'Upload failed',
        description: 'All uploads failed. Please try again.',
        variant: 'destructive',
      });
    }

    setIsUploading(false);
    setUploadingFiles([]);
    setUploadStatus({});
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 className="text-2xl font-bold text-white">Import Music</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('youtube')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'youtube'
                ? 'text-white border-b-2 border-orange-500'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            YouTube Search
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'upload'
                ? 'text-white border-b-2 border-orange-500'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Upload File
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'youtube' ? (
            <div className="space-y-4">
              {/* Search Form */}
              <form onSubmit={handleYouTubeSearch} className="flex gap-2">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for songs, artists, or albums..."
                  className="flex-1 bg-neutral-800 border-neutral-700 text-white"
                />
                <Button
                  type="submit"
                  disabled={isSearching}
                  className="bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 hover:opacity-90"
                >
                  {isSearching ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                </Button>
              </form>

              {/* Search Results */}
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div
                    key={result.videoId}
                    className="flex items-center gap-4 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
                  >
                    <img
                      src={result.thumbnail}
                      alt={result.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{result.title}</p>
                      <p className="text-neutral-400 text-sm truncate">{result.artist}</p>
                      <p className="text-neutral-500 text-xs">{result.duration}</p>
                    </div>
                    <Button
                      onClick={() => handleAddYouTubeSong(result)}
                      disabled={isAdding[result.videoId]}
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-purple-500 hover:opacity-90"
                    >
                      {isAdding[result.videoId] ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Upload Area */}
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                      <p className="text-white mb-2">Uploading {uploadingFiles.length} file(s)...</p>
                      <div className="w-full max-w-md space-y-2 px-4">
                        {uploadingFiles.map((fileName) => (
                          <div key={fileName} className="space-y-1">
                            <div className="flex justify-between text-xs text-neutral-400">
                              <span className="truncate max-w-[200px]">{fileName}</span>
                              <span>
                                {uploadStatus[fileName]?.status === 'complete' ? '✓' : 
                                 uploadStatus[fileName]?.status === 'error' ? '✗' : 
                                 `${uploadStatus[fileName]?.progress || 0}%`}
                              </span>
                            </div>
                            <div className="h-1 bg-neutral-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  uploadStatus[fileName]?.status === 'complete' ? 'bg-green-500' :
                                  uploadStatus[fileName]?.status === 'error' ? 'bg-red-500' :
                                  'bg-gradient-to-r from-orange-500 to-purple-500'
                                }`}
                                style={{ width: `${uploadStatus[fileName]?.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-neutral-400 mb-4" />
                      <p className="mb-2 text-sm text-white">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-neutral-400">MP3, WAV, M4A, or FLAC</p>
                      <p className="text-xs text-orange-500 mt-2">⚡ Select multiple files to upload at once</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/flac"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  multiple
                />
              </label>

              <div className="flex items-center gap-2 text-neutral-400 text-sm">
                <Music size={16} />
                <p>Audio metadata will be extracted from filename or ID3 tags</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
