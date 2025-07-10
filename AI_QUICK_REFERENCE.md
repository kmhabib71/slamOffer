# 🤖 AI Quick Reference - SlamOffer Project

## 🎯 **Essential Info for AI Assistants**

### Database Architecture (AI-FRIENDLY)

- **PRIMARY COLLECTION**: `user_profiles` (contains ALL user data)
- **LEGACY COLLECTIONS**: `users` (auth only), `user_profiles` (subscription only) - being phased out
- **OFFERS COLLECTION**: `grand_slam_offers`
- **PURCHASES COLLECTION**: `purchased_offers`

### User Data Pattern (ALWAYS USE THIS)

```javascript
// ✅ CORRECT: Use unified collection
const user = await db.collection('user_profiles').findOne({ email: userEmail })

// ❌ WRONG: Don't use separate collections
const user = await db.collection('users').findOne({ email: userEmail })
const profile = await db.collection('user_profiles').findOne({ userId: user._id })
```

### User Document Structure

```javascript
{
  _id: ObjectId,
  email: string,
  password: string,
  name: string,
  role: 'user' | 'admin',
  subscription_tier: 'free' | 'pro' | 'premium',
  credits_remaining: number,
  total_offers_generated: number,
  created_at: Date,
  updated_at: Date
}
```

## 🔧 **Common Operations**

### Get User

```javascript
const user = await db.collection('user_profiles').findOne({ email: userEmail })
```

### Update User Credits

```javascript
await db
  .collection('user_profiles')
  .updateOne(
    { email: userEmail },
    { $inc: { credits_remaining: -1 }, $set: { updated_at: new Date() } }
  )
```

### Check User Subscription

```javascript
const user = await db.collection('user_profiles').findOne({ email: userEmail })
const isProUser = user.subscription_tier === 'pro'
```

### Get User Offers

```javascript
const offers = await db.collection('grand_slam_offers').find({ user_id: userId }).toArray()
```

## 📁 **Key Files to Know**

### Authentication & Users

- `src/lib/auth.ts` - Main auth service (AI-FRIENDLY)
- `src/lib/auth-config.ts` - NextAuth configuration
- `src/app/api/auth/register/route.ts` - User registration

### Business Logic

- `src/lib/offers.ts` - Offer management (AI-FRIENDLY)
- `src/lib/openai.ts` - AI generation logic
- `src/types/index.ts` - TypeScript definitions

### Client-Safe Components

- `src/lib/auth-types.ts` - Client-safe type definitions
- `src/lib/subscription-helpers.ts` - Client-safe utilities
- `src/components/dashboard/` - Dashboard components

## 🚫 **What NOT to Do**

### DON'T Import Server Modules in Client Components

```javascript
// ❌ WRONG: Will cause MongoDB import errors
import { authService } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

// ✅ CORRECT: Use client-safe imports
import { useAuth } from '@/app/providers/auth-provider'
import { UserProfile } from '@/lib/auth-types'
```

### DON'T Use Separate User Collections

```javascript
// ❌ WRONG: Old pattern
const user = await db.collection('users').findOne({ email })
const profile = await db.collection('user_profiles').findOne({ userId: user._id })

// ✅ CORRECT: Unified pattern
const user = await db.collection('user_profiles').findOne({ email })
```

## 🎨 **UI/UX Preferences**

- **Style**: Alex Hormozi's raw, personal storytelling style [[memory:2685964]]
- **Port**: Always use port 3000 for dev server
- **Theme**: Modern, professional with cosmic/space theme
- **Colors**: Purple/blue gradient backgrounds, white text

## 🔍 **Debugging Tips**

### Check User Data

```javascript
console.log('User data:', await db.collection('user_profiles').findOne({ email }))
```

### Check Offer Data

```javascript
console.log('User offers:', await db.collection('grand_slam_offers').find({ user_id }).toArray())
```

### Check Build Issues

```bash
npm run build  # Check for import errors
npm run dev    # Start dev server on port 3000
```

## 🚀 **Adding New Features**

1. **Always use unified `user_profiles` collection**
2. **Add AI-FRIENDLY comments to your code**
3. **Follow existing patterns in the codebase**
4. **Test with both new and existing users**
5. **Keep client and server code separate**

## 📊 **Current Status**

- ✅ MongoDB import errors FIXED
- ✅ Unified user collection implemented
- ✅ Backward compatibility maintained
- ✅ Build working successfully
- ✅ All functionality preserved

---

**Remember**: This architecture is designed to be AI-friendly. When in doubt, look for "AI-FRIENDLY" comments in the code for guidance!
