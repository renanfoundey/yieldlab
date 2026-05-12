import { X } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBuilderStore } from '@/store/builderStore'
import { NODE_DEF } from '@/features/builder/canvas/nodes/nodeTypes'
import type { StepNodeData, Unit } from '@/store/types'
import { ReportingSection } from './sections/ReportingSection'
import { EndPathsEditor } from './sections/EndPathsEditor'

const polarities: StepNodeData['polarity'][] = ['Tension', 'Compression', 'Neutral']
const controlOptions = ['none', 'force', 'strain', 'strain-rate', 'displacement']
const modeOptions = ['Idle', 'Tension', 'Compression', 'Hold', 'Ramp', 'Final']
const valueUnits: Unit[] = ['s', 'min', 'N', 'kN', 'mm', '%', 'MPa']

export function EditNodeDrawer({
  drawerId,
  nodeId,
}: {
  drawerId: string
  nodeId: string
}) {
  const node = useBuilderStore((s) => s.nodes.find((n) => n.id === nodeId))
  const updateStepData = useBuilderStore((s) => s.updateStepData)
  const closeDrawer = useBuilderStore((s) => s.closeDrawer)

  if (!node || node.data.kind === 'group') {
    return (
      <DrawerShell title="Edit Node" onClose={() => closeDrawer(drawerId)}>
        <div className="p-4 text-sm text-slate-500">Node no longer exists.</div>
      </DrawerShell>
    )
  }

  const data = node.data as StepNodeData
  const def = NODE_DEF(data.kind)

  return (
    <DrawerShell
      title={
        <span className="flex items-center gap-2">
          Edit Node: <Badge variant="accent">{def.label}</Badge>
        </span>
      }
      onClose={() => closeDrawer(drawerId)}
    >
      <ScrollArea className="h-full">
        <div className="space-y-4 p-4">
          <div>
            <Label className="text-xs text-slate-600">Node Label</Label>
            <Input
              value={data.label}
              onChange={(e) => updateStepData(nodeId, { label: e.target.value })}
              className="mt-1 h-8 text-sm"
            />
          </div>

          <Accordion
            type="multiple"
            defaultValue={['properties', 'reporting', 'endpaths']}
            className="space-y-2"
          >
            <AccordionItem
              value="properties"
              className="rounded-md border bg-white px-3"
            >
              <AccordionTrigger>Node Properties</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px] text-slate-500">Node Type</Label>
                    <Input
                      readOnly
                      value={def.label}
                      className="h-8 cursor-default text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-500">Mode</Label>
                    <Select
                      value={data.mode}
                      onValueChange={(v) => updateStepData(nodeId, { mode: v })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {modeOptions.map((m) => (
                          <SelectItem key={m} value={m} className="text-xs">
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-500">Control</Label>
                    <Select
                      value={data.control}
                      onValueChange={(v) => updateStepData(nodeId, { control: v })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {controlOptions.map((c) => (
                          <SelectItem key={c} value={c} className="text-xs">
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-500">Polarity</Label>
                    <Select
                      value={data.polarity}
                      onValueChange={(v) =>
                        updateStepData(nodeId, { polarity: v as StepNodeData['polarity'] })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {polarities.map((p) => (
                          <SelectItem key={p} value={p} className="text-xs">
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-500">Value</Label>
                    <Input
                      type="number"
                      value={data.value ?? ''}
                      onChange={(e) =>
                        updateStepData(nodeId, {
                          value: e.target.value === '' ? null : e.target.valueAsNumber,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-500">Unit</Label>
                    <Select
                      value={data.unit ?? ''}
                      onValueChange={(v) =>
                        updateStepData(nodeId, { unit: v as Unit })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        {valueUnits.map((u) => (
                          <SelectItem key={u} value={u} className="text-xs">
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="reporting"
              className="rounded-md border bg-white px-3"
            >
              <AccordionTrigger>Reporting</AccordionTrigger>
              <AccordionContent>
                <ReportingSection nodeId={nodeId} data={data} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="endpaths"
              className="rounded-md border bg-white px-3"
            >
              <AccordionTrigger>End Paths</AccordionTrigger>
              <AccordionContent>
                <EndPathsEditor nodeId={nodeId} data={data} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </DrawerShell>
  )
}

function DrawerShell({
  title,
  onClose,
  children,
}: {
  title: React.ReactNode
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full w-[380px] shrink-0 flex-col border-l bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  )
}
