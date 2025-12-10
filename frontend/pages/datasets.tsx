import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import FileUpload from '../components/FileUpload'
import { FolderIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Dataset {
  id: number
  name: string
  description: string | null
  type: string
  num_items: number
  tags: string[]
  created_at: string
}

interface UploadedFile {
  filename: string
  path: string
  size: number
  type: string
  extracted_files?: string[]
  error?: string
}

export default function Datasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [newDataset, setNewDataset] = useState({
    name: '',
    description: '',
    type: 'image',
    tags: ''
  })

  useEffect(() => {
    fetchDatasets()
  }, [])

  const fetchDatasets = async () => {
    try {
      const response = await fetch('/api/datasets/')
      if (response.ok) {
        const data = await response.json()
        setDatasets(data)
      }
    } catch (error) {
      console.error('Error fetching datasets:', error)
    }
  }

  const handleCreateDataset = async () => {
    try {
      const response = await fetch('/api/datasets/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDataset.name,
          description: newDataset.description || null,
          type: newDataset.type,
          tags: newDataset.tags.split(',').map(t => t.trim()).filter(t => t)
        })
      })

      if (response.ok) {
        await fetchDatasets()
        setShowCreateModal(false)
        setNewDataset({ name: '', description: '', type: 'image', tags: '' })
      }
    } catch (error) {
      console.error('Error creating dataset:', error)
    }
  }

  const handleDeleteDataset = async (id: number) => {
    if (!confirm('Delete this dataset?')) return

    try {
      const response = await fetch(`/api/datasets/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchDatasets()
      }
    } catch (error) {
      console.error('Error deleting dataset:', error)
    }
  }

  const handleUploadComplete = (files: UploadedFile[]) => {
    const successCount = files.filter(f => !f.error).length
    const errorCount = files.filter(f => f.error).length
    
    if (errorCount > 0) {
      setUploadError(`${errorCount} file(s) failed to upload`)
      setTimeout(() => setUploadError(null), 3000)
    }
    
    if (successCount > 0) {
      setUploadSuccess(`Successfully uploaded ${successCount} file(s)!`)
      setTimeout(() => {
        setUploadSuccess(null)
        setShowUploadModal(false)
      }, 2000)
    }
  }

  const handleUploadError = (error: string) => {
    setUploadError(error)
    setTimeout(() => setUploadError(null), 3000)
  }

  const openUploadModal = (datasetId: number) => {
    setSelectedDatasetId(datasetId)
    setShowUploadModal(true)
  }

  return (
    <Layout title="Ensembles de Données">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Ensembles de Données
              </span>
            </h2>
            <p className="text-gray-400">Gérez et organisez vos ensembles de données d'entraînement</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nouveau Dataset</span>
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <div className="text-2xl font-bold text-white mb-1">{datasets.length}</div>
            <div className="text-sm text-gray-400">Total Datasets</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {datasets.reduce((sum, ds) => sum + ds.num_items, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Éléments</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <div className="text-2xl font-bold text-green-400 mb-1">
              {datasets.filter(ds => ds.type === 'image').length}
            </div>
            <div className="text-sm text-gray-400">Datasets Images</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {datasets.filter(ds => ds.type === 'video').length}
            </div>
            <div className="text-sm text-gray-400">Datasets Vidéos</div>
          </motion.div>
        </div>

        {/* Datasets List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-apple-lg border border-white/10"
        >
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <FolderIcon className="w-6 h-6 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Tous les Datasets</h2>
            </div>
          </div>

          {datasets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">Aucun dataset pour le moment</div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Créer votre Premier Dataset
              </motion.button>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {datasets.map((dataset, index) => (
                <motion.div
                  key={dataset.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-6 hover:bg-white/5 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {dataset.name}
                      </h3>
                      {dataset.description && (
                        <p className="text-sm text-gray-400 mb-2">{dataset.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-400">
                          Type: <span className="text-white">{dataset.type}</span>
                        </span>
                        <span className="text-gray-400">
                          Items: <span className="text-white">{dataset.num_items}</span>
                        </span>
                        {dataset.tags.length > 0 && (
                          <div className="flex items-center space-x-1">
                            {dataset.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openUploadModal(dataset.id)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm rounded-xl hover:shadow-lg transition-all"
                      >
                        Upload
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.href = `/training?dataset=${dataset.id}`}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm rounded-xl hover:shadow-lg transition-all"
                      >
                        Entraîner
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteDataset(dataset.id)}
                        className="p-2 bg-red-500/20 text-red-400 text-sm rounded-xl hover:bg-red-500/30 transition-all"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 glass-effect rounded-apple-lg p-6 border border-blue-500/20 bg-blue-900/10"
        >
          <h3 className="text-sm font-semibold text-blue-300 mb-3">💡 À Propos des Datasets</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p><strong>Datasets d'Images:</strong> Collections d'images avec légendes pour l'entraînement de modèles d'images</p>
            <p><strong>Datasets de Vidéos:</strong> Clips vidéo pour l'entraînement de modèles de génération vidéo</p>
            <p><strong>Datasets Mixtes:</strong> Combinaison d'images et de vidéos</p>
            <p className="mt-4"><strong>Utilisation:</strong> Créez un dataset, téléchargez vos données, puis démarrez un travail d'entraînement pour affiner les modèles (LoRA, DreamBooth)</p>
          </div>
        </motion.div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect rounded-apple-lg border border-white/10 max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Créer un Nouveau Dataset</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={newDataset.name}
                  onChange={(e) => setNewDataset({...newDataset, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mon Dataset d'Entraînement"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newDataset.description}
                  onChange={(e) => setNewDataset({...newDataset, description: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Description du dataset..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type *
                </label>
                <select
                  value={newDataset.type}
                  onChange={(e) => setNewDataset({...newDataset, type: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="image">Image</option>
                  <option value="video">Vidéo</option>
                  <option value="mixed">Mixte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={newDataset.tags}
                  onChange={(e) => setNewDataset({...newDataset, tags: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="style, personnage, paysage"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 glass-effect text-gray-300 rounded-xl hover:text-white hover:bg-white/5 transition-all"
              >
                Annuler
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateDataset}
                disabled={!newDataset.name}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Créer
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect rounded-apple-lg border border-white/10 max-w-2xl w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Télécharger des Fichiers vers le Dataset</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </motion.button>
            </div>
            
            {uploadSuccess && (
              <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-lg mb-4">
                {uploadSuccess}
              </div>
            )}
            
            {uploadError && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-4">
                {uploadError}
              </div>
            )}
            
            {!uploadSuccess && (
              <FileUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                multiple={true}
                maxSizeMB={100}
                extractArchives={true}
              />
            )}
          </motion.div>
        </div>
      )}
    </Layout>
  )
}
