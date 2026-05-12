import { Activity, Download, GitBranch, Workflow } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBuilderStore } from '@/store/builderStore'
import type { DrawerKind } from '@/store/types'

type TabDef = {
  id: 'builder' | DrawerKind
  label: string
  icon: typeof Workflow
}

const tabs: TabDef[] = [
  { id: 'builder', label: 'Builder', icon: Workflow },
  { id: 'simulation', label: 'Simulation', icon: Activity },
  { id: 'version', label: 'Versioning', icon: GitBranch },
  { id: 'protocol', label: 'Export', icon: Download },
]

export function TabBar() {
  const drawerStack = useBuilderStore((s) => s.drawerStack)
  const openDrawer = useBuilderStore((s) => s.openDrawer)
  const openKinds = new Set(drawerStack.map((d) => d.kind))

  return (
    <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isBuilder = id === 'builder'
        const active = isBuilder || openKinds.has(id as DrawerKind)
        return (
          <button
            key={id}
            type="button"
            onClick={() => {
              if (isBuilder) return
              openDrawer(id as DrawerKind)
            }}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors',
              active
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:bg-slate-200/60',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
