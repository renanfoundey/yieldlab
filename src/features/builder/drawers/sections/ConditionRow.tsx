import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBuilderStore } from '@/store/builderStore'
import type { Condition, Operand, Operator, Unit } from '@/store/types'

const operands: Operand[] = ['time', 'load', 'strain', 'displacement', 'stress']
const operators: Operator[] = ['>', '>=', '<', '<=', '==']
const units: Unit[] = ['s', 'min', 'N', 'kN', 'mm', '%', 'MPa']

export function ConditionRow({
  nodeId,
  endPathId,
  condition,
  index,
}: {
  nodeId: string
  endPathId: string
  condition: Condition
  index: number
}) {
  const updateCondition = useBuilderStore((s) => s.updateCondition)
  const removeCondition = useBuilderStore((s) => s.removeCondition)

  return (
    <div className="rounded-md border border-slate-200 bg-white p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">
          Condition {index + 1}
        </span>
        <button
          type="button"
          className="text-slate-400 hover:text-slate-700"
          onClick={() => removeCondition(nodeId, endPathId, condition.id)}
          aria-label="Remove condition"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[11px] text-slate-500">Operand</Label>
          <Select
            value={condition.operand}
            onValueChange={(v) =>
              updateCondition(nodeId, endPathId, condition.id, { operand: v as Operand })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {operands.map((o) => (
                <SelectItem key={o} value={o} className="text-xs">
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px] text-slate-500">Operator</Label>
          <Select
            value={condition.operator}
            onValueChange={(v) =>
              updateCondition(nodeId, endPathId, condition.id, { operator: v as Operator })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {operators.map((o) => (
                <SelectItem key={o} value={o} className="text-xs">
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[11px] text-slate-500">Value</Label>
          <Input
            type="number"
            className="h-8 text-xs"
            value={condition.value}
            onChange={(e) =>
              updateCondition(nodeId, endPathId, condition.id, {
                value: Number.isFinite(e.target.valueAsNumber) ? e.target.valueAsNumber : 0,
              })
            }
          />
        </div>
        <div>
          <Label className="text-[11px] text-slate-500">Unit</Label>
          <Select
            value={condition.unit}
            onValueChange={(v) =>
              updateCondition(nodeId, endPathId, condition.id, { unit: v as Unit })
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
    </div>
  )
}
