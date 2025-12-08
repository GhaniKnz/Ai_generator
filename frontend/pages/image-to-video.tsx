import { useState } from 'react'
import Link from 'next/link'

export default function ImageToVideo() {
  const [imagePath, setImagePath] = useState('')
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const handleGenerate = async () => {
    if (!imagePath) {
      alert('Please enter an image path')
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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mr-4">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-white">Image to Video</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Animation Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Input Image Path *
                  </label>
                  <input
                    type="text"
                    value={imagePath}
                    onChange={(e) => setImagePath(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="outputs/image-id.png or URL"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Path to the image you want to animate
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Guidance Prompt (Optional)
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe how you want the image to be animated (optional)..."
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Leave empty for automatic animation based on image content
                  </p>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Video Settings</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Duration
                      </label>
                      <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                        <option value="3">3 seconds</option>
                        <option value="5" selected>5 seconds</option>
                        <option value="10">10 seconds</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        FPS
                      </label>
                      <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                        <option value="12">12 fps</option>
                        <option value="24" selected>24 fps</option>
                        <option value="30">30 fps</option>
                        <option value="60">60 fps</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Camera Movement
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                      <option value="static">Static (No movement)</option>
                      <option value="pan_left">Pan Left</option>
                      <option value="pan_right">Pan Right</option>
                      <option value="tilt_up">Tilt Up</option>
                      <option value="tilt_down">Tilt Down</option>
                      <option value="zoom_in">Zoom In</option>
                      <option value="zoom_out">Zoom Out</option>
                      <option value="dolly" selected>Dolly (Forward movement)</option>
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
                      Higher values create more pronounced animation
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!imagePath || generating}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-md transition-colors"
                >
                  {generating ? 'Animating Image...' : 'Animate Image'}
                </button>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-300 mb-2">💡 Tips for Best Results</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Use high-quality images for better animation</li>
                <li>• Landscape images work best for most camera movements</li>
                <li>• Static subjects animate better than complex scenes</li>
                <li>• Start with subtle motion (0.3-0.5) and increase if needed</li>
                <li>• Dolly movement works well for most image types</li>
              </ul>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>
              
              {!result && !generating && (
                <div>
                  <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                    <p className="text-gray-400">Input Image Preview</p>
                  </div>
                  <div className="h-px bg-gray-700 my-4"></div>
                  <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">Animated Video Preview</p>
                  </div>
                </div>
              )}

              {generating && (
                <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-gray-300">Animating image...</p>
                    <p className="text-sm text-gray-400 mt-2">Creating smooth motion</p>
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
                      <p className="text-white font-semibold">Video Created!</p>
                      <p className="text-sm text-gray-400 mt-1">{result.outputs[0]?.path}</p>
                    </div>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Animation Details</h3>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Input: {result.params.image_path}</p>
                      <p>Duration: {result.params.duration}s @ {result.params.fps} fps</p>
                      <p>Camera: {result.params.camera_movement}</p>
                      <p>Motion: {result.params.motion_intensity}</p>
                    </div>
                  </div>
                </div>
              )}

              {result && result.status === 'failed' && (
                <div className="aspect-video bg-red-900/20 border border-red-700 rounded-lg flex items-center justify-center">
                  <div className="text-center px-4">
                    <p className="text-red-400 font-semibold mb-2">Animation Failed</p>
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
