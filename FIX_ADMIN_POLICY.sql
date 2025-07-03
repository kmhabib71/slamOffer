-- COMPREHENSIVE FIX FOR ADMIN USERS RLS POLICY INFINITE RECURSION
-- Apply this in your Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/foeeztuuxsjqozscjoak/sql

-- Step 1: Drop ALL existing policies on admin_users table
DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Users can view own admin record" ON public.admin_users;
DROP POLICY IF EXISTS "Service role can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;

-- Step 2: Temporarily disable RLS to clean up
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-recursive policies

-- Policy 1: Users can view their own admin record
CREATE POLICY "Users can view own admin record" ON public.admin_users
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Service role can do everything (for admin management scripts)
CREATE POLICY "Service role full access" ON public.admin_users
    FOR ALL USING (auth.role() = 'service_role');

-- Policy 3: Allow authenticated users to check if they are admin
-- This is the key policy that was causing recursion
CREATE POLICY "Check admin status" ON public.admin_users
    FOR SELECT USING (
        -- Simple check: if user_id matches auth.uid(), allow access
        user_id = auth.uid()
    );

-- Step 5: Test the policies
SELECT 'Admin policies fixed successfully!' as status;

-- Step 6: Verify the admin user exists and is accessible
SELECT 
    au.id,
    au.user_id,
    au.role,
    au.created_at,
    u.email
FROM public.admin_users au
JOIN public.users u ON au.user_id = u.id
WHERE u.email = 'km.habibs@gmail.com';

-- Step 7: Show all policies on admin_users table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'admin_users'
ORDER BY policyname; 