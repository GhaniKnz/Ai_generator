import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

interface OutputNodeData {
  label: string
  path?: string
}

export const OutputNode = memo(({ data }: NodeProps<OutputNodeData>) => {
  return (
    <div className="bg-gray-700 border-2 border-gray-800 rounded-lg shadow-lg p-4 min-w-[200px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-500" />
      <div className="flex items-center mb-2">
        <div className="text-white text-xl mr-2">💾</div>
        <div className="font-semibold text-white">{data.label}</div>
      </div>
      {data.path ? (
        <div className="text-gray-300 text-xs truncate">{data.path}</div>
      ) : (
        <div className="text-gray-400 text-xs">No output yet</div>
      )}
    </div>
  )
})

OutputNode.displayName = 'OutputNode'
