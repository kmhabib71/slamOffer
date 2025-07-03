# Supabase Debug Guide

## Overview

This guide provides tools and commands to debug authentication and admin-related issues in your Supabase project.

## Setup Complete ✅

- ✅ Supabase CLI installed as dev dependency
- ✅ Authenticated with Supabase CLI
- ✅ Debug scripts created and configured
- ✅ Package.json scripts added for easy debugging

## Debug Scripts Available

### 1. Comprehensive Debug

```bash
npm run debug:supabase
```

Runs all diagnostic tests including:

- Connection status
- Database tables check
- Authentication testing
- RLS policy testing
- User management check

### 2. Specific Debug Tests

```bash
npm run debug:auth      # Test authentication only
npm run debug:users     # Check user management
npm run debug:tables    # List database tables
npm run debug:rls       # Test Row Level Security
```

### 3. Supabase CLI Commands

```bash
npm run supabase:status # List all projects
npm run supabase:types  # Generate TypeScript types
```

## Current Status

🔍 **Database Status**: Tables not found - migrations need to be applied
🔐 **Authentication**: Service configured but no active session
🛡️ **RLS**: Cannot test until tables exist

## Next Steps Required

### 1. Initialize Database Schema

You need to run your database migrations. You have two options:

#### Option A: Use Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard/project/foeeztuuxsjqozscjoak
2. Navigate to SQL Editor
3. Run the migration files manually:
   - Copy content from `supabase/migrations/001_initial_schema.sql`
   - Execute in SQL Editor
   - Copy content from `supabase/migrations/002_pdf_designs.sql`
   - Execute in SQL Editor

#### Option B: Set Database Password and Use CLI

1. Get your database password from Supabase dashboard
2. Run: `npx supabase link --project-ref foeeztuuxsjqozscjoak --password YOUR_PASSWORD`
3. Run: `npx supabase db push`

### 2. Verify Setup

After running migrations, test the setup:

```bash
npm run debug:supabase
```

You should see:

- ✅ Database tables found
- ✅ Service role access working
- ✅ Authentication configured properly

## Common Issues & Solutions

### Issue: "relation does not exist" errors

**Solution**: Database tables haven't been created yet. Run migrations as described above.

### Issue: Authentication not working

**Possible causes**:

- Email confirmations required but not set up
- Redirect URLs not configured
- RLS policies too restrictive

**Debug with**: `npm run debug:auth`

### Issue: Admin access denied

**Possible causes**:

- Service role key incorrect
- RLS policies blocking admin access
- Admin-specific tables missing

**Debug with**: `npm run debug:users`

### Issue: RLS policies not working

**Check**:

- Policies exist for each table
- Policies allow appropriate access
- Service role bypasses RLS

**Debug with**: `npm run debug:rls`

## CLI Commands Reference

### Project Management

```bash
npx supabase projects list              # List all projects
npx supabase link --project-ref ID      # Link to project
npx supabase unlink                     # Unlink current project
```

### Database Operations

```bash
npx supabase db push                    # Push migrations to remote
npx supabase db pull                    # Pull schema from remote
npx supabase db reset                   # Reset local database
npx supabase db diff                    # Show schema differences
```

### Type Generation

```bash
npx supabase gen types typescript --project-id foeeztuuxsjqozscjoak
```

### Authentication

```bash
npx supabase auth users list            # List users (requires link)
npx supabase auth update               # Update auth config
```

## Environment Variables

Make sure these are set in your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://foeeztuuxsjqozscjoak.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Quick Health Check

Run this command to get a quick overview:

```bash
npm run debug:supabase
```

Look for:

- ✅ Connection established
- ✅ Tables found
- ✅ Service role working
- ✅ Authentication configured

## Dashboard Links

- **Project Dashboard**: https://supabase.com/dashboard/project/foeeztuuxsjqozscjoak
- **SQL Editor**: https://supabase.com/dashboard/project/foeeztuuxsjqozscjoak/sql
- **Authentication**: https://supabase.com/dashboard/project/foeeztuuxsjqozscjoak/auth/users
- **Database**: https://supabase.com/dashboard/project/foeeztuuxsjqozscjoak/database/tables

## Support

If you encounter issues:

1. Run `npm run debug:supabase` first
2. Check the output for specific error messages
3. Refer to the solutions above
4. Check Supabase dashboard logs for additional details
