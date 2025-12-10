import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '@/components/Layout'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  PhotoIcon,
  EyeIcon
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

interface TrainingImage {
  id: string
  path: string
  status: 'pending' | 'analyzing' | 'completed'
  timestamp: number
  metadata?: {
    width: number
    height: number
    format: string
  }
}

interface TrainingMetrics {
  epoch: number
  step: number
  loss: number
  learning_rate: number
  timestamp: number
}

interface TrainingProgress {
  job_id: string
  status: string
  progress: number
  current_epoch: number | null
  current_step: number | null
  loss: number | null
  current_image: string | null
  last_update: string | null
  recent_logs: string[]
  config: any
}

export default function TrainingMonitor() {
  const [jobs, setJobs] = useState<TrainingJob[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [jobProgress, setJobProgress] = useState<TrainingProgress | null>(null)
  const [currentImage, setCurrentImage] = useState<TrainingImage | null>(null)
  const [analyzedImages, setAnalyzedImages] = useState<TrainingImage[]>([])
  const [metrics, setMetrics] = useState<TrainingMetrics[]>([])
  
  // Fetch all training jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/training/')
        if (response.ok) {
          const data = await response.json()
          setJobs(data)
          
          // Auto-select first running job or first job
          if (!selectedJobId && data.length > 0) {
            const runningJob = data.find((j: TrainingJob) => j.status === 'running')
            setSelectedJobId(runningJob?.id || data[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching training jobs:', error)
      }
    }
    
    fetchJobs()
    const interval = setInterval(fetchJobs, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])
  
  // Fetch progress for selected job
  useEffect(() => {
    if (!selectedJobId) return
    
    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/training/${selectedJobId}/progress`)
        if (response.ok) {
          const data = await response.json()
          setJobProgress(data)
          
          // Update metrics
          if (data.loss !== null && data.current_step !== null) {
            setMetrics(prev => {
              const newMetric: TrainingMetrics = {
                epoch: data.current_epoch || 0,
                step: data.current_step,
                loss: data.loss,
                learning_rate: data.config?.learning_rate || 0.0001,
                timestamp: Date.now()
              }
              return [...prev.slice(-50), newMetric]
            })
          }
          
          // Update current image if available
          if (data.current_image) {
            setCurrentImage({
              id: `img_${Date.now()}`,
              path: data.current_image,
              status: 'analyzing',
              timestamp: Date.now()
            })
          }
        }
      } catch (error) {
        console.error('Error fetching job progress:', error)
      }
    }
    
    fetchProgress()
    const interval = setInterval(fetchProgress, 2000) // Refresh every 2 seconds
    return () => clearInterval(interval)
  }, [selectedJobId])
  
  const selectedJob = jobs.find(j => j.id === selectedJobId)
  const isRunning = selectedJob?.status === 'running'
  const progress = selectedJob?.progress ? selectedJob.progress * 100 : 0
  const currentEpoch = selectedJob?.current_epoch || 0
  const totalEpochs = jobProgress?.config?.num_epochs || 10

  return (
    <Layout title="Training Monitor">
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
                Moniteur d'Entraînement en Temps Réel
              </span>
            </h2>
            <p className="text-gray-400 mt-1">Visualisation de l'analyse des images et des métriques</p>
          </div>

          {/* Job Selector */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedJobId || ''}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-4 py-2 glass-effect border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="">Sélectionner une tâche</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.id} - {job.status} ({Math.round(job.progress * 100)}%)
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {selectedJob ? (
          <>
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-effect rounded-apple-lg p-6 border border-white/10"
              >
                <div className="text-sm text-gray-400 mb-2">Époque Actuelle</div>
                <div className="text-3xl font-bold text-blue-400">{currentEpoch} / {totalEpochs}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-effect rounded-apple-lg p-6 border border-white/10"
              >
                <div className="text-sm text-gray-400 mb-2">Progression</div>
                <div className="text-3xl font-bold text-green-400">{progress.toFixed(1)}%</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-effect rounded-apple-lg p-6 border border-white/10"
              >
                <div className="text-sm text-gray-400 mb-2">Statut</div>
                <div className="text-2xl font-bold text-purple-400">{selectedJob.status.toUpperCase()}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-effect rounded-apple-lg p-6 border border-white/10"
              >
                <div className="text-sm text-gray-400 mb-2">Loss Actuel</div>
                <div className="text-3xl font-bold text-orange-400">
                  {selectedJob.loss !== null ? selectedJob.loss.toFixed(4) : '0.0000'}
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Current Image Being Analyzed */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-effect rounded-apple-lg p-6 border border-white/10"
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <EyeIcon className="w-6 h-6 mr-2 text-blue-400" />
                  Image en Cours d'Analyse
                </h3>
                
                <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden border border-white/10">
                  <AnimatePresence mode="wait">
                    {currentImage ? (
                      <motion.div
                        key={currentImage.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="w-full h-full"
                      >
                        <img
                          src={currentImage.path}
                          alt="Analyzing"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center justify-between text-white">
                            <div>
                              <div className="text-sm font-medium">{currentImage.id}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                              <span className="text-sm">Analyse...</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <div className="text-center text-gray-500">
                          <PhotoIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
                          <p>En attente de la prochaine image...</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Training Metrics Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-effect rounded-apple-lg p-6 border border-white/10"
              >
                <h3 className="text-xl font-semibold text-white mb-4">Métriques d'Entraînement</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="step" 
                      stroke="#9ca3af" 
                      fontSize={12}
                      label={{ value: 'Steps', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={12}
                      label={{ value: 'Loss', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="loss"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                      name="Loss"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Training Logs */}
            {jobProgress?.recent_logs && jobProgress.recent_logs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-effect rounded-apple-lg p-6 border border-white/10 mb-8"
              >
                <h3 className="text-xl font-semibold text-white mb-4">Logs d'Entraînement</h3>
                <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-300 max-h-64 overflow-y-auto">
                  {jobProgress.recent_logs.map((log, idx) => (
                    <div key={idx} className="mb-1">{log}</div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6 glass-effect rounded-apple-lg p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Progression Globale</h3>
                <span className="text-sm text-gray-400">
                  {progress.toFixed(1)}% complété
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-300"
                />
              </div>
              {isRunning && (
                <p className="text-sm text-gray-400 mt-2">
                  Entraînement en cours... Époque {currentEpoch}/{totalEpochs}
                </p>
              )}
            </motion.div>
          </>
        ) : (
          <div className="glass-effect rounded-apple-lg p-12 text-center border border-white/10">
            <PhotoIcon className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
            <p className="text-gray-400 mb-4">Aucune tâche d'entraînement sélectionnée</p>
            <p className="text-sm text-gray-500">Créez une nouvelle tâche d'entraînement pour commencer</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
