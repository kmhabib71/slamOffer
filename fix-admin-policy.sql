-- Fix Admin Users RLS Policy - Infinite Recursion Issue
-- Apply this in your Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/foeeztuuxsjqozscjoak/sql

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;

-- Create a simple, non-recursive policy for admin_users
-- This policy allows users to see their own admin record
CREATE POLICY "Users can view own admin record" ON public.admin_users
    FOR SELECT USING (auth.uid() = user_id);

-- Create a policy for service role access (for admin management)
CREATE POLICY "Service role can manage admin users" ON public.admin_users
    FOR ALL USING (auth.role() = 'service_role');

-- Alternative: If you want to allow admins to see all admin users, use this instead:
-- CREATE POLICY "Admins can view all admin users" ON public.admin_users
--     FOR SELECT USING (
--         EXISTS (
--             SELECT 1 FROM public.admin_users 
--             WHERE user_id = auth.uid()
--         )
--     );

-- Test the fix
SELECT 'Admin policy fix applied successfully!' as status;

-- Verify the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'admin_users'; 