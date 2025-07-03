-- SAFE Database Setup for Grand Slam Generator
-- Apply this in your Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/foeeztuuxsjqozscjoak/sql
-- This script is safe to run multiple times

-- Create missing custom types (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('free', 'one_time', 'pro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE offer_status AS ENUM ('draft', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pdf_design_category AS ENUM ('business', 'minimal', 'corporate', 'creative', 'technical', 'luxury');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pdf_design_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create missing tables (only if they don't exist)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    subscription_tier subscription_tier DEFAULT 'free',
    credits_remaining INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offers (
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

CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_name TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
    generation_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    shared_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing pdf_design_templates table safely
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    BEGIN
        ALTER TABLE public.pdf_design_templates ADD COLUMN category pdf_design_category DEFAULT 'business';
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE public.pdf_design_templates ADD COLUMN status pdf_design_status DEFAULT 'draft';
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE public.pdf_design_templates ADD COLUMN is_default BOOLEAN DEFAULT FALSE;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
END $$;

-- Create other PDF-related tables
CREATE TABLE IF NOT EXISTS public.pdf_design_styles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES public.pdf_design_templates(id) ON DELETE CASCADE NOT NULL,
    styles JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pdf_design_components (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES public.pdf_design_templates(id) ON DELETE CASCADE NOT NULL,
    component_type TEXT NOT NULL,
    component_name TEXT NOT NULL,
    component_config JSONB NOT NULL DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_pdf_selections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.pdf_design_templates(id) ON DELETE CASCADE NOT NULL,
    offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
    selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints safely
DO $$ 
BEGIN
    ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.admin_users ADD CONSTRAINT unique_admin_user UNIQUE(user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_design_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_design_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_design_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pdf_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies safely
DO $$ BEGIN
    CREATE POLICY "Users can view own profile" ON public.users
        FOR SELECT USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own profile" ON public.users
        FOR UPDATE USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can view own offers" ON public.offers
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create offers" ON public.offers
        FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own offers" ON public.offers
        FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete own offers" ON public.offers
        FOR DELETE USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Anyone can view published templates" ON public.pdf_design_templates
        FOR SELECT USING (status = 'published');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can manage all templates" ON public.pdf_design_templates
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.admin_users 
                WHERE user_id = auth.uid()
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can view all admin users" ON public.admin_users
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.admin_users 
                WHERE user_id = auth.uid()
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
CREATE TRIGGER update_offers_updated_at
    BEFORE UPDATE ON public.offers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pdf_design_templates_updated_at ON public.pdf_design_templates;
CREATE TRIGGER update_pdf_design_templates_updated_at
    BEFORE UPDATE ON public.pdf_design_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates safely (without ON CONFLICT)
DO $$
BEGIN
    -- Only insert if no templates exist
    IF NOT EXISTS (SELECT 1 FROM public.pdf_design_templates LIMIT 1) THEN
        INSERT INTO public.pdf_design_templates (name, description, category, status, is_default) VALUES
          ('Modern Business', 'Clean and professional business template', 'business', 'published', true),
          ('Minimal Clean', 'Simple and elegant minimal design', 'minimal', 'published', false),
          ('Corporate Professional', 'Traditional corporate styling', 'corporate', 'published', false),
          ('Creative Bold', 'Eye-catching creative design', 'creative', 'published', false);
    END IF;
END $$;

-- Create default styles safely
DO $$
BEGIN
    INSERT INTO public.pdf_design_styles (template_id, styles) 
    SELECT t.id, '{
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
    }'::jsonb
    FROM public.pdf_design_templates t
    WHERE NOT EXISTS (SELECT 1 FROM public.pdf_design_styles s WHERE s.template_id = t.id);
END $$;

-- Final verification
SELECT 'SAFE database setup complete!' as status;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';
SELECT COUNT(*) as template_count FROM public.pdf_design_templates;
SELECT COUNT(*) as admin_count FROM public.admin_users;

-- Show what was created
SELECT 
    'Tables created: ' || COUNT(*) as info
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'offers', 'admin_users', 'pdf_design_templates', 'pdf_design_styles'); 