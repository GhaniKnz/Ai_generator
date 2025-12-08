import Link from 'next/link'

export default function Lab() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-100 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-blue-600 hover:text-blue-700 mr-4">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Lab Mode</h1>
            <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
              Coming Soon
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">
              New Project
            </button>
            <button className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">
              Save
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
              Run All
            </button>
          </div>
        </div>
      </header>

      <div className="h-[calc(100vh-73px)] bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Node-Based Workflow Editor
            </h2>
            
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Lab Mode provides a powerful visual canvas for creating complex multi-step AI generation workflows. 
              Chain together text-to-image, image-to-video, and other operations in a node-based interface similar to ComfyUI.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Visual Nodes</h3>
                <p className="text-sm text-gray-600">
                  Drag and drop nodes for different AI operations
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Chain Operations</h3>
                <p className="text-sm text-gray-600">
                  Connect outputs to inputs for complex workflows
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Save Templates</h3>
                <p className="text-sm text-gray-600">
                  Reuse your workflows as project templates
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-blue-900 mb-3">Planned Features</h3>
              <ul className="text-left text-sm text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Node types: Text Input, Image Generator, Video Generator, Style Transfer, Upscaler, Filter</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Multi-branch workflows with parallel execution</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Real-time preview of intermediate results</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Graph save/load with version control</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Batch processing for multiple variations</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-4">
                Lab Mode will be implemented in Phase 3 using React Flow library
              </p>
              <Link 
                href="/"
                className="inline-block px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>

          {/* Example workflow diagram */}
          <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Example Workflow</h3>
            <div className="flex items-center justify-center space-x-4">
              <div className="bg-white border-2 border-blue-500 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">📝</div>
                <div className="font-semibold text-sm">Text Prompt</div>
                <div className="text-xs text-gray-500 mt-1">"Forest scene"</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="bg-white border-2 border-green-500 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🎨</div>
                <div className="font-semibold text-sm">Image Gen</div>
                <div className="text-xs text-gray-500 mt-1">Text-to-Image</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="bg-white border-2 border-purple-500 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🎬</div>
                <div className="font-semibold text-sm">Video Gen</div>
                <div className="text-xs text-gray-500 mt-1">Image-to-Video</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="bg-white border-2 border-orange-500 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">⬆️</div>
                <div className="font-semibold text-sm">Upscale</div>
                <div className="text-xs text-gray-500 mt-1">4x Quality</div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-6">
              This workflow would generate a forest scene, animate it, and upscale the result
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
