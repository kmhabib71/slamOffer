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
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Allow admins to update admin settings" ON admin_settings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Insert default settings
INSERT INTO admin_settings (id, test_mode)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING; 