'use client'

import React, { useState, useCallback, useEffect } from 'react'
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
  ConnectionLineType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  Edit2,
  Save,
  X,
  Star,
  Target,
  AlertTriangle,
  Lightbulb,
  Rocket,
  Layers,
  Package,
  Clock,
  Shield,
  Sparkles,
  Zap,
  Crown,
  ArrowRight,
} from 'lucide-react'
import { PDFExportButton } from '@/components/pdf/pdf-export-button'
import { PurchaseModal } from '@/components/dashboard/purchase-modal'
import { GrandSlamOfferData, GrandSlamComponent, MindmapItem } from '@/types'
import { useAuth } from '@/app/providers/auth-provider'
// ObjectId is now defined as a string type in types/index.ts

// Interface for mindmap data structure
interface SlamOfferData {
  id: string
  label: string
  level: 'grandparent' | 'child' | 'subchild'
  parentId?: string
  children?: SlamOfferData[]
  description?: string
  subChildrenCount?: number
  isExpanded?: boolean
  onToggle?: (id: string) => void
}

// Custom Node Component for Slam Offer Mindmap
const SlamOfferNode = ({ id, data, selected }: { id: string; data: any; selected: boolean }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(data.label)

  const getNodeStyle = () => {
    const baseStyle = 'relative rounded-xl shadow-lg border-2'

    switch (data.level) {
      case 'grandparent':
        const grandparentStyle = `${baseStyle} bg-gradient-to-br from-purple-600 to-purple-800 text-white font-bold text-xl border-purple-300 shadow-2xl`
        return selected
          ? `${grandparentStyle} ring-2 ring-blue-400 ring-opacity-50 shadow-xl`
          : grandparentStyle
      case 'child':
        const childStyle = `${baseStyle} ${getChildNodeColor(data.componentId)} text-white font-semibold text-xl cursor-pointer hover:shadow-xl`
        return selected
          ? `${childStyle} ring-2 ring-blue-400 ring-opacity-50 shadow-xl`
          : childStyle
      case 'subchild':
        if (data.isUnlockNode) {
          const unlockStyle = `${baseStyle} bg-gradient-to-br ${getChildNodeColor(data.parentComponentId)} text-white font-medium text-sm hover:shadow-xl cursor-pointer border-white/30 ${
            data.isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`
          return selected
            ? `${unlockStyle} ring-2 ring-blue-400 ring-opacity-50 shadow-xl`
            : unlockStyle
        } else {
          const subchildStyle = `${baseStyle} bg-white border-slate-200 text-slate-700 font-medium text-sm hover:shadow-lg hover:border-slate-300 ${
            data.isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`
          return selected
            ? `${subchildStyle} ring-2 ring-blue-400 ring-opacity-50 shadow-xl`
            : subchildStyle
        }
      default:
        const defaultStyle = `${baseStyle} bg-white border-gray-300 text-gray-700`
        return selected
          ? `${defaultStyle} ring-2 ring-blue-400 ring-opacity-50 shadow-xl`
          : defaultStyle
    }
  }

  const getChildNodeColor = (componentId: number) => {
    const colorMap: Record<number, string> = {
      1: 'bg-gradient-to-br from-pink-500 to-rose-600 border-pink-400',
      2: 'bg-gradient-to-br from-orange-500 to-red-600 border-orange-400',
      3: 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-400',
      4: 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-400',
      5: 'bg-gradient-to-br from-amber-500 to-yellow-600 border-amber-400',
      6: 'bg-gradient-to-br from-purple-500 to-violet-600 border-purple-400',
      7: 'bg-gradient-to-br from-red-500 to-rose-600 border-red-400',
      8: 'bg-gradient-to-br from-sky-500 to-blue-600 border-sky-400',
      9: 'bg-gradient-to-br from-violet-500 to-purple-600 border-violet-400',
      10: 'bg-gradient-to-br from-teal-500 to-emerald-600 border-teal-400',
      11: 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400',
    }
    return colorMap[componentId] || 'bg-gradient-to-br from-slate-500 to-gray-600 border-slate-400'
  }

  const getIcon = () => {
    switch (data.level) {
      case 'grandparent':
        return <Star className="w-7 h-7 mr-3" />
      case 'child':
        console.log('data.componentId', data.componentId)
        // Ensure componentId is a number, not undefined
        const componentId = typeof data.componentId === 'number' ? data.componentId : 1
        return getChildIcon(componentId)
      case 'subchild':
        if (data.isUnlockNode) {
          return <Crown className="w-4 h-4 mr-2" />
        } else {
          return <div className="w-2 h-2 bg-slate-400 rounded-full mr-2" />
        }
      default:
        return null
    }
  }

  const getChildIcon = (componentId: number) => {
    console.log(`getChildIcon called with componentId: ${componentId}`)
    const iconMap: Record<number, React.JSX.Element> = {
      1: <Target className="w-5 h-5 mr-2" />,
      2: <AlertTriangle className="w-5 h-5 mr-2" />,
      3: <Lightbulb className="w-5 h-5 mr-2" />,
      4: <Rocket className="w-5 h-5 mr-2" />,
      5: <Layers className="w-5 h-5 mr-2" />,
      6: <Package className="w-5 h-5 mr-2" />,
      7: <Clock className="w-5 h-5 mr-2" />,
      8: <Zap className="w-5 h-5 mr-2" />,
      9: <Star className="w-5 h-5 mr-2" />,
      10: <Shield className="w-5 h-5 mr-2" />,
      11: <Sparkles className="w-5 h-5 mr-2" />,
    }
    const selectedIcon = iconMap[componentId] || <Target className="w-5 h-5 mr-2" />
    console.log(`Returning icon for componentId ${componentId}:`, selectedIcon)
    return selectedIcon
  }

  const handleSave = () => {
    if (data.onEdit) {
      data.onEdit(id, editText)
    }
    setIsEditing(false)
  }

  const handleNodeClick = () => {
    if (data.level === 'child' && data.onToggle) {
      data.onToggle(id)
    } else if (data.level === 'subchild' && data.isUnlockNode && data.onUnlockClick) {
      data.onUnlockClick()
    }
  }

  // Dynamic width calculation for subchild nodes based on content
  const getFixedDimensions = () => {
    switch (data.level) {
      case 'grandparent':
        return 'w-[260px] h-[100px] p-6'
      case 'child':
        return 'w-[320px] h-[70px] p-4' // Increased width to accommodate item count
      case 'subchild':
        if (data.isUnlockNode) {
          return 'w-[380px] h-[70px] p-3 m-4'
        } else {
          // Calculate width based on content length - use predefined Tailwind classes
          const contentLength = data.description?.length || data.label?.length || 0
          if (contentLength > 80) {
            return 'w-[400px] h-[80px] p-3'
          } else if (contentLength > 60) {
            return 'w-[360px] h-[80px] p-3'
          } else if (contentLength > 40) {
            return 'w-[320px] h-[80px] p-3'
          } else {
            return 'w-[280px] h-[80px] p-3'
          }
        }
      default:
        return 'w-[160px] h-[60px] p-4'
    }
  }

  if (isEditing) {
    return (
      <div
        className={`bg-white border-2 border-blue-500 rounded-lg shadow-lg ${getFixedDimensions()}`}
      >
        <Handle type="target" position={Position.Left} className="w-2 h-2" />

        <div className="flex flex-col h-full">
          <input
            type="text"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-800 bg-white focus:outline-none focus:border-blue-500"
            autoFocus
            onKeyPress={e => e.key === 'Enter' && handleSave()}
          />

          <div className="flex justify-center space-x-2 mt-2">
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false)
                setEditText(data.label)
              }}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <Handle type="source" position={Position.Right} className="w-2 h-2" />
      </div>
    )
  }

  return (
    <div className={`${getNodeStyle()} ${getFixedDimensions()}`} onClick={handleNodeClick}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 border-2 border-white" />

      <div className="flex flex-col justify-center h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            {getIcon()}
            <span
              className={`font-medium ${
                data.level === 'subchild'
                  ? 'text-xs leading-tight'
                  : data.level === 'child'
                    ? 'text-base'
                    : 'text-sm'
              } ${data.level === 'subchild' ? 'break-words overflow-hidden' : data.level === 'child' ? 'whitespace-nowrap' : 'overflow-hidden text-ellipsis'}`}
            >
              {data.level === 'subchild' && data.description ? data.description : data.label}
            </span>
          </div>
          {/* Circular count badge for child nodes */}
          {data.level === 'child' && data.subChildrenCount && (
            <div className="w-6 h-6 bg-white bg-opacity-30 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ml-2">
              {data.subChildrenCount}
            </div>
          )}
          {/* Unlock button for unlock nodes */}
          {data.level === 'subchild' && data.isUnlockNode && (
            <ArrowRight className="w-4 h-4 ml-2 flex-shrink-0" />
          )}
        </div>

        {data.description && data.level === 'grandparent' && (
          <div className="text-xs opacity-90 mt-1 font-normal">{data.description}</div>
        )}
      </div>

      {/* Only show edit button for sub-children */}
      {(selected || data.showControls) &&
        data.level === 'subchild' &&
        data.isVisible &&
        !data.isUnlockNode && (
          <div className="absolute -top-2 -right-2 flex space-x-1">
            <button
              onClick={e => {
                e.stopPropagation()
                setIsEditing(true)
              }}
              className="p-1.5 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        )}

      <Handle type="source" position={Position.Right} className="w-3 h-3 border-2 border-white" />
    </div>
  )
}

const nodeTypes = {
  slamOfferNode: SlamOfferNode,
}

// Generate nodes from provided offer data
function generateNodesFromOfferData(offerData: GrandSlamOfferData): {
  nodes: Node[]
  edges: Edge[]
} {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Create central node
  nodes.push({
    id: 'slam-offer',
    type: 'slamOfferNode',
    position: { x: 100, y: 400 },
    data: {
      label: 'Grand Slam Offer',
      level: 'grandparent',
      description: 'Your complete Grand Slam Offer structure',
    },
  })

  // Create child nodes for each component
  offerData.components.forEach((component, index) => {
    const childId = `child-${index + 1}`
    const childSpacing = 100
    const childStartY = 50
    const childY = childStartY + index * childSpacing

    nodes.push({
      id: childId,
      type: 'slamOfferNode',
      position: { x: 520, y: childY },
      data: {
        label: component.title,
        level: 'child',
        description: component.description,
        isExpanded: false,
        subChildrenCount: component.items.length,
        componentId: typeof component.id === 'string' ? parseInt(component.id) : component.id,
      },
    })

    // Connect to central node
    edges.push({
      id: `edge-slam-${childId}`,
      source: 'slam-offer',
      target: childId,
      type: 'smoothstep',
      style: {
        stroke: '#8b5cf6',
        strokeWidth: 3,
      },
      animated: false,
    })

    // Create subchild nodes for items
    const subChildSpacing = 70
    const subChildGroupHeight = (component.items.length - 1) * subChildSpacing
    const subChildrenStartY = childY - subChildGroupHeight / 2

    component.items.forEach((item, itemIndex) => {
      const subchildId = `subchild-${index + 1}-${itemIndex + 1}`
      const subchildY = subChildrenStartY + itemIndex * subChildSpacing

      nodes.push({
        id: subchildId,
        type: 'slamOfferNode',
        position: { x: 920, y: subchildY },
        data: {
          label: item.title,
          level: 'subchild',
          parentId: childId,
          isVisible: false,
          description: item.content,
        },
      })

      // Connect to parent child node
      edges.push({
        id: `edge-${childId}-${subchildId}`,
        source: childId,
        target: subchildId,
        type: 'smoothstep',
        style: {
          stroke: '#8b5cf6',
          strokeWidth: 3,
          strokeOpacity: 0,
        },
        animated: false,
      })
    })
  })

  return { nodes, edges }
}

// Generate ALL nodes and edges at once - no more dynamic creation/removal
const generateAllSlamOfferData = () => {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Grand parent node - "Grand Slam Offer" (fixed text)
  nodes.push({
    id: 'slam-offer',
    type: 'slamOfferNode',
    position: { x: 100, y: 400 },
    data: {
      label: 'Grand Slam Offer',
      level: 'grandparent',
    },
  })

  // 11 Child nodes with real Grand Slam Offer component names
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

  // Increased spacing for better visual separation
  const childSpacing = 100 // Increased from 90 to 100
  const childStartY = 50 // Starting Y position for first child

  // Sub-children configuration with increased spacing
  const subChildrenPerParent = 3 // Show 3 real items + 1 unlock node for free users
  const subChildSpacing = 70 // Increased from 60 to 70
  const subChildGroupHeight = (subChildrenPerParent - 1) * subChildSpacing

  // Position child nodes and ALL their sub-children with increased horizontal spacing
  childNames.forEach((name, index) => {
    const childId = `child-${index + 1}`
    const childY = childStartY + index * childSpacing
    const componentId = index + 1

    // Add child node with increased horizontal spacing
    console.log(`Creating child node ${childId} with componentId: ${componentId}`)
    nodes.push({
      id: childId,
      type: 'slamOfferNode',
      position: { x: 520, y: childY }, // Increased distance from parent (was 480)
      data: {
        label: name,
        level: 'child',
        subChildrenCount: 5,
        isExpanded: false, // Will be updated by state
        componentId: componentId,
      },
    })

    // Connect child to grand parent with consistent styling
    edges.push({
      id: `edge-slam-${childId}`,
      source: 'slam-offer',
      target: childId,
      type: 'smoothstep',
      style: {
        stroke: '#8b5cf6',
        strokeWidth: 3,
      },
      animated: false,
    })

    // Generate 3 regular sub-children + 1 unlock node
    const subChildrenStartY = childY - subChildGroupHeight / 2

    // First 3 regular subchildren
    for (let subIndex = 0; subIndex < subChildrenPerParent; subIndex++) {
      const subchildId = `subchild-${index + 1}-${subIndex + 1}`
      const subchildY = subChildrenStartY + subIndex * subChildSpacing

      nodes.push({
        id: subchildId,
        type: 'slamOfferNode',
        position: { x: 920, y: subchildY }, // Increased distance from child nodes (was 850)
        data: {
          label: `${name} Item ${subIndex + 1}`,
          level: 'subchild',
          parentId: childId,
          isVisible: false, // Will be controlled by state
          description: `Key strategy ${subIndex + 1} for ${name.toLowerCase()}`,
        },
      })

      // Connect sub-child to its parent child node with consistent styling
      edges.push({
        id: `edge-${childId}-${subchildId}`,
        source: childId,
        target: subchildId,
        type: 'smoothstep',
        style: {
          stroke: '#8b5cf6', // Changed from '#10b981' to match parent-child edges
          strokeWidth: 3, // Changed from 2 to 3 to match parent-child edges
          strokeOpacity: 0, // Will be controlled by state
        },
        animated: false,
      })
    }

    // Add unlock node as 4th subchild
    const unlockNodeId = `unlock-${index + 1}`
    const unlockNodeY = subChildrenStartY + subChildrenPerParent * subChildSpacing

    nodes.push({
      id: unlockNodeId,
      type: 'slamOfferNode',
      position: { x: 920, y: unlockNodeY },
      data: {
        label: 'Unlock All',
        level: 'subchild',
        parentId: childId,
        isVisible: false,
        isUnlockNode: true,
        parentComponentId: componentId,
        description: `Unlock all ${name.toLowerCase()} strategies`,
      },
    })

    // Connect unlock node to parent
    edges.push({
      id: `edge-${childId}-${unlockNodeId}`,
      source: childId,
      target: unlockNodeId,
      type: 'smoothstep',
      style: {
        stroke: '#8b5cf6',
        strokeWidth: 3,
        strokeOpacity: 0,
      },
      animated: false,
    })
  })

  return { nodes, edges }
}

// Build hierarchy for PDF export
const convertToGrandSlamFormat = (hierarchicalData: SlamOfferData[]): GrandSlamOfferData => {
  const components: GrandSlamComponent[] = []

  hierarchicalData.forEach((parentNode, index) => {
    if (parentNode.children) {
      parentNode.children.forEach((childNode, childIndex) => {
        const items: MindmapItem[] = []

        if (childNode.children) {
          childNode.children.forEach((subChild, subIndex) => {
            items.push({
              id: subChild.id,
              title: subChild.label,
              content: subChild.description || 'Click to add detailed content for this item',
              isEditable: true,
              order: subIndex + 1,
            })
          })
        }

        // Add default items if none exist
        if (items.length === 0) {
          for (let i = 1; i <= 3; i++) {
            items.push({
              id: `${childNode.id}-item-${i}`,
              title: `Key Point ${i}`,
              content: 'Add your specific details here',
              isEditable: true,
              order: i,
            })
          }
        }

        components.push({
          id: childNode.id,
          title: childNode.label,
          description: getComponentDescription(childNode.label),
          color: getComponentColor(childNode.label),
          isEditable: false,
          order: childIndex + 1,
          items,
        })
      })
    }
  })

  return {
    _id: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: 'Grand Slam Offer',
    components,
  }
}

// Get component descriptions based on label
const getComponentDescription = (label: string): string => {
  const descriptions: Record<string, string> = {
    'Dream Outcome': "Identify your prospect's ultimate destination",
    'Problems List': 'List everything that could prevent success',
    'Solutions List': 'Transform every problem into a solution',
    'Delivery Vehicles': "Determine how you'll deliver each solution",
    'Trim & Stack': 'Optimize for maximum value at minimum cost',
    'Value Equation': 'Calculate and optimize your offer value',
    'Offer Stack': 'Combine everything into an irresistible package',
    'Scarcity & Urgency': 'Add time-based pressure to drive decisions',
    'Risk Reversal': 'Reverse risk to eliminate purchase resistance',
    'Naming & Pricing': 'Create magnetic offer names using proven formulas',
    'Final Presentation': 'Present your offer in the most compelling way',
  }
  return descriptions[label] || 'Component description'
}

// Get component colors based on label
const getComponentColor = (label: string): string => {
  const colors: Record<string, string> = {
    'Dream Outcome': 'from-pink-500 to-rose-600',
    'Problems List': 'from-orange-500 to-red-600',
    'Solutions List': 'from-blue-500 to-blue-700',
    'Delivery Vehicles': 'from-emerald-500 to-green-600',
    'Trim & Stack': 'from-amber-500 to-yellow-600',
    'Value Equation': 'from-purple-500 to-violet-600',
    'Offer Stack': 'from-indigo-500 to-blue-700',
    'Scarcity & Urgency': 'from-red-500 to-rose-600',
    'Risk Reversal': 'from-teal-500 to-emerald-600',
    'Naming & Pricing': 'from-cyan-500 to-blue-600',
    'Final Presentation': 'from-violet-500 to-purple-700',
  }
  return colors[label] || 'from-gray-500 to-gray-600'
}

const buildHierarchy = (nodes: Node[], edges: Edge[]): SlamOfferData[] => {
  const grandparentNodes = nodes.filter(node => node.data.level === 'grandparent')

  return grandparentNodes.map(grandparent => {
    const children = nodes.filter(
      node =>
        node.data.level === 'child' &&
        edges.some(edge => edge.source === grandparent.id && edge.target === node.id)
    )

    return {
      id: grandparent.id,
      label: grandparent.data.label,
      level: 'grandparent',
      description: grandparent.data.description,
      children: children.map(child => ({
        id: child.id,
        label: child.data.label,
        level: 'child',
        parentId: grandparent.id,
        children: nodes
          .filter(
            node =>
              node.data.level === 'subchild' &&
              edges.some(edge => edge.source === child.id && edge.target === node.id)
          )
          .map(subchild => ({
            id: subchild.id,
            label: subchild.data.label,
            level: 'subchild',
            parentId: child.id,
          })),
      })),
    }
  })
}

interface SlamOfferMindmapProps {
  data?: GrandSlamOfferData
}

export const SlamOfferMindmap: React.FC<SlamOfferMindmapProps> = ({ data }) => {
  const { user } = useAuth()
  const [expandedNode, setExpandedNode] = useState<string>('child-1') // Only one node expanded at a time
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  // Check if user is pro or has purchased access
  const isPro =
    user?.profile?.subscription_tier !== 'free' && user?.profile?.subscription_tier !== undefined

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNode(prev => {
      // If clicking the same node, collapse it. Otherwise, expand the new one
      return prev === nodeId ? '' : nodeId
    })
  }, [])

  const handleUnlockClick = useCallback((componentName: string) => {
    setSelectedComponent(componentName)
    setPurchaseModalOpen(true)
  }, [])

  const handlePurchaseComplete = async () => {
    // Handle purchase completion logic here
    setPurchaseModalOpen(false)
    // You might want to refresh the offer data or update the UI
  }

  // Generate all nodes once - use provided data or generate default
  const { nodes: allNodes, edges: allEdges } = data
    ? generateNodesFromOfferData(data)
    : generateAllSlamOfferData()

  const [nodes, setNodes, onNodesChange] = useNodesState(allNodes)
  const [edges, setEdges, onEdgesState] = useEdgesState(allEdges)

  // Update visibility when expandedNode changes - NO node recreation!
  useEffect(() => {
    setNodes(prevNodes =>
      prevNodes.map(node => {
        if (node.data.level === 'child') {
          // Debug: Log the componentId to ensure it's being preserved
          console.log(`Updating child node ${node.id} with componentId:`, node.data.componentId)
          return {
            ...node,
            data: {
              ...node.data,
              isExpanded: node.id === expandedNode,
              onToggle: toggleNode,
              // Preserve componentId and other essential data
              componentId: node.data.componentId,
              subChildrenCount: node.data.subChildrenCount,
            },
          }
        } else if (node.data.level === 'subchild') {
          const parentId = node.data.parentId
          const isVisible = parentId === expandedNode

          // Hide unlock nodes for pro users
          if (node.data.isUnlockNode && isPro) {
            return {
              ...node,
              data: {
                ...node.data,
                isVisible: false,
                onEdit: (id: string, newLabel: string) => editNode(id, newLabel),
                onUnlockClick: undefined,
                // Preserve essential data
                parentComponentId: node.data.parentComponentId,
                isUnlockNode: node.data.isUnlockNode,
              },
            }
          }

          return {
            ...node,
            data: {
              ...node.data,
              isVisible,
              onEdit: (id: string, newLabel: string) => editNode(id, newLabel),
              onUnlockClick: node.data.isUnlockNode
                ? () => handleUnlockClick(node.data.label)
                : undefined,
              // Preserve essential data
              parentComponentId: node.data.parentComponentId,
              isUnlockNode: node.data.isUnlockNode,
            },
          }
        }
        return {
          ...node,
          data: {
            ...node.data,
            onEdit: (id: string, newLabel: string) => editNode(id, newLabel),
          },
        }
      })
    )

    // Update edge visibility
    setEdges(prevEdges =>
      prevEdges.map(edge => {
        if (edge.id.includes('subchild') || edge.id.includes('unlock')) {
          const parentId = edge.source
          const isVisible = parentId === expandedNode
          return {
            ...edge,
            style: {
              ...edge.style,
              strokeOpacity: isVisible ? 1 : 0,
            },
          }
        }
        return edge
      })
    )
  }, [expandedNode, setNodes, setEdges, toggleNode, handleUnlockClick, isPro])

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
      {/* PDF Export Button */}
      <div className="flex justify-end">
        <PDFExportButton
          data={convertToGrandSlamFormat(hierarchicalData)}
          defaultUserInfo={{
            businessName: 'Your Business Name',
            ownerName: 'Your Name',
          }}
          size="md"
        />
      </div>

      {/* Mindmap Content Area */}
      <div className="border-2 border-gray-300 rounded-lg bg-white">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 border-b border-gray-300">
          <h5 className="font-bold text-lg flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Grand Slam Offer Mindmap
            <span className="ml-4 text-sm opacity-90">
              {expandedNode ? '1 section expanded, 5 items visible' : 'All collapsed'}
            </span>
          </h5>
        </div>
        <div style={{ height: '900px' }} className="relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesState}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
            attributionPosition="bottom-left"
            defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
            minZoom={0.4}
            maxZoom={1.2}
            zoomOnScroll={true}
            preventScrolling={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
          </ReactFlow>
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          No-Flicker Single-Expansion System
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="font-semibold text-purple-800 mb-2">🎯 Smooth Transitions</div>
            <ul className="space-y-1 text-purple-700">
              <li>• All nodes stay in DOM</li>
              <li>• Visibility controlled by opacity</li>
              <li>• Fixed node heights prevent layout shifts</li>
              <li>• Zero flickering or jumping</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="font-semibold text-blue-800 mb-2">🎨 Modern Design</div>
            <ul className="space-y-1 text-blue-700">
              <li>• Matches reference image exactly</li>
              <li>• Colorful child nodes with icons</li>
              <li>• Circular count badges</li>
              <li>• Professional gradients</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="font-semibold text-green-800 mb-2">📊 Current State</div>
            <ul className="space-y-1 text-green-700">
              <li>• Visible items: {expandedNode ? '5' : '0'}</li>
              <li>• Total sections: 11 available</li>
              <li>• Mode: Single expansion only</li>
              <li>• Performance: Optimized</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        offerTitle={selectedComponent || 'Grand Slam Offer Component'}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </div>
  )
}
