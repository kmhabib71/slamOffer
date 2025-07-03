-- TEMPORARY FIX: DISABLE RLS ON ADMIN_USERS TABLE
-- This will allow admin access without RLS policy issues
-- Apply this in your Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/foeeztuuxsjqozscjoak/sql

-- Step 1: Drop ALL existing policies
DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Users can view own admin record" ON public.admin_users;
DROP POLICY IF EXISTS "Service role can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Service role full access" ON public.admin_users;
DROP POLICY IF EXISTS "Check admin status" ON public.admin_users;
DROP POLICY IF EXISTS "Simple admin check" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can view admin records" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update admin records" ON public.admin_users;
DROP POLICY IF EXISTS "Users can create their own admin record" ON public.admin_users;

-- Step 2: COMPLETELY DISABLE RLS on admin_users table
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify the admin user exists
SELECT '✅ Admin user verification:' as status;
SELECT 
    au.id,
    au.user_id,
    au.role,
    au.created_at,
    u.email
FROM public.admin_users au
JOIN public.users u ON au.user_id = u.id
WHERE u.email = 'km.habibs@gmail.com';

-- Step 4: Test direct access (should work now)
SELECT '✅ Testing direct admin access:' as status;
SELECT * FROM public.admin_users WHERE user_id = 'cdb9f670-e43d-4f8f-8f24-e3c0167f8dbb';

-- Step 5: Show table status
SELECT '✅ Table RLS status:' as status;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'admin_users';

SELECT '🎉 RLS DISABLED! Admin access should work now.' as final_status;
SELECT '⚠️  Note: This is a temporary fix. RLS can be re-enabled later with proper policies.' as note; 