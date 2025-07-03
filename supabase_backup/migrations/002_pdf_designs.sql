-- PDF Design Management Tables

-- Create enum for PDF design categories
CREATE TYPE pdf_design_category AS ENUM ('business', 'minimal', 'corporate', 'creative', 'technical', 'luxury');
CREATE TYPE pdf_design_status AS ENUM ('draft', 'published', 'archived');

-- PDF Design Templates table
CREATE TABLE public.pdf_design_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category pdf_design_category NOT NULL,
    status pdf_design_status DEFAULT 'draft',
    preview_image TEXT, -- URL to preview image
    is_default BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PDF Design Styles table - stores the actual styling configuration
CREATE TABLE public.pdf_design_styles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES public.pdf_design_templates(id) ON DELETE CASCADE NOT NULL,
    styles JSONB NOT NULL, -- Complete style configuration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PDF Design Components table - for component-level customization
CREATE TABLE public.pdf_design_components (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES public.pdf_design_templates(id) ON DELETE CASCADE NOT NULL,
    component_type TEXT NOT NULL, -- 'header', 'footer', 'cover', 'section', 'table', etc.
    component_name TEXT NOT NULL,
    component_config JSONB NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User PDF Design Selections table - tracks which design users choose
CREATE TABLE public.user_pdf_selections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.pdf_design_templates(id) ON DELETE CASCADE NOT NULL,
    offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
    selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, offer_id)
);

-- Admin users table (for role-based access)
CREATE TABLE public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin', -- 'admin', 'super_admin'
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_pdf_design_templates_category ON public.pdf_design_templates(category);
CREATE INDEX idx_pdf_design_templates_status ON public.pdf_design_templates(status);
CREATE INDEX idx_pdf_design_styles_template_id ON public.pdf_design_styles(template_id);
CREATE INDEX idx_pdf_design_components_template_id ON public.pdf_design_components(template_id);
CREATE INDEX idx_user_pdf_selections_user_id ON public.user_pdf_selections(user_id);
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);

-- Enable Row Level Security
ALTER TABLE public.pdf_design_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_design_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_design_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pdf_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for PDF Design Templates
CREATE POLICY "Anyone can view published templates" ON public.pdf_design_templates
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all templates" ON public.pdf_design_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for PDF Design Styles
CREATE POLICY "Anyone can view published template styles" ON public.pdf_design_styles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pdf_design_templates 
            WHERE id = template_id AND status = 'published'
        )
    );

CREATE POLICY "Admins can manage all styles" ON public.pdf_design_styles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for PDF Design Components
CREATE POLICY "Anyone can view published template components" ON public.pdf_design_components
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pdf_design_templates 
            WHERE id = template_id AND status = 'published'
        )
    );

CREATE POLICY "Admins can manage all components" ON public.pdf_design_components
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for User PDF Selections
CREATE POLICY "Users can view own selections" ON public.user_pdf_selections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create selections" ON public.user_pdf_selections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own selections" ON public.user_pdf_selections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all selections" ON public.user_pdf_selections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for Admin Users
CREATE POLICY "Admins can view all admin users" ON public.admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Super admins can manage admin users" ON public.admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND role = 'super_admin'
        )
    );

-- Apply updated_at triggers
CREATE TRIGGER update_pdf_design_templates_updated_at
    BEFORE UPDATE ON public.pdf_design_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pdf_design_styles_updated_at
    BEFORE UPDATE ON public.pdf_design_styles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pdf_design_components_updated_at
    BEFORE UPDATE ON public.pdf_design_components
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's selected PDF template
CREATE OR REPLACE FUNCTION public.get_user_pdf_template(user_uuid UUID, offer_uuid UUID DEFAULT NULL)
RETURNS TABLE (
    template_id UUID,
    template_name TEXT,
    template_category pdf_design_category,
    styles JSONB,
    components JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.category,
        s.styles,
        COALESCE(
            json_agg(
                json_build_object(
                    'id', c.id,
                    'type', c.component_type,
                    'name', c.component_name,
                    'config', c.component_config,
                    'order', c.order_index
                )
                ORDER BY c.order_index
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::json
        ) as components
    FROM public.pdf_design_templates t
    JOIN public.pdf_design_styles s ON t.id = s.template_id
    LEFT JOIN public.pdf_design_components c ON t.id = c.template_id
    WHERE t.id = (
        SELECT ups.template_id 
        FROM public.user_pdf_selections ups
        WHERE ups.user_id = user_uuid 
        AND (offer_uuid IS NULL OR ups.offer_id = offer_uuid)
        ORDER BY ups.selected_at DESC
        LIMIT 1
    )
    OR (
        -- Fallback to default template if user hasn't selected one
        NOT EXISTS (
            SELECT 1 FROM public.user_pdf_selections ups
            WHERE ups.user_id = user_uuid 
            AND (offer_uuid IS NULL OR ups.offer_id = offer_uuid)
        )
        AND t.is_default = TRUE
    )
    GROUP BY t.id, t.name, t.category, s.styles
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default PDF templates
INSERT INTO public.pdf_design_templates (name, description, category, status, is_default) VALUES
('Modern Business', 'Clean and professional design perfect for business offers', 'business', 'published', true),
('Minimalist', 'Clean and simple design with focus on content', 'minimal', 'published', false),
('Corporate Elite', 'Premium corporate design with sophisticated styling', 'corporate', 'published', false),
('Creative Pro', 'Bold and creative design for innovative offers', 'creative', 'published', false),
('Technical Guide', 'Structured design perfect for technical and detailed offers', 'technical', 'published', false),
('Luxury Premium', 'Elegant and luxurious design for high-end offers', 'luxury', 'published', false);

-- Insert default styles for each template
INSERT INTO public.pdf_design_styles (template_id, styles)
SELECT 
    id,
    CASE 
        WHEN name = 'Modern Business' THEN '{
            "colors": {
                "primary": "#06B6D4",
                "secondary": "#8B5CF6",
                "accent": "#F59E0B",
                "background": "#FFFFFF",
                "text": "#0A0E1A",
                "muted": "#64748B"
            },
            "fonts": {
                "primary": "Helvetica",
                "secondary": "Helvetica-Bold",
                "size": {
                    "small": 10,
                    "medium": 12,
                    "large": 16,
                    "xl": 20,
                    "xxl": 24
                }
            },
            "spacing": {
                "xs": 4,
                "sm": 8,
                "md": 16,
                "lg": 24,
                "xl": 32
            },
            "borders": {
                "width": 1,
                "radius": 8,
                "color": "#E2E8F0"
            }
        }'::jsonb
        WHEN name = 'Minimalist' THEN '{
            "colors": {
                "primary": "#000000",
                "secondary": "#666666",
                "accent": "#000000",
                "background": "#FFFFFF",
                "text": "#000000",
                "muted": "#999999"
            },
            "fonts": {
                "primary": "Helvetica",
                "secondary": "Helvetica-Light",
                "size": {
                    "small": 9,
                    "medium": 11,
                    "large": 14,
                    "xl": 18,
                    "xxl": 22
                }
            },
            "spacing": {
                "xs": 6,
                "sm": 12,
                "md": 20,
                "lg": 28,
                "xl": 36
            },
            "borders": {
                "width": 0.5,
                "radius": 0,
                "color": "#E5E5E5"
            }
        }'::jsonb
        ELSE '{
            "colors": {
                "primary": "#06B6D4",
                "secondary": "#8B5CF6",
                "accent": "#F59E0B",
                "background": "#FFFFFF",
                "text": "#0A0E1A",
                "muted": "#64748B"
            },
            "fonts": {
                "primary": "Helvetica",
                "secondary": "Helvetica-Bold",
                "size": {
                    "small": 10,
                    "medium": 12,
                    "large": 16,
                    "xl": 20,
                    "xxl": 24
                }
            },
            "spacing": {
                "xs": 4,
                "sm": 8,
                "md": 16,
                "lg": 24,
                "xl": 32
            },
            "borders": {
                "width": 1,
                "radius": 8,
                "color": "#E2E8F0"
            }
        }'::jsonb
    END
FROM public.pdf_design_templates; 