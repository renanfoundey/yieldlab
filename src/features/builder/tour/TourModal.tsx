import { useEffect, useState } from 'react'
import {
  Activity,
  Compass,
  Download,
  GitBranch,
  MousePointerClick,
  Network,
  PanelLeft,
  Route,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useBuilderStore } from '@/store/builderStore'

type Step = {
  icon: LucideIcon
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    icon: Compass,
    title: 'Welcome to the Builder Interface!',
    body: "This is the main interface for creating and managing material test protocols. Let's take a quick tour to get you familiar with the key features.",
  },
  {
    icon: Workflow,
    title: 'Top navigation',
    body: 'Switch between Builder, Simulation, Versioning, and Export. Builder is the canvas; the other three open side drawers alongside your edit panel.',
  },
  {
    icon: PanelLeft,
    title: 'Node sidebar',
    body: 'The left sidebar lists every available step type — Sample Setup, Constant Load, Constant Strain, Strain Rate, Hold, End, Group. Toggle the chevron to collapse to icon-only or expand to show labels.',
  },
  {
    icon: MousePointerClick,
    title: 'Drag onto the canvas',
    body: 'Drag any sidebar item onto the canvas to drop a node. Drop it inside a Group to nest it. Drag from a node\'s bottom handle to another node\'s top handle to connect them.',
  },
  {
    icon: Workflow,
    title: 'Edit a node',
    body: 'Click a node to open the Edit Node drawer. Change the label, mode, polarity, value, and reporting parameters. Changes show on the node card immediately.',
  },
  {
    icon: Route,
    title: 'End paths and conditions',
    body: 'Each step can have multiple End Paths — branches to the next node when a condition is met (e.g. time > 300 s, strain >= 5%). The condition label renders on the edge.',
  },
  {
    icon: Network,
    title: 'Groups and loops',
    body: 'Drop a Group container, then drop step nodes inside it. Set Number of Loops in the group drawer to repeat the contained sequence. Drag the group and its children move together.',
  },
  {
    icon: Activity,
    title: 'Simulation',
    body: 'Open the Simulation tab to preview synthetic Load and Strain curves derived from your protocol. Download the result as CSV.',
  },
  {
    icon: GitBranch,
    title: 'Versioning',
    body: 'The Versioning drawer shows recipe lineage across main and branches, with tags, authors, and a Load button to restore a prior version.',
  },
  {
    icon: Download,
    title: 'Export',
    body: 'Pick a target hardware format (Instron, MTS, Zwick, or Yieldlab JSON) and a sample model, then generate a hardware-specific protocol file. You are ready to build.',
  },
]

export function TourModal() {
  const tourOpen = useBuilderStore((s) => s.tourOpen)
  const tourSeen = useBuilderStore((s) => s.tourSeen)
  const startTour = useBuilderStore((s) => s.startTour)
  const finishTour = useBuilderStore((s) => s.finishTour)
  const [step, setStep] = useState(0)

  // Auto-show on first visit
  useEffect(() => {
    if (!tourSeen && !tourOpen) startTour()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tourOpen) setStep(0)
  }, [tourOpen])

  const total = STEPS.length
  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === total - 1

  const handleClose = (open: boolean) => {
    if (!open) finishTour()
  }

  const next = () => {
    if (isLast) finishTour()
    else setStep((s) => Math.min(total - 1, s + 1))
  }
  const back = () => setStep((s) => Math.max(0, s - 1))

  return (
    <Dialog open={tourOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <DialogTitle>{current.title}</DialogTitle>
          <DialogDescription>{current.body}</DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            className="text-xs text-slate-500 hover:text-slate-700"
            onClick={finishTour}
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={back}>
                Back
              </Button>
            )}
            <Button size="sm" className="h-8 text-xs" onClick={next}>
              {isLast ? 'Finish' : `Next (Step ${step + 1} of ${total})`}
            </Button>
          </div>
        </div>

        <div className="mt-2 flex justify-center gap-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={
                i === step
                  ? 'h-1.5 w-4 rounded-full bg-primary'
                  : 'h-1.5 w-1.5 rounded-full bg-slate-300'
              }
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
