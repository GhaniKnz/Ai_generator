import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

interface VideoGenNodeData {
  label: string
  duration: number
  camera?: string
}

export const VideoGenNode = memo(({ data }: NodeProps<VideoGenNodeData>) => {
  return (
    <div className="bg-purple-500 border-2 border-purple-600 rounded-lg shadow-lg p-4 min-w-[200px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-300" />
      <div className="flex items-center mb-2">
        <div className="text-white text-xl mr-2">🎬</div>
        <div className="font-semibold text-white">{data.label}</div>
      </div>
      <div className="text-white text-xs">
        Duration: {data.duration}s
      </div>
      {data.camera && (
        <div className="text-white text-xs">Camera: {data.camera}</div>
      )}
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-300" />
    </div>
  )
})

VideoGenNode.displayName = 'VideoGenNode'
