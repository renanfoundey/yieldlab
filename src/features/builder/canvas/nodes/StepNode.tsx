import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'
import type { AppNode, StepNodeData } from '@/store/types'
import { NODE_DEF } from './nodeTypes'

function StepNodeBase({ data, selected }: NodeProps<AppNode>) {
  if (data.kind === 'group') return null
  const step = data as StepNodeData
  const def = NODE_DEF(step.kind)
  const Icon = def.icon

  const showValue = step.value !== null && step.unit !== null
  const isEndpoint = step.kind === 'end' || step.kind === 'sample-setup'

  return (
    <div
      className={cn(
        'min-w-[200px] rounded-lg border px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md',
        def.toneClass,
        selected && 'ring-2 ring-primary ring-offset-1',
      )}
    >
      {step.kind !== 'sample-setup' && (
        <Handle type="target" position={Position.Top} />
      )}

      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', def.iconToneClass)} />
        <span className="text-sm font-semibold text-slate-800">{step.label}</span>
      </div>

      <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-slate-500">
        <span>
          Mode: <span className="text-slate-700">{step.mode}</span>
        </span>
        {showValue && (
          <span>
            Value: <span className="text-slate-700">{step.value} {step.unit}</span>
          </span>
        )}
      </div>

      {!isEndpoint && step.kind !== 'end' && (
        <Handle type="source" position={Position.Bottom} />
      )}
      {step.kind === 'sample-setup' && (
        <Handle type="source" position={Position.Bottom} />
      )}
    </div>
  )
}

export const StepNode = memo(StepNodeBase)
