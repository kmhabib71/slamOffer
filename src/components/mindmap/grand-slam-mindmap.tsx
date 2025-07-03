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
import { GrandSlamOfferData, GrandSlamComponent, MindmapItem } from '@/types'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { PDFExportButton } from '@/components/pdf/pdf-export-button'

interface GrandSlamMindmapProps {
  data: GrandSlamOfferData
  onDataChange?: (data: GrandSlamOfferData) => void
}

interface ViewToggleProps {
  currentView: 'mindmap' | 'text'
  onViewChange: (view: 'mindmap' | 'text') => void
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
      <button
        onClick={() => onViewChange('mindmap')}
        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentView === 'mindmap'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
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
            : 'text-gray-600 hover:text-gray-900'
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

const CustomNode: React.FC<{
  data: any
  onEdit?: (id: string, title: string, content: string) => void
  onDelete?: (id: string) => void
}> = ({ data, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(data.label)
  const [editContent, setEditContent] = useState(data.content || '')

  const getNodeStyle = (type: string) => {
    const baseStyle = 'relative px-4 py-3 rounded-lg border-2 text-center min-w-[140px] shadow-lg'

    switch (type) {
      case 'parent':
        return `${baseStyle} bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500 text-white font-bold text-lg min-w-[200px]`
      case 'component':
        return `${baseStyle} bg-gradient-to-br from-blue-100 to-blue-200 border-blue-500 text-blue-900 font-semibold min-w-[180px]`
      case 'item':
        return `${baseStyle} bg-white border-gray-300 text-gray-800 hover:border-gray-400 transition-colors`
      default:
        return `${baseStyle} bg-gray-100 border-gray-500 text-gray-900`
    }
  }

  const handleSave = () => {
    if (onEdit && data.isEditable) {
      onEdit(data.id, editTitle, editContent)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(data.label)
    setEditContent(data.content || '')
    setIsEditing(false)
  }

  if (isEditing && data.isEditable) {
    return (
      <div className="bg-white border-2 border-blue-500 rounded-lg p-4 min-w-[200px] shadow-lg">
        <input
          type="text"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className="w-full mb-2 px-2 py-1 border border-gray-300 rounded text-sm font-medium"
          placeholder="Title"
        />
        <textarea
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          className="w-full mb-2 px-2 py-1 border border-gray-300 rounded text-xs resize-none"
          rows={3}
          placeholder="Content"
        />
        <div className="flex justify-end space-x-1">
          <button
            onClick={handleSave}
            className="p-1 text-green-600 hover:text-green-800 transition-colors"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={getNodeStyle(data.type)}>
      <div className="font-semibold text-sm">{data.label}</div>
      {data.content && <div className="text-xs mt-1 opacity-80">{data.content}</div>}

      {data.isEditable && (
        <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-blue-600 hover:text-blue-800 bg-white rounded shadow-sm transition-colors"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete && onDelete(data.id)}
            className="p-1 text-red-600 hover:text-red-800 bg-white rounded shadow-sm transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

const TextView: React.FC<{
  data: GrandSlamOfferData
  onEdit: (componentId: string, itemId: string, title: string, content: string) => void
  onDelete: (componentId: string, itemId: string) => void
  onAdd: (componentId: string) => void
}> = ({ data, onEdit, onDelete, onAdd }) => {
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  const handleStartEdit = (item: MindmapItem) => {
    setEditingItem(item.id)
    setEditTitle(item.title)
    setEditContent(item.content)
  }

  const handleSaveEdit = (componentId: string, itemId: string) => {
    onEdit(componentId, itemId, editTitle, editContent)
    setEditingItem(null)
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditTitle('')
    setEditContent('')
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Grand Slam Offer Header */}
      <div className="text-center mb-12">
        <div className="inline-block p-8 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl shadow-xl">
          <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
          <p className="text-purple-100">Complete Framework with 11 Components</p>
        </div>
      </div>

      {/* Components */}
      {data.components.map(component => (
        <div
          key={component.id}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className={`p-6 bg-gradient-to-r ${component.color} text-white`}>
            <h2 className="text-xl font-bold mb-2">{component.title}</h2>
            <p className="text-white/90 text-sm">{component.description}</p>
          </div>

          <div className="p-6">
            <div className="grid gap-4">
              {component.items.map(item => (
                <div
                  key={item.id}
                  className="group border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  {editingItem === item.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-medium"
                        placeholder="Item title"
                      />
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                        rows={3}
                        placeholder="Item content"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleSaveEdit(component.id, item.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                        {item.content && <p className="text-gray-600 text-sm">{item.content}</p>}
                      </div>
                      {item.isEditable && (
                        <div className="ml-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(component.id, item.id)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Add New Item Button */}
              <button
                onClick={() => onAdd(component.id)}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add New Item</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const GrandSlamMindmap: React.FC<GrandSlamMindmapProps> = ({ data, onDataChange }) => {
  const [currentView, setCurrentView] = useState<'mindmap' | 'text'>('mindmap')
  const [localData, setLocalData] = useState<GrandSlamOfferData>(data)

  // Generate nodes and edges for ReactFlow (hierarchical left-to-right layout with proper spacing)
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []

    // Parent node (Grand Slam Offer) - positioned on the left
    nodes.push({
      id: 'parent',
      type: 'custom',
      position: { x: 50, y: 400 }, // Left side, vertically centered
      data: {
        id: 'parent',
        label: localData.title,
        content: '',
        type: 'parent',
        isEditable: false,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      draggable: true, // Allow dragging
    })

    // Component nodes (11 components in vertical list in the middle)
    const componentStartY = 50
    const componentSpacing = 80 // Increased spacing between components
    const componentX = 400 // X position for all components (middle) - increased gap

    localData.components.forEach((component, index) => {
      const componentY = componentStartY + index * componentSpacing

      nodes.push({
        id: component.id,
        type: 'custom',
        position: { x: componentX, y: componentY },
        data: {
          id: component.id,
          label: component.title,
          content: component.description,
          type: 'component',
          isEditable: false,
          color: component.color,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        draggable: true, // Allow dragging
      })

      // Edge from parent to component (dotted line with better styling)
      edges.push({
        id: `parent-${component.id}`,
        source: 'parent',
        target: component.id,
        type: 'smoothstep', // Changed to smoothstep for better curves
        animated: false,
        style: {
          strokeDasharray: '8,4',
          stroke: '#6366f1',
          strokeWidth: 2,
          opacity: 0.8,
        },
      })

      // Item nodes for each component positioned on the right
      const itemStartX = 800 // X position for items (right side) - increased gap
      const itemSpacing = 50 // Increased spacing between items
      const maxVisibleItems = 3 // Reduced to 3 for better spacing

      const visibleItems = component.items.slice(0, maxVisibleItems)
      visibleItems.forEach((item, itemIndex) => {
        const itemY = componentY + (itemIndex - (visibleItems.length - 1) / 2) * itemSpacing

        nodes.push({
          id: item.id,
          type: 'custom',
          position: { x: itemStartX, y: itemY },
          data: {
            id: item.id,
            label: item.title,
            content:
              item.content.length > 30 ? item.content.substring(0, 30) + '...' : item.content,
            type: 'item',
            isEditable: item.isEditable,
            componentId: component.id,
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          draggable: true, // Allow dragging
        })

        // Edge from component to item (dotted line with better styling)
        edges.push({
          id: `${component.id}-${item.id}`,
          source: component.id,
          target: item.id,
          type: 'smoothstep', // Changed to smoothstep for better curves
          animated: false,
          style: {
            strokeDasharray: '6,3',
            stroke: '#94a3b8',
            strokeWidth: 1.5,
            opacity: 0.7,
          },
        })
      })

      // Add a "..." node if there are more items
      if (component.items.length > maxVisibleItems) {
        const moreY = componentY + (maxVisibleItems - (visibleItems.length - 1) / 2) * itemSpacing

        nodes.push({
          id: `${component.id}-more`,
          type: 'custom',
          position: { x: itemStartX, y: moreY },
          data: {
            id: `${component.id}-more`,
            label: `+${component.items.length - maxVisibleItems} more`,
            content: 'Switch to text view to see all',
            type: 'item',
            isEditable: false,
            componentId: component.id,
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          draggable: false, // Keep "more" nodes fixed
        })

        edges.push({
          id: `${component.id}-more-edge`,
          source: component.id,
          target: `${component.id}-more`,
          type: 'smoothstep',
          animated: false,
          style: {
            strokeDasharray: '4,2',
            stroke: '#d1d5db',
            strokeWidth: 1,
            opacity: 0.5,
          },
        })
      }
    })

    return { nodes, edges }
  }, [localData])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  // Handle node drag end to save positions
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    // Optional: Save node position to local storage or backend
    console.log(`Node ${node.id} moved to position:`, node.position)
  }, [])

  const handleEditItem = (componentId: string, itemId: string, title: string, content: string) => {
    const updatedData = {
      ...localData,
      components: localData.components.map(comp =>
        comp.id === componentId
          ? {
              ...comp,
              items: comp.items.map(item =>
                item.id === itemId ? { ...item, title, content } : item
              ),
            }
          : comp
      ),
    }
    setLocalData(updatedData)
    onDataChange?.(updatedData)
  }

  const handleDeleteItem = (componentId: string, itemId: string) => {
    const updatedData = {
      ...localData,
      components: localData.components.map(comp =>
        comp.id === componentId
          ? {
              ...comp,
              items: comp.items.filter(item => item.id !== itemId),
            }
          : comp
      ),
    }
    setLocalData(updatedData)
    onDataChange?.(updatedData)
  }

  const handleAddItem = (componentId: string) => {
    const newItem: MindmapItem = {
      id: `item-${Date.now()}`,
      title: 'New Item',
      content: 'Add your content here',
      isEditable: true,
      order: Date.now(),
    }

    const updatedData = {
      ...localData,
      components: localData.components.map(comp =>
        comp.id === componentId
          ? {
              ...comp,
              items: [...comp.items, newItem],
            }
          : comp
      ),
    }
    setLocalData(updatedData)
    onDataChange?.(updatedData)
  }

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
        <PDFExportButton
          data={localData}
          defaultUserInfo={{
            businessName: 'Your Business Name',
            ownerName: 'Your Name',
          }}
          className="ml-4"
        />
      </div>

      {currentView === 'mindmap' ? (
        <div className="w-full h-[950px] border rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={1.5}
            snapToGrid={true}
            snapGrid={[15, 15]}
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          </ReactFlow>
        </div>
      ) : (
        <div className="w-full max-h-[700px] overflow-y-auto">
          <TextView
            data={localData}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onAdd={handleAddItem}
          />
        </div>
      )}
    </div>
  )
}

export default GrandSlamMindmap
