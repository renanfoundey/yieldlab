import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type {
  Connection,
  EdgeChange,
  NodeChange,
  XYPosition,
} from '@xyflow/react'
import { applyNodeChanges } from '@xyflow/react'

import type {
  AppNode,
  AnyNodeData,
  Condition,
  DrawerEntry,
  DrawerKind,
  EndPath,
  GroupNodeData,
  NodeKind,
  StepNodeData,
} from './types'
import { defaultDataForKind } from '@/features/builder/canvas/nodes/nodeTypes'

interface BuilderState {
  nodes: AppNode[]
  drawerStack: DrawerEntry[]
  sidebarExpanded: boolean

  setNodes: (nodes: AppNode[]) => void
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void

  addNode: (kind: NodeKind, position: XYPosition, parentId?: string) => string
  removeNode: (id: string) => void
  setNodeParent: (nodeId: string, parentId: string | null, position: XYPosition) => void
  updateNodeData: (id: string, patch: Partial<AnyNodeData>) => void
  updateStepData: (id: string, patch: Partial<StepNodeData>) => void
  updateGroupData: (id: string, patch: Partial<GroupNodeData>) => void

  connect: (conn: Connection) => void

  addEndPath: (nodeId: string) => void
  removeEndPath: (nodeId: string, endPathId: string) => void
  updateEndPath: (nodeId: string, endPathId: string, patch: Partial<EndPath>) => void
  addCondition: (nodeId: string, endPathId: string) => void
  updateCondition: (
    nodeId: string,
    endPathId: string,
    conditionId: string,
    patch: Partial<Condition>,
  ) => void
  removeCondition: (nodeId: string, endPathId: string, conditionId: string) => void

  openDrawer: (kind: DrawerKind, targetId?: string) => void
  closeDrawer: (id: string) => void
  toggleSidebar: () => void

  tourOpen: boolean
  tourSeen: boolean
  startTour: () => void
  finishTour: () => void

  reset: () => void
}

const blankCondition = (): Condition => ({
  id: nanoid(6),
  operand: 'time',
  operator: '>',
  value: 1,
  unit: 's',
})

const blankEndPath = (): EndPath => ({
  id: nanoid(6),
  targetNodeId: null,
  conditions: [blankCondition()],
})

const stepData = (over: Partial<StepNodeData> & Pick<StepNodeData, 'kind' | 'label'>): StepNodeData => ({
  mode: 'Tension',
  control: 'force',
  polarity: 'Tension',
  value: 1,
  unit: 'kN',
  reporting: { type: 'dT', value: 10, unit: 's' },
  endPaths: [],
  ...over,
})

const seedNodes = (): AppNode[] => [
  {
    id: 'n-setup',
    type: 'step',
    position: { x: 80, y: 60 },
    data: stepData({
      kind: 'sample-setup',
      label: 'Sample Setup',
      mode: 'Idle',
      control: 'none',
      polarity: 'Neutral',
      value: null,
      unit: null,
      endPaths: [
        {
          id: 'e-setup-load',
          targetNodeId: 'n-load',
          conditions: [
            { id: 'c1', operand: 'time', operator: '>=', value: 5, unit: 's' },
          ],
        },
      ],
    }),
  },
  {
    id: 'n-load',
    type: 'step',
    position: { x: 80, y: 200 },
    data: stepData({
      kind: 'constant-load',
      label: 'Pre-load',
      mode: 'Tension',
      control: 'force',
      polarity: 'Tension',
      value: 0.5,
      unit: 'kN',
      endPaths: [
        {
          id: 'e-load-hold',
          targetNodeId: 'n-hold',
          conditions: [
            { id: 'c1', operand: 'time', operator: '>', value: 60, unit: 's' },
          ],
        },
      ],
    }),
  },
  {
    id: 'n-hold',
    type: 'step',
    position: { x: 80, y: 340 },
    data: stepData({
      kind: 'hold',
      label: 'Settle',
      mode: 'Hold',
      control: 'none',
      polarity: 'Neutral',
      value: 30,
      unit: 's',
      endPaths: [
        {
          id: 'e-hold-cycle',
          targetNodeId: 'n-cycle-strain',
          conditions: [
            { id: 'c1', operand: 'time', operator: '>=', value: 30, unit: 's' },
          ],
        },
      ],
    }),
  },
  {
    id: 'n-group',
    type: 'group',
    position: { x: 420, y: 40 },
    style: { width: 360, height: 280 },
    data: {
      kind: 'group',
      label: 'Cycle',
      description: 'Repeat tension cycle',
      loops: 6,
      incrementVariables: [],
    },
  },
  {
    id: 'n-cycle-strain',
    type: 'step',
    parentId: 'n-group',
    position: { x: 20, y: 50 },
    data: stepData({
      kind: 'constant-strain',
      label: 'Apply Strain',
      mode: 'Tension',
      control: 'strain',
      polarity: 'Tension',
      value: 1,
      unit: '%',
      endPaths: [
        {
          id: 'e-strain-rate',
          targetNodeId: 'n-cycle-rate',
          conditions: [
            { id: 'c1', operand: 'strain', operator: '>=', value: 1, unit: '%' },
          ],
        },
      ],
    }),
  },
  {
    id: 'n-cycle-rate',
    type: 'step',
    parentId: 'n-group',
    position: { x: 20, y: 160 },
    data: stepData({
      kind: 'strain-rate',
      label: 'Release Rate',
      mode: 'Ramp',
      control: 'strain-rate',
      polarity: 'Compression',
      value: 0.005,
      unit: '%',
      endPaths: [
        {
          id: 'e-rate-postload',
          targetNodeId: 'n-postload',
          conditions: [
            { id: 'c1', operand: 'time', operator: '>=', value: 120, unit: 's' },
          ],
        },
      ],
    }),
  },
  {
    id: 'n-postload',
    type: 'step',
    position: { x: 420, y: 380 },
    data: stepData({
      kind: 'constant-load',
      label: 'Final Pull',
      mode: 'Tension',
      control: 'force',
      polarity: 'Tension',
      value: 5,
      unit: 'kN',
      endPaths: [
        {
          id: 'e-postload-end',
          targetNodeId: 'n-end',
          conditions: [
            { id: 'c1', operand: 'load', operator: '>=', value: 4.5, unit: 'kN' },
          ],
        },
      ],
    }),
  },
  {
    id: 'n-end',
    type: 'step',
    position: { x: 780, y: 380 },
    data: stepData({
      kind: 'end',
      label: 'End',
      mode: 'Final',
      control: 'none',
      polarity: 'Neutral',
      value: null,
      unit: null,
      endPaths: [],
    }),
  },
]

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      nodes: seedNodes(),
      drawerStack: [],
      sidebarExpanded: true,
      tourOpen: false,
      tourSeen: false,

      setNodes: (nodes) => set({ nodes }),

      onNodesChange: (changes) =>
        set({ nodes: applyNodeChanges(changes, get().nodes) as AppNode[] }),

      onEdgesChange: (changes) => {
        // edges are derived; only react to removals (cut endPath)
        const removals = changes.filter((c) => c.type === 'remove')
        if (removals.length === 0) return
        const removedIds = new Set(removals.map((r) => (r as { id: string }).id))
        set({
          nodes: get().nodes.map((n) => {
            if (n.data.kind === 'group') return n
            const data = n.data as StepNodeData
            const filtered = data.endPaths.filter((ep) => !removedIds.has(`${n.id}__${ep.id}`))
            if (filtered.length === data.endPaths.length) return n
            return { ...n, data: { ...data, endPaths: filtered } }
          }),
        })
      },

      addNode: (kind, position, parentId) => {
        const id = nanoid(6)
        const data = defaultDataForKind(kind)
        const baseNode: AppNode = {
          id,
          type: kind === 'group' ? 'group' : 'step',
          position,
          data,
          ...(kind === 'group' ? { style: { width: 360, height: 220 } } : {}),
          ...(parentId && kind !== 'group' ? { parentId } : {}),
        }
        set({ nodes: [...get().nodes, baseNode] })
        get().openDrawer(kind === 'group' ? 'group' : 'node', id)
        return id
      },

      setNodeParent: (nodeId, parentId, position) => {
        const nodes = get().nodes
        const target = nodes.find((n) => n.id === nodeId)
        if (!target) return
        const others = nodes.filter((n) => n.id !== nodeId)
        const next: AppNode = parentId
          ? { ...target, parentId, position }
          : (() => {
              const rest = { ...target } as AppNode & { parentId?: string; extent?: unknown }
              delete rest.parentId
              delete rest.extent
              return { ...rest, position } as AppNode
            })()
        // parent must precede child in array — append child to end
        set({ nodes: [...others, next] })
      },

      removeNode: (id) => {
        // Remove the node and any direct children, then clear dangling endPath targets.
        const removedIds = new Set<string>([id])
        for (const n of get().nodes) {
          if (n.parentId === id) removedIds.add(n.id)
        }
        const remaining = get()
          .nodes.filter((n) => !removedIds.has(n.id))
          .map((n) => {
            if (n.data.kind === 'group') return n
            const data = n.data as StepNodeData
            const cleaned = data.endPaths.map((ep) =>
              ep.targetNodeId && removedIds.has(ep.targetNodeId)
                ? { ...ep, targetNodeId: null }
                : ep,
            )
            return { ...n, data: { ...data, endPaths: cleaned } }
          })
        set({
          nodes: remaining,
          drawerStack: get().drawerStack.filter(
            (d) => !d.targetId || !removedIds.has(d.targetId),
          ),
        })
      },

      updateNodeData: (id, patch) =>
        set({
          nodes: get().nodes.map((n) =>
            n.id === id ? ({ ...n, data: { ...n.data, ...patch } as AnyNodeData }) : n,
          ),
        }),

      updateStepData: (id, patch) =>
        set({
          nodes: get().nodes.map((n) => {
            if (n.id !== id || n.data.kind === 'group') return n
            return { ...n, data: { ...(n.data as StepNodeData), ...patch } }
          }),
        }),

      updateGroupData: (id, patch) =>
        set({
          nodes: get().nodes.map((n) => {
            if (n.id !== id || n.data.kind !== 'group') return n
            return { ...n, data: { ...(n.data as GroupNodeData), ...patch } }
          }),
        }),

      connect: (conn) => {
        const { source, target } = conn
        if (!source || !target || source === target) return
        const targetNode = get().nodes.find((n) => n.id === target)
        if (!targetNode || targetNode.data.kind === 'group' || targetNode.data.kind === 'sample-setup') return
        set({
          nodes: get().nodes.map((n) => {
            if (n.id !== source || n.data.kind === 'group') return n
            const data = n.data as StepNodeData
            const exists = data.endPaths.some((ep) => ep.targetNodeId === target)
            if (exists) return n
            const empty = data.endPaths.find((ep) => ep.targetNodeId === null)
            const endPaths = empty
              ? data.endPaths.map((ep) =>
                  ep.id === empty.id ? { ...ep, targetNodeId: target } : ep,
                )
              : [...data.endPaths, { ...blankEndPath(), targetNodeId: target }]
            return { ...n, data: { ...data, endPaths } }
          }),
        })
      },

      addEndPath: (nodeId) =>
        set({
          nodes: get().nodes.map((n) => {
            if (n.id !== nodeId || n.data.kind === 'group') return n
            const data = n.data as StepNodeData
            return { ...n, data: { ...data, endPaths: [...data.endPaths, blankEndPath()] } }
          }),
        }),

      removeEndPath: (nodeId, endPathId) =>
        set({
          nodes: get().nodes.map((n) => {
            if (n.id !== nodeId || n.data.kind === 'group') return n
            const data = n.data as StepNodeData
            return {
              ...n,
              data: { ...data, endPaths: data.endPaths.filter((ep) => ep.id !== endPathId) },
            }
          }),
        }),

      updateEndPath: (nodeId, endPathId, patch) =>
        set({
          nodes: get().nodes.map((n) => {
            if (n.id !== nodeId || n.data.kind === 'group') return n
            const data = n.data as StepNodeData
            return {
              ...n,
              data: {
                ...data,
                endPaths: data.endPaths.map((ep) =>
                  ep.id === endPathId ? { ...ep, ...patch } : ep,
                ),
              },
            }
          }),
        }),

      addCondition: (nodeId, endPathId) =>
        set({
          nodes: get().nodes.map((n) => {
            if (n.id !== nodeId || n.data.kind === 'group') return n
            const data = n.data as StepNodeData
            return {
              ...n,
              data: {
                ...data,
                endPaths: data.endPaths.map((ep) =>
                  ep.id === endPathId
                    ? { ...ep, conditions: [...ep.conditions, blankCondition()] }
                    : ep,
                ),
              },
            }
          }),
        }),

      updateCondition: (nodeId, endPathId, conditionId, patch) =>
        set({
          nodes: get().nodes.map((n) => {
            if (n.id !== nodeId || n.data.kind === 'group') return n
            const data = n.data as StepNodeData
            return {
              ...n,
              data: {
                ...data,
                endPaths: data.endPaths.map((ep) =>
                  ep.id !== endPathId
                    ? ep
                    : {
                        ...ep,
                        conditions: ep.conditions.map((c) =>
                          c.id === conditionId ? { ...c, ...patch } : c,
                        ),
                      },
                ),
              },
            }
          }),
        }),

      removeCondition: (nodeId, endPathId, conditionId) =>
        set({
          nodes: get().nodes.map((n) => {
            if (n.id !== nodeId || n.data.kind === 'group') return n
            const data = n.data as StepNodeData
            return {
              ...n,
              data: {
                ...data,
                endPaths: data.endPaths.map((ep) =>
                  ep.id !== endPathId
                    ? ep
                    : { ...ep, conditions: ep.conditions.filter((c) => c.id !== conditionId) },
                ),
              },
            }
          }),
        }),

      openDrawer: (kind, targetId) => {
        const stack = get().drawerStack
        if (kind === 'node' || kind === 'group') {
          // Single edit drawer — replace existing node/group entry, keep others.
          const others = stack.filter((d) => d.kind !== 'node' && d.kind !== 'group')
          const existingEdit = stack.find((d) => d.kind === 'node' || d.kind === 'group')
          if (existingEdit && existingEdit.kind === kind && existingEdit.targetId === targetId) return
          set({ drawerStack: [{ id: nanoid(6), kind, targetId }, ...others] })
          return
        }
        // Toggle for tab drawers (simulation/version/protocol).
        const existing = stack.find((d) => d.kind === kind)
        if (existing) {
          set({ drawerStack: stack.filter((d) => d.id !== existing.id) })
          return
        }
        set({ drawerStack: [...stack, { id: nanoid(6), kind, targetId }] })
      },

      closeDrawer: (id) =>
        set({ drawerStack: get().drawerStack.filter((d) => d.id !== id) }),

      toggleSidebar: () => set({ sidebarExpanded: !get().sidebarExpanded }),

      startTour: () => set({ tourOpen: true }),
      finishTour: () => set({ tourOpen: false, tourSeen: true }),

      reset: () => set({ nodes: [], drawerStack: [] }),
    }),
    {
      name: 'yieldlab.builder.v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ nodes: state.nodes, tourSeen: state.tourSeen }),
    },
  ),
)

export const selectStepNode = (id: string) => (state: BuilderState) => {
  const n = state.nodes.find((n) => n.id === id)
  return n && n.data.kind !== 'group' ? (n.data as StepNodeData) : null
}

export const selectGroupNode = (id: string) => (state: BuilderState) => {
  const n = state.nodes.find((n) => n.id === id)
  return n && n.data.kind === 'group' ? (n.data as GroupNodeData) : null
}
