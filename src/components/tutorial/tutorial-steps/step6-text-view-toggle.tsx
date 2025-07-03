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
import { Eye, FileText, Edit2, Plus, Trash2 } from 'lucide-react'

// Step 6: Text View Toggle - The Final Feature
// Add the ability to switch between visual mindmap and text outline views

interface MindmapData {
  id: string
  label: string
  nodeType: string
  children?: MindmapData[]
  description?: string
}

const SimpleNode = ({ id, data }: { id: string; data: any }) => {
  return (
    <div className="bg-white border-2 border-blue-300 rounded-lg p-3 shadow-md min-w-[120px]">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="text-center">
        <div className="font-medium text-sm">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  )
}

const nodeTypes = {
  simpleNode: SimpleNode,
}

// Convert flat nodes/edges to hierarchical structure for text view
const buildHierarchy = (nodes: Node[], edges: Edge[]): MindmapData[] => {
  const nodeMap = new Map(nodes.map(node => [node.id, { ...node.data, id: node.id, children: [] }]))
  const roots: MindmapData[] = []

  // Build parent-child relationships
  edges.forEach(edge => {
    const parent = nodeMap.get(edge.source)
    const child = nodeMap.get(edge.target)
    if (parent && child) {
      parent.children = parent.children || []
      parent.children.push(child)
    }
  })

  // Find root nodes (nodes with no incoming edges)
  const hasParent = new Set(edges.map(e => e.target))
  nodes.forEach(node => {
    if (!hasParent.has(node.id)) {
      const nodeData = nodeMap.get(node.id)
      if (nodeData) roots.push(nodeData)
    }
  })

  return roots
}

// Text View Component
const TextView = ({
  data,
  onEdit,
  onDelete,
  onAdd,
}: {
  data: MindmapData[]
  onEdit: (id: string, newLabel: string) => void
  onDelete: (id: string) => void
  onAdd: (parentId: string) => void
}) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const renderNode = (node: MindmapData, level: number = 0) => {
    const indent = level * 20
    const isEditing = editingId === node.id

    return (
      <div key={node.id} style={{ marginLeft: `${indent}px` }} className="my-2">
        <div className="flex items-center space-x-2 group">
          <div className="flex-1 flex items-center space-x-2">
            {level === 0 && <div className="w-3 h-3 bg-purple-500 rounded-full"></div>}
            {level === 1 && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
            {level >= 2 && <div className="w-1 h-1 bg-green-500 rounded-full"></div>}

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
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                autoFocus
              />
            ) : (
              <span
                className={`${level === 0 ? 'font-bold text-lg' : level === 1 ? 'font-semibold' : 'font-normal'}`}
              >
                {node.label}
              </span>
            )}
          </div>

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
            <button
              onClick={() => onAdd(node.id)}
              className="p-1 text-green-600 hover:bg-green-100 rounded"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(node.id)}
              className="p-1 text-red-600 hover:bg-red-100 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {node.description && (
          <div className="text-xs text-gray-600 mt-1" style={{ marginLeft: `${indent + 20}px` }}>
            {node.description}
          </div>
        )}

        {node.children && node.children.map(child => renderNode(child, level + 1))}
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 h-full overflow-y-auto">
      <h3 className="text-xl font-bold mb-4">Text Outline View</h3>
      {data.length === 0 ? (
        <p className="text-gray-500 italic">No nodes to display</p>
      ) : (
        data.map(node => renderNode(node))
      )}
    </div>
  )
}

const codeExample = `// Step 6: Text View Toggle

const MindmapWithToggle = () => {
  const [viewMode, setViewMode] = useState<'mindmap' | 'text'>('mindmap')
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Convert nodes/edges to hierarchical structure for text view
  const buildHierarchy = (nodes: Node[], edges: Edge[]) => {
    const nodeMap = new Map(nodes.map(node => [
      node.id, 
      { ...node.data, id: node.id, children: [] }
    ]))
    
    // Build parent-child relationships
    edges.forEach(edge => {
      const parent = nodeMap.get(edge.source)
      const child = nodeMap.get(edge.target)
      if (parent && child) {
        parent.children = parent.children || []
        parent.children.push(child)
      }
    })
    
    // Find root nodes
    const hasParent = new Set(edges.map(e => e.target))
    return nodes
      .filter(node => !hasParent.has(node.id))
      .map(node => nodeMap.get(node.id))
      .filter(Boolean)
  }

  const hierarchicalData = buildHierarchy(nodes, edges)

  return (
    <div>
      {/* View Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setViewMode('mindmap')}
          className={\`flex items-center px-4 py-2 rounded-md \${
            viewMode === 'mindmap' ? 'bg-blue-600 text-white' : 'text-gray-600'
          }\`}
        >
          <Eye className="w-4 h-4 mr-2" />
          Mindmap View
        </button>
        <button
          onClick={() => setViewMode('text')}
          className={\`flex items-center px-4 py-2 rounded-md \${
            viewMode === 'text' ? 'bg-blue-600 text-white' : 'text-gray-600'
          }\`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Text View
        </button>
      </div>

      {/* Conditional Rendering */}
      {viewMode === 'mindmap' ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      ) : (
        <TextView
          data={hierarchicalData}
          onEdit={editNode}
          onDelete={deleteNode}
          onAdd={addNode}
        />
      )}
    </div>
  )
}`

interface Step6Props {
  showCode: boolean
}

export const Step6TextViewToggle: React.FC<Step6Props> = ({ showCode }) => {
  const [viewMode, setViewMode] = useState<'mindmap' | 'text'>('mindmap')

  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: '1',
      type: 'simpleNode',
      position: { x: 250, y: 50 },
      data: { label: 'Project Plan', nodeType: 'root' },
    },
    {
      id: '2',
      type: 'simpleNode',
      position: { x: 150, y: 150 },
      data: { label: 'Research Phase', nodeType: 'branch' },
    },
    {
      id: '3',
      type: 'simpleNode',
      position: { x: 350, y: 150 },
      data: { label: 'Development Phase', nodeType: 'branch' },
    },
    {
      id: '4',
      type: 'simpleNode',
      position: { x: 100, y: 250 },
      data: { label: 'Market Analysis', nodeType: 'leaf' },
    },
    {
      id: '5',
      type: 'simpleNode',
      position: { x: 200, y: 250 },
      data: { label: 'User Interviews', nodeType: 'leaf' },
    },
  ])

  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e1-3', source: '1', target: '3' },
    { id: 'e2-4', source: '2', target: '4' },
    { id: 'e2-5', source: '2', target: '5' },
  ])

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

  const addNode = useCallback(
    (parentId: string) => {
      const newId = `node-${Date.now()}`
      const parent = nodes.find(n => n.id === parentId)

      if (parent) {
        const newNode = {
          id: newId,
          type: 'simpleNode',
          position: { x: parent.position.x + 100, y: parent.position.y + 100 },
          data: { label: 'New Node', nodeType: 'leaf' },
        }

        setNodes(nds => [...nds, newNode])
        setEdges(eds => [...eds, { id: `e-${parentId}-${newId}`, source: parentId, target: newId }])
      }
    },
    [nodes, setNodes, setEdges]
  )

  const hierarchicalData = buildHierarchy(nodes, edges)

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-indigo-900 mb-3">
          🔄 What You'll Learn in Step 6
        </h4>
        <div className="space-y-2 text-indigo-800">
          <p>
            • <strong>View Toggle:</strong> Switch between mindmap and text outline views
          </p>
          <p>
            • <strong>Data Transformation:</strong> Convert flat graph data to hierarchical
            structure
          </p>
          <p>
            • <strong>Consistent Editing:</strong> Edit nodes in both views with synchronized data
          </p>
          <p>
            • <strong>Alternative UX:</strong> Provide different ways to interact with the same data
          </p>
          <p>
            • <strong>Complete Solution:</strong> A fully functional mindmap application
          </p>
        </div>
      </div>

      {/* View Toggle Control */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setViewMode('mindmap')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
            viewMode === 'mindmap'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Eye className="w-4 h-4 mr-2" />
          Mindmap View
        </button>
        <button
          onClick={() => setViewMode('text')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
            viewMode === 'text'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Text View
        </button>
      </div>

      {/* Main Content Area */}
      <div className="border-2 border-gray-300 rounded-lg">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <h5 className="font-semibold">
            {viewMode === 'mindmap' ? 'Visual Mindmap' : 'Text Outline'} - Toggle between views!
          </h5>
        </div>
        <div style={{ height: '500px' }} className="relative">
          {viewMode === 'mindmap' ? (
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
          ) : (
            <TextView
              data={hierarchicalData}
              onEdit={editNode}
              onDelete={deleteNode}
              onAdd={addNode}
            />
          )}
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
      <div className="bg-green-50 border border-green-300 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-green-900 mb-3">
          🎉 Congratulations! You've Built a Complete Mindmap App
        </h4>
        <div className="space-y-3 text-green-800">
          <div>
            <strong>View Modes:</strong> Provide multiple ways to interact with the same data
          </div>
          <div>
            <strong>Data Transformation:</strong> Convert between flat and hierarchical structures
          </div>
          <div>
            <strong>Synchronized Editing:</strong> Changes in one view reflect in the other
          </div>
          <div>
            <strong>Professional UX:</strong> Smooth transitions and consistent interactions
          </div>
          <div className="mt-4 p-3 bg-green-100 rounded-md">
            <strong>🚀 Next Steps:</strong> You now have all the knowledge to build sophisticated
            React Flow applications! Try combining these concepts to create your own unique
            mindmapping tools.
          </div>
        </div>
      </div>
    </div>
  )
}
