-- AGGRESSIVE FIX FOR ADMIN USERS RLS POLICY
-- This will completely reset the admin_users table policies
-- Apply this in your Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/foeeztuuxsjqozscjoak/sql

-- Step 1: COMPLETELY DISABLE RLS on admin_users table
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies on admin_users (if any exist)
DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Users can view own admin record" ON public.admin_users;
DROP POLICY IF EXISTS "Service role can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Service role full access" ON public.admin_users;
DROP POLICY IF EXISTS "Check admin status" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can view admin records" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update admin records" ON public.admin_users;
DROP POLICY IF EXISTS "Users can create their own admin record" ON public.admin_users;

-- Step 3: Verify admin user exists
SELECT 'Current admin users:' as info;
SELECT 
    au.id,
    au.user_id,
    au.role,
    au.created_at,
    u.email
FROM public.admin_users au
JOIN public.users u ON au.user_id = u.id;

-- Step 4: Re-enable RLS with a VERY simple policy
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Step 5: Create ONLY ONE simple policy - no recursion possible
CREATE POLICY "Simple admin check" ON public.admin_users
    FOR SELECT USING (user_id = auth.uid());

-- Step 6: Test the policy
SELECT 'Testing admin policy...' as status;

-- This should work now
SELECT 
    au.id,
    au.user_id,
    au.role
FROM public.admin_users au
WHERE au.user_id = 'cdb9f670-e43d-4f8f-8f24-e3c0167f8dbb';

-- Step 7: Show final policy state
SELECT 'Final policy state:' as info;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'admin_users'
ORDER BY policyname;

SELECT '✅ Admin policy fix complete! RLS is now disabled with simple policy.' as final_status; 