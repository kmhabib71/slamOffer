complete workflow prompt:

## **Complete Purchase and Generation Workflow**

### **User Tiers & Credits System:**
- **Free**: 3 total generations, 1 per day limit, basic components only
- **Starter Spark ($9)**: 1 complete offer + 2 regenerations (same prompt only)
- **Growth Engine ($47)**: 10 complete offers, all features
- **Agency Arsenal ($99)**: 30 complete offers, all features

### **Workflow Requirements:**

#### **Phase 1: User Signup & Initial State**
- New user gets "Free" tier with 3 credits
- System tracks: `subscription_tier`, `credits_remaining`, `daily_generation_count`
- Database: Single `user_profiles` collection (no duplicates)

#### **Phase 2: Offer Generation Logic**
**Before ANY generation:**
1. Check user's current plan and credits
2. If Free user: Check daily limit (1 per day) and total credits (3 max)
3. If Paid user: Check credits remaining for their package
4. If insufficient credits → Show purchase modal
5. If sufficient credits → Proceed with generation

**Generation Types:**
- **Free users**: Basic offer (preview only, 3 items per component)
- **Paid users**: Complete offer (full AI generation, all components)

#### **Phase 3: Purchase Flow**
**Scenario A - Free User Clicks "Unlock":**
1. Show purchase modal with Starter Spark as default
2. User selects plan and purchases
3. Update `user_profiles` collection (upgrade existing, don't create new)
4. Immediately trigger full AI generation with RealTimePackingAnimation
5. Save complete offer to database
6. Update user credits and purchase tracking

**Scenario B - User Purchases Plan First:**
1. User buys plan before generating any offer
2. Update user profile with new tier and credits
3. All subsequent generations are full offers
4. Each generation consumes 1 credit

#### **Phase 4: Regeneration Rules**
**Starter Spark Special Rule:**
- Gets 2 regenerations of the SAME prompt (no editing allowed)
- Regeneration button only appears for Starter Spark users
- Each regeneration uses the exact same business description
- Regenerations don't consume additional credits

#### **Phase 5: Background Processing**
- All AI generations continue even if user closes browser
- Use background job system to complete generation
- Store completed offers in database with user association
- Update user credits atomically when generation completes
- User sees completed offer when they return

#### **Phase 6: Database Updates**
**Collections to update:**
- `user_profiles`: subscription_tier, credits_remaining, purchase_date
- `grand_slam_offers`: store generated offers
- `purchased_offers`: track purchase history

**Update Rules:**
- Always update existing user profile (never create duplicates)
- Use email as primary identifier
- Atomic credit deduction (prevent race conditions)
- Track generation status (pending, completed, failed)

#### **Phase 7: UI Display Logic**
- **Free users**: Show preview (3 items) + unlock buttons
- **Paid users**: Show complete offer (all items)
- **Starter Spark**: Show regeneration button (2 times max)
- **Credits display**: Show remaining credits for current plan
- **Purchase modal**: Always show Starter Spark as default choice

### **Current Issues to Fix:**
1. Maintain same component/code in several place where it might be used 
2. React hooks error in offer-text-view component
3. Purchase flow not properly upgrading existing users
4. Generation not continuing in background
5. Regeneration logic not implemented for Starter Spark

### **Expected Final Behavior:**
1. **New User**: Signs up → Gets 3 free generations → Generates basic offer → Clicks unlock → Purchases → Gets full offer immediately
2. **Direct Purchase**: User buys plan → All generations are full offers → Credits deducted per generation
3. **Starter Spark**: Gets 1 offer + 2 regenerations of same prompt → No editing allowed on regenerations
4. **Background Processing**: Generation continues even if user leaves → User sees completed offer when returning
5. **Database Integrity**: No duplicate profiles, atomic updates, proper credit tracking

### **Files That Need Coordination:**
- `src/components/dashboard/offer-text-view.tsx` (main UI logic)
- `src/components/dashboard/purchase-modal.tsx` (purchase flow)
- `src/lib/auth.ts` (user profile management)
- `src/app/api/purchase-package/route.ts` (purchase processing)
- `src/app/api/purchase-offer/route.ts` (offer generation)

**Should I proceed with implementing this complete workflow, ensuring all these pieces work together seamlessly?**