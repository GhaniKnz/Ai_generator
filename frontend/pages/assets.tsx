import Link from 'next/link'

export default function Assets() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-blue-400 hover:text-blue-300 mr-4">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-white">Asset Library</h1>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Search assets..."
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm">
              <option>All Types</option>
              <option>Images</option>
              <option>Videos</option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-white mb-1">0</div>
            <div className="text-sm text-gray-400">Total Assets</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-blue-400 mb-1">0</div>
            <div className="text-sm text-gray-400">Images</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-purple-400 mb-1">0</div>
            <div className="text-sm text-gray-400">Videos</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-green-400 mb-1">0 GB</div>
            <div className="text-sm text-gray-400">Storage Used</div>
          </div>
        </div>

        {/* Asset Grid */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Generations</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-gray-700/30 border-2 border-dashed border-gray-600 rounded-lg p-16 text-center">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No Assets Yet</h3>
            <p className="text-gray-400 mb-6">
              Start generating images and videos to build your asset library
            </p>
            <div className="flex items-center justify-center space-x-3">
              <Link 
                href="/text-to-image"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Image
              </Link>
              <Link 
                href="/text-to-video"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Create Video
              </Link>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Popular Tags</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">cinematic</span>
            <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">landscape</span>
            <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">portrait</span>
            <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">anime</span>
            <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">realistic</span>
            <button className="px-3 py-1 bg-blue-900/30 text-blue-300 text-sm rounded-full hover:bg-blue-900/50">
              + Add Tag
            </button>
          </div>
        </div>

        <div className="mt-8 bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-300 mb-3">💡 Asset Management Tips</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Use tags to organize your generations by style, subject, or project</li>
            <li>• Click on any asset to view details, metadata, and generation parameters</li>
            <li>• Duplicate successful generations with parameter variations</li>
            <li>• Export assets or add them to projects for complex workflows</li>
            <li>• Assets are automatically saved when generation jobs complete</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
