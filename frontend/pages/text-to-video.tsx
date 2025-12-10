import { useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import { VideoCameraIcon, FilmIcon } from '@heroicons/react/24/outline'

export default function TextToVideo() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/generate/text-to-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          negative_prompt: negativePrompt,
          duration: 5.0,
          fps: 24,
          width: 1024,
          height: 576,
          style_preset: 'cinematic',
          camera_movement: 'dolly',
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
    <Layout title="Texte vers Vidéo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Texte vers Vidéo
            </span>
          </h2>
          <p className="text-gray-400">Créez des vidéos dynamiques à partir de descriptions textuelles</p>
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
                <VideoCameraIcon className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Paramètres Vidéo</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    rows={4}
                    placeholder="Décrivez la scène vidéo que vous souhaitez générer..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prompt Négatif (Optionnel)
                  </label>
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    rows={2}
                    placeholder="Éléments à éviter..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Durée (secondes)
                    </label>
                    <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="3">3 secondes</option>
                      <option value="5">5 secondes</option>
                      <option value="10">10 secondes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ratio d'Aspect
                    </label>
                    <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="16:9">16:9 (Paysage)</option>
                      <option value="9:16">9:16 (Portrait)</option>
                      <option value="1:1">1:1 (Carré)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Style Prédéfini
                  </label>
                  <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="cinematic">Cinématique</option>
                    <option value="vlog">Vlog</option>
                    <option value="anime">Anime</option>
                    <option value="music_video">Clip Musical</option>
                    <option value="horror">Horreur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mouvement de Caméra
                  </label>
                  <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="static">Statique</option>
                    <option value="pan_left">Panoramique Gauche</option>
                    <option value="pan_right">Panoramique Droite</option>
                    <option value="tilt_up">Inclinaison Haut</option>
                    <option value="tilt_down">Inclinaison Bas</option>
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
                  <p className="text-xs text-gray-400 mt-1">
                    Contrôle la quantité de mouvement/animation dans la vidéo
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={!prompt || generating}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {generating ? 'Génération de la Vidéo...' : 'Générer la Vidéo'}
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
                <FilmIcon className="w-6 h-6 text-pink-400" />
                <h2 className="text-xl font-semibold text-white">Aperçu Vidéo</h2>
              </div>
              
              {!result && !generating && (
                <div className="aspect-video bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-white/10 flex items-center justify-center">
                  <p className="text-gray-400">Votre vidéo générée apparaîtra ici</p>
                </div>
              )}

              {generating && (
                <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/20 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"
                    ></motion.div>
                    <p className="text-gray-300">Génération de la vidéo...</p>
                    <p className="text-sm text-gray-400 mt-2">Cela peut prendre quelques instants</p>
                  </div>
                </div>
              )}

              {result && result.status === 'done' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="aspect-video bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/20 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-white font-semibold">Vidéo Générée!</p>
                      <p className="text-sm text-gray-400 mt-1">{result.outputs[0]?.path}</p>
                    </div>
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
              className="glass-effect rounded-apple-lg p-4 border border-blue-500/20 bg-blue-900/10"
            >
              <h3 className="text-sm font-semibold text-blue-300 mb-2">💡 Conseils</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Soyez précis sur les mouvements de caméra et les actions</li>
                <li>• Commencez avec des durées courtes (3-5s) pour des résultats rapides</li>
                <li>• Choisissez des mouvements de caméra adaptés à votre scène</li>
                <li>• Une intensité de mouvement plus élevée crée des vidéos plus dynamiques</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
