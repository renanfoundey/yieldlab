import { useMemo } from 'react'
import { Download } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useBuilderStore } from '@/store/builderStore'
import type { AppNode, StepNodeData } from '@/store/types'
import { DrawerShell } from './DrawerShell'

type Sample = { t: number; load: number; strain: number }

const STEP_DURATION = 300 // seconds per step
const SAMPLE_RATE = 10 // samples per step

function simulate(nodes: AppNode[]): Sample[] {
  const samples: Sample[] = []
  let t = 0
  let load = 0
  let strain = 0

  const steps = nodes.filter((n) => n.data.kind !== 'group') as Array<
    AppNode & { data: StepNodeData }
  >
  if (steps.length === 0) return [{ t: 0, load: 0, strain: 0 }]

  for (const step of steps) {
    const { data } = step
    const value = data.value ?? 0
    const polaritySign = data.polarity === 'Compression' ? -1 : 1

    let nextLoad = load
    let nextStrain = strain
    switch (data.kind) {
      case 'constant-load':
        nextLoad = polaritySign * (data.unit === 'N' ? value / 1000 : value) // normalize to kN
        break
      case 'constant-strain':
        nextStrain = polaritySign * value
        nextLoad = polaritySign * Math.min(50, Math.abs(value) * 2) // synthetic load response
        break
      case 'strain-rate':
        nextStrain = strain + polaritySign * value * STEP_DURATION
        nextLoad = polaritySign * Math.min(50, Math.abs(nextStrain) * 1.5)
        break
      case 'hold':
      case 'sample-setup':
        break
      case 'end':
        nextLoad = 0
        break
    }

    const startT = t
    for (let i = 0; i <= SAMPLE_RATE; i++) {
      const frac = i / SAMPLE_RATE
      samples.push({
        t: startT + frac * STEP_DURATION,
        load: load + (nextLoad - load) * frac,
        strain: strain + (nextStrain - strain) * frac,
      })
    }

    t = startT + STEP_DURATION
    load = nextLoad
    strain = nextStrain
  }
  return samples
}

function downloadCSV(samples: Sample[]) {
  const header = 'time_s,load_kN,strain_pct\n'
  const body = samples
    .map((s) => `${s.t.toFixed(2)},${s.load.toFixed(4)},${s.strain.toFixed(4)}`)
    .join('\n')
  const blob = new Blob([header + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `yieldlab-simulation-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function SimulationDrawer({
  drawerId,
}: {
  drawerId: string
}) {
  const nodes = useBuilderStore((s) => s.nodes)
  const closeDrawer = useBuilderStore((s) => s.closeDrawer)

  const samples = useMemo(() => simulate(nodes), [nodes])
  const summary = useMemo(() => {
    const loads = samples.map((s) => s.load)
    const strains = samples.map((s) => s.strain)
    return {
      maxLoad: Math.max(...loads, 0),
      minLoad: Math.min(...loads, 0),
      maxStrain: Math.max(...strains, 0),
      minStrain: Math.min(...strains, 0),
      totalTime: samples.length ? samples[samples.length - 1].t : 0,
    }
  }, [samples])

  return (
    <DrawerShell
      title="Simulation Results"
      onClose={() => closeDrawer(drawerId)}
      width="w-[520px]"
    >
      <ScrollArea className="h-full">
        <div className="space-y-3 p-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => downloadCSV(samples)}
            >
              <Download className="h-3.5 w-3.5" /> Download CSV
            </Button>
          </div>

          <div className="rounded-md border bg-white p-3">
            <div className="mb-2 text-sm font-semibold text-slate-800">
              Load and Strain Over Time
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={samples} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="t"
                    tick={{ fontSize: 10 }}
                    label={{ value: 'Time [s]', position: 'insideBottom', offset: -2, fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="load"
                    tick={{ fontSize: 10, fill: '#6366f1' }}
                    label={{ value: 'Load [kN]', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6366f1' }}
                  />
                  <YAxis
                    yAxisId="strain"
                    orientation="right"
                    tick={{ fontSize: 10, fill: '#10b981' }}
                    label={{ value: 'Strain [%]', angle: 90, position: 'insideRight', fontSize: 11, fill: '#10b981' }}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 11 }}
                    labelFormatter={(v) => `t = ${Number(v).toFixed(1)} s`}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    yAxisId="load"
                    type="monotone"
                    dataKey="load"
                    name="Load"
                    stroke="#6366f1"
                    dot={false}
                    strokeWidth={1.5}
                  />
                  <Line
                    yAxisId="strain"
                    type="monotone"
                    dataKey="strain"
                    name="Strain"
                    stroke="#10b981"
                    dot={false}
                    strokeWidth={1.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-md border bg-white">
            <div className="border-b px-3 py-2 text-sm font-semibold text-slate-800">
              Simulation Summary
            </div>
            <table className="w-full text-xs">
              <tbody>
                <SummaryRow label="Maximum Load" value={`${summary.maxLoad.toFixed(2)} kN`} />
                <SummaryRow label="Minimum Load" value={`${summary.minLoad.toFixed(2)} kN`} />
                <SummaryRow label="Maximum Strain" value={`${summary.maxStrain.toFixed(2)} %`} />
                <SummaryRow label="Minimum Strain" value={`${summary.minStrain.toFixed(2)} %`} />
                <SummaryRow label="Total Time" value={`${summary.totalTime.toFixed(2)} s`} />
              </tbody>
            </table>
          </div>
        </div>
      </ScrollArea>
    </DrawerShell>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b last:border-0">
      <td className="px-3 py-2 text-slate-600">{label}</td>
      <td className="px-3 py-2 text-right font-mono text-slate-800">{value}</td>
    </tr>
  )
}
