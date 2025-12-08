import { useState, useEffect } from 'react'
import Link from 'next/link'

interface TrainingJob {
  id: string
  dataset_id: number
  base_model_id: number
  type: string
  status: string
  progress: number
  current_epoch: number | null
  loss: number | null
  output_path: string | null
  created_at: string
  updated_at: string
}

export default function Training() {
  const [jobs, setJobs] = useState<TrainingJob[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newJob, setNewJob] = useState({
    dataset_id: 1,
    base_model_id: 1,
    type: 'lora',
    output_name: '',
    learning_rate: 0.0001,
    batch_size: 4,
    num_epochs: 10,
    lora_rank: 4
  })

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/training/')
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error('Error fetching training jobs:', error)
    }
  }

  const handleCreateJob = async () => {
    try {
      const response = await fetch('/api/training/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset_id: newJob.dataset_id,
          base_model_id: newJob.base_model_id,
          type: newJob.type,
          output_name: newJob.output_name,
          config: {
            learning_rate: newJob.learning_rate,
            batch_size: newJob.batch_size,
            num_epochs: newJob.num_epochs,
            lora_rank: newJob.lora_rank,
            lora_alpha: newJob.lora_rank * 8,
            mixed_precision: 'fp16'
          }
        })
      })

      if (response.ok) {
        await fetchJobs()
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error creating training job:', error)
    }
  }

  const handleStartJob = async (jobId: string) => {
    try {
      await fetch(`/api/training/${jobId}/start`, { method: 'POST' })
      await fetchJobs()
    } catch (error) {
      console.error('Error starting job:', error)
    }
  }

  const handleCancelJob = async (jobId: string) => {
    try {
      await fetch(`/api/training/${jobId}/cancel`, { method: 'POST' })
      await fetchJobs()
    } catch (error) {
      console.error('Error cancelling job:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'running': return 'text-blue-400'
      case 'failed': return 'text-red-400'
      case 'cancelled': return 'text-gray-400'
      default: return 'text-yellow-400'
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
            <h1 className="text-2xl font-bold text-white">Training Jobs</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/datasets"
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Manage Datasets
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + New Training Job
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-white mb-1">{jobs.length}</div>
            <div className="text-sm text-gray-400">Total Jobs</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {jobs.filter(j => j.status === 'running').length}
            </div>
            <div className="text-sm text-gray-400">Running</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {jobs.filter(j => j.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {jobs.filter(j => j.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">All Training Jobs</h2>
          </div>

          {jobs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">No training jobs yet</div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Start Your First Training
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {jobs.map((job) => (
                <div key={job.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-semibold text-white">{job.id}</h3>
                        <span className={`text-sm font-semibold ${getStatusColor(job.status)}`}>
                          {job.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>Type: {job.type}</span>
                        <span>Dataset ID: {job.dataset_id}</span>
                        <span>Base Model ID: {job.base_model_id}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {job.status === 'pending' && (
                        <button
                          onClick={() => handleStartJob(job.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Start
                        </button>
                      )}
                      {job.status === 'running' && (
                        <button
                          onClick={() => handleCancelJob(job.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(job.status === 'running' || job.status === 'completed') && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(job.progress * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Metrics */}
                  {job.current_epoch && (
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Epoch: {job.current_epoch}</span>
                      {job.loss && <span>Loss: {job.loss.toFixed(4)}</span>}
                    </div>
                  )}

                  {/* Output */}
                  {job.output_path && (
                    <div className="mt-2 text-sm text-green-400">
                      ✓ Model saved: {job.output_path}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-300 mb-3">💡 Training Info</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p><strong>LoRA Training:</strong> Lightweight fine-tuning for specific styles or subjects (recommended)</p>
            <p><strong>DreamBooth:</strong> Fine-tune model on specific subjects or concepts</p>
            <p><strong>Full Training:</strong> Complete model training (requires significant resources)</p>
            <p className="mt-4"><strong>Tip:</strong> Start with LoRA training with rank 4-8 for best results with minimal resources</p>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Create Training Job</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dataset ID *
                  </label>
                  <input
                    type="number"
                    value={newJob.dataset_id}
                    onChange={(e) => setNewJob({...newJob, dataset_id: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Base Model ID *
                  </label>
                  <input
                    type="number"
                    value={newJob.base_model_id}
                    onChange={(e) => setNewJob({...newJob, base_model_id: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Training Type *
                </label>
                <select
                  value={newJob.type}
                  onChange={(e) => setNewJob({...newJob, type: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="lora">LoRA (Recommended)</option>
                  <option value="dreambooth">DreamBooth</option>
                  <option value="full">Full Fine-tuning</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Output Name *
                </label>
                <input
                  type="text"
                  value={newJob.output_name}
                  onChange={(e) => setNewJob({...newJob, output_name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="my-custom-lora"
                />
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-white mb-3">Training Configuration</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Learning Rate
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      value={newJob.learning_rate}
                      onChange={(e) => setNewJob({...newJob, learning_rate: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Batch Size
                    </label>
                    <input
                      type="number"
                      value={newJob.batch_size}
                      onChange={(e) => setNewJob({...newJob, batch_size: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Number of Epochs
                    </label>
                    <input
                      type="number"
                      value={newJob.num_epochs}
                      onChange={(e) => setNewJob({...newJob, num_epochs: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      LoRA Rank
                    </label>
                    <input
                      type="number"
                      value={newJob.lora_rank}
                      onChange={(e) => setNewJob({...newJob, lora_rank: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                </div>
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
                onClick={handleCreateJob}
                disabled={!newJob.output_name}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600"
              >
                Create Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
