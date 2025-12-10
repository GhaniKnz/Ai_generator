import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { ArrowDownTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ImageSource {
  id: string;
  source: string;
  url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  author: string;
  author_url?: string;
  description?: string;
  tags: string[];
  license: string;
  download_url: string;
}

interface SearchResponse {
  search_id: string;
  query: string;
  total_results: number;
  results: ImageSource[];
  page: number;
  per_page: number;
}

export default function DataCollection() {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('both');
  const [mediaType, setMediaType] = useState('image');
  const [searchResults, setSearchResults] = useState<ImageSource[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [datasetId, setDatasetId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string>('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setSearching(true);
    try {
      const response = await fetch('http://localhost:8000/api/data-collection/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          source,
          media_type: mediaType,
          per_page: 20,
          page: 1
        })
      });
      
      const data: SearchResponse = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Make sure the backend is running.');
    } finally {
      setSearching(false);
    }
  };

  const toggleImageSelection = (imageId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleDownload = async () => {
    if (selectedImages.size === 0) {
      alert('Please select at least one image');
      return;
    }

    setLoading(true);
    setDownloadStatus('Starting download...');
    
    try {
      const response = await fetch('http://localhost:8000/api/data-collection/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_ids: Array.from(selectedImages),
          dataset_id: parseInt(datasetId),
          add_tags: true
        })
      });
      
      const data = await response.json();
      setDownloadStatus(`Download started! Job ID: ${data.download_id}`);
      
      // Clear selection
      setSelectedImages(new Set());
      
      setTimeout(() => setDownloadStatus(''), 5000);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus('Download failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Collection de Données">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Collection de Données
            </span>
          </h2>
          <p className="text-gray-400">
            Recherchez et téléchargez des images gratuites pour enrichir vos datasets
          </p>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-apple-lg p-6 border border-blue-500/20 bg-blue-900/10 mb-8"
        >
          <h3 className="font-semibold mb-2 text-blue-300">📝 À Propos de la Collection de Données</h3>
          <p className="text-sm text-gray-300">
            Cet outil vous permet de rechercher des images provenant de sources gratuites et légales comme Unsplash et Pexels.
            Toutes les images respectent les exigences de licence et peuvent être utilisées pour l'entraînement de l'IA.
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-apple-lg p-6 border border-white/10 mb-8"
        >
          <div className="flex items-center space-x-2 mb-6">
            <MagnifyingGlassIcon className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Rechercher des Images</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Query</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., forest landscape, portrait, sunset..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="both">Both (Unsplash + Pexels)</option>
                <option value="unsplash">Unsplash</option>
                <option value="pexels">Pexels</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Media Type</label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
          >
            {searching ? '🔍 Rechercher...' : '🔍 Rechercher'}
          </button>
        </motion.div>

        {/* Results Section */}
        {searchResults.length > 0 && (
          <>
            <div className="bg-gray-800 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  📷 Results ({searchResults.length} images)
                </h2>
                <div className="text-sm text-gray-400">
                  {selectedImages.size} selected
                </div>
              </div>

              {/* Selection Controls */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    Target Dataset ID
                  </label>
                  <input
                    type="number"
                    value={datasetId}
                    onChange={(e) => setDatasetId(e.target.value)}
                    min="1"
                    className="w-32 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                </div>
                <button
                  onClick={handleDownload}
                  disabled={loading || selectedImages.size === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg"
                >
                  {loading ? '⏳ Downloading...' : `⬇️ Download ${selectedImages.size} to Dataset`}
                </button>
              </div>

              {downloadStatus && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-4">
                  {downloadStatus}
                </div>
              )}
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((image) => (
                <div
                  key={image.id}
                  className={`bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition ${
                    selectedImages.has(image.id) ? 'ring-4 ring-purple-500' : ''
                  }`}
                  onClick={() => toggleImageSelection(image.id)}
                >
                  <div className="relative aspect-video bg-gray-700">
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                      🖼️
                    </div>
                    {selectedImages.has(image.id) && (
                      <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-gray-400 mb-1">
                      {image.source.toUpperCase()}
                    </div>
                    <div className="text-sm font-medium mb-1 truncate">
                      {image.description || `Image ${image.id}`}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      by {image.author}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {image.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-700 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-green-400 mt-2">
                      {image.width} × {image.height}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {searchResults.length === 0 && !searching && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-6xl mb-4">🔍</div>
            <p>Enter a search query to find images from Unsplash and Pexels</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
