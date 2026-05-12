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
import type { ReportType, StepNodeData, Unit } from '@/store/types'

const reportTypes: ReportType[] = ['dT', 'dV', 'dStrain', 'dStress', 'dLoad']
const units: Unit[] = ['s', 'min', 'N', 'kN', 'mm', '%', 'MPa']

export function ReportingSection({
  nodeId,
  data,
}: {
  nodeId: string
  data: StepNodeData
}) {
  const updateStepData = useBuilderStore((s) => s.updateStepData)
  return (
    <div className="grid grid-cols-3 gap-2">
      <div>
        <Label className="text-[11px] text-slate-500">Report Type</Label>
        <Select
          value={data.reporting.type}
          onValueChange={(v) =>
            updateStepData(nodeId, {
              reporting: { ...data.reporting, type: v as ReportType },
            })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {reportTypes.map((r) => (
              <SelectItem key={r} value={r} className="text-xs">
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-[11px] text-slate-500">Value</Label>
        <Input
          type="number"
          className="h-8 text-xs"
          value={data.reporting.value}
          onChange={(e) =>
            updateStepData(nodeId, {
              reporting: {
                ...data.reporting,
                value: Number.isFinite(e.target.valueAsNumber) ? e.target.valueAsNumber : 0,
              },
            })
          }
        />
      </div>
      <div>
        <Label className="text-[11px] text-slate-500">Unit</Label>
        <Select
          value={data.reporting.unit}
          onValueChange={(v) =>
            updateStepData(nodeId, {
              reporting: { ...data.reporting, unit: v as Unit },
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
  )
}
