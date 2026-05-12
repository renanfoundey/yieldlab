import { memo } from 'react'
import { NodeResizeControl, type NodeProps } from '@xyflow/react'
import { Network, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useBuilderStore } from '@/store/builderStore'
import type { AppNode, GroupNodeData } from '@/store/types'

function GroupNodeBase({ id, data, selected }: NodeProps<AppNode>) {
  const removeNode = useBuilderStore((s) => s.removeNode)
  if (data.kind !== 'group') return null
  const group = data as GroupNodeData

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col rounded-lg border-2 border-dashed bg-slate-50/40 transition-shadow',
        selected ? 'border-primary' : 'border-slate-300',
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-200/70 bg-white/70 px-3 py-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Network className="h-3.5 w-3.5 text-slate-500" />
          <span>{group.label}</span>
          <Badge variant="accent" className="ml-1 text-[10px]">
            Loop × {group.loops}
          </Badge>
        </div>
        <button
          type="button"
          className="text-slate-400 hover:text-slate-700"
          onClick={(e) => {
            e.stopPropagation()
            removeNode(id)
          }}
          aria-label="Remove group"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1" />
      <NodeResizeControl
        minWidth={240}
        minHeight={140}
        style={{ background: 'transparent', border: 'none' }}
      />
    </div>
  )
}

export const GroupNode = memo(GroupNodeBase)
