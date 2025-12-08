import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
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
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

interface LayoutProps {
  children: ReactNode
  title?: string
  showSidebar?: boolean
}

export default function Layout({ children, title, showSidebar = true }: LayoutProps) {
  const router = useRouter()

  const navSections = [
    {
      title: 'Generate',
      items: [
        { name: 'Home', path: '/', icon: HomeIcon },
        { name: 'Text to Image', path: '/text-to-image', icon: PhotoIcon },
        { name: 'Text to Video', path: '/text-to-video', icon: VideoCameraIcon },
        { name: 'Image to Video', path: '/image-to-video', icon: CloudArrowUpIcon },
        { name: 'Lab Mode', path: '/lab', icon: BeakerIcon },
      ]
    },
    {
      title: 'Training',
      items: [
        { name: 'Datasets', path: '/datasets', icon: FolderIcon },
        { name: 'Training', path: '/training', icon: CpuChipIcon },
        { name: 'Training Guide', path: '/training-guide', icon: BookOpenIcon },
        { name: 'Data Collection', path: '/data-collection', icon: ArrowDownTrayIcon },
      ]
    },
    {
      title: 'Management',
      items: [
        { name: 'Assets', path: '/assets', icon: RectangleStackIcon },
        { name: 'Models', path: '/models', icon: CpuChipIcon },
        { name: 'Monitoring', path: '/monitoring', icon: ChartBarIcon },
        { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
      ]
    }
  ]

  const isActive = (path: string) => {
    return router.pathname === path
  }

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
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-2xl font-bold"
              >
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI Generator
                </span>
              </motion.div>
            </Link>
            {title && <h1 className="text-lg text-white font-medium hidden md:block">{title}</h1>}
            <div className="flex items-center space-x-3">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href="/monitoring"
                  className={`p-2 rounded-xl transition-all ${
                    isActive('/monitoring')
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ChartBarIcon className="w-6 h-6" />
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
                  <Cog6ToothIcon className="w-6 h-6" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Improved Sidebar */}
        {showSidebar && (
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-72 glass-effect border-r border-white/10 overflow-y-auto"
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
  )
}
