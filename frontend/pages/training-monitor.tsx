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

export default function TrainingMonitor() {
  const [jobId, setJobId] = useState<string>('train_1')
  const [isRunning, setIsRunning] = useState(false)
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [totalEpochs] = useState(10)
  const [progress, setProgress] = useState(0)
  const [currentImage, setCurrentImage] = useState<TrainingImage | null>(null)
  const [analyzedImages, setAnalyzedImages] = useState<TrainingImage[]>([])
  const [metrics, setMetrics] = useState<TrainingMetrics[]>([])
  
  // Mock data for demonstration
  const mockImages: TrainingImage[] = [
    {
      id: 'img_1',
      path: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      status: 'completed',
      timestamp: Date.now() - 5000,
      metadata: { width: 1920, height: 1080, format: 'JPEG' }
    },
    {
      id: 'img_2',
      path: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
      status: 'completed',
      timestamp: Date.now() - 4000,
      metadata: { width: 1920, height: 1280, format: 'JPEG' }
    },
    {
      id: 'img_3',
      path: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400',
      status: 'analyzing',
      timestamp: Date.now(),
      metadata: { width: 1920, height: 1080, format: 'JPEG' }
    }
  ]

  // Simulate training progress
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      // Update progress
      setProgress(prev => {
        const newProgress = prev + 0.5
        if (newProgress >= 100) {
          setIsRunning(false)
          return 100
        }
        return newProgress
      })

      // Update epoch
      setCurrentEpoch(prev => {
        const newEpoch = Math.floor((progress / 100) * totalEpochs)
        return Math.min(newEpoch, totalEpochs)
      })

      // Add new metrics
      setMetrics(prev => {
        const newMetric: TrainingMetrics = {
          epoch: currentEpoch,
          step: prev.length + 1,
          loss: 0.8 - (prev.length * 0.02) + (Math.random() * 0.1),
          learning_rate: 0.0001 * Math.pow(0.95, prev.length / 10),
          timestamp: Date.now()
        }
        return [...prev.slice(-50), newMetric]
      })

      // Simulate image analysis
      if (Math.random() > 0.7) {
        const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)]
        setCurrentImage({
          ...randomImage,
          id: `img_${Date.now()}`,
          status: 'analyzing',
          timestamp: Date.now()
        })

        // Complete after 1 second
        setTimeout(() => {
          setAnalyzedImages(prev => [
            ...prev.slice(-20),
            { ...randomImage, id: `img_${Date.now()}`, status: 'completed', timestamp: Date.now() }
          ])
          setCurrentImage(null)
        }, 1000)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [isRunning, progress, currentEpoch, totalEpochs])

  const handleStart = () => {
    setIsRunning(true)
    if (progress >= 100) {
      setProgress(0)
      setCurrentEpoch(0)
      setMetrics([])
      setAnalyzedImages([])
    }
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = () => {
    setIsRunning(false)
    setProgress(0)
    setCurrentEpoch(0)
    setMetrics([])
    setAnalyzedImages([])
    setCurrentImage(null)
  }

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
                Entraînement en Temps Réel
              </span>
            </h2>
            <p className="text-gray-400 mt-1">Visualisation de l'analyse des images</p>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            {!isRunning ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <PlayIcon className="w-5 h-5" />
                <span>Démarrer</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePause}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <PauseIcon className="w-5 h-5" />
                <span>Pause</span>
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStop}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <StopIcon className="w-5 h-5" />
              <span>Arrêter</span>
            </motion.button>
          </div>
        </motion.div>

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
            <div className="text-sm text-gray-400 mb-2">Images Analysées</div>
            <div className="text-3xl font-bold text-purple-400">{analyzedImages.length}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <div className="text-sm text-gray-400 mb-2">Loss Actuel</div>
            <div className="text-3xl font-bold text-orange-400">
              {metrics.length > 0 ? metrics[metrics.length - 1].loss.toFixed(4) : '0.0000'}
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
                          {currentImage.metadata && (
                            <div className="text-xs text-gray-300">
                              {currentImage.metadata.width} × {currentImage.metadata.height} • {currentImage.metadata.format}
                            </div>
                          )}
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

        {/* Recently Analyzed Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-effect rounded-apple-lg p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Images Récemment Analysées</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <AnimatePresence>
              {analyzedImages.slice(-12).reverse().map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative aspect-square group cursor-pointer"
                >
                  <img
                    src={image.path}
                    alt={image.id}
                    className="w-full h-full object-cover rounded-lg border border-white/10"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {analyzedImages.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <PhotoIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p>Aucune image analysée pour le moment</p>
              <p className="text-sm mt-1">Cliquez sur "Démarrer" pour commencer l'entraînement</p>
            </div>
          )}
        </motion.div>

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
      </div>
    </Layout>
  )
}
