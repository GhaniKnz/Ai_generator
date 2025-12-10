import { useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import { CloudArrowUpIcon, FilmIcon } from '@heroicons/react/24/outline'

export default function ImageToVideo() {
  const [imagePath, setImagePath] = useState('')
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const handleGenerate = async () => {
    if (!imagePath) {
      alert('Veuillez entrer un chemin d\'image')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/generate/image-to-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_path: imagePath,
          prompt: prompt || undefined,
          duration: 5.0,
          fps: 24,
          camera_movement: 'dolly',
          motion_intensity: 0.5,
        }),
      })
      const data = await response.json()
      setJobId(data.id)
      
      // Poll for results
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`/api/generate/${data.id}`)
        const statusData = await statusResponse.json()
        
        if (statusData.status === 'done' || statusData.status === 'failed') {
          clearInterval(pollInterval)
          setResult(statusData)
          setGenerating(false)
        }
      }, 1000)
    } catch (error) {
      console.error('Error generating video:', error)
      setGenerating(false)
    }
  }

  return (
    <Layout title="Image vers Vidéo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Image vers Vidéo
            </span>
          </h2>
          <p className="text-gray-400">Animez vos images avec des mouvements et animations personnalisables</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="glass-effect rounded-apple-lg p-6 border border-white/10">
              <div className="flex items-center space-x-2 mb-6">
                <CloudArrowUpIcon className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-semibold text-white">Paramètres</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chemin de l'Image Source
                  </label>
                  <input
                    type="text"
                    value={imagePath}
                    onChange={(e) => setImagePath(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="/path/to/your/image.png"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Entrez le chemin vers votre image source
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prompt (Optionnel)
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    rows={3}
                    placeholder="Décrivez comment vous voulez animer l'image..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Durée (secondes)
                    </label>
                    <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="3">3 secondes</option>
                      <option value="5">5 secondes</option>
                      <option value="10">10 secondes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      FPS
                    </label>
                    <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="24">24 FPS</option>
                      <option value="30">30 FPS</option>
                      <option value="60">60 FPS</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mouvement de Caméra
                  </label>
                  <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="static">Statique</option>
                    <option value="pan_left">Panoramique Gauche</option>
                    <option value="pan_right">Panoramique Droite</option>
                    <option value="zoom_in">Zoom Avant</option>
                    <option value="zoom_out">Zoom Arrière</option>
                    <option value="dolly">Dolly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Intensité du Mouvement: 0.5
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue={0.5}
                    className="w-full"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={!imagePath || generating}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {generating ? 'Génération en cours...' : 'Générer la Vidéo'}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glass-effect rounded-apple-lg p-6 border border-white/10">
              <div className="flex items-center space-x-2 mb-6">
                <FilmIcon className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-semibold text-white">Aperçu</h2>
              </div>

              {!result && !generating && (
                <div className="aspect-video bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-white/10 flex items-center justify-center">
                  <p className="text-gray-400">Votre vidéo générée apparaîtra ici</p>
                </div>
              )}

              {generating && (
                <div className="aspect-video bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/20 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"
                    ></motion.div>
                    <p className="text-gray-300">Animation de l'image...</p>
                  </div>
                </div>
              )}

              {result && result.status === 'done' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="aspect-video bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/20 flex items-center justify-center"
                >
                  <div className="text-center">
                    <svg className="w-16 h-16 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-white font-semibold">Vidéo Générée!</p>
                    <p className="text-sm text-gray-400 mt-1">{result.outputs[0]?.path}</p>
                  </div>
                </motion.div>
              )}

              {result && result.status === 'failed' && (
                <div className="aspect-video bg-red-900/20 border border-red-700/50 rounded-xl flex items-center justify-center">
                  <div className="text-center px-4">
                    <p className="text-red-400 font-semibold mb-2">Échec de la génération</p>
                    <p className="text-gray-400 text-sm">{result.error || 'Erreur inconnue'}</p>
                  </div>
                </div>
              )}
            </div>

            {jobId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-apple-lg p-4 border border-white/10"
              >
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Détails du Travail</h3>
                <p className="text-xs text-gray-400">ID du Travail: {jobId}</p>
                {result && (
                  <>
                    <p className="text-xs text-gray-400">Statut: {result.status}</p>
                    <p className="text-xs text-gray-400">Progression: {Math.round(result.progress * 100)}%</p>
                  </>
                )}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-effect rounded-apple-lg p-4 border border-green-500/20 bg-green-900/10"
            >
              <h3 className="text-sm font-semibold text-green-300 mb-2">💡 Conseils</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Utilisez des images de haute qualité pour de meilleurs résultats</li>
                <li>• Le prompt peut guider l'animation de manière spécifique</li>
                <li>• Les mouvements subtils fonctionnent mieux avec les images statiques</li>
                <li>• Ajustez l'intensité du mouvement selon votre image</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
