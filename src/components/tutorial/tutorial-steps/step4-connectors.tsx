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
import { Zap, Link } from 'lucide-react'

// Step 4: Smart Connectors and Edge Management
// Learn how to create, style, and manage connections between nodes

const ConnectorNode = ({ id, data, selected }: { id: string; data: any; selected: boolean }) => {
  const getNodeStyle = () => {
    const baseStyle = 'relative bg-white border-2 rounded-lg p-3 shadow-md min-w-[120px]'

    if (selected) {
      return `${baseStyle} border-blue-500 ring-2 ring-blue-200`
    }

    switch (data.type) {
      case 'hub':
        return `${baseStyle} border-purple-400 bg-purple-50`
      case 'connector':
        return `${baseStyle} border-green-400 bg-green-50`
      default:
        return `${baseStyle} border-gray-300`
    }
  }

  return (
    <div className={getNodeStyle()}>
      {/* Multiple connection points for different purposes */}
      <Handle type="target" position={Position.Top} id="top" className="w-3 h-3 bg-blue-500" />
      <Handle type="target" position={Position.Left} id="left" className="w-3 h-3 bg-green-500" />

      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          {data.type === 'hub' && <Zap className="w-4 h-4 text-purple-600 mr-1" />}
          {data.type === 'connector' && <Link className="w-4 h-4 text-green-600 mr-1" />}
          <span className="font-medium text-sm">{data.label}</span>
        </div>
        {data.description && <div className="text-xs text-gray-600">{data.description}</div>}
      </div>

      <Handle type="source" position={Position.Bottom} id="bottom" className="w-3 h-3 bg-red-500" />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-3 h-3 bg-orange-500"
      />
    </div>
  )
}

const nodeTypes = {
  connectorNode: ConnectorNode,
}

// Different edge styles for different connection types
const getEdgeStyle = (type: string) => {
  switch (type) {
    case 'strong':
      return {
        stroke: '#10b981',
        strokeWidth: 3,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      }
    case 'weak':
      return {
        stroke: '#6b7280',
        strokeWidth: 1,
        strokeDasharray: '5,5',
        markerEnd: { type: MarkerType.Arrow, color: '#6b7280' },
      }
    case 'bidirectional':
      return {
        stroke: '#3b82f6',
        strokeWidth: 2,
        markerStart: { type: MarkerType.Arrow, color: '#3b82f6' },
        markerEnd: { type: MarkerType.Arrow, color: '#3b82f6' },
      }
    default:
      return { stroke: '#94a3b8', strokeWidth: 1 }
  }
}

const codeExample = `// Step 4: Smart Connectors & Edge Management

import { addEdge, Connection, MarkerType } from 'reactflow'

const SmartConnectors = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  
  // Handle new connections between nodes
  const onConnect = useCallback((params: Connection) => {
    // Create a smart edge with custom styling
    const newEdge = {
      ...params,
      id: \`edge-\${params.source}-\${params.target}\`,
      type: 'smoothstep', // or 'straight', 'step', 'bezier'
      style: getEdgeStyle('strong'),
      markerEnd: { 
        type: MarkerType.ArrowClosed, 
        color: '#10b981' 
      }
    }
    
    setEdges((eds) => addEdge(newEdge, eds))
  }, [setEdges])

  // Different edge styles based on connection type  
  const getEdgeStyle = (type: string) => {
    switch (type) {
      case 'strong':
        return { 
          stroke: '#10b981', 
          strokeWidth: 3,
          markerEnd: { type: MarkerType.ArrowClosed }
        }
      case 'weak':
        return { 
          stroke: '#6b7280', 
          strokeWidth: 1,
          strokeDasharray: '5,5' // Dashed line
        }
      case 'bidirectional':
        return { 
          stroke: '#3b82f6',
          markerStart: { type: MarkerType.Arrow },
          markerEnd: { type: MarkerType.Arrow }
        }
    }
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect} // Handle new connections
      connectionMode={ConnectionMode.Loose} // Easier connections
      fitView
    >
      <Controls />
      <Background />
    </ReactFlow>
  )
}

// Custom Node with Multiple Connection Points
const MultiHandleNode = ({ data }) => (
  <div className="bg-white border rounded-lg p-3">
    {/* Multiple handles for different connection types */}
    <Handle type="target" position={Position.Top} id="input" />
    <Handle type="target" position={Position.Left} id="left-input" />
    
    <div>{data.label}</div>
    
    <Handle type="source" position={Position.Bottom} id="output" />
    <Handle type="source" position={Position.Right} id="right-output" />
  </div>
)`

interface Step4Props {
  showCode: boolean
}

export const Step4Connectors: React.FC<Step4Props> = ({ showCode }) => {
  const [connectionType, setConnectionType] = useState('strong')

  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: '1',
      type: 'connectorNode',
      position: { x: 250, y: 50 },
      data: {
        label: 'Central Hub',
        type: 'hub',
        description: 'Main connection point',
      },
    },
    {
      id: '2',
      type: 'connectorNode',
      position: { x: 100, y: 200 },
      data: {
        label: 'Node A',
        type: 'connector',
        description: 'Connect from multiple points',
      },
    },
    {
      id: '3',
      type: 'connectorNode',
      position: { x: 400, y: 200 },
      data: {
        label: 'Node B',
        type: 'connector',
        description: 'Smart connections',
      },
    },
    {
      id: '4',
      type: 'connectorNode',
      position: { x: 250, y: 350 },
      data: {
        label: 'Output Node',
        type: 'connector',
        description: 'Final destination',
      },
    },
  ])

  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      sourceHandle: 'bottom',
      targetHandle: 'top',
      type: 'smoothstep',
      ...getEdgeStyle('strong'),
    },
    {
      id: 'e1-3',
      source: '1',
      target: '3',
      sourceHandle: 'right',
      targetHandle: 'left',
      type: 'bezier',
      ...getEdgeStyle('bidirectional'),
    },
  ])

  // Handle new connections with smart styling
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        type: 'smoothstep',
        ...getEdgeStyle(connectionType),
      }

      setEdges(eds => addEdge(newEdge, eds))
    },
    [setEdges, connectionType]
  )

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">🔗 What You'll Learn in Step 4</h4>
        <div className="space-y-2 text-blue-800">
          <p>
            • <strong>Edge Creation:</strong> Use <code>onConnect</code> to handle new connections
          </p>
          <p>
            • <strong>Multiple Handles:</strong> Add multiple connection points per node
          </p>
          <p>
            • <strong>Edge Styling:</strong> Different visual styles for different connection types
          </p>
          <p>
            • <strong>Markers:</strong> Add arrows, dots, and other markers to edges
          </p>
          <p>
            • <strong>Connection Modes:</strong> Control how connections are made
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <h5 className="font-semibold mb-3">🎮 Connection Controls:</h5>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium">Connection Type:</span>
          <select
            value={connectionType}
            onChange={e => setConnectionType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="strong">Strong (Thick Green)</option>
            <option value="weak">Weak (Dashed Gray)</option>
            <option value="bidirectional">Bidirectional (Blue Arrows)</option>
          </select>
          <div className="text-sm text-gray-600">
            💡 Drag from colored handles to create connections
          </div>
        </div>
      </div>

      {/* Interactive Example */}
      <div className="border-2 border-gray-300 rounded-lg">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <h5 className="font-semibold">Smart Connectors - Try connecting nodes!</h5>
        </div>
        <div style={{ height: '500px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
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

      {/* Code Display */}
      {showCode && (
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            <code>{codeExample}</code>
          </pre>
        </div>
      )}

      {/* Key Concepts */}
      <div className="bg-teal-50 border border-teal-300 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-teal-900 mb-3">⚡ Connector Mastery</h4>
        <div className="space-y-3 text-teal-800">
          <div>
            <strong>Handle IDs:</strong> Use unique IDs for multiple handles:{' '}
            <code className="bg-teal-200 px-2 py-1 rounded">id="top"</code>
          </div>
          <div>
            <strong>Source/Target Handles:</strong> Specify which handles to connect:{' '}
            <code className="bg-teal-200 px-2 py-1 rounded">sourceHandle="bottom"</code>
          </div>
          <div>
            <strong>Edge Types:</strong>{' '}
            <code className="bg-teal-200 px-2 py-1 rounded">
              straight | bezier | smoothstep | step
            </code>
          </div>
          <div>
            <strong>Markers:</strong>{' '}
            <code className="bg-teal-200 px-2 py-1 rounded">
              MarkerType.Arrow | ArrowClosed | Circle
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
