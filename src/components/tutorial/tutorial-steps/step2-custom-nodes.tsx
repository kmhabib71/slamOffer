'use client'

import React from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'

// Step 2: Creating Custom Nodes
// Default nodes are boring! Let's create beautiful custom nodes for our mindmap

// Custom Node Component - This is where the magic happens!
const MindmapNode = ({ data }: { data: any }) => {
  // Different styles based on node type
  const getNodeStyle = () => {
    switch (data.type) {
      case 'main':
        return 'bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-lg px-6 py-4 rounded-full shadow-lg'
      case 'branch':
        return 'bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold px-4 py-3 rounded-lg shadow-md'
      case 'leaf':
        return 'bg-white border-2 border-gray-300 text-gray-800 px-3 py-2 rounded-md shadow-sm hover:shadow-md transition-shadow'
      default:
        return 'bg-gray-100 border border-gray-300 text-gray-700 px-3 py-2 rounded'
    }
  }

  return (
    <div className={getNodeStyle()}>
      {/* Handles are connection points - where edges attach */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-red-400" />

      <div className="text-center">
        <div className="font-semibold">{data.label}</div>
        {data.description && <div className="text-xs mt-1 opacity-75">{data.description}</div>}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-400" />
    </div>
  )
}

// Custom Icon Node - Let's add some visual flair!
const IconNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-white border-2 border-indigo-300 rounded-lg p-3 shadow-md min-w-[120px]">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />

      <div className="text-center">
        <div className="text-2xl mb-1">{data.icon}</div>
        <div className="text-sm font-medium text-gray-700">{data.label}</div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  )
}

// Register our custom node types
const nodeTypes = {
  mindmapNode: MindmapNode,
  iconNode: IconNode,
}

// Create nodes using our custom types
const customNodes: Node[] = [
  {
    id: '1',
    type: 'mindmapNode', // Use our custom type!
    position: { x: 250, y: 0 },
    data: {
      label: 'My Business Idea',
      type: 'main',
      description: 'Central concept',
    },
  },
  {
    id: '2',
    type: 'mindmapNode',
    position: { x: 100, y: 150 },
    data: {
      label: 'Target Market',
      type: 'branch',
      description: 'Who are we serving?',
    },
  },
  {
    id: '3',
    type: 'mindmapNode',
    position: { x: 400, y: 150 },
    data: {
      label: 'Revenue Streams',
      type: 'branch',
      description: 'How we make money',
    },
  },
  {
    id: '4',
    type: 'iconNode',
    position: { x: 50, y: 280 },
    data: {
      label: 'Entrepreneurs',
      icon: '👔',
    },
  },
  {
    id: '5',
    type: 'iconNode',
    position: { x: 180, y: 280 },
    data: {
      label: 'Small Business',
      icon: '🏪',
    },
  },
  {
    id: '6',
    type: 'mindmapNode',
    position: { x: 350, y: 280 },
    data: {
      label: 'Subscriptions',
      type: 'leaf',
    },
  },
  {
    id: '7',
    type: 'mindmapNode',
    position: { x: 450, y: 280 },
    data: {
      label: 'One-time Sales',
      type: 'leaf',
    },
  },
]

const customEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e1-3', source: '1', target: '3', style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e2-4', source: '2', target: '4', style: { stroke: '#6b7280' } },
  { id: 'e2-5', source: '2', target: '5', style: { stroke: '#6b7280' } },
  { id: 'e3-6', source: '3', target: '6', style: { stroke: '#6b7280' } },
  { id: 'e3-7', source: '3', target: '7', style: { stroke: '#6b7280' } },
]

const codeExample = `// Step 2: Custom Nodes

// 1. Create a Custom Node Component
const MindmapNode = ({ data }) => {
  const getNodeStyle = () => {
    switch (data.type) {
      case 'main':
        return 'bg-purple-500 text-white font-bold rounded-full px-6 py-4'
      case 'branch':
        return 'bg-green-400 text-white font-semibold rounded-lg px-4 py-3'
      default:
        return 'bg-white border border-gray-300 rounded px-3 py-2'
    }
  }

  return (
    <div className={getNodeStyle()}>
      {/* Connection Points */}
      <Handle type="target" position={Position.Top} />
      
      <div>{data.label}</div>
      {data.description && <div className="text-xs">{data.description}</div>}
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

// 2. Register Your Custom Node Types
const nodeTypes = {
  mindmapNode: MindmapNode,
  iconNode: IconNode,
}

// 3. Use Custom Types in Your Nodes
const nodes = [
  {
    id: '1',
    type: 'mindmapNode', // Your custom type!
    position: { x: 250, y: 0 },
    data: { 
      label: 'Central Idea',
      type: 'main',
      description: 'This is the main concept'
    },
  }
]

// 4. Pass nodeTypes to ReactFlow
<ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes} // Important!
  fitView
>
  <Controls />
  <Background />
</ReactFlow>`

interface Step2Props {
  showCode: boolean
}

export const Step2CustomNodes: React.FC<Step2Props> = ({ showCode }) => {
  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-green-900 mb-3">
          🎨 What You'll Learn in Step 2
        </h4>
        <div className="space-y-2 text-green-800">
          <p>
            • <strong>Custom Node Components:</strong> Create React components as nodes
          </p>
          <p>
            • <strong>Handles:</strong> Define where edges can connect to your nodes
          </p>
          <p>
            • <strong>Node Types:</strong> Register and use different custom node types
          </p>
          <p>
            • <strong>Dynamic Styling:</strong> Style nodes based on their data/type
          </p>
          <p>
            • <strong>Rich Content:</strong> Add icons, descriptions, and complex layouts
          </p>
        </div>
      </div>

      {/* Interactive Example */}
      <div className="border-2 border-gray-300 rounded-lg">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <h5 className="font-semibold">Beautiful Custom Nodes - Notice the different styles!</h5>
        </div>
        <div style={{ height: '500px' }}>
          <ReactFlow
            nodes={customNodes}
            edges={customEdges}
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
      <div className="bg-indigo-50 border border-indigo-300 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-indigo-900 mb-3">🔑 Custom Node Essentials</h4>
        <div className="space-y-3 text-indigo-800">
          <div>
            <strong>Handles:</strong> Use{' '}
            <code className="bg-indigo-200 px-2 py-1 rounded">Handle</code> components to define
            connection points
          </div>
          <div>
            <strong>Position:</strong>{' '}
            <code className="bg-indigo-200 px-2 py-1 rounded">
              Position.Top | Bottom | Left | Right
            </code>
          </div>
          <div>
            <strong>Data Access:</strong> Node data is passed via props:{' '}
            <code className="bg-indigo-200 px-2 py-1 rounded">{`{ data }`}</code>
          </div>
          <div>
            <strong>Registration:</strong> Always register custom types with{' '}
            <code className="bg-indigo-200 px-2 py-1 rounded">nodeTypes</code>
          </div>
        </div>
      </div>
    </div>
  )
}
