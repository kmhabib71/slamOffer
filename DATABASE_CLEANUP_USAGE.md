# 🧹 Database Cleanup Functionality - Testing Guide

**🚨 TESTING ONLY - REMOVE BEFORE PRODUCTION**

## How to Use the Database Cleanup Feature

### 1. Access the Cleanup Interface
- **Login** to the application (any authenticated user can access)
- **Navigate** to the dashboard
- **Look for** the red "TEST" button in the header navigation
- **Click** the button to expand the cleanup interface

### 2. Available Cleanup Options

#### **Clean All Data** (Red Button)
- **Action:** Deletes ALL data from ALL collections
- **Collections:** user_profiles + purchased_offers + grand_slam_offers  
- **Use Case:** Complete database reset for testing
- **Warning:** Requires double confirmation

#### **Individual Collection Buttons**
1. **Users Button** - Cleans `user_profiles` collection
2. **Purchases Button** - Cleans `purchased_offers` collection  
3. **Offers Button** - Cleans `grand_slam_offers` collection

### 3. Safety Features
- ✅ **Authentication Required** - Must be logged in
- ✅ **Confirmation Dialogs** - Each action requires confirmation
- ✅ **Real-time Stats** - Shows current collection counts
- ✅ **Result Feedback** - Displays cleanup results
- ✅ **Refresh Stats** - Update counts after operations

### 4. Visual Interface

```
┌─────────────────────────────────────────────────────────┐
│ 🚨 TESTING ONLY - Database Cleanup                     │
├─────────────────────────────────────────────────────────┤
│ ⚠️ WARNING: This functionality must be REMOVED before  │
│ production deployment!                                  │
├─────────────────────────────────────────────────────────┤
│ Stats: [Users: X] [Purchases: Y] [Offers: Z] [Total: N]│
├─────────────────────────────────────────────────────────┤
│ [Clean All] [Users] [Purchases] [Offers] [Refresh]     │
├─────────────────────────────────────────────────────────┤
│ Last Action: Deleted X documents...                    │
└─────────────────────────────────────────────────────────┘
```

### 5. Typical Testing Workflow

1. **Create Test Data:**
   - Sign up new users
   - Generate offers
   - Make purchases

2. **Check Stats:**
   - Click "Refresh Stats" to see current counts
   - Verify data exists

3. **Clean Specific Data:**
   - Use individual buttons for targeted cleanup
   - Or use "Clean All" for complete reset

4. **Verify Cleanup:**
   - Stats should update automatically
   - Refresh stats to double-check

### 6. API Endpoints (for reference)

#### GET `/api/admin/database/clean-testing`
- Returns collection counts
- No authentication bypass

#### POST `/api/admin/database/clean-testing`
```json
{
  "action": "clean-all" | "clean-user-profiles" | "clean-purchased-offers" | "clean-grand-slam-offers"
}
```

### 7. Security Notes
- **Requires authentication** (session-based)
- **No admin role required** (for testing convenience)
- **All operations logged** to console
- **Dangerous operations** require confirmation

### 8. Before Production Checklist
- [ ] Remove all cleanup functionality
- [ ] Test that cleanup endpoints return 404
- [ ] Verify no cleanup buttons exist in UI
- [ ] Remove this documentation file

---

**⚠️ CRITICAL REMINDER:** This functionality provides dangerous data deletion capabilities and MUST be removed before production deployment!