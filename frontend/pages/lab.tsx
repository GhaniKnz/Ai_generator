import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  MiniMap,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { TextNode } from '@/components/TextNode'
import { ImageGenNode } from '@/components/ImageGenNode'
import { VideoGenNode } from '@/components/VideoGenNode'
import { UpscaleNode } from '@/components/UpscaleNode'
import { OutputNode } from '@/components/OutputNode'
import {
  PlayIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const nodeTypes: NodeTypes = {
  textNode: TextNode,
  imageGenNode: ImageGenNode,
  videoGenNode: VideoGenNode,
  upscaleNode: UpscaleNode,
  outputNode: OutputNode,
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'textNode',
    position: { x: 50, y: 100 },
    data: { label: 'Text Prompt', prompt: 'A serene forest landscape at sunset' },
  },
  {
    id: '2',
    type: 'imageGenNode',
    position: { x: 350, y: 100 },
    data: { label: 'Generate Image', model: 'Stable Diffusion 1.5', status: 'Ready' },
  },
  {
    id: '3',
    type: 'videoGenNode',
    position: { x: 650, y: 100 },
    data: { label: 'Generate Video', duration: 5, camera: 'dolly' },
  },
  {
    id: '4',
    type: 'upscaleNode',
    position: { x: 950, y: 100 },
    data: { label: 'Upscale', factor: 2 },
  },
  {
    id: '5',
    type: 'outputNode',
    position: { x: 1250, y: 100 },
    data: { label: 'Output', path: '' },
  },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
  { id: 'e4-5', source: '4', target: '5', animated: true },
]

const nodeTemplates = [
  { type: 'textNode', label: 'Entrée Texte', icon: '📝' },
  { type: 'imageGenNode', label: 'Générateur d\'Image', icon: '🎨' },
  { type: 'videoGenNode', label: 'Générateur de Vidéo', icon: '🎬' },
  { type: 'upscaleNode', label: 'Upscaler', icon: '⬆️' },
  { type: 'outputNode', label: 'Sortie', icon: '📤' },
]

// Shared ReactFlow styles
const reactFlowStyles = {
  controls: {
    background: 'rgba(29, 29, 31, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px'
  }
}

export default function Lab() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [running, setRunning] = useState(false)
  const [showNodeMenu, setShowNodeMenu] = useState(false)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleAddNode = (type: string) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type,
      position: { x: 100 + nodes.length * 20, y: 300 + nodes.length * 20 },
      data: getDefaultNodeData(type),
    }
    setNodes((nds) => [...nds, newNode])
    setShowNodeMenu(false)
  }

  const getDefaultNodeData = (type: string) => {
    switch (type) {
      case 'textNode':
        return { label: 'New Prompt', prompt: 'Enter your prompt...' }
      case 'imageGenNode':
        return { label: 'New Image Gen', model: 'SD 1.5' }
      case 'videoGenNode':
        return { label: 'New Video Gen', duration: 3, camera: 'static' }
      case 'upscaleNode':
        return { label: 'Upscale', factor: 2 }
      case 'outputNode':
        return { label: 'Output', path: '' }
      default:
        return {}
    }
  }

  const handleRunAll = async () => {
    setRunning(true)
    try {
      const response = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Workflow execution result:', data)
        alert(`✅ Workflow executed successfully!\n\n${data.message}\n\nResults: ${JSON.stringify(data.results, null, 2)}`)
      } else {
        const error = await response.json()
        alert(`❌ Execution failed: ${error.detail || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error executing workflow:', error)
      alert('❌ Failed to execute workflow. Check console for details.')
    } finally {
      setRunning(false)
    }
  }

  const handleClear = () => {
    if (confirm('Clear all nodes and edges?')) {
      setNodes([])
      setEdges([])
    }
  }

  const handleSave = async () => {
    const workflow = { nodes, edges }
    console.log('Saving workflow:', workflow)
    
    try {
      const response = await fetch('/api/workflows/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      })
      
      const data = await response.json()
      if (data.status === 'valid') {
        alert(`✅ Workflow is valid!\n\n${data.message}\n\nExecution order: ${data.execution_order}`)
      } else {
        alert(`⚠️ Workflow has issues:\n\n${data.message}`)
      }
    } catch (error) {
      console.error('Error validating workflow:', error)
      alert('Workflow data logged to console')
    }
  }

  const handleExport = () => {
    const workflow = { nodes, edges }
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workflow-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const workflow = JSON.parse(e.target?.result as string)
            setNodes(workflow.nodes || [])
            setEdges(workflow.edges || [])
            alert('✅ Workflow imported successfully!')
          } catch (error) {
            alert('❌ Failed to import workflow. Invalid file format.')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <Layout title="Mode Lab" showSidebar={false}>
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect border-b border-white/10 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNodeMenu(!showNodeMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Ajouter Nœud</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClear}
                className="flex items-center space-x-2 px-4 py-2 glass-effect text-gray-300 rounded-xl hover:text-white hover:bg-white/5 transition-all"
              >
                <TrashIcon className="w-5 h-5" />
                <span>Effacer</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 glass-effect text-gray-300 rounded-xl hover:text-white hover:bg-white/5 transition-all"
              >
                <DocumentDuplicateIcon className="w-5 h-5" />
                <span>Valider</span>
              </motion.button>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleImport}
                className="flex items-center space-x-2 px-4 py-2 glass-effect text-gray-300 rounded-xl hover:text-white hover:bg-white/5 transition-all"
              >
                <ArrowUpTrayIcon className="w-5 h-5" />
                <span>Importer</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 glass-effect text-gray-300 rounded-xl hover:text-white hover:bg-white/5 transition-all"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>Exporter</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRunAll}
                disabled={running}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                <PlayIcon className="w-5 h-5" />
                <span>{running ? 'En cours...' : 'Exécuter'}</span>
              </motion.button>
            </div>
          </div>

          {/* Node Menu */}
          {showNodeMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 grid grid-cols-5 gap-3"
            >
              {nodeTemplates.map((template, index) => (
                <motion.button
                  key={template.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddNode(template.type)}
                  className="glass-effect rounded-xl p-4 border border-white/10 hover:border-blue-500/50 transition-all"
                >
                  <div className="text-3xl mb-2">{template.icon}</div>
                  <div className="text-sm text-white font-medium">{template.label}</div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Canvas */}
        <div className="flex-1 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: 'transparent' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#4b5563" />
            <Controls style={reactFlowStyles.controls} />
            <MiniMap
              style={reactFlowStyles.controls}
              nodeColor={(node) => {
                switch (node.type) {
                  case 'textNode': return '#3b82f6'
                  case 'imageGenNode': return '#8b5cf6'
                  case 'videoGenNode': return '#ec4899'
                  case 'upscaleNode': return '#10b981'
                  case 'outputNode': return '#f59e0b'
                  default: return '#6b7280'
                }
              }}
            />
          </ReactFlow>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect border-t border-white/10 p-3"
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6 text-gray-400">
              <span>Nœuds: <span className="text-white font-semibold">{nodes.length}</span></span>
              <span>Connexions: <span className="text-white font-semibold">{edges.length}</span></span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                Prêt
              </span>
            </div>
            <div className="text-gray-400">
              Glisser pour connecter • Shift+Clic pour sélection multiple
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
