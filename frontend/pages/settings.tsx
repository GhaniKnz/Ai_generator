import Link from 'next/link'

export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mr-4">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">General</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Application Name
                </label>
                <input
                  type="text"
                  defaultValue="AI Generator"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Output Directory
                </label>
                <input
                  type="text"
                  defaultValue="outputs/"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Theme
                </label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                  <option selected>Dark</option>
                  <option>Light</option>
                  <option>Auto</option>
                </select>
              </div>
            </div>
          </div>

          {/* Performance Settings */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Performance</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Parallel Jobs
                </label>
                <input
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={8}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Number of jobs that can run simultaneously (requires GPU memory)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Generation Delay (seconds)
                </label>
                <input
                  type="number"
                  defaultValue={0.5}
                  step={0.1}
                  min={0}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Mock delay for testing (remove in production)
                </p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enable-cache"
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                />
                <label htmlFor="enable-cache" className="ml-2 text-sm text-gray-300">
                  Enable caching for faster generations
                </label>
              </div>
            </div>
          </div>

          {/* Model Settings */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Models</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Image Model
                </label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                  <option selected>Stable Diffusion 1.5</option>
                  <option>SDXL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Video Model
                </label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                  <option selected>Stable Video Diffusion</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model Cache Directory
                </label>
                <input
                  type="text"
                  defaultValue="models/"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
            </div>
          </div>

          {/* API Settings */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">API Configuration</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Backend URL
                </label>
                <input
                  type="text"
                  defaultValue="http://localhost:8000"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Enter API key..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Required for production deployments with authentication
                </p>
              </div>
            </div>
          </div>

          {/* Storage Settings */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Storage</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-300">Database</div>
                  <div className="text-xs text-gray-400">SQLite (ai_generator.db)</div>
                </div>
                <button className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded hover:bg-gray-600">
                  Backup
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-300">Clear Cache</div>
                  <div className="text-xs text-gray-400">Free up disk space</div>
                </div>
                <button className="px-3 py-1 bg-red-900 text-red-300 text-sm rounded hover:bg-red-800">
                  Clear
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-300">Export Data</div>
                  <div className="text-xs text-gray-400">Download all assets and metadata</div>
                </div>
                <button className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded hover:bg-gray-600">
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">
              Reset to Defaults
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save Changes
            </button>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-300 mb-2">⚠️ Note</h3>
            <p className="text-xs text-gray-300">
              Settings management is currently in development. Changes are not yet persisted.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
