import { useMemo } from 'react'
import { MarkerType } from '@xyflow/react'
import { useBuilderStore } from '@/store/builderStore'
import type { StepNodeData } from '@/store/types'
import type { ConditionEdgeType } from './edges/ConditionEdge'

const operandLabel: Record<string, string> = {
  time: 'time',
  load: 'load',
  strain: 'strain',
  displacement: 'displ.',
  stress: 'stress',
}

export function useDerivedEdges(): ConditionEdgeType[] {
  const nodes = useBuilderStore((s) => s.nodes)
  return useMemo(() => {
    const byId = new Map(nodes.map((n) => [n.id, n] as const))
    const edges: ConditionEdgeType[] = []
    for (const node of nodes) {
      if (node.data.kind === 'group') continue
      const data = node.data as StepNodeData
      for (const ep of data.endPaths) {
        if (!ep.targetNodeId) continue
        const target = byId.get(ep.targetNodeId)
        if (!target || target.data.kind === 'group' || target.data.kind === 'sample-setup') continue
        const label = ep.conditions
          .map(
            (c) => `${operandLabel[c.operand] ?? c.operand} ${c.operator} ${c.value}${c.unit}`,
          )
          .join(' & ')
        edges.push({
          id: `${node.id}__${ep.id}`,
          source: node.id,
          target: ep.targetNodeId,
          type: 'condition',
          markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(221 83% 53%)' },
          data: { label: label || undefined },
        })
      }
    }
    return edges
  }, [nodes])
}
