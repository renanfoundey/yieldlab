import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type EdgeTypes,
  type NodeMouseHandler,
  type NodeTypes,
  type OnNodeDrag,
  type OnNodesDelete,
  type ReactFlowInstance,
  type XYPosition,
} from '@xyflow/react'
import { Trash2 } from 'lucide-react'

import { useBuilderStore } from '@/store/builderStore'
import type { AppNode, NodeKind } from '@/store/types'
import { StepNode } from './nodes/StepNode'
import { GroupNode } from './nodes/GroupNode'
import { ConditionEdge, type ConditionEdgeType } from './edges/ConditionEdge'
import { useDerivedEdges } from './useDerivedEdges'

type ContextMenuState = { x: number; y: number; nodeId: string; isGroup: boolean }

const DND_MIME = 'application/x-yieldlab-node-kind'

const NODE_TYPES_MAP = { step: StepNode, group: GroupNode } as unknown as NodeTypes
const EDGE_TYPES_MAP = { condition: ConditionEdge } as unknown as EdgeTypes

function getNodeSize(n: AppNode): { w: number; h: number } {
  const measured = (n as AppNode & { measured?: { width?: number; height?: number } }).measured
  const style = n.style ?? {}
  const w = measured?.width ?? (typeof style.width === 'number' ? style.width : 360)
  const h = measured?.height ?? (typeof style.height === 'number' ? style.height : 220)
  return { w, h }
}

function findGroupAt(pos: XYPosition, nodes: AppNode[]): AppNode | undefined {
  // search in reverse so a group nested visually later wins
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i]
    if (n.data.kind !== 'group') continue
    const { w, h } = getNodeSize(n)
    if (
      pos.x >= n.position.x &&
      pos.x <= n.position.x + w &&
      pos.y >= n.position.y &&
      pos.y <= n.position.y + h
    ) {
      return n
    }
  }
  return undefined
}

function FlowCanvasInner() {
  const nodes = useBuilderStore((s) => s.nodes)
  const onNodesChange = useBuilderStore((s) => s.onNodesChange)
  const onEdgesChange = useBuilderStore((s) => s.onEdgesChange)
  const connect = useBuilderStore((s) => s.connect)
  const addNode = useBuilderStore((s) => s.addNode)
  const removeNode = useBuilderStore((s) => s.removeNode)
  const setNodeParent = useBuilderStore((s) => s.setNodeParent)
  const openDrawer = useBuilderStore((s) => s.openDrawer)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const rfRef = useRef<ReactFlowInstance<AppNode, ConditionEdgeType> | null>(null)
  const { screenToFlowPosition, getNode } = useReactFlow<AppNode, ConditionEdgeType>()
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

  const edges = useDerivedEdges()

  useEffect(() => {
    if (!contextMenu) return
    const onDocClick = () => setContextMenu(null)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null)
    }
    window.addEventListener('click', onDocClick)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('click', onDocClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [contextMenu])

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: AppNode) => {
      event.preventDefault()
      const rect = wrapperRef.current?.getBoundingClientRect()
      setContextMenu({
        x: event.clientX - (rect?.left ?? 0),
        y: event.clientY - (rect?.top ?? 0),
        nodeId: node.id,
        isGroup: node.data.kind === 'group',
      })
    },
    [],
  )

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const kind = event.dataTransfer.getData(DND_MIME) as NodeKind
      if (!kind) return
      const flowPos = screenToFlowPosition({ x: event.clientX, y: event.clientY })

      // Only step nodes can be parented; groups are always root.
      if (kind === 'group') {
        addNode(kind, flowPos)
        return
      }
      const group = findGroupAt(flowPos, nodes)
      if (group) {
        const rel = { x: flowPos.x - group.position.x, y: flowPos.y - group.position.y }
        addNode(kind, rel, group.id)
      } else {
        addNode(kind, flowPos)
      }
    },
    [addNode, nodes, screenToFlowPosition],
  )

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const n = node as AppNode
      openDrawer(n.data.kind === 'group' ? 'group' : 'node', n.id)
    },
    [openDrawer],
  )

  const onNodesDelete: OnNodesDelete = useCallback(
    (deleted) => {
      for (const n of deleted) removeNode(n.id)
    },
    [removeNode],
  )

  const onNodeDragStop: OnNodeDrag<AppNode> = useCallback(
    (_event, node) => {
      if (node.data.kind === 'group') return // groups cannot be nested
      const live = getNode(node.id) as AppNode | undefined
      if (!live) return
      const parent = live.parentId
        ? (getNode(live.parentId) as AppNode | undefined)
        : undefined
      const absolute: XYPosition = parent
        ? { x: live.position.x + parent.position.x, y: live.position.y + parent.position.y }
        : { x: live.position.x, y: live.position.y }

      const targetGroup = findGroupAt(absolute, nodes)

      if (targetGroup && targetGroup.id !== live.parentId) {
        const rel = {
          x: absolute.x - targetGroup.position.x,
          y: absolute.y - targetGroup.position.y,
        }
        setNodeParent(live.id, targetGroup.id, rel)
      } else if (!targetGroup && live.parentId) {
        setNodeParent(live.id, null, absolute)
      }
    },
    [getNode, nodes, setNodeParent],
  )

  const defaultEdgeOptions = useMemo(
    () => ({ type: 'condition', animated: false }),
    [],
  )

  return (
    <div ref={wrapperRef} className="h-full w-full bg-canvas" onDragOver={handleDragOver} onDrop={handleDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES_MAP}
        edgeTypes={EDGE_TYPES_MAP}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={connect}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={() => setContextMenu(null)}
        onPaneContextMenu={(e) => {
          e.preventDefault()
          setContextMenu(null)
        }}
        onNodesDelete={onNodesDelete}
        onNodeDragStop={onNodeDragStop}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={{ hideAttribution: true }}
        onInit={(instance) => {
          rfRef.current = instance
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
        <MiniMap pannable zoomable className="!bg-white !border !border-slate-200" />
        <Controls showInteractive={false} />
      </ReactFlow>

      {contextMenu && (
        <div
          className="absolute z-50 min-w-[180px] rounded-md border border-slate-200 bg-white py-1 text-sm shadow-md"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-red-600 hover:bg-red-50"
            onClick={() => {
              removeNode(contextMenu.nodeId)
              setContextMenu(null)
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete {contextMenu.isGroup ? 'group' : 'node'}
          </button>
        </div>
      )}
    </div>
  )
}

export function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  )
}

export { DND_MIME }
