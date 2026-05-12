import type { DragEvent } from 'react'
import { PanelLeft, PanelLeftClose } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useBuilderStore } from '@/store/builderStore'
import { DND_MIME } from '@/features/builder/canvas/FlowCanvas'
import {
  NODE_DEF,
  NODE_KINDS_ORDER,
} from '@/features/builder/canvas/nodes/nodeTypes'
import type { NodeKind } from '@/store/types'

export function Sidebar() {
  const expanded = useBuilderStore((s) => s.sidebarExpanded)
  const toggleSidebar = useBuilderStore((s) => s.toggleSidebar)

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          'flex h-full shrink-0 flex-col border-r bg-white transition-[width] duration-150',
          expanded ? 'w-56' : 'w-12',
        )}
      >
        <div
          className={cn(
            'flex h-11 items-center border-b',
            expanded ? 'justify-between px-3' : 'justify-center',
          )}
        >
          {expanded && (
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Nodes
            </span>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-500"
                onClick={toggleSidebar}
                aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {expanded ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            {!expanded && (
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            )}
          </Tooltip>
        </div>

        <div className={cn('flex-1 overflow-y-auto', expanded ? 'p-2' : 'py-2')}>
          <ul className="space-y-1">
            {NODE_KINDS_ORDER.map((kind) => (
              <SidebarItem key={kind} kind={kind} expanded={expanded} />
            ))}
          </ul>
        </div>
      </aside>
    </TooltipProvider>
  )
}

function SidebarItem({ kind, expanded }: { kind: NodeKind; expanded: boolean }) {
  const def = NODE_DEF(kind)
  const Icon = def.icon

  const handleDragStart = (event: DragEvent<HTMLLIElement>) => {
    event.dataTransfer.setData(DND_MIME, kind)
    event.dataTransfer.effectAllowed = 'move'
  }

  const body = (
    <li
      draggable
      onDragStart={handleDragStart}
      title={expanded ? def.description : undefined}
      className={cn(
        'group flex cursor-grab select-none items-center gap-2 rounded-md border border-transparent text-sm transition-colors active:cursor-grabbing',
        expanded
          ? 'px-2 py-1.5 hover:border-slate-200 hover:bg-slate-50'
          : 'mx-1 justify-center px-0 py-1.5 hover:bg-slate-100',
      )}
    >
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border',
          def.toneClass,
        )}
      >
        <Icon className={cn('h-4 w-4', def.iconToneClass)} />
      </span>
      {expanded && (
        <span className="min-w-0 flex-1 truncate font-medium text-slate-800">
          {def.label}
        </span>
      )}
    </li>
  )

  if (expanded) return body
  return (
    <Tooltip>
      <TooltipTrigger asChild>{body}</TooltipTrigger>
      <TooltipContent side="right">{def.label}</TooltipContent>
    </Tooltip>
  )
}
