import { useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  BeakerIcon, 
  FolderIcon, 
  CpuChipIcon, 
  CloudArrowUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

export default function Home() {
  const router = useRouter()

  const features = [
    {
      title: 'Texte vers Image',
      description: 'Générez des images époustouflantes à partir de descriptions textuelles avec des modèles IA avancés.',
      icon: PhotoIcon,
      color: 'from-blue-500 to-cyan-500',
      path: '/text-to-image'
    },
    {
      title: 'Texte vers Vidéo',
      description: 'Créez des vidéos dynamiques à partir de prompts textuels avec contrôles de caméra.',
      icon: VideoCameraIcon,
      color: 'from-purple-500 to-pink-500',
      path: '/text-to-video'
    },
    {
      title: 'Image vers Vidéo',
      description: 'Animez vos images avec des mouvements et animations personnalisables.',
      icon: CloudArrowUpIcon,
      color: 'from-green-500 to-emerald-500',
      path: '/image-to-video'
    },
    {
      title: 'Mode Lab',
      description: 'Canvas basé sur des nœuds pour des workflows IA multi-étapes complexes.',
      icon: BeakerIcon,
      color: 'from-orange-500 to-red-500',
      path: '/lab'
    },
    {
      title: 'Ensembles de Données',
      description: 'Gérez et organisez vos ensembles de données d\'entraînement efficacement.',
      icon: FolderIcon,
      color: 'from-indigo-500 to-blue-500',
      path: '/datasets'
    },
    {
      title: 'Entraînement',
      description: 'Créez des modèles personnalisés avec l\'entraînement LoRA et DreamBooth.',
      icon: CpuChipIcon,
      color: 'from-yellow-500 to-orange-500',
      path: '/training'
    }
  ]

  return (
    <Layout title="">
      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Générateur IA
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Une plateforme complète pour créer des images et vidéos époustouflantes avec la technologie IA de pointe.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => router.push(feature.path)}
              className="glass-effect rounded-apple-lg p-6 cursor-pointer card-hover group border border-white/10"
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
            </motion.div>
          ))}
        </div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-effect rounded-apple-lg p-8 border border-white/10"
        >
          <h3 className="text-2xl font-semibold text-white mb-6">Fonctionnalités</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <p className="text-gray-300">Génération avancée texte vers image avec support LoRA</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
              <p className="text-gray-300">Conversion texte et image vers vidéo</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <p className="text-gray-300">Capacités d'inpainting et d'outpainting</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
              <p className="text-gray-300">Amélioration et upscaling d'images</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-pink-500 mt-2"></div>
              <p className="text-gray-300">Éditeur de workflow basé sur des nœuds (Mode Lab)</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
              <p className="text-gray-300">Entraînement de modèles personnalisés (LoRA/DreamBooth)</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
              <p className="text-gray-300">Gestion et organisation des ensembles de données</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2"></div>
              <p className="text-gray-300">Support de téléchargement multi-formats</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
              <p className="text-gray-300">Bibliothèque de ressources avec tags et recherche</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
              <p className="text-gray-300">Gestion de projets et modèles</p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
