-- Admin Panel Database Setup Script
-- Copy and paste this into your Supabase SQL editor

-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    CONSTRAINT unique_user_admin UNIQUE(user_id)
);

-- 2. Create pdf_design_templates table
CREATE TABLE IF NOT EXISTS public.pdf_design_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'business',
    thumbnail_url TEXT,
    preview_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    is_default BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    CONSTRAINT valid_category CHECK (category IN ('business', 'minimal', 'corporate', 'creative', 'technical', 'luxury')),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- 3. Create pdf_design_styles table
CREATE TABLE IF NOT EXISTS public.pdf_design_styles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES public.pdf_design_templates(id) ON DELETE CASCADE,
    styles JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    CONSTRAINT unique_template_style UNIQUE(template_id)
);

-- 4. Create user_pdf_selections table
CREATE TABLE IF NOT EXISTS public.user_pdf_selections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.pdf_design_templates(id) ON DELETE CASCADE,
    offer_id TEXT,
    selected_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    CONSTRAINT unique_user_offer_selection UNIQUE(user_id, offer_id)
);

-- 5. Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_design_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_design_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pdf_selections ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for admin_users
CREATE POLICY "Admin users can view all admin users" ON public.admin_users FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Super admins can manage admin users" ON public.admin_users FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- 7. Create policies for templates
CREATE POLICY "Everyone can view published templates" ON public.pdf_design_templates FOR SELECT USING (
    status = 'published'
);

CREATE POLICY "Admins can manage all templates" ON public.pdf_design_templates FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- 8. Create policies for styles
CREATE POLICY "Everyone can view published template styles" ON public.pdf_design_styles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.pdf_design_templates WHERE id = template_id AND status = 'published')
);

CREATE POLICY "Admins can manage all styles" ON public.pdf_design_styles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- 9. Create policies for user selections
CREATE POLICY "Users can view their own selections" ON public.user_pdf_selections FOR SELECT USING (
    auth.uid() = user_id
);

CREATE POLICY "Users can manage their own selections" ON public.user_pdf_selections FOR ALL USING (
    auth.uid() = user_id
);

-- 10. Insert default templates
INSERT INTO public.pdf_design_templates (name, description, category, status, is_default, sort_order)
VALUES 
    ('Modern Business', 'Professional and clean design perfect for business offers', 'business', 'published', true, 1),
    ('Minimalist', 'Clean and simple design with focus on content', 'minimal', 'published', false, 2),
    ('Corporate Elite', 'Sophisticated and formal design for enterprise proposals', 'corporate', 'published', false, 3),
    ('Creative Bold', 'Bold and artistic design for creative agencies', 'creative', 'published', false, 4),
    ('Technical Pro', 'Structured and detailed design for technical documentation', 'technical', 'published', false, 5),
    ('Luxury Premium', 'Premium and elegant design for high-end services', 'luxury', 'published', false, 6)
ON CONFLICT DO NOTHING;

-- 11. Insert default styles
INSERT INTO public.pdf_design_styles (template_id, styles)
SELECT 
    t.id,
    CASE 
        WHEN t.category = 'business' THEN '{
            "colors": {"primary": "#06B6D4", "secondary": "#1F2937", "accent": "#F59E0B", "background": "#FFFFFF", "text": "#0A0E1A", "muted": "#64748B"},
            "fonts": {"primary": "Helvetica", "secondary": "Helvetica-Bold", "size": {"small": 10, "medium": 12, "large": 16, "xl": 20, "xxl": 24}},
            "spacing": {"xs": 4, "sm": 8, "md": 16, "lg": 24, "xl": 32},
            "borders": {"width": 1, "radius": 8, "color": "#E2E8F0"}
        }'::jsonb
        WHEN t.category = 'minimal' THEN '{
            "colors": {"primary": "#000000", "secondary": "#6B7280", "accent": "#E5E7EB", "background": "#FFFFFF", "text": "#111827", "muted": "#9CA3AF"},
            "fonts": {"primary": "Helvetica", "secondary": "Helvetica-Bold", "size": {"small": 10, "medium": 12, "large": 16, "xl": 20, "xxl": 24}},
            "spacing": {"xs": 6, "sm": 12, "md": 24, "lg": 32, "xl": 48},
            "borders": {"width": 0, "radius": 0, "color": "#F3F4F6"}
        }'::jsonb
        ELSE '{
            "colors": {"primary": "#06B6D4", "secondary": "#1F2937", "accent": "#F59E0B", "background": "#FFFFFF", "text": "#0A0E1A", "muted": "#64748B"},
            "fonts": {"primary": "Helvetica", "secondary": "Helvetica-Bold", "size": {"small": 10, "medium": 12, "large": 16, "xl": 20, "xxl": 24}},
            "spacing": {"xs": 4, "sm": 8, "md": 16, "lg": 24, "xl": 32},
            "borders": {"width": 1, "radius": 8, "color": "#E2E8F0"}
        }'::jsonb
    END
FROM public.pdf_design_templates t
WHERE NOT EXISTS (SELECT 1 FROM public.pdf_design_styles s WHERE s.template_id = t.id);

-- Success message
SELECT 'Admin panel database setup completed successfully!' as message; 