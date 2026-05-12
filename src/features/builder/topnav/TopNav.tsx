import { Beaker, Compass, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBuilderStore } from '@/store/builderStore'
import { TabBar } from './TabBar'

export function TopNav() {
  const startTour = useBuilderStore((s) => s.startTour)
  return (
    <header className="flex h-12 items-center justify-between border-b bg-white px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Beaker className="h-4 w-4" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-slate-900">Yieldlab</span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-sm text-slate-600">Protocol Builder</span>
        </div>
      </div>
      <TabBar />
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={startTour}>
          <Compass className="h-3.5 w-3.5" /> Take Tour
        </Button>
        <Button size="sm" className="h-7 text-xs">
          <PhoneCall className="h-3.5 w-3.5" /> Book a Call
        </Button>
      </div>
    </header>
  )
}
