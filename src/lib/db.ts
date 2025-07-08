import { ObjectId } from 'mongodb'
import clientPromise from './mongodb'
import { User, UserProfile } from './models/user'
import { Offer, PurchasedOffer } from './models/offer'

export async function getUser(userId: string) {
  const client = await clientPromise
  const db = client.db()
  const user = await db.collection<User>('users').findOne({ _id: new ObjectId(userId) })
  return user
}

export async function getUserProfile(userId: string) {
  const client = await clientPromise
  const db = client.db()
  const profile = await db.collection<UserProfile>('user_profiles').findOne({ userId })
  return profile
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
  const client = await clientPromise
  const db = client.db()
  const now = new Date()

  const result = await db.collection<UserProfile>('user_profiles').updateOne(
    { userId },
    {
      $set: {
        ...data,
        updated_at: now,
      },
    },
    { upsert: true }
  )

  return result.acknowledged
}

export async function saveOffer(userId: string, offer: Omit<Offer, '_id'>) {
  const client = await clientPromise
  const db = client.db()
  const now = new Date()

  const result = await db.collection<Offer>('offers').insertOne({
    ...offer,
    _id: new ObjectId(),
    created_at: now,
    updated_at: now,
  })

  return result.insertedId
}

export async function getUserOffers(userId: string) {
  const client = await clientPromise
  const db = client.db()

  const offers = await db
    .collection<Offer>('offers')
    .find({ userId })
    .sort({ created_at: -1 })
    .toArray()

  return offers
}

export async function getOffer(offerId: string) {
  const client = await clientPromise
  const db = client.db()

  const offer = await db.collection<Offer>('offers').findOne({ _id: new ObjectId(offerId) })

  return offer
}

export async function updateOffer(offerId: string, data: Partial<Offer>) {
  const client = await clientPromise
  const db = client.db()
  const now = new Date()

  const result = await db.collection<Offer>('offers').updateOne(
    { _id: new ObjectId(offerId) },
    {
      $set: {
        ...data,
        updated_at: now,
      },
    }
  )

  return result.acknowledged
}

export async function deleteOffer(offerId: string, userId: string) {
  const client = await clientPromise
  const db = client.db()

  const result = await db
    .collection<Offer>('offers')
    .deleteOne({ _id: new ObjectId(offerId), userId })

  return result.acknowledged
}

export async function savePurchase(purchase: Omit<PurchasedOffer, '_id'>) {
  const client = await clientPromise
  const db = client.db()

  const result = await db.collection<PurchasedOffer>('purchased_offers').insertOne({
    ...purchase,
    _id: new ObjectId(),
    purchased_at: new Date(),
  })

  return result.insertedId
}

export async function getPurchasedOffers(userId: string) {
  const client = await clientPromise
  const db = client.db()

  const purchases = await db
    .collection<PurchasedOffer>('purchased_offers')
    .find({ userId })
    .sort({ purchased_at: -1 })
    .toArray()

  return purchases
}
