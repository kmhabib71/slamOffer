import { ObjectId } from 'mongodb'
import { CompleteGrandSlamOffer } from '@/types'

export interface Offer {
  _id: ObjectId
  userId: string
  title: string
  offer_data: CompleteGrandSlamOffer
  created_at: Date
  updated_at: Date
  status: 'draft' | 'published'
  tier: 'free' | 'pro'
}

export interface PurchasedOffer {
  _id: ObjectId
  userId: string
  offerId: string
  componentName?: string
  purchased_at: Date
  status: 'pending' | 'completed'
  amount_paid: number
}
