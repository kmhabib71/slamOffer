'use client'

import React, { useState, useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { MindmapNode, MindmapEdge } from '@/types'

interface MindmapViewerProps {
  data: MindmapData
  onDataChange?: (data: MindmapData) => void
}

interface MindmapData {
  nodes: MindmapNode[]
  edges: MindmapEdge[]
}

interface ViewToggleProps {
  currentView: 'mindmap' | 'text'
  onViewChange: (view: 'mindmap' | 'text') => void
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1 mb-4 light-content">
      <button
        onClick={() => onViewChange('mindmap')}
        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentView === 'mindmap'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-gray-700 hover:text-gray-900'
        }`}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Mindmap View
      </button>
      <button
        onClick={() => onViewChange('text')}
        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentView === 'text'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-gray-700 hover:text-gray-900'
        }`}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Text View
      </button>
    </div>
  )
}

const CustomNode: React.FC<{ data: any }> = ({ data }) => {
  const getNodeStyle = (type: string) => {
    const baseStyle = 'px-4 py-2 rounded-lg border-2 text-center min-w-[120px] shadow-lg'

    switch (type) {
      case 'central':
        return `${baseStyle} bg-purple-100 border-purple-500 text-purple-900 font-bold`
      case 'problem':
        return `${baseStyle} bg-red-100 border-red-500 text-red-900`
      case 'outcome':
        return `${baseStyle} bg-green-100 border-green-500 text-green-900`
      case 'value':
        return `${baseStyle} bg-blue-100 border-blue-500 text-blue-900`
      case 'guarantee':
        return `${baseStyle} bg-yellow-100 border-yellow-500 text-yellow-900`
      case 'scarcity':
        return `${baseStyle} bg-orange-100 border-orange-500 text-orange-900`
      default:
        return `${baseStyle} bg-gray-100 border-gray-500 text-gray-900`
    }
  }

  return (
    <div className={getNodeStyle(data.type)}>
      <div className="font-semibold text-sm">{data.label}</div>
      {data.content && <div className="text-xs mt-1 opacity-80">{data.content}</div>}
      {data.score && <div className="text-xs mt-1 font-bold">Score: {data.score}</div>}
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

const TextView: React.FC<{ data: MindmapData }> = ({ data }) => {
  // Convert mindmap horizontal structure to vertical text structure
  const organizeDataForTextView = () => {
    const centralNode = data.nodes.find(node => node.type === 'central')
    const otherNodes = data.nodes.filter(node => node.type !== 'central')

    // Group nodes by type for better organization
    const nodesByType = otherNodes.reduce(
      (acc, node) => {
        if (!acc[node.type]) acc[node.type] = []
        acc[node.type].push(node)
        return acc
      },
      {} as Record<string, MindmapNode[]>
    )

    return { centralNode, nodesByType }
  }

  const { centralNode, nodesByType } = organizeDataForTextView()

  const getTypeTitle = (type: string) => {
    switch (type) {
      case 'problem':
        return 'Problems'
      case 'outcome':
        return 'Desired Outcomes'
      case 'value':
        return 'Value Propositions'
      case 'guarantee':
        return 'Guarantees'
      case 'scarcity':
        return 'Scarcity Elements'
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'problem':
        return 'border-l-red-500 bg-red-50'
      case 'outcome':
        return 'border-l-green-500 bg-green-50'
      case 'value':
        return 'border-l-blue-500 bg-blue-50'
      case 'guarantee':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'scarcity':
        return 'border-l-orange-500 bg-orange-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {centralNode && (
        <div className="text-center mb-8">
          <div className="inline-block p-6 bg-purple-100 border-2 border-purple-500 rounded-lg">
            <h1 className="text-2xl font-bold text-purple-900 mb-2">{centralNode.data.label}</h1>
            {centralNode.data.content && (
              <p className="text-purple-700">{centralNode.data.content}</p>
            )}
            {centralNode.data.score && (
              <div className="mt-2 text-sm font-semibold text-purple-800">
                Score: {centralNode.data.score}
              </div>
            )}
          </div>
        </div>
      )}

      {Object.entries(nodesByType).map(([type, nodes]) => (
        <div key={type} className={`border-l-4 pl-6 py-4 ${getTypeColor(type)}`}>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{getTypeTitle(type)}</h2>
          <div className="space-y-3">
            {nodes.map((node, index) => (
              <div key={node.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{node.data.label}</h3>
                    {node.data.content && (
                      <p className="text-gray-600 text-sm">{node.data.content}</p>
                    )}
                  </div>
                  {node.data.score && (
                    <div className="ml-4 text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                      {node.data.score}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export const MindmapViewer: React.FC<MindmapViewerProps> = ({ data, onDataChange }) => {
  const [currentView, setCurrentView] = useState<'mindmap' | 'text'>('mindmap')

  // Convert MindmapNode[] to ReactFlow Node[]
  const initialNodes: Node[] = useMemo(
    () =>
      data.nodes.map(node => ({
        id: node.id,
        type: 'custom',
        position: node.position,
        data: { ...node.data, type: node.type },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      })),
    [data.nodes]
  )

  // Convert MindmapEdge[] to ReactFlow Edge[]
  const initialEdges: Edge[] = useMemo(
    () =>
      data.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        animated: edge.animated,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      })),
    [data.edges]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="w-full h-full">
      <ViewToggle currentView={currentView} onViewChange={setCurrentView} />

      {currentView === 'mindmap' ? (
        <div className="w-full h-[600px] border rounded-lg overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      ) : (
        <div className="w-full">
          <TextView data={data} />
        </div>
      )}
    </div>
  )
}

export default MindmapViewer
