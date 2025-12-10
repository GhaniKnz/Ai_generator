import { useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import { SparklesIcon, PhotoIcon } from '@heroicons/react/24/outline'

export default function TextToImage() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/generate/text-to-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          negative_prompt: negativePrompt,
          num_outputs: 2,
          width: 768,
          height: 768,
          cfg_scale: 7.5,
          steps: 30,
          style_preset: 'cinematic',
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
      console.error('Error generating image:', error)
      setGenerating(false)
    }
  }

  return (
    <Layout title="Texte vers Image">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Texte vers Image
            </span>
          </h2>
          <p className="text-gray-400">Générez des images époustouflantes à partir de descriptions textuelles</p>
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
                <SparklesIcon className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Paramètres</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={4}
                    placeholder="Décrivez l'image que vous souhaitez générer..."
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Soyez précis et descriptif pour de meilleurs résultats
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prompt Négatif (Optionnel)
                  </label>
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={2}
                    placeholder="Éléments à éviter dans l'image..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Modèle
                    </label>
                    <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Stable Diffusion 1.5</option>
                      <option>SDXL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Style Prédéfini
                    </label>
                    <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="cinematic">Cinématique</option>
                      <option value="anime">Anime</option>
                      <option value="realistic">Réaliste</option>
                      <option value="illustration">Illustration</option>
                      <option value="concept_art">Concept Art</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Largeur
                    </label>
                    <input
                      type="number"
                      defaultValue={768}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hauteur
                    </label>
                    <input
                      type="number"
                      defaultValue={768}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Échelle CFG: 7.5
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    defaultValue={7.5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Étapes: 30
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    defaultValue={30}
                    className="w-full"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={!prompt || generating}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {generating ? 'Génération en cours...' : 'Générer des Images'}
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
                <PhotoIcon className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">Aperçu</h2>
              </div>
              
              {!result && !generating && (
                <div className="aspect-square bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-white/10 flex items-center justify-center">
                  <p className="text-gray-400">Vos images générées apparaîtront ici</p>
                </div>
              )}

              {generating && (
                <div className="aspect-square bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/20 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"
                    ></motion.div>
                    <p className="text-gray-300">Génération en cours...</p>
                  </div>
                </div>
              )}

              {result && result.status === 'done' && (
                <div className="space-y-4">
                  {result.outputs.map((output: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-effect border border-white/10 p-4 rounded-xl"
                    >
                      <div className="aspect-square bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg mb-2 flex items-center justify-center">
                        <p className="text-gray-400">Image {index + 1}</p>
                      </div>
                      <p className="text-sm text-gray-400">Chemin: {output.path}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {result && result.status === 'failed' && (
                <div className="aspect-square bg-red-900/20 border border-red-700/50 rounded-xl flex items-center justify-center">
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
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
