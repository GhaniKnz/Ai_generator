import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import { RectangleStackIcon } from '@heroicons/react/24/outline'

export default function Assets() {
  return (
    <Layout title="Ressources">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Bibliothèque de Ressources
            </span>
          </h2>
          <p className="text-gray-400">Gérez et organisez toutes vos ressources générées</p>
        </motion.div>

        {/* Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-apple-lg p-6 border border-white/10 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <RectangleStackIcon className="w-6 h-6 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Ressources</h3>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Rechercher des ressources..."
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <select className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option>Tous Types</option>
                <option>Images</option>
                <option>Vidéos</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <div className="text-2xl font-bold text-white mb-1">0</div>
            <div className="text-sm text-gray-400">Total Ressources</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <div className="text-2xl font-bold text-blue-400 mb-1">0</div>
            <div className="text-sm text-gray-400">Images</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <div className="text-2xl font-bold text-purple-400 mb-1">0</div>
            <div className="text-sm text-gray-400">Vidéos</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <div className="text-2xl font-bold text-green-400 mb-1">0 GB</div>
            <div className="text-sm text-gray-400">Stockage Utilisé</div>
          </motion.div>
        </div>

        {/* Asset Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-effect rounded-apple-lg border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Générations Récentes</h2>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 glass-effect text-gray-300 rounded-xl hover:bg-white/5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 glass-effect text-gray-300 rounded-xl hover:bg-white/5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </motion.button>
            </div>
          </div>

          <div className="glass-effect border-2 border-dashed border-white/10 rounded-xl p-16 text-center">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Aucune Ressource Encore</h3>
            <p className="text-gray-400 mb-6">
              Commencez à générer des images et vidéos pour construire votre bibliothèque
            </p>
            <div className="flex items-center justify-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/text-to-image'}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Créer une Image
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/text-to-video'}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Créer une Vidéo
              </motion.button>
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
        </motion.div>
      </div>
    </Layout>
  )
}
