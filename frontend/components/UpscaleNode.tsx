import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

interface UpscaleNodeData {
  label: string
  factor: number
}

export const UpscaleNode = memo(({ data }: NodeProps<UpscaleNodeData>) => {
  return (
    <div className="bg-orange-500 border-2 border-orange-600 rounded-lg shadow-lg p-4 min-w-[200px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-300" />
      <div className="flex items-center mb-2">
        <div className="text-white text-xl mr-2">⬆️</div>
        <div className="font-semibold text-white">{data.label}</div>
      </div>
      <div className="text-white text-xs">Scale: {data.factor}x</div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-orange-300" />
    </div>
  )
})

UpscaleNode.displayName = 'UpscaleNode'
