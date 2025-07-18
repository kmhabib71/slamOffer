# Manual Testing Checklist - Grand Slam Offer Application

**Date:** \***\*\_\_\_\*\***  
**Tester:** \***\*\_\_\_\*\***  
**Environment:** \***\*\_\_\_\*\***

## Pre-Testing Setup ✅

- [ ] Environment variables configured
- [ ] Application running on port 3000
- [ ] Database connection verified
- [ ] MongoDB collections exist (user_profiles, offers, background_jobs)

---

## Phase 1: Authentication & User Registration

### Test 1.1: New User Registration

- [ ] Navigate to http://localhost:3000
- [ ] Click "Sign In" or "Get Started"
- [ ] Complete Google OAuth flow
- [ ] **Verify in database:**
  - [ ] New user in `user_profiles` collection
  - [ ] `subscription_tier: "free"`
  - [ ] `credits_remaining: 3`
  - [ ] `daily_limit: 1`
  - [ ] `generations_today: 0`

**Result:** ✅ PASS
**Notes:**

1. Should I add security system like "Verification code sent to your email, put it here, verify button" then give access to dashboard page else no access to dashboard, initally will it reduce user access to the platform or add later this, or if we don't add it hacker can easily create so many users from the signin and signup, we need decide it for security also user conversion rate perspective.

### Test 1.2: Existing User Login

- [ ] Login with previously registered user
- [ ] Verify profile data persists
- [ ] Check dashboard shows correct tier

**Result:** ✅ PASS

---

## Phase 2: Free Tier Testing

### Test 2.1: Free User First Generation

- [ ] Login as Free user
- [ ] Navigate to dashboard
- [ ] Click "Generate New Offer"
- [ ] Fill out business form
- [ ] Submit generation
- [ ] **Verify:**
  - [ ] Credits: 3 → 2
  - [ ] Daily limit: 0 → 1
  - [ ] Basic components only
  - [ ] Background job created

**Result:** ✅ PASS

### Test 2.2: Daily Limit Check

- [ ] Same day, attempt second generation
- [ ] Verify daily limit error
- [ ] Check no credits deducted

**Result:** ✅ PASS

### Test 2.3: Credit Exhaustion

- [ ] Use all 3 free credits
- [ ] Attempt generation with 0 credits
- [ ] Verify error and upgrade prompt

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

### Test 2.4: Free Offer Unlock Button Purchase Flow

- [ ] **Complete Free Offer Generation (verified working):**
  - [ ] Sign in/up as free user
  - [ ] Generate free offer (basic version)
  - [ ] Verify credit deduction (3 → 2)
  - [ ] Verify profile update in database

- [ ] **Test Unlock Button from Dashboard:**
  - [ ] Locate "Unlock" button on generated free offer
  - [ ] Click unlock button
  - [ ] Select pricing plan (Starter Spark/Growth Engine/Agency Arsenal)
  - [ ] Complete purchase flow
  - [ ] **Verify instant database update:**
    - [ ] `subscription_tier` updated immediately
    - [ ] Credits updated according to plan
    - [ ] No duplicate profiles created

- [ ] **Test Full Offer Generation After Purchase:**
  - [ ] After successful purchase, system should trigger full OpenAI generation
  - [ ] Real-time packing animation should display during generation
  - [ ] User can close browser - generation continues in background
  - [ ] Full offer replaces free preview

- [ ] **Test Unlock Button from Offer Page (/offer/:id):**
  - [ ] Navigate to /offer/:id of free offer
  - [ ] Click unlock button on offer page
  - [ ] Complete same purchase flow
  - [ ] Verify same behavior as dashboard unlock

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

### Test 2.5: Email Notification System

- [ ] **Free Offer Generation Email:**
  - [ ] Generate free offer
  - [ ] Verify email sent with offer link /offer/:id
  - [ ] Check email contains correct offer ID

- [ ] **Full Offer Generation Email:**
  - [ ] Purchase plan and trigger full generation
  - [ ] Close browser during generation
  - [ ] Wait for generation completion
  - [ ] Verify email sent with updated offer link
  - [ ] Check offer link leads to full generated content

- [ ] **Email Content Verification:**
  - [ ] Subject line appropriate
  - [ ] Offer link functional
  - [ ] Professional formatting

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

---

## Phase 3: Purchase Flow Testing

### Test 3.1: Free to Starter Spark Upgrade

- [ ] Login as Free user with remaining credits
- [ ] Navigate to pricing page
- [ ] Select "Starter Spark ($9)"
- [ ] Complete purchase flow
- [ ] **Verify upgrade:**
  - [ ] `subscription_tier: "starter_spark"`
  - [ ] Credits preserved + 1 new
  - [ ] No duplicate profiles

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

### Test 3.2: Direct Purchase

- [ ] Register new user
- [ ] Immediately purchase Growth Engine
- [ ] Verify direct upgrade to tier
- [ ] Check 10 credits available

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

### Test 3.3: Purchase Validation

- [ ] Attempt to purchase same package twice
- [ ] Verify error message
- [ ] Try purchasing lower tier
- [ ] Verify appropriate handling

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

---

## Phase 4: Plan Validation & Credit System Testing

### Test 4.1: Plan Validation Before Generation

- [ ] **Starter Spark Plan Validation:**
  - [ ] User should have 1 credit for new offer generation
  - [ ] Credit should be consumed when purchasing full offer from free preview (unlock button)
  - [ ] After unlock purchase, user should have 0 credits for new generations
  - [ ] Dashboard should show "0 credits" for new offers after using credit

- [ ] **Growth Engine Plan Validation:**
  - [ ] User should have 10 credits for new offer generation
  - [ ] Credits should only be used for new complete offers

- [ ] **Agency Arsenal Plan Validation:**
  - [ ] User should have 30 credits for new offer generation
  - [ ] Credits should only be used for new complete offers

- [ ] **Credit System Validation:**
  - [ ] Credits = for new offer generation from scratch
  - [ ] Dashboard should clearly show available credits
  - [ ] Credit deduction should be atomic and accurate

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

### Test 4.2: Database Update During Unlock Purchase

- [ ] **Real-time Database Updates:**
  - [ ] Free user clicks unlock button
  - [ ] Selects and purchases plan
  - [ ] Verify subscription_tier updates instantly in database
  - [ ] Verify credits update according to purchased plan
  - [ ] Verify purchase triggers full OpenAI generation immediately
  - [ ] Verify no race conditions or data inconsistencies

- [ ] **Generation Trigger After Purchase:**
  - [ ] Purchase completion should automatically start full generation
  - [ ] Should replace free preview with full offer content
  - [ ] Background job should be created for generation
  - [ ] User should see real-time packing animation

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

## Phase 5: Generation System Testing

### Test 5.1: Complete Generation

- [ ] Login as paid user
- [ ] Generate complete offer
- [ ] **Verify:**
  - [ ] All premium components
  - [ ] Background processing
  - [ ] Credit deducted correctly
  - [ ] Offer saved to database

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

### Test 5.2: Background Processing

- [ ] Start generation
- [ ] Close browser tab immediately
- [ ] Wait 2-3 minutes
- [ ] Reopen application
- [ ] Check for completed offer

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

### Test 5.3: Generation Failure

- [ ] Break OpenAI API key temporarily
- [ ] Attempt generation
- [ ] **Verify:**
  - [ ] Error message displayed
  - [ ] Credits refunded
  - [ ] Job marked as failed

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

---

## Phase 6: Database Integrity Testing

### Test 6.1: Concurrent Operations

- [ ] Open multiple browser tabs
- [ ] Login as same user
- [ ] Attempt simultaneous operations
- [ ] Verify no race conditions

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

### Test 6.2: Data Consistency

- [ ] Check database directly:
  - [ ] No negative credits
  - [ ] Proper tier assignments
  - [ ] Accurate generation counts
  - [ ] Valid timestamps
  - [ ] Accurate generation counts
  - [ ] Proper subscription_tier values

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

---

## Phase 7: UI/UX Testing

### Test 7.1: Tier-Specific UI

- [ ] **Free:** 
  - [ ] Basic features, upgrade prompts
  - [ ] Unlock buttons on free offers
  - [ ] Credit display shows correctly

- [ ] **Starter Spark:** 
  - [ ] Single offer interface
  - [ ] Credit display shows available credits
  - [ ] Shows "X credits for new offers"

- [ ] **Growth Engine:** 
  - [ ] Full features, multiple offers
  - [ ] High credit display (10 credits)
  - [ ] Complete offer generation UI

- [ ] **Agency Arsenal:** 
  - [ ] Full features, multiple offers
  - [ ] Highest credit display (30 credits)
  - [ ] Complete offer generation UI

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

### Test 7.2: Real-Time Updates

- [ ] Keep dashboard open
- [ ] Perform operations in another tab
- [ ] Verify automatic updates
- [ ] Verify instant database reflection for unlock purchases

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

### Test 7.3: Mobile Responsiveness

- [ ] Test on mobile device
- [ ] Verify all features work
- [ ] Check responsive design
- [ ] Test unlock button functionality on mobile

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

---

## Phase 8: Performance Testing

### Test 8.1: Load Testing

- [ ] Create multiple test users
- [ ] Simulate concurrent operations
- [ ] Monitor system performance

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

### Test 8.2: Generation Speed

- [ ] Time generation processes
- [ ] Verify reasonable completion times
- [ ] Check background job efficiency

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

---

## Phase 9: Error Handling Testing

### Test 9.1: Network Failures

- [ ] Simulate network interruptions
- [ ] Test offline/online scenarios
- [ ] Verify graceful degradation

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

### Test 9.2: Invalid Data

- [ ] Submit invalid form data
- [ ] Test edge cases
- [ ] Verify validation works

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

---

## Phase 10: Security Testing

### Test 10.1: Authentication Security

- [ ] Test unauthorized access attempts
- [ ] Verify session management
- [ ] Check route protection

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

### Test 10.2: Data Protection

- [ ] Verify user data isolation
- [ ] Test API endpoint security
- [ ] Check for data leaks

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** \***\*\_\_\_\*\***

---

## Final Summary

**Total Tests:** **\_** / 20  
**Passed:** **\_**  
**Failed:** **\_**  
**Overall Status:** ✅ READY FOR PRODUCTION / ❌ NEEDS FIXES

### Critical Issues Found:

1. ***
2. ***
3. ***

### Minor Issues Found:

1. ***
2. ***
3. ***

### Recommendations:

1. ***
2. ***
3. ***

---

**Tester Signature:** \***\*\_\_\_\*\***  
**Date Completed:** \***\*\_\_\_\*\***  
**Approved for Production:** ✅ YES / ❌ NO
