import { motion } from 'framer-motion'
import Layout from '@/components/Layout'

export default function Models() {
  return (
    <Layout title="Modèles">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Gestion des Modèles
              </span>
            </h2>
            <p className="text-gray-400 mt-1">Gérez vos modèles IA et leurs configurations</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg"
          >
            Enregistrer un Nouveau Modèle
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Base Models */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Modèles de Base</h2>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-lg">2</span>
            </div>
            <div className="space-y-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass-effect border border-white/10 p-4 rounded-xl hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">Stable Diffusion 1.5</h3>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-lg">Actif</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">Modèle de base texte vers image</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Type: base_model</span>
                  <span>v1.5</span>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass-effect border border-white/10 p-4 rounded-xl hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">Stable Video Diffusion</h3>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-lg">Actif</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">Modèle texte/image vers vidéo</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Type: base_model</span>
                  <span>v1.0</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* LoRA Models */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Modèles LoRA</h2>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-lg">0</span>
            </div>
            <div className="glass-effect border border-dashed border-white/20 rounded-xl p-8 text-center">
              <p className="text-gray-400 text-sm mb-2">Aucun modèle LoRA</p>
              <p className="text-xs text-gray-500">Entraînez des modèles LoRA personnalisés pour affiner les styles</p>
            </div>
          </motion.div>

          {/* Other Models */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Autres Modèles</h2>
              <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs font-semibold rounded-lg">1</span>
            </div>
            <div className="space-y-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass-effect border border-white/10 p-4 rounded-xl hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">ESRGAN</h3>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-lg">Actif</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">Modèle d'upscaling d'images</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Type: upscaler</span>
                  <span>v1.0</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Model Details Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-apple-lg border border-white/10 overflow-hidden"
        >
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Tous les Modèles</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="glass-effect">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Catégorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Stable Diffusion 1.5</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">base_model</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">text-to-image</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">v1.5</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-lg">Actif</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-400 hover:text-blue-300">Voir détails</button>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Stable Video Diffusion</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">base_model</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">video-generation</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">v1.0</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-lg">Actif</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-400 hover:text-blue-300">Voir détails</button>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">ESRGAN</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">upscaler</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">image-enhancement</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">v1.0</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-lg">Actif</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-400 hover:text-blue-300">Voir détails</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 glass-effect border border-blue-500/30 bg-blue-500/10 p-4 rounded-xl"
        >
          <h3 className="text-sm font-semibold text-blue-300 mb-2">ℹ️ Information</h3>
          <p className="text-xs text-gray-300">
            Les modèles peuvent être entraînés via la page d'entraînement. Les modèles LoRA personnalisés apparaîtront ici une fois l'entraînement terminé.
          </p>
        </motion.div>
      </div>
    </Layout>
  )
}
