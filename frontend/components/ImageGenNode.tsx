import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

interface ImageGenNodeData {
  label: string
  model: string
  status?: string
}

export const ImageGenNode = memo(({ data }: NodeProps<ImageGenNodeData>) => {
  return (
    <div className="bg-green-500 border-2 border-green-600 rounded-lg shadow-lg p-4 min-w-[200px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-green-300" />
      <div className="flex items-center mb-2">
        <div className="text-white text-xl mr-2">🎨</div>
        <div className="font-semibold text-white">{data.label}</div>
      </div>
      <div className="text-white text-xs">Model: {data.model || 'SD 1.5'}</div>
      {data.status && (
        <div className="mt-2 bg-green-400 text-white text-xs px-2 py-1 rounded">
          {data.status}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-300" />
    </div>
  )
})

ImageGenNode.displayName = 'ImageGenNode'
