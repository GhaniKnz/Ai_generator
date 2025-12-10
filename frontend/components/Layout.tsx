import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PhotoIcon,
  VideoCameraIcon,
  BeakerIcon,
  FolderIcon,
  CpuChipIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  BookOpenIcon,
  HomeIcon,
  RectangleStackIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface LayoutProps {
  children: ReactNode
  title?: string
  showSidebar?: boolean
}

export default function Layout({ children, title, showSidebar = true }: LayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navSections = [
    {
      title: 'Génération',
      items: [
        { name: 'Accueil', path: '/', icon: HomeIcon },
        { name: 'Texte vers Image', path: '/text-to-image', icon: PhotoIcon },
        { name: 'Texte vers Vidéo', path: '/text-to-video', icon: VideoCameraIcon },
        { name: 'Image vers Vidéo', path: '/image-to-video', icon: CloudArrowUpIcon },
        { name: 'Mode Lab', path: '/lab', icon: BeakerIcon },
      ]
    },
    {
      title: 'Entraînement',
      items: [
        { name: 'Ensembles de Données', path: '/datasets', icon: FolderIcon },
        { name: 'Entraînement', path: '/training', icon: CpuChipIcon },
        { name: 'Moniteur d\'Entraînement', path: '/training-monitor', icon: EyeIcon },
        { name: 'Guide d\'Entraînement', path: '/training-guide', icon: BookOpenIcon },
        { name: 'Collection de Données', path: '/data-collection', icon: ArrowDownTrayIcon },
      ]
    },
    {
      title: 'Gestion',
      items: [
        { name: 'Ressources', path: '/assets', icon: RectangleStackIcon },
        { name: 'Modèles', path: '/models', icon: CpuChipIcon },
        { name: 'Surveillance', path: '/monitoring', icon: ChartBarIcon },
        { name: 'Paramètres', path: '/settings', icon: Cog6ToothIcon },
      ]
    }
  ]

  const isActive = (path: string) => {
    return router.pathname === path
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-50 border-b border-white/10 header-glass"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {showSidebar && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {sidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                  </motion.button>
                )}
                <Link href="/" className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-xl font-bold"
                  >
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Générateur IA
                    </span>
                  </motion.div>
                </Link>
              </div>
              {title && <h1 className="text-base text-white font-medium hidden md:block">{title}</h1>}
              <div className="flex items-center space-x-2">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Link
                    href="/monitoring"
                    className={`p-2 rounded-xl transition-all ${
                      isActive('/monitoring')
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ChartBarIcon className="w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Link
                    href="/settings"
                    className={`p-2 rounded-xl transition-all ${
                      isActive('/settings')
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Improved Sidebar */}
        <AnimatePresence mode="wait">
          {showSidebar && sidebarOpen && (
            <motion.aside
              initial={{ opacity: 0, x: -288 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -288 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-72 border-r border-white/10 overflow-y-auto sidebar-glass"
            >
            <nav className="p-4 space-y-6">
              {navSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                >
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item, itemIndex) => {
                      const active = isActive(item.path)
                      return (
                        <motion.div
                          key={item.path}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                          whileHover={{ x: 4 }}
                        >
                          <Link
                            href={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                              active
                                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg'
                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <item.icon
                              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                                active ? 'text-blue-400' : ''
                              }`}
                            />
                            <span className="font-medium">{item.name}</span>
                            {active && (
                              <motion.div
                                layoutId="activeIndicator"
                                className="ml-auto w-2 h-2 rounded-full bg-blue-400"
                              />
                            )}
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              ))}
            </nav>
          </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      </div>
    </div>
  )
}
