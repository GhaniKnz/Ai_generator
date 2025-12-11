import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import { SparklesIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface Model {
  id: number
  name: string
  type: string
  category: string
  created_at: string
}

const ASPECT_RATIOS = [
  { name: 'Carré (1:1)', width: 1024, height: 1024, icon: 'square' },
  { name: 'Portrait (9:16)', width: 768, height: 1344, icon: 'portrait' },
  { name: 'Paysage (16:9)', width: 1344, height: 768, icon: 'landscape' },
  { name: 'Classique (4:3)', width: 1024, height: 768, icon: 'classic' },
]

const NUM_IMAGES_OPTIONS = [
  { label: '1 image', value: 1 },
  { label: '2 images', value: 2 },
  { label: '4 images', value: 4 },
  { label: '8 images', value: 8 },
]

export default function TextToImage() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [models, setModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState('stable-diffusion-1.5')
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0])
  const [numImages, setNumImages] = useState(2)
  const [cfgScale, setCfgScale] = useState(7.5)
  const [steps, setSteps] = useState(30)

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/models/')
        if (response.ok) {
          const data = await response.json()
          setModels(data)
        }
      } catch (error) {
        console.error('Error fetching models:', error)
      }
    }
    fetchModels()
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/generate/text-to-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          negative_prompt: negativePrompt,
          num_outputs: numImages,
          width: selectedRatio.width,
          height: selectedRatio.height,
          cfg_scale: cfgScale,
          steps: steps,
          model: selectedModel,
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
                    <select 
                      aria-label="Sélectionner un modèle"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:bg-gray-900 [&>option]:text-white"
                    >
                      <option value="stable-diffusion-1.5">Stable Diffusion 1.5</option>
                      <option value="sdxl">SDXL</option>
                      {models.filter(m => m.category === 'image').map((model) => (
                        <option key={model.id} value={model.name}>
                          {model.name} ({model.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre d'Images
                    </label>
                    <select 
                      aria-label="Nombre d'images"
                      value={numImages}
                      onChange={(e) => setNumImages(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:bg-gray-900 [&>option]:text-white"
                    >
                      {NUM_IMAGES_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Style Prédéfini
                  </label>
                  <select 
                    aria-label="Sélectionner un style"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:bg-gray-900 [&>option]:text-white"
                  >
                    <option value="cinematic">Cinématique</option>
                    <option value="anime">Anime</option>
                    <option value="realistic">Réaliste</option>
                    <option value="illustration">Illustration</option>
                    <option value="concept_art">Concept Art</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Format de l'image
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio.name}
                        onClick={() => setSelectedRatio(ratio)}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          selectedRatio.name === ratio.name
                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {ratio.name}
                        <div className="text-xs opacity-60 mt-1">{ratio.width}x{ratio.height}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Échelle CFG: {cfgScale}
                    </label>
                    <span className="text-xs text-gray-500">Fidélité au prompt</span>
                  </div>
                  <input
                    aria-label="Échelle CFG"
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={cfgScale}
                    onChange={(e) => setCfgScale(parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Étapes: {steps}
                    </label>
                    <span className="text-xs text-gray-500">Qualité du rendu</span>
                  </div>
                  <input
                    aria-label="Nombre d'étapes"
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={steps}
                    onChange={(e) => setSteps(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
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
                <div className={`grid gap-4 ${result.outputs.length === 1 ? 'grid-cols-1' : result.outputs.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                  {result.outputs.map((output: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-effect border border-white/10 p-4 rounded-xl"
                    >
                      <div className="relative rounded-lg overflow-hidden mb-2 bg-gray-900/50">
                        <img 
                          src={output.path} 
                          alt={`Généré: ${prompt}`}
                          className="w-full h-auto object-contain"
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-400">Image {index + 1}</p>
                        <a 
                          href={output.path} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          Ouvrir / Télécharger
                        </a>
                      </div>
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
