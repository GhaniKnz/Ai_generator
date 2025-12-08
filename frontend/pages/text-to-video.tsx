import { useState } from 'react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mr-4">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-white">Text to Video</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Video Settings</h2>
              
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
                    placeholder="Describe the video scene you want to generate..."
                  />
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
                    placeholder="Things to avoid..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duration (seconds)
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                      <option value="3">3 seconds</option>
                      <option value="5" selected>5 seconds</option>
                      <option value="10">10 seconds</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Aspect Ratio
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                      <option value="16:9" selected>16:9 (Landscape)</option>
                      <option value="9:16">9:16 (Portrait)</option>
                      <option value="1:1">1:1 (Square)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Style Preset
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                    <option value="cinematic" selected>Cinematic</option>
                    <option value="vlog">Vlog</option>
                    <option value="anime">Anime</option>
                    <option value="music_video">Music Video</option>
                    <option value="horror">Horror</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Camera Movement
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                    <option value="static">Static</option>
                    <option value="pan_left">Pan Left</option>
                    <option value="pan_right">Pan Right</option>
                    <option value="tilt_up">Tilt Up</option>
                    <option value="tilt_down">Tilt Down</option>
                    <option value="zoom_in">Zoom In</option>
                    <option value="zoom_out">Zoom Out</option>
                    <option value="dolly" selected>Dolly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Motion Intensity: 0.5
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
                    Controls how much movement/animation in the video
                  </p>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!prompt || generating}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-md transition-colors"
                >
                  {generating ? 'Generating Video...' : 'Generate Video'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Video Preview</h2>
              
              {!result && !generating && (
                <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Your generated video will appear here</p>
                </div>
              )}

              {generating && (
                <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-gray-300">Generating video...</p>
                    <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
                  </div>
                </div>
              )}

              {result && result.status === 'done' && (
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-white font-semibold">Video Generated!</p>
                      <p className="text-sm text-gray-400 mt-1">{result.outputs[0]?.path}</p>
                    </div>
                  </div>
                </div>
              )}

              {result && result.status === 'failed' && (
                <div className="aspect-video bg-red-900/20 border border-red-700 rounded-lg flex items-center justify-center">
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

            <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-300 mb-2">💡 Tips</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Be specific about camera movements and actions</li>
                <li>• Start with shorter durations (3-5s) for faster results</li>
                <li>• Choose camera movements that match your scene</li>
                <li>• Higher motion intensity creates more dynamic videos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
