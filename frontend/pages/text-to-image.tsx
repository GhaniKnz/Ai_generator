import { useState } from 'react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mr-4">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-white">Text to Image</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Describe the image you want to generate..."
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Be specific and descriptive for best results
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Negative Prompt (Optional)
                  </label>
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Things to avoid in the image..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Model
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                      <option>Stable Diffusion 1.5</option>
                      <option>SDXL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Style Preset
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                      <option value="cinematic">Cinematic</option>
                      <option value="anime">Anime</option>
                      <option value="realistic">Realistic</option>
                      <option value="illustration">Illustration</option>
                      <option value="concept_art">Concept Art</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Width
                    </label>
                    <input
                      type="number"
                      defaultValue={768}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Height
                    </label>
                    <input
                      type="number"
                      defaultValue={768}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CFG Scale: 7.5
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
                    Steps: 30
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    defaultValue={30}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!prompt || generating}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-md transition-colors"
                >
                  {generating ? 'Generating...' : 'Generate Images'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>
              
              {!result && !generating && (
                <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Your generated images will appear here</p>
                </div>
              )}

              {generating && (
                <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-gray-300">Generating...</p>
                  </div>
                </div>
              )}

              {result && result.status === 'done' && (
                <div className="space-y-4">
                  {result.outputs.map((output: any, index: number) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <div className="aspect-square bg-gray-600 rounded-lg mb-2 flex items-center justify-center">
                        <p className="text-gray-400">Image {index + 1}</p>
                      </div>
                      <p className="text-sm text-gray-400">Path: {output.path}</p>
                    </div>
                  ))}
                </div>
              )}

              {result && result.status === 'failed' && (
                <div className="aspect-square bg-red-900/20 border border-red-700 rounded-lg flex items-center justify-center">
                  <div className="text-center px-4">
                    <p className="text-red-400 font-semibold mb-2">Generation Failed</p>
                    <p className="text-gray-400 text-sm">{result.error || 'Unknown error'}</p>
                  </div>
                </div>
              )}
            </div>

            {jobId && (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Job Details</h3>
                <p className="text-xs text-gray-400">Job ID: {jobId}</p>
                {result && (
                  <>
                    <p className="text-xs text-gray-400">Status: {result.status}</p>
                    <p className="text-xs text-gray-400">Progress: {Math.round(result.progress * 100)}%</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
