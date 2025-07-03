-- Admin Panel Database Setup Script
-- Run this in your Supabase SQL editor or database console

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    CONSTRAINT unique_user_admin UNIQUE(user_id)
);

-- Create pdf_design_templates table
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

-- Create pdf_design_styles table
CREATE TABLE IF NOT EXISTS public.pdf_design_styles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES public.pdf_design_templates(id) ON DELETE CASCADE,
    styles JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    CONSTRAINT unique_template_style UNIQUE(template_id)
);

-- Create pdf_design_components table
CREATE TABLE IF NOT EXISTS public.pdf_design_components (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES public.pdf_design_templates(id) ON DELETE CASCADE,
    component_type TEXT NOT NULL,
    component_config JSONB NOT NULL DEFAULT '{}',
    position INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    CONSTRAINT valid_component_type CHECK (component_type IN ('header', 'footer', 'body', 'sidebar', 'watermark', 'signature'))
);

-- Create user_pdf_selections table
CREATE TABLE IF NOT EXISTS public.user_pdf_selections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.pdf_design_templates(id) ON DELETE CASCADE,
    offer_id TEXT,
    selected_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    CONSTRAINT unique_user_offer_selection UNIQUE(user_id, offer_id)
);

-- Create template_usage_analytics table
CREATE TABLE IF NOT EXISTS public.template_usage_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES public.pdf_design_templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    CONSTRAINT valid_action CHECK (action IN ('view', 'select', 'download', 'preview'))
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_design_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_design_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_design_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pdf_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_usage_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_users
CREATE POLICY "Admin users can view all admin users" ON public.admin_users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Super admins can manage admin users" ON public.admin_users FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() AND role = 'super_admin'
    )
);

-- Create RLS policies for pdf_design_templates
CREATE POLICY "Everyone can view published templates" ON public.pdf_design_templates FOR SELECT USING (
    status = 'published'
);

CREATE POLICY "Admins can manage all templates" ON public.pdf_design_templates FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid()
    )
);

-- Create RLS policies for pdf_design_styles
CREATE POLICY "Everyone can view published template styles" ON public.pdf_design_styles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.pdf_design_templates 
        WHERE id = template_id AND status = 'published'
    )
);

CREATE POLICY "Admins can manage all styles" ON public.pdf_design_styles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid()
    )
);

-- Create RLS policies for pdf_design_components
CREATE POLICY "Everyone can view published template components" ON public.pdf_design_components FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.pdf_design_templates 
        WHERE id = template_id AND status = 'published'
    )
);

CREATE POLICY "Admins can manage all components" ON public.pdf_design_components FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid()
    )
);

-- Create RLS policies for user_pdf_selections
CREATE POLICY "Users can view their own selections" ON public.user_pdf_selections FOR SELECT USING (
    auth.uid() = user_id
);

CREATE POLICY "Users can manage their own selections" ON public.user_pdf_selections FOR ALL USING (
    auth.uid() = user_id
);

CREATE POLICY "Admins can view all selections" ON public.user_pdf_selections FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid()
    )
);

-- Create RLS policies for template_usage_analytics
CREATE POLICY "Admins can view all analytics" ON public.template_usage_analytics FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Anyone can insert analytics" ON public.template_usage_analytics FOR INSERT WITH CHECK (true);

-- Create database functions
CREATE OR REPLACE FUNCTION public.get_template_with_styles(template_id UUID)
RETURNS TABLE(
    id UUID,
    name TEXT,
    description TEXT,
    category TEXT,
    thumbnail_url TEXT,
    preview_url TEXT,
    status TEXT,
    is_default BOOLEAN,
    sort_order INTEGER,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    styles JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.description,
        t.category,
        t.thumbnail_url,
        t.preview_url,
        t.status,
        t.is_default,
        t.sort_order,
        t.created_by,
        t.created_at,
        t.updated_at,
        COALESCE(s.styles, '{}'::jsonb) as styles
    FROM public.pdf_design_templates t
    LEFT JOIN public.pdf_design_styles s ON t.id = s.template_id
    WHERE t.id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_template_selection(user_id UUID, offer_id TEXT)
RETURNS TABLE(
    template_id UUID,
    template_name TEXT,
    template_category TEXT,
    styles JSONB,
    selected_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as template_id,
        t.name as template_name,
        t.category as template_category,
        COALESCE(s.styles, '{}'::jsonb) as styles,
        ups.selected_at
    FROM public.user_pdf_selections ups
    JOIN public.pdf_design_templates t ON ups.template_id = t.id
    LEFT JOIN public.pdf_design_styles s ON t.id = s.template_id
    WHERE ups.user_id = user_id AND ups.offer_id = offer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_template_usage(
    template_id UUID,
    user_id UUID,
    action TEXT,
    metadata JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.template_usage_analytics (template_id, user_id, action, metadata)
    VALUES (template_id, user_id, action, metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.pdf_design_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.pdf_design_styles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.pdf_design_components
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default template categories data
INSERT INTO public.pdf_design_templates (name, description, category, status, is_default, sort_order)
VALUES 
    ('Modern Business', 'Professional and clean design perfect for business offers', 'business', 'published', true, 1),
    ('Minimalist', 'Clean and simple design with focus on content', 'minimal', 'published', false, 2),
    ('Corporate Elite', 'Sophisticated and formal design for enterprise proposals', 'corporate', 'published', false, 3),
    ('Creative Bold', 'Bold and artistic design for creative agencies', 'creative', 'published', false, 4),
    ('Technical Pro', 'Structured and detailed design for technical documentation', 'technical', 'published', false, 5),
    ('Luxury Premium', 'Premium and elegant design for high-end services', 'luxury', 'published', false, 6)
ON CONFLICT DO NOTHING;

-- Insert default styles for each template
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
        WHEN t.category = 'corporate' THEN '{
            "colors": {"primary": "#1E3A8A", "secondary": "#374151", "accent": "#FCD34D", "background": "#F8FAFC", "text": "#0F172A", "muted": "#64748B"},
            "fonts": {"primary": "Helvetica", "secondary": "Helvetica-Bold", "size": {"small": 9, "medium": 11, "large": 14, "xl": 18, "xxl": 22}},
            "spacing": {"xs": 4, "sm": 8, "md": 16, "lg": 20, "xl": 28},
            "borders": {"width": 2, "radius": 4, "color": "#CBD5E1"}
        }'::jsonb
        WHEN t.category = 'creative' THEN '{
            "colors": {"primary": "#EC4899", "secondary": "#8B5CF6", "accent": "#F59E0B", "background": "#FEF7FF", "text": "#1F2937", "muted": "#6B7280"},
            "fonts": {"primary": "Helvetica", "secondary": "Helvetica-Bold", "size": {"small": 11, "medium": 13, "large": 17, "xl": 22, "xxl": 28}},
            "spacing": {"xs": 6, "sm": 12, "md": 20, "lg": 28, "xl": 40},
            "borders": {"width": 3, "radius": 12, "color": "#F3E8FF"}
        }'::jsonb
        WHEN t.category = 'technical' THEN '{
            "colors": {"primary": "#059669", "secondary": "#374151", "accent": "#10B981", "background": "#F0FDF4", "text": "#0F172A", "muted": "#6B7280"},
            "fonts": {"primary": "Helvetica", "secondary": "Helvetica-Bold", "size": {"small": 9, "medium": 11, "large": 14, "xl": 17, "xxl": 20}},
            "spacing": {"xs": 4, "sm": 8, "md": 14, "lg": 20, "xl": 28},
            "borders": {"width": 1, "radius": 4, "color": "#D1FAE5"}
        }'::jsonb
        WHEN t.category = 'luxury' THEN '{
            "colors": {"primary": "#7C3AED", "secondary": "#1F2937", "accent": "#F59E0B", "background": "#FFFBEB", "text": "#0A0E1A", "muted": "#6B7280"},
            "fonts": {"primary": "Helvetica", "secondary": "Helvetica-Bold", "size": {"small": 11, "medium": 13, "large": 18, "xl": 24, "xxl": 30}},
            "spacing": {"xs": 8, "sm": 16, "md": 24, "lg": 32, "xl": 48},
            "borders": {"width": 2, "radius": 8, "color": "#FEF3C7"}
        }'::jsonb
        ELSE '{
            "colors": {"primary": "#06B6D4", "secondary": "#1F2937", "accent": "#F59E0B", "background": "#FFFFFF", "text": "#0A0E1A", "muted": "#64748B"},
            "fonts": {"primary": "Helvetica", "secondary": "Helvetica-Bold", "size": {"small": 10, "medium": 12, "large": 16, "xl": 20, "xxl": 24}},
            "spacing": {"xs": 4, "sm": 8, "md": 16, "lg": 24, "xl": 32},
            "borders": {"width": 1, "radius": 8, "color": "#E2E8F0"}
        }'::jsonb
    END
FROM public.pdf_design_templates t
WHERE NOT EXISTS (
    SELECT 1 FROM public.pdf_design_styles s WHERE s.template_id = t.id
);

-- Success message
SELECT 'Admin panel database setup completed successfully!' as message; 