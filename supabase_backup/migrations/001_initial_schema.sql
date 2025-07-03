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