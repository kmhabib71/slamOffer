'use client'

import React from 'react'
import ReactFlow, { Node, Edge, Controls, Background, BackgroundVariant } from 'reactflow'
import 'reactflow/dist/style.css'

// Step 1: Understanding the Basics
// In React Flow, we work with two main concepts:
// 1. NODES - The boxes/circles you see (like ideas in a mindmap)
// 2. EDGES - The lines that connect nodes (like relationships)

// Let's start with simple nodes
const initialNodes: Node[] = [
  {
    id: '1', // Every node needs a unique ID
    type: 'default', // React Flow has built-in node types
    position: { x: 250, y: 0 }, // Where to place the node (x, y coordinates)
    data: { label: 'Hello React Flow!' }, // The content to show
  },
  {
    id: '2',
    type: 'default',
    position: { x: 100, y: 100 },
    data: { label: 'This is Node 2' },
  },
  {
    id: '3',
    type: 'default',
    position: { x: 400, y: 100 },
    data: { label: 'This is Node 3' },
  },
]

// Now let's create edges to connect the nodes
const initialEdges: Edge[] = [
  {
    id: 'e1-2', // Each edge needs a unique ID
    source: '1', // Which node does this edge start from?
    target: '2', // Which node does this edge connect to?
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
  },
]

const codeExample = `// Step 1: Basic React Flow Setup

import ReactFlow, { Node, Edge, Controls, Background } from 'reactflow'
import 'reactflow/dist/style.css' // Important! Include the CSS

// Define your nodes (the boxes you see)
const nodes: Node[] = [
  {
    id: '1',                    // Unique identifier
    type: 'default',            // Built-in node type
    position: { x: 250, y: 0 }, // Position on canvas
    data: { label: 'Hello!' },  // Content to display
  },
  // ... more nodes
]

// Define your edges (the connecting lines)
const edges: Edge[] = [
  {
    id: 'e1-2',    // Unique identifier
    source: '1',   // Start node ID
    target: '2',   // End node ID
  },
  // ... more edges
]

// Render the flow
<ReactFlow
  nodes={nodes}
  edges={edges}
  fitView
>
  <Controls />      {/* Zoom, pan controls */}
  <Background />    {/* Dot/line background */}
</ReactFlow>`

interface Step1Props {
  showCode: boolean
}

export const Step1BasicFlow: React.FC<Step1Props> = ({ showCode }) => {
  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">🎯 What You'll Learn in Step 1</h4>
        <div className="space-y-2 text-blue-800">
          <p>
            • <strong>Nodes:</strong> The basic building blocks (boxes/circles in your mindmap)
          </p>
          <p>
            • <strong>Edges:</strong> The connections between nodes (lines that show relationships)
          </p>
          <p>
            • <strong>Position:</strong> How to place nodes at specific coordinates
          </p>
          <p>
            • <strong>Controls:</strong> Built-in zoom and pan functionality
          </p>
          <p>
            • <strong>Background:</strong> Adding a visual grid or dots to your canvas
          </p>
        </div>
      </div>

      {/* Interactive Example */}
      <div className="border-2 border-gray-300 rounded-lg">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <h5 className="font-semibold">Interactive Example - Try dragging the nodes!</h5>
        </div>
        <div style={{ height: '400px' }}>
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
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
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-yellow-900 mb-3">💡 Key Concepts to Remember</h4>
        <div className="space-y-3 text-yellow-800">
          <div>
            <strong>Node Structure:</strong>
            <code className="bg-yellow-200 px-2 py-1 rounded ml-2">
              {`{ id: 'unique', position: { x: 0, y: 0 }, data: { label: 'text' } }`}
            </code>
          </div>
          <div>
            <strong>Edge Structure:</strong>
            <code className="bg-yellow-200 px-2 py-1 rounded ml-2">
              {`{ id: 'unique', source: 'nodeId1', target: 'nodeId2' }`}
            </code>
          </div>
          <div>
            <strong>Must Include:</strong> The CSS import is crucial for proper styling!
          </div>
        </div>
      </div>
    </div>
  )
}
