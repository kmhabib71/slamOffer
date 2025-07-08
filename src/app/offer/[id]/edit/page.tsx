'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/auth-provider'
import { AuthGuard } from '@/components/auth/auth-guard'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit3,
  Loader,
  AlertTriangle,
  GripVertical,
  Check,
  X,
} from 'lucide-react'
import Link from 'next/link'

type OfferItem = {
  id: string
  title: string
  description: string
  value: string
  category: string
  priority: 'high' | 'medium' | 'low'
  order: number
}

type OfferComponent = {
  componentId: number
  componentName: string
  description: string
  items: OfferItem[]
  totalValue: string
  isLocked: boolean
  previewCount: number
  totalAvailable: number
  conversionMessage: string | null
}

type EditableOffer = {
  _id: string
  user_id: string
  businessContext: {
    businessDescription: string
  }
  components: OfferComponent[]
  totalOfferValue: string
  createdAt: Date
  metadata: {
    tokenUsage?: number
    generationTime?: number
    model?: string
    testMode?: boolean
  }
  isPublic?: boolean
}

export default function EditOfferPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [offer, setOffer] = useState<EditableOffer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [editingItem, setEditingItem] = useState<{ componentId: number; itemId: string } | null>(
    null
  )
  const [newItem, setNewItem] = useState<{ componentId: number; item: Partial<OfferItem> } | null>(
    null
  )

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await fetch(`/api/offers/${params.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Offer not found')
          } else if (response.status === 403) {
            setError('You do not have permission to edit this offer')
          } else {
            setError('Failed to load offer')
          }
          return
        }

        const data = await response.json()

        // Check if user is the owner
        const userIsOwner = user?.email === data.data.owner_email
        setIsOwner(userIsOwner)

        if (!userIsOwner) {
          setError('You do not have permission to edit this offer')
          return
        }

        // Convert to editable format
        const editableOffer: EditableOffer = {
          ...data.data.offer_data,
          _id: data.data.id || data.data._id?.toString() || '',
          user_id: data.data.user_id?.toString() || '',
          businessContext: data.data.offer_data?.businessContext || {
            businessDescription: data.data.business_description || '',
          },
          isPublic: data.data.isPublic,
        }

        setOffer(editableOffer)
      } catch (err) {
        console.error('Error fetching offer:', err)
        setError('Failed to load offer')
      } finally {
        setLoading(false)
      }
    }

    if (params.id && user) {
      fetchOffer()
    }
  }, [params.id, user])

  const updateItem = (componentId: number, itemId: string, updates: OfferItem) => {
    if (!offer) return

    setOffer(prev => ({
      ...prev!,
      components: prev!.components.map(component =>
        component.componentId === componentId
          ? {
              ...component,
              items: component.items.map(item => (item.id === itemId ? updates : item)),
            }
          : component
      ),
    }))
  }

  const addItem = (componentId: number, newItemData: Partial<OfferItem>) => {
    if (!offer) return

    const component = offer.components.find(c => c.componentId === componentId)
    if (!component) return

    const newId = `${componentId}-${Date.now()}`
    const newOrder = Math.max(...component.items.map(item => item.order), 0) + 1

    const fullItem: OfferItem = {
      id: newId,
      title: newItemData.title || '',
      description: newItemData.description || '',
      value: newItemData.value || '$0',
      category: newItemData.category || 'core',
      priority: newItemData.priority || 'medium',
      order: newOrder,
    }

    setOffer(prev => ({
      ...prev!,
      components: prev!.components.map(component =>
        component.componentId === componentId
          ? {
              ...component,
              items: [...component.items, fullItem],
              totalAvailable: component.totalAvailable + 1,
            }
          : component
      ),
    }))
  }

  const deleteItem = (componentId: number, itemId: string) => {
    if (!offer) return

    setOffer(prev => ({
      ...prev!,
      components: prev!.components.map(component =>
        component.componentId === componentId
          ? {
              ...component,
              items: component.items.filter(item => item.id !== itemId),
              totalAvailable: Math.max(0, component.totalAvailable - 1),
            }
          : component
      ),
    }))
  }

  const validateOffer = () => {
    if (!offer) return false

    // Check if all components have at least one item
    for (const component of offer.components) {
      if (component.items.length === 0) {
        setSaveError(`Component "${component.componentName}" must have at least one item`)
        return false
      }

      // Check if all items have required fields
      for (const item of component.items) {
        if (!item.title.trim()) {
          setSaveError(`All items in "${component.componentName}" must have a title`)
          return false
        }
        if (!item.description.trim()) {
          setSaveError(`All items in "${component.componentName}" must have a description`)
          return false
        }
        if (!item.value.trim()) {
          setSaveError(`All items in "${component.componentName}" must have a value`)
          return false
        }
      }
    }

    return true
  }

  const saveOffer = async () => {
    if (!offer) return

    setSaving(true)
    setSaveError(null)

    // Validate the offer before saving
    if (!validateOffer()) {
      setSaving(false)
      return
    }

    try {
      const response = await fetch(`/api/offers/${params.id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offer_data: offer,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save offer')
      }

      // Redirect back to offer view
      router.push(`/offer/${params.id}`)
    } catch (error) {
      console.error('Error saving offer:', error)
      setSaveError(error instanceof Error ? error.message : 'Failed to save offer')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen relative bg-[#F9FAFB] dotted-bg flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
        </div>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen relative bg-[#F9FAFB] dotted-bg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!offer) {
    return (
      <AuthGuard>
        <div className="min-h-screen relative bg-[#F9FAFB] dotted-bg flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Offer Not Found</h1>
            <p className="text-slate-600 mb-6">The offer you're looking for doesn't exist.</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen relative bg-[#F9FAFB] dotted-bg">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm fixed top-0 z-50 w-full">
          <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Link
                href={`/offer/${params.id}`}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back to Offer</span>
              </Link>

              <div className="h-6 w-px bg-slate-300" />

              <div>
                <h1 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                  <Edit3 className="h-5 w-5 text-violet-600" />
                  <span>Edit Offer</span>
                </h1>
                <p className="text-sm text-slate-500">
                  {offer.businessContext?.businessDescription?.substring(0, 50)}...
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={saveOffer}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8 mt-28">
          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{saveError}</span>
              </div>
            </motion.div>
          )}

          <div className="space-y-8">
            {offer.components.map((component, index) => (
              <ComponentEditor
                key={component.componentId}
                component={component}
                onUpdateItem={updateItem}
                onAddItem={addItem}
                onDeleteItem={deleteItem}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
                newItem={newItem}
                setNewItem={setNewItem}
              />
            ))}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}

// Component Editor Component
interface ComponentEditorProps {
  component: OfferComponent
  onUpdateItem: (componentId: number, itemId: string, updates: OfferItem) => void
  onAddItem: (componentId: number, newItem: Partial<OfferItem>) => void
  onDeleteItem: (componentId: number, itemId: string) => void
  editingItem: { componentId: number; itemId: string } | null
  setEditingItem: (item: { componentId: number; itemId: string } | null) => void
  newItem: { componentId: number; item: Partial<OfferItem> } | null
  setNewItem: (item: { componentId: number; item: Partial<OfferItem> } | null) => void
}

function ComponentEditor({
  component,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  editingItem,
  setEditingItem,
  newItem,
  setNewItem,
}: ComponentEditorProps) {
  const [tempItem, setTempItem] = useState<Partial<OfferItem>>({})

  const startEditing = (item: OfferItem) => {
    setEditingItem({ componentId: component.componentId, itemId: item.id })
    // Initialize tempItem with all existing values
    setTempItem({
      title: item.title,
      description: item.description,
      value: item.value,
      priority: item.priority,
      category: item.category,
      order: item.order,
      id: item.id,
    })
  }

  const saveEdit = () => {
    if (editingItem) {
      // Get the current item to merge with updates
      const currentItem = component.items.find(item => item.id === editingItem.itemId)
      if (!currentItem) return

      // Merge current values with updates (only update fields that have values)
      const updatedItem = {
        ...currentItem,
        ...(tempItem.title !== undefined && tempItem.title.trim() !== ''
          ? { title: tempItem.title.trim() }
          : {}),
        ...(tempItem.description !== undefined && tempItem.description.trim() !== ''
          ? { description: tempItem.description.trim() }
          : {}),
        ...(tempItem.value !== undefined && tempItem.value.trim() !== ''
          ? { value: tempItem.value.trim() }
          : {}),
        ...(tempItem.priority !== undefined ? { priority: tempItem.priority } : {}),
      }

      // Basic validation - only check if the final result has required fields
      if (!updatedItem.title?.trim()) {
        alert('Title cannot be empty')
        return
      }
      if (!updatedItem.description?.trim()) {
        alert('Description cannot be empty')
        return
      }
      if (!updatedItem.value?.trim()) {
        alert('Value cannot be empty')
        return
      }

      onUpdateItem(editingItem.componentId, editingItem.itemId, updatedItem)
      setEditingItem(null)
      setTempItem({})
    }
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setTempItem({})
  }

  const startAddingItem = () => {
    setNewItem({
      componentId: component.componentId,
      item: {
        title: '',
        description: '',
        value: '$0',
        priority: 'medium',
      },
    })
  }

  const saveNewItem = () => {
    if (newItem && newItem.componentId === component.componentId) {
      // Validate required fields
      if (!newItem.item.title?.trim()) {
        alert('Title is required')
        return
      }
      if (!newItem.item.description?.trim()) {
        alert('Description is required')
        return
      }
      if (!newItem.item.value?.trim()) {
        alert('Value is required')
        return
      }

      onAddItem(component.componentId, newItem.item)
      setNewItem(null)
    }
  }

  const cancelNewItem = () => {
    setNewItem(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-violet-500 to-sky-500 px-6 py-4">
        <h3 className="text-xl font-bold text-white">{component.componentName}</h3>
        <p className="text-violet-100 text-sm mt-1">{component.description}</p>
        <div className="flex items-center space-x-4 mt-2">
          <span className="text-violet-100 text-sm">
            {component.items.length} items • {component.totalValue}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {component.items.map((item, index) => (
            <div key={item.id} className="border border-slate-200 rounded-lg p-4">
              {editingItem?.componentId === component.componentId &&
              editingItem?.itemId === item.id ? (
                <ItemEditForm
                  item={tempItem}
                  onChange={setTempItem}
                  onSave={saveEdit}
                  onCancel={cancelEdit}
                  itemNumber={index + 1}
                />
              ) : (
                <ItemDisplay
                  item={item}
                  itemNumber={index + 1}
                  onEdit={() => startEditing(item)}
                  onDelete={() => onDeleteItem(component.componentId, item.id)}
                />
              )}
            </div>
          ))}

          {newItem?.componentId === component.componentId ? (
            <div className="border-2 border-dashed border-violet-300 rounded-lg p-4">
              <ItemEditForm
                item={newItem.item}
                onChange={updates =>
                  setNewItem({ ...newItem, item: { ...newItem.item, ...updates } })
                }
                onSave={saveNewItem}
                onCancel={cancelNewItem}
                isNew={true}
              />
            </div>
          ) : (
            <button
              onClick={startAddingItem}
              className="w-full border-2 border-dashed border-slate-300 rounded-lg p-4 text-slate-500 hover:border-violet-400 hover:text-violet-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Item</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Item Display Component
interface ItemDisplayProps {
  item: OfferItem
  itemNumber: number
  onEdit: () => void
  onDelete: () => void
}

function ItemDisplay({ item, itemNumber, onEdit, onDelete }: ItemDisplayProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <span className="flex-shrink-0 w-6 h-6 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-sm font-semibold">
            {itemNumber}
          </span>
          <h4 className="font-semibold text-slate-800">{item.title}</h4>
          <span className="text-sm font-medium text-violet-600">{item.value}</span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              item.priority === 'high'
                ? 'bg-red-100 text-red-700'
                : item.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
            }`}
          >
            {item.priority}
          </span>
        </div>
        <p className="text-slate-600 text-sm">{item.description}</p>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={onEdit}
          className="p-2 text-slate-400 hover:text-violet-600 transition-colors"
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            if (
              confirm('Are you sure you want to delete this item? This action cannot be undone.')
            ) {
              onDelete()
            }
          }}
          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
          title="Delete item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Item Edit Form Component
interface ItemEditFormProps {
  item: Partial<OfferItem>
  onChange: (updates: Partial<OfferItem>) => void
  onSave: () => void
  onCancel: () => void
  itemNumber?: number
  isNew?: boolean
}

function ItemEditForm({
  item,
  onChange,
  onSave,
  onCancel,
  itemNumber,
  isNew = false,
}: ItemEditFormProps) {
  return (
    <div className="space-y-4">
      {itemNumber && !isNew && (
        <div className="flex items-center space-x-2 mb-4">
          <span className="flex-shrink-0 w-6 h-6 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-sm font-semibold">
            {itemNumber}
          </span>
          <span className="text-sm font-medium text-slate-600">Editing Item #{itemNumber}</span>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
        <input
          type="text"
          value={item.title || ''}
          onChange={e => onChange({ ...item, title: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="Enter item title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={item.description || ''}
          onChange={e => onChange({ ...item, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="Enter item description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
          <input
            type="text"
            value={item.value || ''}
            onChange={e => onChange({ ...item, value: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="$0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
          <select
            value={item.priority || 'medium'}
            onChange={e =>
              onChange({ ...item, priority: e.target.value as 'high' | 'medium' | 'low' })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onSave}
          className="flex items-center space-x-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          <Check className="h-4 w-4" />
          <span>{isNew ? 'Add Item' : 'Save Changes'}</span>
        </button>
        <button
          onClick={onCancel}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
        >
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  )
}
