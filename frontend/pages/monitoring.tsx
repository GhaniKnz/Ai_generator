import { useEffect, useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface DashboardData {
  system: {
    total_jobs: number
    jobs_completed: number
    jobs_failed: number
    jobs_pending: number
    avg_generation_time: number
    uptime_seconds: number
  }
  usage: {
    total_images_generated: number
    total_videos_generated: number
    total_workflows_executed: number
    total_datasets_created: number
    total_training_jobs: number
    total_downloads: number
  }
  uptime_formatted: string
  recent_activity: Array<{
    type: string
    status: string
    time: string
  }>
  popular_presets: Array<{
    name: string
    usage: number
  }>
  timestamp: string
}

interface MetricsHistory {
  timestamp: string
  jobs: number
  generation_time: number
  images: number
  videos: number
}

export default function MonitoringDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [metricsHistory, setMetricsHistory] = useState<MetricsHistory[]>([])

  const fetchDashboard = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/monitoring/dashboard')
      const data = await response.json()
      setDashboardData(data)
      
      // Add to history for graphs
      const now = new Date().toLocaleTimeString()
      setMetricsHistory(prev => {
        const newHistory = [
          ...prev,
          {
            timestamp: now,
            jobs: data.system.total_jobs,
            generation_time: data.system.avg_generation_time,
            images: data.usage.total_images_generated,
            videos: data.usage.total_videos_generated
          }
        ]
        // Keep only last 20 data points
        return newHistory.slice(-20)
      })
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
    
    if (autoRefresh) {
      const interval = setInterval(fetchDashboard, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  if (loading || !dashboardData) {
    return (
      <Layout title="Tableau de Bord de Surveillance">
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      </Layout>
    )
  }

  const { system, usage, uptime_formatted, recent_activity, popular_presets } = dashboardData

  const statusData = [
    { name: 'Terminés', value: system.jobs_completed, color: '#10b981' },
    { name: 'Échoués', value: system.jobs_failed, color: '#ef4444' },
    { name: 'En attente', value: system.jobs_pending, color: '#f59e0b' }
  ]

  const generationData = [
    { name: 'Images', value: usage.total_images_generated, color: '#3b82f6' },
    { name: 'Vidéos', value: usage.total_videos_generated, color: '#8b5cf6' },
    { name: 'Workflows', value: usage.total_workflows_executed, color: '#06b6d4' }
  ]

  return (
    <Layout title="Tableau de Bord de Surveillance">
      <Head>
        <title>Tableau de Bord de Surveillance - Générateur IA</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Tableau de Bord en Temps Réel
              </span>
            </h2>
            <p className="text-gray-400 mt-1">Surveillez votre système de génération IA</p>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-xl transition-all ${
                autoRefresh
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'glass-effect text-gray-300'
              }`}
            >
              {autoRefresh ? '🔄 Rafraîchissement Auto ACTIVÉ' : '⏸️ Rafraîchissement Auto DÉSACTIVÉ'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchDashboard}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              🔄 Rafraîchir Maintenant
            </motion.button>
          </div>
        </motion.div>

        {/* System Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10 cursor-default"
          >
            <div className="text-sm text-gray-400 mb-2">Temps de Fonctionnement</div>
            <div className="text-3xl font-bold text-green-400 mb-1">{uptime_formatted}</div>
            <div className="text-xs text-gray-500">Fonctionne correctement</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10 cursor-default"
          >
            <div className="text-sm text-gray-400 mb-2">Total des Tâches</div>
            <div className="text-3xl font-bold text-blue-400 mb-1">{system.total_jobs}</div>
            <div className="text-xs text-gray-500">
              ✅ {system.jobs_completed} terminées · ❌ {system.jobs_failed} échouées
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10 cursor-default"
          >
            <div className="text-sm text-gray-400 mb-2">Tâches en Attente</div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">{system.jobs_pending}</div>
            <div className="text-xs text-gray-500">En file d'attente</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -4 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10 cursor-default"
          >
            <div className="text-sm text-gray-400 mb-2">Temps Moyen de Génération</div>
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {system.avg_generation_time.toFixed(2)}s
            </div>
            <div className="text-xs text-gray-500">Par tâche</div>
          </motion.div>
        </div>

        {/* Real-Time Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Jobs Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Jobs Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={metricsHistory}>
                <defs>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="timestamp" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="jobs"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorJobs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Generation Time Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Generation Time Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metricsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="timestamp" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="generation_time"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={{ fill: '#a855f7', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Job Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Job Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Generation Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Generation Types</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={generationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {generationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <h2 className="text-xl font-bold text-white mb-4">Generation Stats</h2>
            <div className="space-y-4">
              <motion.div
                whileHover={{ x: 4 }}
                className="flex justify-between items-center p-3 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg border border-green-500/20"
              >
                <span className="text-gray-300 flex items-center">
                  <span className="text-2xl mr-3">🎨</span>
                  Images Generated
                </span>
                <span className="text-2xl font-bold text-green-400">{usage.total_images_generated}</span>
              </motion.div>
              <motion.div
                whileHover={{ x: 4 }}
                className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg border border-blue-500/20"
              >
                <span className="text-gray-300 flex items-center">
                  <span className="text-2xl mr-3">🎬</span>
                  Videos Generated
                </span>
                <span className="text-2xl font-bold text-blue-400">{usage.total_videos_generated}</span>
              </motion.div>
              <motion.div
                whileHover={{ x: 4 }}
                className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg border border-purple-500/20"
              >
                <span className="text-gray-300 flex items-center">
                  <span className="text-2xl mr-3">🔗</span>
                  Workflows Executed
                </span>
                <span className="text-2xl font-bold text-purple-400">{usage.total_workflows_executed}</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <h2 className="text-xl font-bold text-white mb-4">Training & Data Stats</h2>
            <div className="space-y-4">
              <motion.div
                whileHover={{ x: 4 }}
                className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-lg border border-yellow-500/20"
              >
                <span className="text-gray-300 flex items-center">
                  <span className="text-2xl mr-3">📊</span>
                  Datasets Created
                </span>
                <span className="text-2xl font-bold text-yellow-400">{usage.total_datasets_created}</span>
              </motion.div>
              <motion.div
                whileHover={{ x: 4 }}
                className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-500/10 to-transparent rounded-lg border border-orange-500/20"
              >
                <span className="text-gray-300 flex items-center">
                  <span className="text-2xl mr-3">🏋️</span>
                  Training Jobs
                </span>
                <span className="text-2xl font-bold text-orange-400">{usage.total_training_jobs}</span>
              </motion.div>
              <motion.div
                whileHover={{ x: 4 }}
                className="flex justify-between items-center p-3 bg-gradient-to-r from-pink-500/10 to-transparent rounded-lg border border-pink-500/20"
              >
                <span className="text-gray-300 flex items-center">
                  <span className="text-2xl mr-3">🌐</span>
                  Downloads
                </span>
                <span className="text-2xl font-bold text-pink-400">{usage.total_downloads}</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity & Popular Presets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recent_activity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + (index * 0.1) }}
                  whileHover={{ scale: 1.02 }}
                  className="flex justify-between items-center p-3 glass-effect rounded-lg border border-white/5"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {activity.type === 'image' ? '🎨' : activity.type === 'video' ? '🎬' : '🔗'}
                    </span>
                    <div>
                      <div className="font-semibold text-white capitalize">{activity.type}</div>
                      <div className="text-sm text-gray-400">{activity.time}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    activity.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                    activity.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {activity.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="glass-effect rounded-apple-lg p-6 border border-white/10"
          >
            <h2 className="text-xl font-bold text-white mb-4">Popular Presets</h2>
            <div className="space-y-3">
              {popular_presets.map((preset, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + (index * 0.1) }}
                  whileHover={{ scale: 1.02 }}
                  className="flex justify-between items-center p-3 glass-effect rounded-lg border border-white/5"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-bold text-gray-500">#{index + 1}</span>
                    <span className="font-semibold text-white">{preset.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-400 font-medium">{preset.usage} uses</span>
                    <div className="w-24 bg-gray-700/50 rounded-full h-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(preset.usage / 50) * 100}%` }}
                        transition={{ duration: 1, delay: 1.2 + (index * 0.1) }}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" 
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
