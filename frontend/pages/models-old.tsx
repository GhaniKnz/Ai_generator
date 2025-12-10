import Link from 'next/link'

export default function Models() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-blue-400 hover:text-blue-300 mr-4">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-white">Model Management</h1>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Register New Model
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Base Models */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Base Models</h2>
              <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs font-semibold rounded">2</span>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-700 p-4 rounded">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">Stable Diffusion 1.5</h3>
                  <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">Active</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">Text-to-image base model</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Type: base_model</span>
                  <span>v1.5</span>
                </div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">Stable Video Diffusion</h3>
                  <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">Active</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">Text/image-to-video model</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Type: base_model</span>
                  <span>v1.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* LoRA Models */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">LoRA Models</h2>
              <span className="px-2 py-1 bg-purple-900 text-purple-300 text-xs font-semibold rounded">0</span>
            </div>
            <div className="bg-gray-700/50 border border-dashed border-gray-600 rounded-lg p-8 text-center">
              <p className="text-gray-400 text-sm mb-2">No LoRA models yet</p>
              <p className="text-xs text-gray-500">Train custom LoRA models to fine-tune styles</p>
            </div>
          </div>

          {/* VAE / Other */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Other Models</h2>
              <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs font-semibold rounded">1</span>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-700 p-4 rounded">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">ESRGAN</h3>
                  <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">Active</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">Image upscaling model</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Type: upscaler</span>
                  <span>v1.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Model Details Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">All Models</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">Stable Diffusion 1.5</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">base_model</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">image</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">v1.5</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">Active</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-400 hover:text-blue-300 mr-3">Edit</button>
                    <button className="text-red-400 hover:text-red-300">Disable</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">Stable Video Diffusion</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">base_model</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">video</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">v1.0</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">Active</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-400 hover:text-blue-300 mr-3">Edit</button>
                    <button className="text-red-400 hover:text-red-300">Disable</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">ESRGAN</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">upscaler</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">image</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">v1.0</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">Active</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-400 hover:text-blue-300 mr-3">Edit</button>
                    <button className="text-red-400 hover:text-red-300">Disable</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-300 mb-3">💡 About Models</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p><strong>Base Models:</strong> Foundation models for generation (SD, SDXL, SVD)</p>
            <p><strong>LoRA Models:</strong> Fine-tuned adaptations for specific styles or subjects</p>
            <p><strong>Upscalers:</strong> Models for improving image resolution and quality</p>
            <p><strong>VAE:</strong> Variational autoencoders for improved image encoding/decoding</p>
          </div>
        </div>
      </div>
    </div>
  )
}
