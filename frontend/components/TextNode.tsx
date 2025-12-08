import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

interface TextNodeData {
  label: string
  prompt: string
}

export const TextNode = memo(({ data }: NodeProps<TextNodeData>) => {
  return (
    <div className="bg-blue-500 border-2 border-blue-600 rounded-lg shadow-lg p-4 min-w-[200px]">
      <div className="flex items-center mb-2">
        <div className="text-white text-xl mr-2">📝</div>
        <div className="font-semibold text-white">{data.label}</div>
      </div>
      <div className="bg-blue-400 text-white text-sm p-2 rounded">
        {data.prompt || 'Enter prompt...'}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-300" />
    </div>
  )
})

TextNode.displayName = 'TextNode'
