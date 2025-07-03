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
  addEdge,
  Connection,
  ConnectionMode,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus, Edit2, Trash2, Save, X, Lightbulb, Target, DollarSign } from 'lucide-react'

// Step 5: Full Interactive Mindmap
// Combining all previous concepts into a complete mindmap solution

const MindmapNode = ({ id, data, selected }: { id: string; data: any; selected: boolean }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(data.label)

  const getNodeStyle = () => {
    const baseStyle = 'relative rounded-lg p-3 shadow-md transition-all duration-200'

    if (selected) {
      return `${baseStyle} ring-2 ring-blue-400 ring-opacity-50`
    }

    switch (data.nodeType) {
      case 'central':
        return `${baseStyle} bg-gradient-to-br from-purple-500 to-purple-700 text-white font-bold text-lg min-w-[180px] rounded-full`
      case 'main-branch':
        return `${baseStyle} bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold min-w-[140px]`
      case 'sub-branch':
        return `${baseStyle} bg-gradient-to-br from-green-400 to-green-500 text-white min-w-[120px]`
      case 'leaf':
        return `${baseStyle} bg-white border-2 border-gray-300 text-gray-800 hover:border-gray-400 min-w-[100px]`
      default:
        return `${baseStyle} bg-gray-100 border border-gray-300 text-gray-700`
    }
  }

  const getIcon = () => {
    switch (data.category) {
      case 'idea':
        return <Lightbulb className="w-4 h-4" />
      case 'goal':
        return <Target className="w-4 h-4" />
      case 'money':
        return <DollarSign className="w-4 h-4" />
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
        <Handle type="target" position={Position.Top} className="w-2 h-2" />

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

        <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
      </div>
    )
  }

  return (
    <div className={getNodeStyle()}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />

      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          {getIcon()}
          <span
            className={`font-medium ${data.nodeType === 'central' ? 'text-lg' : 'text-sm'} ml-1`}
          >
            {data.label}
          </span>
        </div>
        {data.description && <div className="text-xs opacity-75 mt-1">{data.description}</div>}
      </div>

      {(selected || data.showControls) && (
        <div className="absolute -top-2 -right-2 flex space-x-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          {data.nodeType !== 'central' && (
            <button
              onClick={() => data.onDelete && data.onDelete(id)}
              className="p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  )
}

const nodeTypes = {
  mindmapNode: MindmapNode,
}

const getEdgeStyle = (level: number) => {
  const styles = [
    { stroke: '#7c3aed', strokeWidth: 3 }, // Central to main
    { stroke: '#2563eb', strokeWidth: 2 }, // Main to sub
    { stroke: '#059669', strokeWidth: 1 }, // Sub to leaf
  ]
  return styles[level] || { stroke: '#6b7280', strokeWidth: 1 }
}

const codeExample = `// Step 5: Complete Interactive Mindmap

const InteractiveMindmap = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesState] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState(null)

  // Add different types of nodes
  const addNode = useCallback((type: string, parentId?: string) => {
    const position = getOptimalPosition(parentId)
    const newNode = {
      id: \`node-\${Date.now()}\`,
      type: 'mindmapNode',
      position,
      data: {
        label: getDefaultLabel(type),
        nodeType: type,
        category: 'idea',
        onEdit: editNode,
        onDelete: deleteNode,
      },
    }
    
    setNodes((nds) => [...nds, newNode])
    
    // Auto-connect to parent if specified
    if (parentId) {
      const newEdge = {
        id: \`edge-\${parentId}-\${newNode.id}\`,
        source: parentId,
        target: newNode.id,
        ...getEdgeStyle(getNodeLevel(type)),
      }
      setEdges((eds) => [...eds, newEdge])
    }
  }, [setNodes, setEdges])

  // Smart positioning based on existing nodes
  const getOptimalPosition = (parentId?: string) => {
    if (!parentId) return { x: Math.random() * 400, y: Math.random() * 300 }
    
    const parent = nodes.find(n => n.id === parentId)
    if (!parent) return { x: 250, y: 150 }
    
    // Position children in a circle around parent
    const childCount = edges.filter(e => e.source === parentId).length
    const angle = (childCount * 60) * (Math.PI / 180)
    const radius = 150
    
    return {
      x: parent.position.x + Math.cos(angle) * radius,
      y: parent.position.y + Math.sin(angle) * radius,
    }
  }

  // Context menu for quick actions
  const onNodeContextMenu = (event, node) => {
    event.preventDefault()
    setContextMenu({
      show: true,
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
    })
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeContextMenu={onNodeContextMenu}
      nodeTypes={nodeTypes}
      connectionMode={ConnectionMode.Loose}
      fitView
    >
      <Controls />
      <Background variant={BackgroundVariant.Dots} />
      {contextMenu.show && <ContextMenu {...contextMenu} />}
    </ReactFlow>
  )
}`

interface Step5Props {
  showCode: boolean
}

export const Step5InteractiveMindmap: React.FC<Step5Props> = ({ showCode }) => {
  const [selectedNodeType, setSelectedNodeType] = useState('main-branch')
  const [contextMenu, setContextMenu] = useState<{
    show: boolean
    x: number
    y: number
    nodeId?: string
  }>({
    show: false,
    x: 0,
    y: 0,
  })

  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: 'central',
      type: 'mindmapNode',
      position: { x: 250, y: 150 },
      data: {
        label: 'My Business Plan',
        nodeType: 'central',
        category: 'idea',
        onEdit: (id: string, newLabel: string) => editNode(id, newLabel),
        onDelete: () => {},
      },
    },
    {
      id: 'branch1',
      type: 'mindmapNode',
      position: { x: 100, y: 50 },
      data: {
        label: 'Target Market',
        nodeType: 'main-branch',
        category: 'goal',
        onEdit: (id: string, newLabel: string) => editNode(id, newLabel),
        onDelete: (id: string) => deleteNode(id),
      },
    },
    {
      id: 'branch2',
      type: 'mindmapNode',
      position: { x: 400, y: 50 },
      data: {
        label: 'Revenue Model',
        nodeType: 'main-branch',
        category: 'money',
        onEdit: (id: string, newLabel: string) => editNode(id, newLabel),
        onDelete: (id: string) => deleteNode(id),
      },
    },
  ])

  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      id: 'e-central-branch1',
      source: 'central',
      target: 'branch1',
      ...getEdgeStyle(0),
    },
    {
      id: 'e-central-branch2',
      source: 'central',
      target: 'branch2',
      ...getEdgeStyle(0),
    },
  ])

  const getOptimalPosition = useCallback(
    (parentId?: string) => {
      if (!parentId) return { x: Math.random() * 400 + 50, y: Math.random() * 200 + 50 }

      const parent = nodes.find(n => n.id === parentId)
      if (!parent) return { x: 250, y: 150 }

      const childCount = edges.filter(e => e.source === parentId).length
      const angle = childCount * 60 * (Math.PI / 180)
      const radius = 120

      return {
        x: parent.position.x + Math.cos(angle) * radius,
        y: parent.position.y + Math.sin(angle) * radius,
      }
    },
    [nodes, edges]
  )

  const addNode = useCallback(
    (type: string, parentId?: string) => {
      const newId = `node-${Date.now()}`
      const position = getOptimalPosition(parentId)

      const labels = {
        'main-branch': 'New Branch',
        'sub-branch': 'Sub Topic',
        leaf: 'New Idea',
      }

      const newNode = {
        id: newId,
        type: 'mindmapNode',
        position,
        data: {
          label: labels[type as keyof typeof labels] || 'New Node',
          nodeType: type,
          category: 'idea',
          onEdit: (id: string, newLabel: string) => editNode(id, newLabel),
          onDelete: (id: string) => deleteNode(id),
        },
      }

      setNodes(nds => [...nds, newNode])

      if (parentId) {
        const levelMap = { 'main-branch': 0, 'sub-branch': 1, leaf: 2 }
        const newEdge = {
          id: `edge-${parentId}-${newId}`,
          source: parentId,
          target: newId,
          ...getEdgeStyle(levelMap[type as keyof typeof levelMap] || 2),
        }
        setEdges(eds => [...eds, newEdge])
      }
    },
    [setNodes, setEdges, getOptimalPosition]
  )

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

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes(nds => nds.filter(node => node.id !== nodeId))
      setEdges(eds => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId))
    },
    [setNodes, setEdges]
  )

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        ...getEdgeStyle(1),
      }
      setEdges(eds => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault()
    setContextMenu({
      show: true,
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-purple-900 mb-3">
          🧠 What You'll Learn in Step 5
        </h4>
        <div className="space-y-2 text-purple-800">
          <p>
            • <strong>Complete Integration:</strong> All previous concepts working together
          </p>
          <p>
            • <strong>Smart Positioning:</strong> Auto-position new nodes around parents
          </p>
          <p>
            • <strong>Context Menus:</strong> Right-click interactions for quick actions
          </p>
          <p>
            • <strong>Visual Hierarchy:</strong> Different styles for different node levels
          </p>
          <p>
            • <strong>Professional UX:</strong> Polished interactions and animations
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <h5 className="font-semibold mb-3">🎮 Mindmap Controls:</h5>
        <div className="flex flex-wrap gap-3 items-center mb-3">
          <span className="text-sm font-medium">Add Node Type:</span>
          <select
            value={selectedNodeType}
            onChange={e => setSelectedNodeType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="main-branch">Main Branch</option>
            <option value="sub-branch">Sub Branch</option>
            <option value="leaf">Leaf Node</option>
          </select>
          <button
            onClick={() => addNode(selectedNodeType)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Node
          </button>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            💡 <strong>Try these:</strong> Drag nodes, click to select, right-click for context menu
          </p>
          <p>🎯 Connect nodes by dragging from handles, edit by clicking the edit button</p>
        </div>
      </div>

      {/* Interactive Example */}
      <div className="border-2 border-gray-300 rounded-lg">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <h5 className="font-semibold">Full Interactive Mindmap - All features combined!</h5>
        </div>
        <div style={{ height: '600px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeContextMenu={onNodeContextMenu}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} />
          </ReactFlow>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={() => setContextMenu({ show: false, x: 0, y: 0 })}
        >
          <button
            onClick={() => {
              addNode('sub-branch', contextMenu.nodeId)
              setContextMenu({ show: false, x: 0, y: 0 })
            }}
            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
          >
            Add Child Node
          </button>
          <button
            onClick={() => {
              if (contextMenu.nodeId) deleteNode(contextMenu.nodeId)
              setContextMenu({ show: false, x: 0, y: 0 })
            }}
            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded text-red-600"
          >
            Delete Node
          </button>
        </div>
      )}

      {/* Code Display */}
      {showCode && (
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            <code>{codeExample}</code>
          </pre>
        </div>
      )}

      {/* Key Concepts */}
      <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-emerald-900 mb-3">
          🎯 Professional Mindmap Features
        </h4>
        <div className="space-y-3 text-emerald-800">
          <div>
            <strong>Smart Layout:</strong> Calculate optimal positions for new nodes relative to
            parents
          </div>
          <div>
            <strong>Context Actions:</strong> Right-click menus for quick node operations
          </div>
          <div>
            <strong>Visual Hierarchy:</strong> Different node styles and edge weights for different
            levels
          </div>
          <div>
            <strong>Cascading Updates:</strong> Changes propagate correctly throughout the tree
          </div>
        </div>
      </div>
    </div>
  )
}
