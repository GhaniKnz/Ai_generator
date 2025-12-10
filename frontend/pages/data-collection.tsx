import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { ArrowDownTrayIcon, MagnifyingGlassIcon, ArrowTopRightOnSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
  const [previewImage, setPreviewImage] = useState<ImageSource | null>(null);

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
          <h3 className="font-semibold mb-3 text-blue-300 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span>À Propos de la Collection de Données</span>
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>
              ✨ Cet outil vous permet de rechercher et prévisualiser des images provenant de sources gratuites 
              et légales comme <span className="text-cyan-400 font-semibold">Unsplash</span> et <span className="text-cyan-400 font-semibold">Pexels</span>.
            </p>
            <p>
              🎯 Toutes les images respectent les exigences de licence et peuvent être utilisées pour l'entraînement de l'IA.
            </p>
            <p>
              📥 Sélectionnez les images que vous souhaitez importer et elles seront automatiquement téléchargées 
              dans votre dataset pour entraîner votre modèle.
            </p>
          </div>
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
              <label className="block text-sm font-medium mb-2 text-gray-300">
                🔍 Requête de recherche
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ex: paysage forestier, portrait, coucher de soleil..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                🌐 Source des données
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
              >
                <option value="both">Les deux (Unsplash + Pexels)</option>
                <option value="unsplash">Unsplash uniquement</option>
                <option value="pexels">Pexels uniquement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                📁 Type de média
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
              >
                <option value="image">Images</option>
                <option value="video">Vidéos</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
          >
            {searching ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Recherche en cours...
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="w-5 h-5" />
                Rechercher des images
              </>
            )}
          </button>
        </motion.div>

        {/* Results Section */}
        {searchResults.length > 0 && (
          <>
            <div className="bg-gray-800 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span>📷 Résultats de recherche</span>
                  <span className="text-cyan-400">({searchResults.length})</span>
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-purple-400 font-semibold">{selectedImages.size}</span>
                    <span className="text-gray-400"> sélectionné{selectedImages.size > 1 ? 's' : ''}</span>
                  </div>
                  {selectedImages.size > 0 && (
                    <button
                      onClick={() => setSelectedImages(new Set())}
                      className="text-sm text-gray-400 hover:text-white transition"
                    >
                      Désélectionner tout
                    </button>
                  )}
                </div>
              </div>

              {/* Selection Controls */}
              <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      📦 Dataset cible pour l'importation
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={datasetId}
                        onChange={(e) => setDatasetId(e.target.value)}
                        min="1"
                        className="w-32 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-400">
                        Les images seront importées directement dans ce dataset
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    disabled={loading || selectedImages.size === 0}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg disabled:shadow-none flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Importation...
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Importer {selectedImages.size} image{selectedImages.size > 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {downloadStatus && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4 flex items-start gap-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <div className="font-medium text-green-300 mb-1">Import réussi!</div>
                    <div className="text-sm text-gray-300">{downloadStatus}</div>
                    <div className="text-xs text-gray-400 mt-2">
                      Les images ont été téléchargées et ajoutées au dataset. Vous pouvez maintenant les utiliser pour entraîner votre IA.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-gray-800 rounded-lg overflow-hidden transition-all ${
                    selectedImages.has(image.id) ? 'ring-4 ring-purple-500' : 'hover:ring-2 hover:ring-gray-600'
                  }`}
                >
                  <div 
                    className="relative aspect-video bg-gray-700 cursor-pointer group"
                    onClick={() => toggleImageSelection(image.id)}
                  >
                    {/* Real Image Preview */}
                    <img 
                      src={image.thumbnail_url} 
                      alt={image.description || `Image ${image.id}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 hidden items-center justify-center text-6xl bg-gray-700">
                      🖼️
                    </div>
                    
                    {/* Selection Checkbox */}
                    {selectedImages.has(image.id) && (
                      <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                        ✓
                      </div>
                    )}
                    
                    {/* Hover Overlay with Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(image);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                      >
                        👁️ Prévisualiser
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    {/* Source Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-cyan-900/50 text-cyan-300">
                        {image.source.toUpperCase()}
                      </span>
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-cyan-400 transition"
                        title="Voir sur le site source"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </a>
                    </div>
                    
                    {/* Description */}
                    <div className="text-sm font-medium mb-1 truncate" title={image.description || `Image ${image.id}`}>
                      {image.description || `Image ${image.id}`}
                    </div>
                    
                    {/* Author */}
                    <div className="text-xs text-gray-400 mb-2">
                      par{' '}
                      {image.author_url ? (
                        <a
                          href={image.author_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-cyan-400 hover:underline"
                        >
                          {image.author}
                        </a>
                      ) : (
                        <span className="text-gray-300">{image.author}</span>
                      )}
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {image.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {image.tags.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{image.tags.length - 2}
                        </span>
                      )}
                    </div>
                    
                    {/* Dimensions */}
                    <div className="text-xs text-green-400 font-mono">
                      {image.width} × {image.height}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {searchResults.length === 0 && !searching && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-6xl mb-4">🔍</div>
            <p>Entrez une requête de recherche pour trouver des images depuis Unsplash et Pexels</p>
            <p className="text-sm mt-2">Les images seront prévisualisées avec leurs liens sources</p>
          </div>
        )}

        {/* Preview Modal */}
        {previewImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gray-900 p-4 flex items-center justify-between border-b border-gray-700">
                <h3 className="text-xl font-bold text-white">Prévisualisation de l'image</h3>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Image Preview */}
              <div className="bg-gray-900 p-4">
                <img
                  src={previewImage.url}
                  alt={previewImage.description || 'Preview'}
                  className="w-full rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = previewImage.thumbnail_url;
                  }}
                />
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                {/* Title and Source */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded bg-cyan-900/50 text-cyan-300">
                      {previewImage.source.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">ID: {previewImage.id}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white">
                    {previewImage.description || 'Sans titre'}
                  </h4>
                </div>

                {/* Author */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Auteur:</span>
                  {previewImage.author_url ? (
                    <a
                      href={previewImage.author_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline font-medium flex items-center gap-1"
                    >
                      {previewImage.author}
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-white font-medium">{previewImage.author}</span>
                  )}
                </div>

                {/* Dimensions */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Dimensions:</span>
                  <span className="text-green-400 font-mono">
                    {previewImage.width} × {previewImage.height}px
                  </span>
                </div>

                {/* License */}
                <div>
                  <span className="text-sm text-gray-400">Licence: </span>
                  <span className="text-white">{previewImage.license}</span>
                </div>

                {/* Tags */}
                {previewImage.tags.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-400 mb-2 block">Tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {previewImage.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <a
                    href={previewImage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                    Voir sur {previewImage.source}
                  </a>
                  <a
                    href={previewImage.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Télécharger
                  </a>
                  <button
                    onClick={() => {
                      toggleImageSelection(previewImage.id);
                      setPreviewImage(null);
                    }}
                    className={`flex-1 ${
                      selectedImages.has(previewImage.id)
                        ? 'bg-purple-700 hover:bg-purple-800'
                        : 'bg-purple-600 hover:bg-purple-700'
                    } text-white py-3 rounded-lg font-medium transition`}
                  >
                    {selectedImages.has(previewImage.id) ? '✓ Sélectionné' : 'Sélectionner pour import'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
}
