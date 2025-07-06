-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admins to read admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Allow admins to update admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Allow admins to insert admin settings" ON admin_settings;

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    test_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add RLS policies
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only allow admin users to read/write admin settings
CREATE POLICY "Allow admins to read admin settings" ON admin_settings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND (admin_users.role = 'admin' OR admin_users.role = 'super_admin')
        )
    );

CREATE POLICY "Allow admins to update admin settings" ON admin_settings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND (admin_users.role = 'admin' OR admin_users.role = 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND (admin_users.role = 'admin' OR admin_users.role = 'super_admin')
        )
    );

CREATE POLICY "Allow admins to insert admin settings" ON admin_settings
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND (admin_users.role = 'admin' OR admin_users.role = 'super_admin')
        )
    );

-- Insert default settings
INSERT INTO admin_settings (id, test_mode)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;
