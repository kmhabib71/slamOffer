Complete Purchase and Generation Workflow
User Tiers & Credits System:
Free: 3 total generations, 1 per day limit, basic components only
Starter Spark ($9): 1 complete offer + 2 regenerations (same prompt only)
Growth Engine ($47): 10 complete offers, all features
Agency Arsenal ($99): 30 complete offers, all features
Workflow Requirements:
Phase 1: User Signup & Initial State
New user gets "Free" tier with 3 credits
System tracks: subscription_tier, credits_remaining, daily_generation_count
Database: Single user_profiles collection (no duplicates)
Phase 2: Offer Generation Logic
Before ANY generation:

Check user's current plan and credits
If Free user: Check daily limit (1 per day) and total credits (3 max)
If Paid user: Check credits remaining for their package
If insufficient credits → Show purchase modal
If sufficient credits → Proceed with generation
Generation Types:

Free users: Basic offer (preview only, 3 items per component)
Paid users: Complete offer (full AI generation, all components)
Phase 3: Purchase Flow
Scenario A - Free User Clicks "Unlock":

Show purchase modal with Starter Spark as default
User selects plan and purchases
Update user_profiles collection (upgrade existing, don't create new)
Immediately trigger full AI generation with RealTimePackingAnimation
Save complete offer to database
Update user credits and purchase tracking
Scenario B - User Purchases Plan First:

User buys plan before generating any offer
Update user profile with new tier and credits
All subsequent generations are full offers
Each generation consumes 1 credit
Phase 4: Regeneration Rules
Starter Spark Special Rule:

Gets 2 regenerations of the SAME prompt (no editing allowed)
Regeneration button only appears for Starter Spark users
Each regeneration uses the exact same business description
Regenerations don't consume additional credits
Phase 5: Background Processing
All AI generations continue even if user closes browser
Use background job system to complete generation
Store completed offers in database with user association
Update user credits atomically when generation completes
User sees completed offer when they return
Phase 6: Database Updates
Collections to update:

user_profiles: subscription_tier, credits_remaining, purchase_date
grand_slam_offers: store generated offers
purchased_offers: track purchase history
Update Rules:

Always update existing user profile (never create duplicates)
Use email as primary identifier
Atomic credit deduction (prevent race conditions)
Track generation status (pending, completed, failed)
Phase 7: UI Display Logic
Free users: Show preview (3 items) + unlock buttons
Paid users: Show complete offer (all items)
Starter Spark: Show regeneration button (2 times max)
Credits display: Show remaining credits for current plan
Purchase modal: Always show Starter Spark as default choice
Current Issues to Fix:
Maintain same component/code in several place where it might be used
React hooks error in offer-text-view component
Purchase flow not properly upgrading existing users
Generation not continuing in background
Regeneration logic not implemented for Starter Spark
Expected Final Behavior:
New User: Signs up → Gets 3 free generations → Generates basic offer → Clicks unlock → Purchases → Gets full offer immediately
Direct Purchase: User buys plan → All generations are full offers → Credits deducted per generation
Starter Spark: Gets 1 offer + 2 regenerations of same prompt → No editing allowed on regenerations
Background Processing: Generation continues even if user leaves → User sees completed offer when returning
Database Integrity: No duplicate profiles, atomic updates, proper credit tracking
Files That Need Coordination:
src/components/dashboard/offer-text-view.tsx (main UI logic)
src/components/dashboard/purchase-modal.tsx (purchase flow)
src/lib/auth.ts (user profile management)
src/app/api/purchase-package/route.ts (purchase processing)
src/app/api/purchase-offer/route.ts (offer generation)

test gso too with the prompt below, the prompt is short in real it will be longer:

### 1. 🏠 **Bhara.com (Peer-to-Peer Renting Marketplace)**

> I want to build a peer-to-peer renting platform in Bangladesh called Bhara.com, where users can rent out or borrow things like furniture, cameras, bikes, or tools from each other. Most people here either can’t afford to buy everything or have idle items they want to earn from. My goal is to reach 100,000 active users and make renting mainstream through convenience, trust, and local pickup.

---

### 2. 💼 **Remote Career Accelerator for Students**

> I want to create an online bootcamp for South Asian university students to help them land remote jobs in US-based tech companies. Most students feel lost, have poor resumes, and lack real-world project experience. My platform will offer AI-assisted resume building, portfolio coaching, and mock interviews. I want to hit \$20K MRR in 6 months with cohort-based training.

---

### 3. 📦 **AI Inventory Optimizer for Shopify Stores**

> I want to build an AI tool for Shopify store owners that predicts which SKUs are about to go out of stock or underperform. Most small eCommerce brands lose money from overstocking or missed demand. My goal is to sell this as a plug-and-play app for \$49/month and hit 500 stores in the next 90 days.

---

### 4. 📚 **\$1 Micro-Course Platform for Busy Professionals**

> I want to launch a platform where busy professionals can learn specific skills—like how to raise prices, cold email, or run ads—in 20-minute video micro-courses for just \$1 each. Most people don’t finish big courses. I want to build a \$100K/year side business by offering quick wins they can consume in one coffee break.

---

### 5. 💬 **Multi-Tenant Video Chat PaaS for Speed Dating & Coaching**

> I want to launch a multi-tenant video chat SaaS where people can create white-labeled apps for speed dating, 1:1 coaching, or live therapist sessions. Most creators or communities want to monetize real-time interaction but don’t know how to build WebRTC tools. I’ll charge \$99–\$299/month per tenant and take 10% of client-side revenue using Stripe Connect.

find and kill 3000 in windows:

netstat -aon | findstr :3000
TCP [::1]:3000 [::]:0 LISTENING 8884
TCP [::1]:3000 [::1]:63971 ESTABLISHED 8884
TCP [::1]:3000 [::1]:64044 TIME_WAIT 0
TCP [::1]:3000 [::1]:64052 TIME_WAIT 0
TCP [::1]:3000 [::1]:64066 TIME_WAIT 0
TCP [::1]:63971 [::1]:3000 ESTABLISHED 18412
PS D:\Projects\Grand-offer\slamOffer> Stop-Process -Id 8884

Find and kill 3000 in ubuntu
ss -tuln | grep 3000
sudo fuser -k 3000/tcp
ss -tuln | grep 3000
