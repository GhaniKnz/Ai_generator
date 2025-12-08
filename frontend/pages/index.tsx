import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-white">AI Generator</h1>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700">
          <nav className="p-4 space-y-2">
            <Link href="/text-to-image" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md">
              Text to Image
            </Link>
            <Link href="/text-to-video" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md">
              Text to Video
            </Link>
            <Link href="/image-to-video" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md">
              Image to Video
            </Link>
            <Link href="/lab" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md">
              Lab Mode
            </Link>
            <Link href="/assets" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md">
              Assets
            </Link>
            <Link href="/models" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md">
              Models
            </Link>
            <Link href="/settings" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md">
              Settings
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Welcome to AI Generator
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              A comprehensive AI generation platform for creating images, videos, and more.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-2">Text to Image</h3>
                <p className="text-gray-400 mb-4">
                  Generate images from text descriptions with advanced controls.
                </p>
                <button
                  onClick={() => router.push('/text-to-image')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Get Started
                </button>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-2">Text to Video</h3>
                <p className="text-gray-400 mb-4">
                  Create videos from text prompts with camera controls.
                </p>
                <button
                  onClick={() => router.push('/text-to-video')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Get Started
                </button>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-2">Image to Video</h3>
                <p className="text-gray-400 mb-4">
                  Animate your images with customizable motion and camera movements.
                </p>
                <button
                  onClick={() => router.push('/image-to-video')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Get Started
                </button>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-2">Lab Mode</h3>
                <p className="text-gray-400 mb-4">
                  Node-based canvas for complex multi-step generation workflows.
                </p>
                <button
                  onClick={() => router.push('/lab')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Open Lab
                </button>
              </div>
            </div>

            <div className="mt-12 bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>✓ Advanced text-to-image generation with LoRA support</li>
                <li>✓ Text and image to video conversion</li>
                <li>✓ Inpainting and outpainting</li>
                <li>✓ Image upscaling and enhancement</li>
                <li>✓ Node-based workflow editor (Lab Mode)</li>
                <li>✓ Custom model training and management</li>
                <li>✓ Asset library with tagging and organization</li>
                <li>✓ Project management and templates</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
