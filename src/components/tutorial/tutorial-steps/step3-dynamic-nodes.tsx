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
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'

// Step 3: Dynamic Nodes - Add, Edit, Delete
// Now we'll make our mindmap truly interactive!

// Enhanced Custom Node with editing capabilities
const EditableNode = ({ id, data, selected }: { id: string; data: any; selected: boolean }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(data.label)

  const handleSave = () => {
    // We'll handle the actual save through a callback
    if (data.onEdit) {
      data.onEdit(id, editText)
    }
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (data.onDelete) {
      data.onDelete(id)
    }
  }

  const getNodeStyle = () => {
    const baseStyle = 'relative bg-white border-2 rounded-lg p-3 shadow-md min-w-[120px]'

    if (selected) {
      return `${baseStyle} border-blue-500 ring-2 ring-blue-200`
    }

    switch (data.type) {
      case 'main':
        return `${baseStyle} border-purple-400 bg-purple-50`
      case 'branch':
        return `${baseStyle} border-green-400 bg-green-50`
      default:
        return `${baseStyle} border-gray-300`
    }
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
        <div className="font-medium text-sm">{data.label}</div>
        {data.type === 'main' && <div className="text-xs text-purple-600 mt-1">Main Topic</div>}
      </div>

      {/* Edit/Delete buttons appear on hover or selection */}
      {(selected || data.showControls) && (
        <div className="absolute -top-2 -right-2 flex space-x-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  )
}

const nodeTypes = {
  editableNode: EditableNode,
}

const codeExample = `// Step 3: Dynamic Nodes with State Management

import { useNodesState, useEdgesState } from 'reactflow'

const DynamicMindmap = () => {
  // React Flow provides special hooks for managing nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  
  // Add new node
  const addNode = (type = 'branch') => {
    const newNode = {
      id: \`node-\${Date.now()}\`, // Simple unique ID
      type: 'editableNode',
      position: { 
        x: Math.random() * 400, 
        y: Math.random() * 300 
      },
      data: {
        label: 'New Idea',
        type: type,
        onEdit: editNode,
        onDelete: deleteNode,
      },
    }
    setNodes((nds) => [...nds, newNode])
  }

  // Edit existing node
  const editNode = (nodeId, newLabel) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    )
  }

  // Delete node
  const deleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ))
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange} // Handle drag, select, etc.
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
    >
      <Controls />
      <Background />
    </ReactFlow>
  )
}`

interface Step3Props {
  showCode: boolean
}

export const Step3DynamicNodes: React.FC<Step3Props> = ({ showCode }) => {
  // Initialize with React Flow's state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: '1',
      type: 'editableNode',
      position: { x: 250, y: 50 },
      data: {
        label: 'My Project',
        type: 'main',
        onEdit: (id: string, newLabel: string) => editNode(id, newLabel),
        onDelete: (id: string) => deleteNode(id),
      },
    },
    {
      id: '2',
      type: 'editableNode',
      position: { x: 100, y: 200 },
      data: {
        label: 'Feature 1',
        type: 'branch',
        onEdit: (id: string, newLabel: string) => editNode(id, newLabel),
        onDelete: (id: string) => deleteNode(id),
      },
    },
  ])

  const [edges, setEdges, onEdgesChange] = useEdgesState([{ id: 'e1-2', source: '1', target: '2' }])

  // Add a new node
  const addNode = useCallback(
    (type = 'branch') => {
      const newId = `node-${Date.now()}`
      const newNode = {
        id: newId,
        type: 'editableNode',
        position: {
          x: Math.random() * 400 + 50,
          y: Math.random() * 200 + 100,
        },
        data: {
          label: type === 'main' ? 'New Topic' : 'New Idea',
          type: type,
          onEdit: (id: string, newLabel: string) => editNode(id, newLabel),
          onDelete: (id: string) => deleteNode(id),
        },
      }
      setNodes(nds => [...nds, newNode])
    },
    [setNodes]
  )

  // Edit a node's label
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

  // Delete a node and its connected edges
  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes(nds => nds.filter(node => node.id !== nodeId))
      setEdges(eds => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId))
    },
    [setNodes, setEdges]
  )

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-orange-900 mb-3">
          ⚡ What You'll Learn in Step 3
        </h4>
        <div className="space-y-2 text-orange-800">
          <p>
            • <strong>State Management:</strong> Use <code>useNodesState</code> and{' '}
            <code>useEdgesState</code> hooks
          </p>
          <p>
            • <strong>Add Nodes:</strong> Dynamically create new nodes with unique IDs
          </p>
          <p>
            • <strong>Edit Nodes:</strong> Inline editing with save/cancel functionality
          </p>
          <p>
            • <strong>Delete Nodes:</strong> Remove nodes and their connected edges
          </p>
          <p>
            • <strong>Event Handling:</strong> Respond to user interactions
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <h5 className="font-semibold mb-3">🎮 Try These Controls:</h5>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => addNode('main')}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Main Topic
          </button>
          <button
            onClick={() => addNode('branch')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Branch
          </button>
          <div className="flex items-center text-sm text-gray-600">
            💡 Click nodes to select them, then use edit/delete buttons
          </div>
        </div>
      </div>

      {/* Interactive Example */}
      <div className="border-2 border-gray-300 rounded-lg">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <h5 className="font-semibold">Interactive Dynamic Mindmap - Add, Edit, Delete!</h5>
        </div>
        <div style={{ height: '500px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} />
          </ReactFlow>
        </div>
      </div>

      {/* Code Display */}
      {showCode && (
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            <code>{codeExample}</code>
          </pre>
        </div>
      )}

      {/* Key Concepts */}
      <div className="bg-purple-50 border border-purple-300 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-purple-900 mb-3">🧠 State Management Patterns</h4>
        <div className="space-y-3 text-purple-800">
          <div>
            <strong>useNodesState:</strong> Special hook that handles node updates, dragging,
            selection
          </div>
          <div>
            <strong>Unique IDs:</strong> Use timestamps or UUID for unique node identification
          </div>
          <div>
            <strong>Immutable Updates:</strong> Always create new arrays/objects when updating state
          </div>
          <div>
            <strong>Cascading Deletes:</strong> When deleting nodes, also remove connected edges
          </div>
          <div>
            <strong>Callback Props:</strong> Pass functions to custom nodes for handling actions
          </div>
        </div>
      </div>
    </div>
  )
}
