import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  BeakerIcon, 
  FolderIcon, 
  CpuChipIcon, 
  Cog6ToothIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'

export default function Home() {
  const router = useRouter()

  const features = [
    {
      title: 'Text to Image',
      description: 'Generate stunning images from text descriptions with advanced AI models.',
      icon: PhotoIcon,
      color: 'from-blue-500 to-cyan-500',
      path: '/text-to-image'
    },
    {
      title: 'Text to Video',
      description: 'Create dynamic videos from text prompts with camera controls.',
      icon: VideoCameraIcon,
      color: 'from-purple-500 to-pink-500',
      path: '/text-to-video'
    },
    {
      title: 'Image to Video',
      description: 'Animate your images with customizable motion and movements.',
      icon: CloudArrowUpIcon,
      color: 'from-green-500 to-emerald-500',
      path: '/image-to-video'
    },
    {
      title: 'Lab Mode',
      description: 'Node-based canvas for complex multi-step AI workflows.',
      icon: BeakerIcon,
      color: 'from-orange-500 to-red-500',
      path: '/lab'
    },
    {
      title: 'Datasets',
      description: 'Manage and organize your training datasets efficiently.',
      icon: FolderIcon,
      color: 'from-indigo-500 to-blue-500',
      path: '/datasets'
    },
    {
      title: 'Training',
      description: 'Create custom models with LoRA and DreamBooth training.',
      icon: CpuChipIcon,
      color: 'from-yellow-500 to-orange-500',
      path: '/training'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-apple-gray-900 to-black">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">AI Generator</h1>
          <div className="flex items-center space-x-4">
            <Link href="/settings" className="text-gray-400 hover:text-white transition-colors">
              <Cog6ToothIcon className="w-6 h-6" />
            </Link>
            <Link href="/monitoring" className="text-gray-400 hover:text-white transition-colors">
              <ChartBarIcon className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-64 glass-effect border-r border-white/10">
          <nav className="p-4 space-y-1">
            <Link href="/text-to-image" 
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition-all">
              <PhotoIcon className="w-5 h-5" />
              <span>Text to Image</span>
            </Link>
            <Link href="/text-to-video" 
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition-all">
              <VideoCameraIcon className="w-5 h-5" />
              <span>Text to Video</span>
            </Link>
            <Link href="/image-to-video" 
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition-all">
              <CloudArrowUpIcon className="w-5 h-5" />
              <span>Image to Video</span>
            </Link>
            <Link href="/lab" 
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition-all">
              <BeakerIcon className="w-5 h-5" />
              <span>Lab Mode</span>
            </Link>
            <div className="border-t border-white/10 my-3"></div>
            <Link href="/datasets" 
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition-all">
              <FolderIcon className="w-5 h-5" />
              <span>Datasets</span>
            </Link>
            <Link href="/training" 
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition-all">
              <CpuChipIcon className="w-5 h-5" />
              <span>Training</span>
            </Link>
            <Link href="/training-guide" 
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition-all">
              <BookOpenIcon className="w-5 h-5" />
              <span>Training Guide</span>
            </Link>
            <Link href="/data-collection" 
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Data Collection</span>
            </Link>
            <div className="border-t border-white/10 my-3"></div>
            <Link href="/assets" 
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition-all">
              <FolderIcon className="w-5 h-5" />
              <span>Assets</span>
            </Link>
            <Link href="/models" 
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition-all">
              <CpuChipIcon className="w-5 h-5" />
              <span>Models</span>
            </Link>
            <Link href="/settings" 
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition-all">
              <Cog6ToothIcon className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <div className="border-t border-white/10 my-3"></div>
            <Link href="/monitoring" 
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition-all">
              <ChartBarIcon className="w-5 h-5" />
              <span>Monitoring</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-8 py-16">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h2 className="text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI Generator
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                A comprehensive platform for creating stunning images and videos with cutting-edge AI technology.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onClick={() => router.push(feature.path)}
                  className="glass-effect rounded-apple-lg p-6 cursor-pointer card-hover group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Features List */}
            <div className="glass-effect rounded-apple-lg p-8">
              <h3 className="text-2xl font-semibold text-white mb-6">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <p className="text-gray-300">Advanced text-to-image generation with LoRA support</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <p className="text-gray-300">Text and image to video conversion</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <p className="text-gray-300">Inpainting and outpainting capabilities</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                  <p className="text-gray-300">Image upscaling and enhancement</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-pink-500 mt-2"></div>
                  <p className="text-gray-300">Node-based workflow editor (Lab Mode)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
                  <p className="text-gray-300">Custom model training (LoRA/DreamBooth)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                  <p className="text-gray-300">Dataset management and organization</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2"></div>
                  <p className="text-gray-300">Multi-format file upload support</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                  <p className="text-gray-300">Asset library with tagging and search</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                  <p className="text-gray-300">Project management and templates</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
