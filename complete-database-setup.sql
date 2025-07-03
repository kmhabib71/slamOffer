-- Grand Slam Generator - Complete Database Setup
-- Apply this in your Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/foeeztuuxsjqozscjoak/sql

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'one_time', 'pro');
CREATE TYPE offer_status AS ENUM ('draft', 'completed', 'archived');

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    subscription_tier subscription_tier DEFAULT 'free',
    credits_remaining INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers table
CREATE TABLE public.offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    status offer_status DEFAULT 'draft',
    input_data JSONB NOT NULL,
    generated_content JSONB,
    overall_score INTEGER DEFAULT 0,
    sections JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_name TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User generations tracking (for rate limiting)
CREATE TABLE public.user_generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
    generation_type TEXT NOT NULL, -- 'full', 'section', 'regenerate'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shares tracking (for share-to-unlock feature)
CREATE TABLE public.shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- 'twitter', 'linkedin', 'facebook'
    shared_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_offers_user_id ON public.offers(user_id);
CREATE INDEX idx_offers_created_at ON public.offers(created_at DESC);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_user_generations_user_id ON public.user_generations(user_id);
CREATE INDEX idx_shares_user_id ON public.shares(user_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Users can manage their own offers
CREATE POLICY "Users can view own offers" ON public.offers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create offers" ON public.offers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own offers" ON public.offers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own offers" ON public.offers
    FOR DELETE USING (auth.uid() = user_id);

-- Analytics events - users can create and view their own
CREATE POLICY "Users can create analytics events" ON public.analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own analytics events" ON public.analytics_events
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- User generations - users can view and create their own
CREATE POLICY "Users can view own generations" ON public.user_generations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create generations" ON public.user_generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Shares - users can manage their own shares
CREATE POLICY "Users can view own shares" ON public.shares
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create shares" ON public.shares
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
    BEFORE UPDATE ON public.offers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check user generation limits
CREATE OR REPLACE FUNCTION public.can_user_generate(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_tier subscription_tier;
    user_credits INTEGER;
    generations_today INTEGER;
BEGIN
    -- Get user subscription tier and credits
    SELECT subscription_tier, credits_remaining 
    INTO user_tier, user_credits
    FROM public.users 
    WHERE id = user_uuid;

    -- Count generations today
    SELECT COUNT(*)
    INTO generations_today
    FROM public.user_generations
    WHERE user_id = user_uuid 
    AND created_at >= CURRENT_DATE;

    -- Check limits based on tier
    CASE user_tier
        WHEN 'free' THEN
            RETURN user_credits > 0;
        WHEN 'one_time' THEN
            RETURN TRUE; -- Unlimited for one-time purchase
        WHEN 'pro' THEN
            RETURN TRUE; -- Unlimited for pro users
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 

-- ============================================================================
-- NEXT MIGRATION
-- ============================================================================

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

-- ============================================================================
-- NEXT MIGRATION
-- ============================================================================

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

-- Create default PDF templates
INSERT INTO public.pdf_design_templates (name, description, category, status, is_default) VALUES
  ('Modern Business', 'Clean and professional business template', 'business', 'published', true),
  ('Minimal Clean', 'Simple and elegant minimal design', 'minimal', 'published', false),
  ('Corporate Professional', 'Traditional corporate styling', 'corporate', 'published', false),
  ('Creative Bold', 'Eye-catching creative design', 'creative', 'published', false)
ON CONFLICT DO NOTHING;

-- Create default styles for templates
INSERT INTO public.pdf_design_styles (template_id, styles) 
SELECT id, '{
  "colors": {
    "primary": "#2563eb",
    "secondary": "#64748b",
    "accent": "#3b82f6",
    "text": "#1e293b",
    "background": "#ffffff"
  },
  "fonts": {
    "heading": "Inter",
    "body": "Inter",
    "sizes": {
      "h1": "24px",
      "h2": "20px",
      "h3": "18px",
      "body": "14px"
    }
  },
  "spacing": {
    "margin": "20px",
    "padding": "16px"
  },
  "layout": {
    "pageSize": "A4",
    "orientation": "portrait"
  }
}' FROM public.pdf_design_templates
WHERE NOT EXISTS (SELECT 1 FROM public.pdf_design_styles WHERE template_id = public.pdf_design_templates.id);

-- Verify setup
SELECT 'Database setup complete!' as status;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';
