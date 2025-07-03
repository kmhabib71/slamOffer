'use client'

import React, { useState, useCallback } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Eye, FileText, Edit2, Save, X, Star, Target, Zap } from 'lucide-react'

// Interface for mindmap data structure
interface SlamOfferData {
  id: string
  label: string
  level: 'grandparent' | 'child' | 'subchild'
  parentId?: string
  children?: SlamOfferData[]
  description?: string
}

// Custom Node Component for Slam Offer Mindmap
const SlamOfferNode = ({ id, data, selected }: { id: string; data: any; selected: boolean }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(data.label)

  const getNodeStyle = () => {
    const baseStyle = 'relative rounded-lg p-4 shadow-lg transition-all duration-200 min-w-[140px]'

    if (selected) {
      return `${baseStyle} ring-2 ring-blue-400 ring-opacity-50`
    }

    switch (data.level) {
      case 'grandparent':
        return `${baseStyle} bg-gradient-to-br from-purple-600 to-purple-800 text-white font-bold text-xl min-w-[200px] rounded-xl border-4 border-purple-400`
      case 'child':
        return `${baseStyle} bg-gradient-to-br from-blue-500 to-blue-700 text-white font-semibold text-lg min-w-[160px] rounded-lg border-2 border-blue-300`
      case 'subchild':
        return `${baseStyle} bg-gradient-to-br from-green-400 to-green-600 text-white font-medium min-w-[120px] rounded-md border border-green-300`
      default:
        return `${baseStyle} bg-gray-100 border border-gray-300 text-gray-700`
    }
  }

  const getIcon = () => {
    switch (data.level) {
      case 'grandparent':
        return <Star className="w-6 h-6 mr-2" />
      case 'child':
        return <Target className="w-5 h-5 mr-2" />
      case 'subchild':
        return <Zap className="w-4 h-4 mr-1" />
      default:
        return null
    }
  }

  const handleSave = () => {
    if (data.onEdit) {
      data.onEdit(id, editText)
    }
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-lg min-w-[150px]">
        <Handle type="target" position={Position.Left} className="w-2 h-2" />

        <input
          type="text"
          value={editText}
          onChange={e => setEditText(e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          autoFocus
          onKeyPress={e => e.key === 'Enter' && handleSave()}
        />

        <div className="flex justify-center space-x-2 mt-2">
          <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-100 rounded">
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsEditing(false)
              setEditText(data.label)
            }}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <Handle type="source" position={Position.Right} className="w-2 h-2" />
      </div>
    )
  }

  return (
    <div className={getNodeStyle()}>
      <Handle type="target" position={Position.Left} className="w-2 h-2" />

      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          {getIcon()}
          <span className="font-medium">{data.label}</span>
        </div>
        {data.description && <div className="text-xs opacity-75 mt-1">{data.description}</div>}
      </div>

      {(selected || data.showControls) && data.level !== 'grandparent' && (
        <div className="absolute -top-2 -right-2 flex space-x-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Right} className="w-2 h-2" />
    </div>
  )
}

const nodeTypes = {
  slamOfferNode: SlamOfferNode,
}

// Generate initial nodes and edges for the Slam Offer structure
const generateSlamOfferData = () => {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Grand parent node - "Slam Offer"
  nodes.push({
    id: 'slam-offer',
    type: 'slamOfferNode',
    position: { x: 100, y: 300 },
    data: {
      label: 'Slam Offer',
      level: 'grandparent',
      description: 'The Ultimate Irresistible Offer',
    },
  })

  // 11 Child nodes
  const childNames = [
    'Dream Outcome',
    'Problems List',
    'Solutions List',
    'Delivery Vehicles',
    'Trim & Stack',
    'Value Equation',
    'Offer Stack',
    'Scarcity & Urgency',
    'Risk Reversal',
    'Naming & Pricing',
    'Final Presentation',
  ]

  // Position child nodes vertically centered
  const childStartY = 50
  const childSpacing = 50

  childNames.forEach((name, index) => {
    const childId = `child-${index + 1}`

    nodes.push({
      id: childId,
      type: 'slamOfferNode',
      position: { x: 400, y: childStartY + index * childSpacing },
      data: {
        label: name,
        level: 'child',
        description: `Component ${index + 1}`,
      },
    })

    // Connect child to grand parent
    edges.push({
      id: `edge-slam-${childId}`,
      source: 'slam-offer',
      target: childId,
      style: { stroke: '#8b5cf6', strokeWidth: 3 },
    })

    // Generate 5 sub-children for each child node
    for (let subIndex = 0; subIndex < 5; subIndex++) {
      const subchildId = `subchild-${index + 1}-${subIndex + 1}`
      const subchildY = childStartY + index * childSpacing - 80 + subIndex * 40

      nodes.push({
        id: subchildId,
        type: 'slamOfferNode',
        position: { x: 700, y: subchildY },
        data: {
          label: `${name} Item ${subIndex + 1}`,
          level: 'subchild',
          parentId: childId,
        },
      })

      // Connect sub-child to its parent child node
      edges.push({
        id: `edge-${childId}-${subchildId}`,
        source: childId,
        target: subchildId,
        style: { stroke: '#10b981', strokeWidth: 2 },
      })
    }
  })

  return { nodes, edges }
}

// Convert flat nodes/edges to hierarchical structure for text view
const buildHierarchy = (nodes: Node[], edges: Edge[]): SlamOfferData[] => {
  const nodeMap = new Map(nodes.map(node => [node.id, { ...node.data, id: node.id, children: [] }]))

  // Build parent-child relationships
  edges.forEach(edge => {
    const parent = nodeMap.get(edge.source)
    const child = nodeMap.get(edge.target)
    if (parent && child) {
      parent.children = parent.children || []
      parent.children.push(child)
    }
  })

  // Find root node (slam-offer)
  const rootNode = nodeMap.get('slam-offer')
  return rootNode ? [rootNode] : []
}

// Text View Component
const TextView = ({
  data,
  onEdit,
}: {
  data: SlamOfferData[]
  onEdit: (id: string, newLabel: string) => void
}) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const renderNode = (node: SlamOfferData, level: number = 0) => {
    const indent = level * 30
    const isEditing = editingId === node.id

    return (
      <div key={node.id} style={{ marginLeft: `${indent}px` }} className="my-3">
        <div className="flex items-center space-x-3 group">
          <div className="flex-1 flex items-center space-x-3">
            {level === 0 && (
              <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                <Star className="w-2 h-2 text-white" />
              </div>
            )}
            {level === 1 && (
              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <Target className="w-1.5 h-1.5 text-white" />
              </div>
            )}
            {level >= 2 && (
              <div className="w-2 h-2 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
              </div>
            )}

            {isEditing ? (
              <input
                type="text"
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    onEdit(node.id, editText)
                    setEditingId(null)
                  }
                }}
                onBlur={() => setEditingId(null)}
                className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                autoFocus
              />
            ) : (
              <span
                className={`${
                  level === 0
                    ? 'font-bold text-xl text-purple-800'
                    : level === 1
                      ? 'font-semibold text-lg text-blue-700'
                      : 'font-medium text-green-700'
                }`}
              >
                {node.label}
              </span>
            )}
          </div>

          {node.level !== 'grandparent' && (
            <div className="opacity-0 group-hover:opacity-100 flex space-x-1 transition-opacity">
              <button
                onClick={() => {
                  setEditingId(node.id)
                  setEditText(node.label)
                }}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {node.description && (
          <div
            className="text-xs text-gray-600 mt-1 ml-6"
            style={{ marginLeft: `${indent + 25}px` }}
          >
            {node.description}
          </div>
        )}

        {node.children && node.children.map(child => renderNode(child, level + 1))}
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 h-full overflow-y-auto">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <Star className="w-6 h-6 text-purple-600 mr-2" />
        Grand Slam Offer Structure
      </h3>
      {data.length === 0 ? (
        <p className="text-gray-500 italic">No data to display</p>
      ) : (
        data.map(node => renderNode(node))
      )}
    </div>
  )
}

export const SlamOfferMindmap: React.FC = () => {
  const [viewMode, setViewMode] = useState<'mindmap' | 'text'>('mindmap')

  const { nodes: initialNodes, edges: initialEdges } = generateSlamOfferData()

  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onEdit: (id: string, newLabel: string) => editNode(id, newLabel),
      },
    }))
  )

  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const editNode = useCallback(
    (nodeId: string, newLabel: string) => {
      setNodes(nds =>
        nds.map(node =>
          node.id === nodeId ? { ...node, data: { ...node.data, label: newLabel } } : node
        )
      )
    },
    [setNodes]
  )

  const hierarchicalData = buildHierarchy(nodes, edges)

  return (
    <div className="space-y-6">
      {/* View Toggle Control */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setViewMode('mindmap')}
          className={`flex items-center px-6 py-3 rounded-md text-sm font-medium transition-all ${
            viewMode === 'mindmap'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Eye className="w-5 h-5 mr-2" />
          Mindmap View
        </button>
        <button
          onClick={() => setViewMode('text')}
          className={`flex items-center px-6 py-3 rounded-md text-sm font-medium transition-all ${
            viewMode === 'text'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-5 h-5 mr-2" />
          Text Structure View
        </button>
      </div>

      {/* Main Content Area */}
      <div className="border-2 border-gray-300 rounded-lg bg-white">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 border-b border-gray-300">
          <h5 className="font-bold text-lg flex items-center">
            <Star className="w-5 h-5 mr-2" />
            {viewMode === 'mindmap'
              ? 'Interactive Grand Slam Offer Mindmap'
              : 'Structured Text View'}
            <span className="ml-4 text-sm opacity-90">
              {viewMode === 'mindmap'
                ? '(1 Parent → 11 Children → 55 Sub-items)'
                : '(Hierarchical Structure)'}
            </span>
          </h5>
        </div>
        <div style={{ height: '700px' }} className="relative">
          {viewMode === 'mindmap' ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            >
              <Controls />
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            </ReactFlow>
          ) : (
            <TextView data={hierarchicalData} onEdit={editNode} />
          )}
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          Grand Slam Offer Mindmap Structure
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="font-semibold text-purple-800 mb-2">📊 Structure Overview</div>
            <ul className="space-y-1 text-purple-700">
              <li>• 1 Grand Parent Node</li>
              <li>• 11 Main Component Nodes</li>
              <li>• 55 Sub-component Items</li>
              <li>• 66 Total Connected Elements</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="font-semibold text-blue-800 mb-2">🎯 Interactive Features</div>
            <ul className="space-y-1 text-blue-700">
              <li>• Click nodes to select them</li>
              <li>• Edit node labels inline</li>
              <li>• Switch between view modes</li>
              <li>• Zoom and pan the mindmap</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="font-semibold text-green-800 mb-2">💡 Navigation Tips</div>
            <ul className="space-y-1 text-green-700">
              <li>• Use mouse wheel to zoom</li>
              <li>• Drag to pan around</li>
              <li>• Use controls for fit view</li>
              <li>• Toggle text view for editing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
