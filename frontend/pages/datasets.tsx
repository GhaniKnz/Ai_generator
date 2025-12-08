import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Dataset {
  id: number
  name: string
  description: string | null
  type: string
  num_items: number
  tags: string[]
  created_at: string
}

export default function Datasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
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

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-blue-400 hover:text-blue-300 mr-4">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-white">Training Datasets</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + New Dataset
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-white mb-1">{datasets.length}</div>
            <div className="text-sm text-gray-400">Total Datasets</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {datasets.reduce((sum, ds) => sum + ds.num_items, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Items</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {datasets.filter(ds => ds.type === 'image').length}
            </div>
            <div className="text-sm text-gray-400">Image Datasets</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {datasets.filter(ds => ds.type === 'video').length}
            </div>
            <div className="text-sm text-gray-400">Video Datasets</div>
          </div>
        </div>

        {/* Datasets List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">All Datasets</h2>
          </div>

          {datasets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">No datasets yet</div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Your First Dataset
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {datasets.map((dataset) => (
                <div key={dataset.id} className="p-4 hover:bg-gray-700/50">
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
                      <Link
                        href={`/training?dataset=${dataset.id}`}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Train
                      </Link>
                      <button
                        onClick={() => handleDeleteDataset(dataset.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-300 mb-3">💡 About Datasets</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p><strong>Image Datasets:</strong> Collections of images with captions for training image models</p>
            <p><strong>Video Datasets:</strong> Video clips for training video generation models</p>
            <p><strong>Mixed Datasets:</strong> Combination of images and videos</p>
            <p className="mt-4"><strong>Usage:</strong> Create a dataset, upload your data, then start a training job to fine-tune models (LoRA, DreamBooth)</p>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Create New Dataset</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newDataset.name}
                  onChange={(e) => setNewDataset({...newDataset, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="My Training Dataset"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newDataset.description}
                  onChange={(e) => setNewDataset({...newDataset, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  rows={3}
                  placeholder="Dataset description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type *
                </label>
                <select
                  value={newDataset.type}
                  onChange={(e) => setNewDataset({...newDataset, type: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newDataset.tags}
                  onChange={(e) => setNewDataset({...newDataset, tags: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="style, character, landscape"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDataset}
                disabled={!newDataset.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
