import { useCallback, useState } from 'react'
import Link from 'next/link'
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

export default function Lab() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [running, setRunning] = useState(false)

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
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setRunning(false)
    alert('Workflow executed! (This is a demo - connect to backend API for real execution)')
  }

  const handleClear = () => {
    if (confirm('Clear all nodes and edges?')) {
      setNodes([])
      setEdges([])
    }
  }

  const handleSave = () => {
    const workflow = { nodes, edges }
    console.log('Saving workflow:', workflow)
    alert('Workflow saved! Check console for graph data.')
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-100 border-b border-gray-300 flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-blue-600 hover:text-blue-700 mr-4">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Lab Mode</h1>
            <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
              Active
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            >
              Save
            </button>
            <button
              onClick={handleRunAll}
              disabled={running}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {running ? 'Running...' : 'Run All'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-300 p-4 overflow-y-auto flex-shrink-0">
          <h3 className="font-semibold text-gray-900 mb-4">Add Nodes</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleAddNode('textNode')}
              className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center justify-start"
            >
              <span className="mr-2">📝</span>
              Text Prompt
            </button>
            <button
              onClick={() => handleAddNode('imageGenNode')}
              className="w-full px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 flex items-center justify-start"
            >
              <span className="mr-2">🎨</span>
              Image Generator
            </button>
            <button
              onClick={() => handleAddNode('videoGenNode')}
              className="w-full px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 flex items-center justify-start"
            >
              <span className="mr-2">🎬</span>
              Video Generator
            </button>
            <button
              onClick={() => handleAddNode('upscaleNode')}
              className="w-full px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 flex items-center justify-start"
            >
              <span className="mr-2">⬆️</span>
              Upscale
            </button>
            <button
              onClick={() => handleAddNode('outputNode')}
              className="w-full px-3 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-800 flex items-center justify-start"
            >
              <span className="mr-2">💾</span>
              Output
            </button>
          </div>

          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            <p className="font-semibold mb-2">💡 How to use:</p>
            <ul className="space-y-1">
              <li>• Drag nodes to reposition</li>
              <li>• Connect node handles</li>
              <li>• Click nodes to edit (future)</li>
              <li>• Run All to execute workflow</li>
              <li>• Save to store graph</li>
            </ul>
          </div>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-800">
            <p className="font-semibold mb-1">✨ Features:</p>
            <ul className="space-y-1">
              <li>• Example workflow loaded</li>
              <li>• 5 node types available</li>
              <li>• Fully interactive canvas</li>
              <li>• Ready for backend API</li>
            </ul>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-gray-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'textNode':
                    return '#3B82F6'
                  case 'imageGenNode':
                    return '#10B981'
                  case 'videoGenNode':
                    return '#8B5CF6'
                  case 'upscaleNode':
                    return '#F59E0B'
                  case 'outputNode':
                    return '#374151'
                  default:
                    return '#94A3B8'
                }
              }}
              maskColor="rgb(240, 240, 240, 0.6)"
            />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}
