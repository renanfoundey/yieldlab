import { TopNav } from './topnav/TopNav'
import { Sidebar } from './sidebar/Sidebar'
import { FlowCanvas } from './canvas/FlowCanvas'
import { DrawerStack } from './drawers/DrawerStack'
import { TourModal } from './tour/TourModal'

export function Builder() {
  return (
    <div className="flex h-screen w-screen flex-col bg-slate-50">
      <TopNav />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="relative min-w-0 flex-1">
          <FlowCanvas />
        </main>
        <DrawerStack />
      </div>
      <TourModal />
    </div>
  )
}
