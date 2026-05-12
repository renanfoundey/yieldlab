import { useMemo } from 'react'
import { Plus, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import type { GroupNodeData, StepNodeData, Unit } from '@/store/types'

const units: Unit[] = ['s', 'min', 'N', 'kN', 'mm', '%', 'MPa']

export function EditGroupDrawer({
  drawerId,
  nodeId,
}: {
  drawerId: string
  nodeId: string
}) {
  const allNodes = useBuilderStore((s) => s.nodes)
  const node = useMemo(() => allNodes.find((n) => n.id === nodeId), [allNodes, nodeId])
  const containedNodes = useMemo(
    () => allNodes.filter((n) => n.parentId === nodeId),
    [allNodes, nodeId],
  )
  const updateGroupData = useBuilderStore((s) => s.updateGroupData)
  const closeDrawer = useBuilderStore((s) => s.closeDrawer)

  if (!node || node.data.kind !== 'group') {
    return (
      <Shell onClose={() => closeDrawer(drawerId)}>
        <div className="p-4 text-sm text-slate-500">Group no longer exists.</div>
      </Shell>
    )
  }
  const data = node.data as GroupNodeData

  const addVar = () =>
    updateGroupData(nodeId, {
      incrementVariables: [
        ...data.incrementVariables,
        { id: nanoid(4), name: 'voltage', deltaPerLoop: 0.1, unit: 'MPa' },
      ],
    })
  const removeVar = (id: string) =>
    updateGroupData(nodeId, {
      incrementVariables: data.incrementVariables.filter((v) => v.id !== id),
    })

  return (
    <Shell onClose={() => closeDrawer(drawerId)}>
      <ScrollArea className="h-full">
        <div className="space-y-4 p-4">
          <div>
            <div className="mb-1 text-xs text-slate-500">
              ID: <span className="font-mono text-slate-700">{nodeId}</span>
            </div>
            <Label className="text-xs text-slate-600">Group Label</Label>
            <Input
              value={data.label}
              onChange={(e) => updateGroupData(nodeId, { label: e.target.value })}
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-600">Description</Label>
            <Input
              placeholder="What does this group do?"
              value={data.description}
              onChange={(e) => updateGroupData(nodeId, { description: e.target.value })}
              className="mt-1 h-8 text-sm"
            />
          </div>

          <Accordion type="multiple" defaultValue={['props', 'vars', 'contents']} className="space-y-2">
            <AccordionItem value="props" className="rounded-md border bg-white px-3">
              <AccordionTrigger>Group Properties</AccordionTrigger>
              <AccordionContent>
                <Label className="text-[11px] text-slate-500">Number of Loops</Label>
                <Input
                  type="number"
                  min={1}
                  value={data.loops}
                  onChange={(e) =>
                    updateGroupData(nodeId, {
                      loops: Math.max(1, Number.isFinite(e.target.valueAsNumber) ? e.target.valueAsNumber : 1),
                    })
                  }
                  className="h-8 text-xs"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  How many times this group should repeat.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="vars" className="rounded-md border bg-white px-3">
              <AccordionTrigger>Increment Variables</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {data.incrementVariables.length === 0 && (
                    <div className="rounded-md border border-dashed p-3 text-center text-xs text-slate-500">
                      No increment variables configured.
                    </div>
                  )}
                  {data.incrementVariables.map((v) => (
                    <div key={v.id} className="rounded-md border bg-slate-50/50 p-2">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">{v.name}</span>
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-700"
                          onClick={() => removeVar(v.id)}
                          aria-label="Remove variable"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          value={v.name}
                          onChange={(e) =>
                            updateGroupData(nodeId, {
                              incrementVariables: data.incrementVariables.map((x) =>
                                x.id === v.id ? { ...x, name: e.target.value } : x,
                              ),
                            })
                          }
                          className="h-8 text-xs"
                        />
                        <Input
                          type="number"
                          value={v.deltaPerLoop}
                          onChange={(e) =>
                            updateGroupData(nodeId, {
                              incrementVariables: data.incrementVariables.map((x) =>
                                x.id === v.id
                                  ? { ...x, deltaPerLoop: e.target.valueAsNumber || 0 }
                                  : x,
                              ),
                            })
                          }
                          className="h-8 text-xs"
                        />
                        <Select
                          value={v.unit}
                          onValueChange={(u) =>
                            updateGroupData(nodeId, {
                              incrementVariables: data.incrementVariables.map((x) =>
                                x.id === v.id ? { ...x, unit: u as Unit } : x,
                              ),
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((u) => (
                              <SelectItem key={u} value={u} className="text-xs">
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={addVar}>
                    <Plus className="h-3.5 w-3.5" /> Add Variable
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contents" className="rounded-md border bg-white px-3">
              <AccordionTrigger>Group Contents</AccordionTrigger>
              <AccordionContent>
                {containedNodes.length === 0 && (
                  <div className="rounded-md border border-dashed p-3 text-center text-xs text-slate-500">
                    Drag nodes inside the group to nest them.
                  </div>
                )}
                <div className="space-y-1">
                  {containedNodes.map((n) => {
                    const d = n.data as StepNodeData
                    return (
                      <div
                        key={n.id}
                        className="flex items-center justify-between rounded border bg-white px-2 py-1 text-xs"
                      >
                        <span>{d.label}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {d.kind}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </Shell>
  )
}

function Shell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="flex h-full w-[380px] shrink-0 flex-col border-l bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          Edit Group: <Badge variant="accent">Group</Badge>
        </div>
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
