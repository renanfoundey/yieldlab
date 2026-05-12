import {
  Activity,
  Flag,
  LineChart,
  Network,
  Pause,
  Timer,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type {
  AnyNodeData,
  GroupNodeData,
  NodeKind,
  StepNodeData,
} from '@/store/types'

export type NodeTypeDef = {
  kind: NodeKind
  label: string
  description: string
  icon: LucideIcon
  /** Tailwind classes applied to the node body to tint it. */
  toneClass: string
  /** Tailwind class for icon color inside the palette + node header. */
  iconToneClass: string
  defaults: () => AnyNodeData
}

const stepDefaults = (
  partial: Partial<StepNodeData> & Pick<StepNodeData, 'kind' | 'label'>,
): StepNodeData => ({
  mode: 'Tension',
  control: 'force',
  polarity: 'Tension',
  value: 1,
  unit: 'kN',
  reporting: { type: 'dT', value: 10, unit: 's' },
  endPaths: [],
  ...partial,
})

const groupDefaults = (): GroupNodeData => ({
  kind: 'group',
  label: 'Group',
  description: '',
  loops: 6,
  incrementVariables: [],
})

export const NODE_TYPES: Record<NodeKind, NodeTypeDef> = {
  'sample-setup': {
    kind: 'sample-setup',
    label: 'Sample Setup',
    description: 'Idle hold while operator mounts specimen',
    icon: Timer,
    toneClass: 'bg-white border-slate-200',
    iconToneClass: 'text-slate-500',
    defaults: () =>
      stepDefaults({
        kind: 'sample-setup',
        label: 'Sample Setup',
        mode: 'Idle',
        control: 'none',
        polarity: 'Neutral',
        value: null,
        unit: null,
      }),
  },
  'constant-load': {
    kind: 'constant-load',
    label: 'Constant Load',
    description: 'Hold a constant force / load setpoint',
    icon: Activity,
    toneClass: 'bg-blue-50 border-blue-200',
    iconToneClass: 'text-blue-600',
    defaults: () =>
      stepDefaults({
        kind: 'constant-load',
        label: 'Constant Load',
        mode: 'Tension',
        control: 'force',
        polarity: 'Tension',
        value: 1,
        unit: 'kN',
      }),
  },
  'constant-strain': {
    kind: 'constant-strain',
    label: 'Constant Strain',
    description: 'Hold a constant strain / displacement setpoint',
    icon: Zap,
    toneClass: 'bg-blue-50 border-blue-200',
    iconToneClass: 'text-blue-600',
    defaults: () =>
      stepDefaults({
        kind: 'constant-strain',
        label: 'Constant Strain',
        mode: 'Tension',
        control: 'strain',
        polarity: 'Tension',
        value: 1,
        unit: '%',
      }),
  },
  'strain-rate': {
    kind: 'strain-rate',
    label: 'Strain Rate Ramp',
    description: 'Ramp strain at a controlled rate',
    icon: LineChart,
    toneClass: 'bg-emerald-50 border-emerald-200',
    iconToneClass: 'text-emerald-600',
    defaults: () =>
      stepDefaults({
        kind: 'strain-rate',
        label: 'Strain Rate',
        mode: 'Ramp',
        control: 'strain-rate',
        polarity: 'Tension',
        value: 0.001,
        unit: '%',
      }),
  },
  hold: {
    kind: 'hold',
    label: 'Hold',
    description: 'Pause and hold current setpoint for a duration',
    icon: Pause,
    toneClass: 'bg-white border-slate-200',
    iconToneClass: 'text-slate-500',
    defaults: () =>
      stepDefaults({
        kind: 'hold',
        label: 'Hold',
        mode: 'Hold',
        control: 'none',
        polarity: 'Neutral',
        value: 60,
        unit: 's',
      }),
  },
  end: {
    kind: 'end',
    label: 'End',
    description: 'Terminate the protocol',
    icon: Flag,
    toneClass: 'bg-white border-slate-200',
    iconToneClass: 'text-slate-500',
    defaults: () =>
      stepDefaults({
        kind: 'end',
        label: 'End',
        mode: 'Final',
        control: 'none',
        polarity: 'Neutral',
        value: null,
        unit: null,
      }),
  },
  group: {
    kind: 'group',
    label: 'Group',
    description: 'Repeat contained nodes N times',
    icon: Network,
    toneClass: 'bg-slate-50/50 border-slate-300',
    iconToneClass: 'text-slate-500',
    defaults: groupDefaults,
  },
}

export const NODE_KINDS_ORDER: NodeKind[] = [
  'sample-setup',
  'constant-load',
  'constant-strain',
  'strain-rate',
  'hold',
  'end',
  'group',
]

export function defaultDataForKind(kind: NodeKind): AnyNodeData {
  return NODE_TYPES[kind].defaults()
}

export const NODE_DEF = (kind: NodeKind) => NODE_TYPES[kind]
