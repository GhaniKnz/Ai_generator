import { motion } from 'framer-motion'
import Layout from '@/components/Layout'

export default function Settings() {
  return (
    <Layout title="Paramètres">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-effect rounded-apple-lg border border-white/10 overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Général</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom de l'Application
                </label>
                <input
                  type="text"
                  defaultValue="Générateur IA"
                  className="w-full px-3 py-2 glass-effect border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Répertoire de Sortie
                </label>
                <input
                  type="text"
                  defaultValue="outputs/"
                  className="w-full px-3 py-2 glass-effect border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Thème
                </label>
                <select className="w-full px-3 py-2 glass-effect border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option selected>Sombre</option>
                  <option>Clair</option>
                  <option>Auto</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Performance Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect rounded-apple-lg border border-white/10 overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Performance</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tâches Parallèles Maximum
                </label>
                <input
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={8}
                  className="w-full px-3 py-2 glass-effect border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Nombre de tâches pouvant s'exécuter simultanément (nécessite de la mémoire GPU)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Délai de Génération (secondes)
                </label>
                <input
                  type="number"
                  defaultValue={0.5}
                  step={0.1}
                  min={0}
                  className="w-full px-3 py-2 glass-effect border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Délai simulé pour les tests (à retirer en production)
                </p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enable-cache"
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                />
                <label htmlFor="enable-cache" className="ml-2 text-sm text-gray-300">
                  Activer la mise en cache pour des générations plus rapides
                </label>
              </div>
            </div>
          </motion.div>

          {/* Model Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-effect rounded-apple-lg border border-white/10 overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Modèles</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modèle d'Image par Défaut
                </label>
                <select className="w-full px-3 py-2 glass-effect border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option selected>Stable Diffusion 1.5</option>
                  <option>SDXL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modèle de Vidéo par Défaut
                </label>
                <select className="w-full px-3 py-2 glass-effect border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option selected>Stable Video Diffusion</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Répertoire de Cache des Modèles
                </label>
                <input
                  type="text"
                  defaultValue="models/"
                  className="w-full px-3 py-2 glass-effect border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>

          {/* API Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-effect rounded-apple-lg border border-white/10 overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Configuration API</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL du Backend
                </label>
                <input
                  type="text"
                  defaultValue="http://localhost:8000"
                  className="w-full px-3 py-2 glass-effect border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Clé API (Optionnel)
                </label>
                <input
                  type="password"
                  placeholder="Entrez la clé API..."
                  className="w-full px-3 py-2 glass-effect border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Requis pour les déploiements en production avec authentification
                </p>
              </div>
            </div>
          </motion.div>

          {/* Storage Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-effect rounded-apple-lg border border-white/10 overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Stockage</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-300">Base de Données</div>
                  <div className="text-xs text-gray-400">SQLite (ai_generator.db)</div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 glass-effect text-gray-300 text-sm rounded-xl hover:bg-white/5"
                >
                  Sauvegarder
                </motion.button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-300">Vider le Cache</div>
                  <div className="text-xs text-gray-400">Libérer de l'espace disque</div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 bg-red-900/50 text-red-300 text-sm rounded-xl hover:bg-red-800/50"
                >
                  Vider
                </motion.button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-300">Exporter les Données</div>
                  <div className="text-xs text-gray-400">Télécharger toutes les ressources et métadonnées</div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 glass-effect text-gray-300 text-sm rounded-xl hover:bg-white/5"
                >
                  Exporter
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-between"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 glass-effect text-gray-300 rounded-xl hover:bg-white/5"
            >
              Réinitialiser
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg"
            >
              Enregistrer
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-effect border border-yellow-700/30 bg-yellow-500/10 p-4 rounded-xl"
          >
            <h3 className="text-sm font-semibold text-yellow-300 mb-2">⚠️ Note</h3>
            <p className="text-xs text-gray-300">
              La gestion des paramètres est en cours de développement. Les modifications ne sont pas encore persistantes.
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
