import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpenIcon,
  LightBulbIcon,
  CpuChipIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftIcon,
  AcademicCapIcon,
  BeakerIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function TrainingGuide() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: BookOpenIcon },
    { id: 'types', name: 'Types d\'Entraînement', icon: BeakerIcon },
    { id: 'parameters', name: 'Paramètres', icon: Cog6ToothIcon },
    { id: 'use-cases', name: 'Cas d\'Utilisation', icon: LightBulbIcon },
    { id: 'best-practices', name: 'Meilleures Pratiques', icon: AcademicCapIcon }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-apple-gray-900 to-black">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect sticky top-0 z-50 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Guide d'Entraînement</h1>
                <p className="text-sm text-gray-400">Guide complet pour l'entraînement de modèles IA</p>
              </div>
            </div>
            <Link
              href="/training"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Commencer l'Entraînement →
            </Link>
          </div>
        </div>
      </motion.header>

      <div className="flex h-[calc(100vh-81px)]">
        {/* Sidebar Navigation */}
        <motion.aside 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-64 glass-effect border-r border-white/10 overflow-y-auto"
        >
          <nav className="p-4 space-y-1">
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-500/30'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span>{section.name}</span>
              </motion.button>
            ))}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-8 py-12">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-4xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Training AI Models
                    </span>
                  </h2>
                  <p className="text-xl text-gray-400">
                    Learn how to create custom AI models tailored to your specific needs
                  </p>
                </div>

                <div className="glass-effect rounded-apple-lg p-6">
                  <h3 className="text-2xl font-semibold text-white mb-4">What is Model Training?</h3>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Model training is the process of teaching an AI model to understand and replicate specific styles, 
                    subjects, or concepts. Instead of using generic pre-trained models, you can fine-tune them with your 
                    own data to create personalized outputs.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    This platform supports three main training approaches: LoRA (Low-Rank Adaptation), DreamBooth, 
                    and Full Fine-tuning. Each method has different requirements, costs, and use cases.
                  </p>
                </div>

                <div className="glass-effect rounded-apple-lg p-6">
                  <h3 className="text-2xl font-semibold text-white mb-4">Why Train Custom Models?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                      <div className="text-3xl mb-2">🎨</div>
                      <h4 className="text-white font-semibold mb-2">Custom Styles</h4>
                      <p className="text-gray-400 text-sm">
                        Create unique artistic styles that match your brand or vision
                      </p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                      <div className="text-3xl mb-2">👤</div>
                      <h4 className="text-white font-semibold mb-2">Specific Subjects</h4>
                      <p className="text-gray-400 text-sm">
                        Train models to recognize and generate specific people, objects, or characters
                      </p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                      <div className="text-3xl mb-2">⚡</div>
                      <h4 className="text-white font-semibold mb-2">Better Control</h4>
                      <p className="text-gray-400 text-sm">
                        Achieve more consistent and predictable results for your use case
                      </p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                      <div className="text-3xl mb-2">💰</div>
                      <h4 className="text-white font-semibold mb-2">Cost Effective</h4>
                      <p className="text-gray-400 text-sm">
                        Use smaller, faster models that are optimized for your specific needs
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-apple-lg p-6 bg-yellow-500/5 border-yellow-500/30">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold mb-2">Before You Start</h4>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li>• Prepare high-quality training images (at least 10-20 images)</li>
                        <li>• Ensure images are consistent in style and subject</li>
                        <li>• Have a clear goal for what you want to achieve</li>
                        <li>• Understand the computational requirements (GPU recommended)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Training Types Section */}
            {activeSection === 'types' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <h2 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Training Types
                  </span>
                </h2>

                {/* LoRA */}
                <div className="glass-effect rounded-apple-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <CpuChipIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white">LoRA (Low-Rank Adaptation)</h3>
                      <p className="text-sm text-blue-400">Recommended for most users</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-gray-300 leading-relaxed">
                      LoRA is a lightweight fine-tuning method that modifies only a small portion of the model. 
                      It creates small "adapter" files that can be loaded on top of base models, making it fast, 
                      efficient, and easy to share.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-500/10 rounded-lg p-4">
                        <h4 className="text-green-400 font-semibold mb-2">Advantages</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Very fast training (30min - 2hrs)</li>
                          <li>• Low memory requirements (8GB+ VRAM)</li>
                          <li>• Small file size (5-200MB)</li>
                          <li>• Easy to combine multiple LoRAs</li>
                          <li>• Less prone to overfitting</li>
                        </ul>
                      </div>
                      <div className="bg-red-500/10 rounded-lg p-4">
                        <h4 className="text-red-400 font-semibold mb-2">Limitations</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Limited capacity for complex concepts</li>
                          <li>• Requires compatible base model</li>
                          <li>• May need higher LoRA strength</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">Best For:</h4>
                      <p className="text-gray-300 text-sm">
                        Styles, artistic techniques, character faces, specific objects, clothing styles, 
                        lighting techniques, and color grading.
                      </p>
                    </div>
                  </div>
                </div>

                {/* DreamBooth */}
                <div className="glass-effect rounded-apple-lg p-6 border-l-4 border-purple-500">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <BeakerIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white">DreamBooth</h3>
                      <p className="text-sm text-purple-400">For specific subjects and concepts</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-gray-300 leading-relaxed">
                      DreamBooth fine-tunes the entire model to learn a specific subject or concept. It's particularly 
                      effective for training on specific people, pets, objects, or unique concepts that need high accuracy.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-500/10 rounded-lg p-4">
                        <h4 className="text-green-400 font-semibold mb-2">Advantages</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• High accuracy for specific subjects</li>
                          <li>• Better preservation of details</li>
                          <li>• Works with fewer training images</li>
                          <li>• Can learn complex concepts</li>
                        </ul>
                      </div>
                      <div className="bg-red-500/10 rounded-lg p-4">
                        <h4 className="text-red-400 font-semibold mb-2">Limitations</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Slower training (2-4 hours)</li>
                          <li>• Higher memory requirements (12GB+ VRAM)</li>
                          <li>• Larger file size (2-5GB)</li>
                          <li>• Risk of overfitting</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">Best For:</h4>
                      <p className="text-gray-300 text-sm">
                        Specific people, pets, products, brand logos, unique characters, or any subject 
                        that requires high fidelity and consistency.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Full Fine-tuning */}
                <div className="glass-effect rounded-apple-lg p-6 border-l-4 border-orange-500">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white">Full Fine-tuning</h3>
                      <p className="text-sm text-orange-400">For advanced users with large datasets</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-gray-300 leading-relaxed">
                      Full fine-tuning trains the entire model from scratch or significantly modifies all layers. 
                      This is the most comprehensive approach but requires substantial computational resources and data.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-500/10 rounded-lg p-4">
                        <h4 className="text-green-400 font-semibold mb-2">Advantages</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Maximum customization</li>
                          <li>• Can learn complex styles</li>
                          <li>• Best quality for large datasets</li>
                          <li>• Complete control over output</li>
                        </ul>
                      </div>
                      <div className="bg-red-500/10 rounded-lg p-4">
                        <h4 className="text-red-400 font-semibold mb-2">Limitations</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Very slow (6-24+ hours)</li>
                          <li>• High memory (24GB+ VRAM)</li>
                          <li>• Requires large dataset (1000+ images)</li>
                          <li>• Complex hyperparameter tuning</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">Best For:</h4>
                      <p className="text-gray-300 text-sm">
                        Enterprise applications, completely new artistic styles, domain-specific models, 
                        or when you have a large dataset and computational resources.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Parameters Section */}
            {activeSection === 'parameters' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <h2 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Training Parameters
                  </span>
                </h2>
                <p className="text-xl text-gray-400">
                  Understanding and tuning parameters is crucial for successful training
                </p>

                {/* Learning Rate */}
                <div className="glass-effect rounded-apple-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Learning Rate</h3>
                  <p className="text-gray-300 mb-4">
                    Controls how quickly the model adapts to new data. Higher values = faster learning but risk instability.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <div className="text-green-400 font-mono text-sm mb-1">1e-4 (0.0001)</div>
                      <div className="text-gray-400 text-xs">LoRA Standard</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <div className="text-blue-400 font-mono text-sm mb-1">1e-5 (0.00001)</div>
                      <div className="text-gray-400 text-xs">DreamBooth Standard</div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                      <div className="text-purple-400 font-mono text-sm mb-1">1e-6 (0.000001)</div>
                      <div className="text-gray-400 text-xs">Full Fine-tuning</div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-400">
                    <strong>Tip:</strong> Start with recommended values. If training is unstable, decrease by 10x. 
                    If too slow, increase by 2-3x.
                  </div>
                </div>

                {/* Batch Size */}
                <div className="glass-effect rounded-apple-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Batch Size</h3>
                  <p className="text-gray-300 mb-4">
                    Number of images processed together in each training step. Larger batches = more stable training but higher memory usage.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-300">Batch Size 1-2</span>
                      <span className="text-gray-400 text-sm">Low VRAM (4-8GB) - Slower but works</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-300">Batch Size 4-8</span>
                      <span className="text-green-400 text-sm">Recommended (8-16GB VRAM)</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-300">Batch Size 16+</span>
                      <span className="text-blue-400 text-sm">High-end (24GB+ VRAM)</span>
                    </div>
                  </div>
                </div>

                {/* Epochs */}
                <div className="glass-effect rounded-apple-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Number of Epochs</h3>
                  <p className="text-gray-300 mb-4">
                    How many times the model sees the entire dataset. More epochs = better learning but risk of overfitting.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <div className="text-yellow-400 font-bold text-2xl mb-1">5-10</div>
                      <div className="text-gray-400 text-xs">Small dataset (10-20 images)</div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <div className="text-green-400 font-bold text-2xl mb-1">10-20</div>
                      <div className="text-gray-400 text-xs">Medium dataset (20-50 images)</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <div className="text-blue-400 font-bold text-2xl mb-1">20-50</div>
                      <div className="text-gray-400 text-xs">Large dataset (50+ images)</div>
                    </div>
                  </div>
                </div>

                {/* LoRA Specific */}
                <div className="glass-effect rounded-apple-lg p-6 border border-blue-500/30">
                  <h3 className="text-xl font-semibold text-white mb-3">LoRA-Specific Parameters</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-semibold mb-2">LoRA Rank</h4>
                      <p className="text-gray-300 text-sm mb-3">
                        Determines the capacity of the LoRA adapter. Higher rank = more complex concepts but larger file size.
                      </p>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                          <div className="text-white font-bold mb-1">4</div>
                          <div className="text-gray-400 text-xs">Fast, Small</div>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                          <div className="text-green-400 font-bold mb-1">8</div>
                          <div className="text-gray-400 text-xs">Recommended</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                          <div className="text-white font-bold mb-1">16</div>
                          <div className="text-gray-400 text-xs">Complex</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                          <div className="text-white font-bold mb-1">32+</div>
                          <div className="text-gray-400 text-xs">Maximum</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2">LoRA Alpha</h4>
                      <p className="text-gray-300 text-sm mb-2">
                        Scaling factor for LoRA weights. Typically set to Rank × 8 for optimal results.
                      </p>
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <code className="text-blue-400 text-sm">Alpha = Rank × 8 (e.g., Rank 8 → Alpha 64)</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Parameters */}
                <div className="glass-effect rounded-apple-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Advanced Parameters</h3>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="text-white font-semibold mb-1">Mixed Precision</h4>
                      <p className="text-gray-300 text-sm">
                        Use fp16 or bf16 to reduce memory usage by 50%. fp16 is compatible with most GPUs. 
                        bf16 requires newer GPUs (Ampere+) but is more stable.
                      </p>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="text-white font-semibold mb-1">Gradient Accumulation</h4>
                      <p className="text-gray-300 text-sm">
                        Simulate larger batch sizes by accumulating gradients. Useful when GPU memory is limited. 
                        Steps = 2-4 for low-memory setups.
                      </p>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="text-white font-semibold mb-1">Warmup Steps</h4>
                      <p className="text-gray-300 text-sm">
                        Gradually increase learning rate at the start. Typically 5-10% of total training steps. 
                        Helps prevent early instability.
                      </p>
                    </div>

                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="text-white font-semibold mb-1">Scheduler</h4>
                      <p className="text-gray-300 text-sm">
                        Controls how learning rate changes over time. "cosine" is recommended for most cases. 
                        "constant" keeps rate fixed, "linear" gradually decreases.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Use Cases Section */}
            {activeSection === 'use-cases' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <h2 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Use Cases & Examples
                  </span>
                </h2>

                {/* Style Transfer */}
                <div className="glass-effect rounded-apple-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">🎨</div>
                    <h3 className="text-2xl font-semibold text-white">Artistic Style Transfer</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Train a model to replicate a specific artistic style (watercolor, oil painting, anime, etc.)
                  </p>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Recommended Settings:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Type:</strong> LoRA</li>
                      <li>• <strong>Dataset:</strong> 20-30 images in target style</li>
                      <li>• <strong>Rank:</strong> 8-16</li>
                      <li>• <strong>Epochs:</strong> 10-15</li>
                      <li>• <strong>Learning Rate:</strong> 1e-4</li>
                    </ul>
                  </div>
                </div>

                {/* Character/Person */}
                <div className="glass-effect rounded-apple-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">👤</div>
                    <h3 className="text-2xl font-semibold text-white">Character/Person Training</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Create a model that can generate a specific person or character in various poses and settings
                  </p>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Recommended Settings:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Type:</strong> DreamBooth or LoRA (rank 16+)</li>
                      <li>• <strong>Dataset:</strong> 15-25 high-quality images, various angles</li>
                      <li>• <strong>Epochs:</strong> 8-12 for DreamBooth, 15-20 for LoRA</li>
                      <li>• <strong>Learning Rate:</strong> 1e-5 (DreamBooth), 1e-4 (LoRA)</li>
                      <li>• <strong>Tips:</strong> Include variety in poses, lighting, and backgrounds</li>
                    </ul>
                  </div>
                </div>

                {/* Product/Object */}
                <div className="glass-effect rounded-apple-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">📦</div>
                    <h3 className="text-2xl font-semibold text-white">Product/Object Training</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Train on specific products, furniture, or objects for marketing and visualization
                  </p>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Recommended Settings:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Type:</strong> DreamBooth</li>
                      <li>• <strong>Dataset:</strong> 10-15 images, white or neutral background</li>
                      <li>• <strong>Epochs:</strong> 10-15</li>
                      <li>• <strong>Learning Rate:</strong> 1e-5</li>
                      <li>• <strong>Tips:</strong> Consistent lighting, multiple angles, clean backgrounds</li>
                    </ul>
                  </div>
                </div>

                {/* Logo/Brand */}
                <div className="glass-effect rounded-apple-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">🏢</div>
                    <h3 className="text-2xl font-semibold text-white">Logo & Brand Style</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Incorporate specific logos, brand colors, or corporate identity into generations
                  </p>
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Recommended Settings:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Type:</strong> LoRA (Rank 8)</li>
                      <li>• <strong>Dataset:</strong> 15-20 images with logo/branding</li>
                      <li>• <strong>Epochs:</strong> 12-18</li>
                      <li>• <strong>Learning Rate:</strong> 1e-4</li>
                      <li>• <strong>Tips:</strong> High-resolution logos, various contexts and scales</li>
                    </ul>
                  </div>
                </div>

                {/* Concept Art */}
                <div className="glass-effect rounded-apple-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">🖼️</div>
                    <h3 className="text-2xl font-semibold text-white">Concept Art & Environments</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Create unique environments, architectural styles, or fantasy/sci-fi concepts
                  </p>
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Recommended Settings:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>Type:</strong> LoRA (Rank 16-32)</li>
                      <li>• <strong>Dataset:</strong> 30-50 images in consistent style</li>
                      <li>• <strong>Epochs:</strong> 15-25</li>
                      <li>• <strong>Learning Rate:</strong> 8e-5 to 1e-4</li>
                      <li>• <strong>Tips:</strong> Curate cohesive aesthetic, tag consistently</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Best Practices Section */}
            {activeSection === 'best-practices' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <h2 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Best Practices & Tips
                  </span>
                </h2>

                {/* Data Preparation */}
                <div className="glass-effect rounded-apple-lg p-6">
                  <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-3">
                      <span className="text-xl">📸</span>
                    </div>
                    Data Preparation
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="text-green-400 mt-1">✓</div>
                      <div>
                        <strong className="text-white">Quality over Quantity:</strong>
                        <p className="text-gray-300 text-sm">10 great images beat 100 mediocre ones</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="text-green-400 mt-1">✓</div>
                      <div>
                        <strong className="text-white">Consistent Resolution:</strong>
                        <p className="text-gray-300 text-sm">512x512 or 768x768 for best results. Resize if needed</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="text-green-400 mt-1">✓</div>
                      <div>
                        <strong className="text-white">Diverse Compositions:</strong>
                        <p className="text-gray-300 text-sm">Include variety in angles, lighting, and context</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="text-green-400 mt-1">✓</div>
                      <div>
                        <strong className="text-white">Clean & Clear:</strong>
                        <p className="text-gray-300 text-sm">Remove watermarks, blur, and artifacts</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="text-red-400 mt-1">✗</div>
                      <div>
                        <strong className="text-white">Avoid:</strong>
                        <p className="text-gray-300 text-sm">Mixed subjects, inconsistent styles, low resolution, heavy compression</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Training Process */}
                <div className="glass-effect rounded-apple-lg p-6">
                  <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                      <ClockIcon className="w-5 h-5 text-white" />
                    </div>
                    Training Process
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">1. Start Conservative</h4>
                      <p className="text-gray-300 text-sm">
                        Begin with recommended settings and few epochs. You can always train longer if needed.
                      </p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">2. Monitor Progress</h4>
                      <p className="text-gray-300 text-sm">
                        Save checkpoints every few epochs. Test intermediate results to catch overfitting early.
                      </p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">3. Test & Iterate</h4>
                      <p className="text-gray-300 text-sm">
                        Generate test images with various prompts. Adjust parameters based on results.
                      </p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">4. Document Settings</h4>
                      <p className="text-gray-300 text-sm">
                        Keep notes on what works. Different subjects need different approaches.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Common Issues */}
                <div className="glass-effect rounded-apple-lg p-6">
                  <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                    <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400 mr-3" />
                    Common Issues & Solutions
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="text-red-400 font-semibold mb-1">Overfitting</h4>
                      <p className="text-gray-300 text-sm mb-2">
                        <strong>Symptoms:</strong> Model reproduces training images exactly, no variation
                      </p>
                      <p className="text-gray-400 text-sm">
                        <strong>Solution:</strong> Reduce epochs, increase dataset size, use regularization
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="text-yellow-400 font-semibold mb-1">Underfitting</h4>
                      <p className="text-gray-300 text-sm mb-2">
                        <strong>Symptoms:</strong> Model doesn't learn the subject, outputs look generic
                      </p>
                      <p className="text-gray-400 text-sm">
                        <strong>Solution:</strong> Increase epochs, raise learning rate, check dataset quality
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="text-orange-400 font-semibold mb-1">Training Instability</h4>
                      <p className="text-gray-300 text-sm mb-2">
                        <strong>Symptoms:</strong> Loss spikes, NaN values, weird artifacts
                      </p>
                      <p className="text-gray-400 text-sm">
                        <strong>Solution:</strong> Lower learning rate, use gradient clipping, check for corrupt images
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="text-blue-400 font-semibold mb-1">Slow Training</h4>
                      <p className="text-gray-300 text-sm mb-2">
                        <strong>Symptoms:</strong> Training takes too long, low GPU utilization
                      </p>
                      <p className="text-gray-400 text-sm">
                        <strong>Solution:</strong> Increase batch size, use mixed precision, optimize data loading
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="glass-effect rounded-apple-lg p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
                  <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                    <LightBulbIcon className="w-8 h-8 text-yellow-400 mr-3" />
                    Pro Tips
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-2xl mb-2">💡</div>
                      <p className="text-gray-300 text-sm">
                        Use trigger words in your dataset captions to make activation easier (e.g., "sks person", "xyz style")
                      </p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-2xl mb-2">🎯</div>
                      <p className="text-gray-300 text-sm">
                        Train multiple LoRAs for different aspects and combine them at inference time
                      </p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-2xl mb-2">⚡</div>
                      <p className="text-gray-300 text-sm">
                        Use validation images during training to monitor progress without manual testing
                      </p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-2xl mb-2">🔍</div>
                      <p className="text-gray-300 text-sm">
                        Review loss curves - steady decrease is good, flatline or spikes need attention
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
