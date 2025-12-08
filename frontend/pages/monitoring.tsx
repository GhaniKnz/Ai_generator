import { useEffect, useState } from 'react'
import Head from 'next/head'

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

export default function MonitoringDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchDashboard = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/monitoring/dashboard')
      const data = await response.json()
      setDashboardData(data)
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
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  const { system, usage, uptime_formatted, recent_activity, popular_presets } = dashboardData

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Monitoring Dashboard - AI Generator</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Monitoring Dashboard</h1>
            <p className="text-gray-400">System health and analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded ${
                autoRefresh ? 'bg-green-600' : 'bg-gray-600'
              } hover:opacity-80 transition`}
            >
              {autoRefresh ? '🔄 Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
            </button>
            <button
              onClick={fetchDashboard}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
            >
              🔄 Refresh Now
            </button>
          </div>
        </div>

        {/* System Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">System Uptime</div>
            <div className="text-3xl font-bold text-green-400">{uptime_formatted}</div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Total Jobs</div>
            <div className="text-3xl font-bold text-blue-400">{system.total_jobs}</div>
            <div className="text-xs text-gray-500 mt-2">
              ✅ {system.jobs_completed} completed · ❌ {system.jobs_failed} failed
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Pending Jobs</div>
            <div className="text-3xl font-bold text-yellow-400">{system.jobs_pending}</div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Avg Generation Time</div>
            <div className="text-3xl font-bold text-purple-400">
              {system.avg_generation_time.toFixed(2)}s
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Generation Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">🎨 Images Generated</span>
                <span className="text-2xl font-bold text-green-400">{usage.total_images_generated}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">🎬 Videos Generated</span>
                <span className="text-2xl font-bold text-blue-400">{usage.total_videos_generated}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">🔗 Workflows Executed</span>
                <span className="text-2xl font-bold text-purple-400">{usage.total_workflows_executed}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Training & Data Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">📊 Datasets Created</span>
                <span className="text-2xl font-bold text-yellow-400">{usage.total_datasets_created}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">🏋️ Training Jobs</span>
                <span className="text-2xl font-bold text-orange-400">{usage.total_training_jobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">🌐 Downloads</span>
                <span className="text-2xl font-bold text-pink-400">{usage.total_downloads}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Popular Presets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recent_activity.map((activity, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {activity.type === 'image' ? '🎨' : activity.type === 'video' ? '🎬' : '🔗'}
                    </span>
                    <div>
                      <div className="font-semibold capitalize">{activity.type}</div>
                      <div className="text-sm text-gray-400">{activity.time}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm ${
                    activity.status === 'completed' ? 'bg-green-600' : 
                    activity.status === 'failed' ? 'bg-red-600' : 'bg-yellow-600'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Popular Presets</h2>
            <div className="space-y-3">
              {popular_presets.map((preset, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                    <span className="font-semibold">{preset.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400">{preset.usage} uses</span>
                    <div className="w-24 bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(preset.usage / 50) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
