import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBuilderStore } from '@/store/builderStore'
import type { StepNodeData } from '@/store/types'
import { ConditionRow } from './ConditionRow'

const NO_TARGET = '__none__'

export function EndPathsEditor({ nodeId, data }: { nodeId: string; data: StepNodeData }) {
  const nodes = useBuilderStore((s) => s.nodes)
  const addEndPath = useBuilderStore((s) => s.addEndPath)
  const removeEndPath = useBuilderStore((s) => s.removeEndPath)
  const updateEndPath = useBuilderStore((s) => s.updateEndPath)
  const addCondition = useBuilderStore((s) => s.addCondition)

  const candidates = nodes.filter(
    (n) =>
      n.id !== nodeId &&
      n.data.kind !== 'group' &&
      n.data.kind !== 'sample-setup',
  )

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full justify-center text-xs"
        onClick={() => addEndPath(nodeId)}
      >
        <Plus className="h-3.5 w-3.5" /> Add End Path
      </Button>

      {data.endPaths.map((ep, i) => (
        <div key={ep.id} className="rounded-md border bg-slate-50/50 p-2.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">End Path {i + 1}</span>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-700"
              onClick={() => removeEndPath(nodeId, ep.id)}
              aria-label="Remove end path"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <Label className="text-[11px] text-slate-500">Next Node</Label>
          <Select
            value={ep.targetNodeId ?? NO_TARGET}
            onValueChange={(v) =>
              updateEndPath(nodeId, ep.id, {
                targetNodeId: v === NO_TARGET ? null : v,
              })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select node…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_TARGET} className="text-xs italic text-slate-400">
                None
              </SelectItem>
              {candidates.map((n) => {
                const d = n.data as StepNodeData
                return (
                  <SelectItem key={n.id} value={n.id} className="text-xs">
                    {d.label}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          <div className="mt-2 flex items-center justify-between">
            <Label className="text-[11px] text-slate-500">Conditions</Label>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[11px]"
              onClick={() => addCondition(nodeId, ep.id)}
            >
              <Plus className="h-3 w-3" /> Add Condition
            </Button>
          </div>

          <div className="mt-1 space-y-2">
            {ep.conditions.map((c, ci) => (
              <ConditionRow
                key={c.id}
                nodeId={nodeId}
                endPathId={ep.id}
                condition={c}
                index={ci}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
