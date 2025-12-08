import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { 
  PlayIcon, 
  XMarkIcon, 
  BookOpenIcon,
  PlusIcon 
} from '@heroicons/react/24/outline'

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

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 border-green-500/30'
      case 'running': return 'bg-blue-500/20 border-blue-500/30'
      case 'failed': return 'bg-red-500/20 border-red-500/30'
      case 'cancelled': return 'bg-gray-500/20 border-gray-500/30'
      default: return 'bg-yellow-500/20 border-yellow-500/30'
    }
  }

  return (
    <Layout title="Training Jobs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Training Jobs
              </span>
            </h2>
            <p className="text-gray-400 mt-1">Create and manage AI model training</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/training-guide"
              className="flex items-center space-x-2 px-4 py-2 glass-effect text-gray-300 rounded-xl hover:text-white hover:bg-white/5 transition-all"
            >
              <BookOpenIcon className="w-5 h-5" />
              <span>Training Guide</span>
            </Link>
            <Link
              href="/datasets"
              className="px-4 py-2 glass-effect text-gray-300 rounded-xl hover:text-white hover:bg-white/5 transition-all"
            >
              Manage Datasets
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Training Job</span>
            </motion.button>
          </div>
        </motion.div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10 cursor-default"
          >
            <div className="text-2xl font-bold text-white mb-1">{jobs.length}</div>
            <div className="text-sm text-gray-400">Total Jobs</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10 cursor-default"
          >
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {jobs.filter(j => j.status === 'running').length}
            </div>
            <div className="text-sm text-gray-400">Running</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10 cursor-default"
          >
            <div className="text-2xl font-bold text-green-400 mb-1">
              {jobs.filter(j => j.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-400">Completed</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -4 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10 cursor-default"
          >
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {jobs.filter(j => j.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-400">Pending</div>
          </motion.div>
        </div>

        {/* Jobs List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-effect rounded-apple-lg border border-white/10"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">All Training Jobs</h2>
          </div>

          {jobs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">No training jobs yet</div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Start Your First Training
              </motion.button>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (index * 0.1) }}
                  className="p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{job.id}</h3>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-lg border ${getStatusBgColor(job.status)} ${getStatusColor(job.status)}`}>
                          {job.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                          Type: {job.type}
                        </span>
                        <span>Dataset ID: {job.dataset_id}</span>
                        <span>Base Model ID: {job.base_model_id}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {job.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleStartJob(job.id)}
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all border border-green-500/30"
                        >
                          <PlayIcon className="w-5 h-5" />
                        </motion.button>
                      )}
                      {job.status === 'running' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCancelJob(job.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(job.status === 'running' || job.status === 'completed') && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(job.progress * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${job.progress * 100}%` }}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}

                  {/* Metrics */}
                  {job.current_epoch && (
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        Epoch: {job.current_epoch}
                      </span>
                      {job.loss && (
                        <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                          Loss: {job.loss.toFixed(4)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Output */}
                  {job.output_path && (
                    <div className="mt-2 text-sm text-green-400 flex items-center">
                      <span className="mr-2">✓</span>
                      Model saved: {job.output_path}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 glass-effect rounded-apple-lg p-6 border border-blue-500/30"
        >
          <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            Training Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="text-white font-semibold mb-2">LoRA Training</h4>
              <p className="text-gray-300 text-sm">Lightweight fine-tuning for specific styles or subjects (recommended)</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
              <h4 className="text-white font-semibold mb-2">DreamBooth</h4>
              <p className="text-gray-300 text-sm">Fine-tune model on specific subjects or concepts</p>
            </div>
            <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
              <h4 className="text-white font-semibold mb-2">Full Training</h4>
              <p className="text-gray-300 text-sm">Complete model training (requires significant resources)</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-gray-300 text-sm">
              <strong className="text-green-400">💡 Tip:</strong> Start with LoRA training with rank 4-8 for best results with minimal resources.
              Check out the <Link href="/training-guide" className="text-blue-400 hover:text-blue-300 underline">Training Guide</Link> for detailed information.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-effect rounded-apple-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Create Training Job
              </span>
            </h2>
            
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
                    className="w-full px-4 py-2 glass-effect border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors"
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
                    className="w-full px-4 py-2 glass-effect border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors"
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
                  className="w-full px-4 py-2 glass-effect border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors"
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
                  className="w-full px-4 py-2 glass-effect border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="my-custom-lora"
                />
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="text-sm font-semibold text-white mb-4">Training Configuration</h3>
                
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
                      className="w-full px-4 py-2 glass-effect border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors"
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
                      className="w-full px-4 py-2 glass-effect border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors"
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
                      className="w-full px-4 py-2 glass-effect border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors"
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
                      className="w-full px-4 py-2 glass-effect border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 glass-effect text-gray-300 rounded-xl hover:text-white transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateJob}
                disabled={!newJob.output_name}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Job
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </Layout>
  )
}
