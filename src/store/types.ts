import type { Node } from '@xyflow/react'

export type NodeKind =
  | 'sample-setup'
  | 'constant-load'
  | 'constant-strain'
  | 'strain-rate'
  | 'hold'
  | 'end'
  | 'group'

export type Operand = 'time' | 'load' | 'strain' | 'displacement' | 'stress'
export type Operator = '>' | '>=' | '<' | '<=' | '=='
export type Unit = 's' | 'min' | 'N' | 'kN' | 'mm' | '%' | 'MPa'

export type Condition = {
  id: string
  operand: Operand
  operator: Operator
  value: number
  unit: Unit
}

export type EndPath = {
  id: string
  targetNodeId: string | null
  conditions: Condition[]
}

export type ReportType = 'dT' | 'dV' | 'dStrain' | 'dStress' | 'dLoad'

export type StepNodeData = {
  kind: Exclude<NodeKind, 'group'>
  label: string
  mode: string
  control: string
  polarity: 'Tension' | 'Compression' | 'Neutral'
  value: number | null
  unit: Unit | null
  reporting: { type: ReportType; value: number; unit: Unit }
  endPaths: EndPath[]
}

export type GroupNodeData = {
  kind: 'group'
  label: string
  description: string
  loops: number
  incrementVariables: { id: string; name: string; deltaPerLoop: number; unit: Unit }[]
}

export type AnyNodeData = StepNodeData | GroupNodeData

export type AppNode = Node<AnyNodeData>

export type DrawerKind = 'node' | 'group' | 'protocol' | 'simulation' | 'version'

export type DrawerEntry = {
  id: string
  kind: DrawerKind
  targetId?: string
}
