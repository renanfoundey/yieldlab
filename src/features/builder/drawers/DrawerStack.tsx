import { useBuilderStore } from '@/store/builderStore'
import { EditNodeDrawer } from './EditNodeDrawer'
import { EditGroupDrawer } from './EditGroupDrawer'
import { SimulationDrawer } from './SimulationDrawer'
import { VersioningDrawer } from './VersioningDrawer'
import { ExportDrawer } from './ExportDrawer'

export function DrawerStack() {
  const drawerStack = useBuilderStore((s) => s.drawerStack)
  if (drawerStack.length === 0) return null

  return (
    <div className="flex h-full max-w-[70vw] overflow-x-auto">
      {drawerStack.map((entry) => {
        if (entry.kind === 'node' && entry.targetId) {
          return (
            <EditNodeDrawer
              key={entry.id}
              drawerId={entry.id}
              nodeId={entry.targetId}
            />
          )
        }
        if (entry.kind === 'group' && entry.targetId) {
          return (
            <EditGroupDrawer
              key={entry.id}
              drawerId={entry.id}
              nodeId={entry.targetId}
            />
          )
        }
        if (entry.kind === 'simulation') {
          return <SimulationDrawer key={entry.id} drawerId={entry.id} />
        }
        if (entry.kind === 'version') {
          return <VersioningDrawer key={entry.id} drawerId={entry.id} />
        }
        if (entry.kind === 'protocol') {
          return <ExportDrawer key={entry.id} drawerId={entry.id} />
        }
        return null
      })}
    </div>
  )
}
