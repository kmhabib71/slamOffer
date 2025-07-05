-- Create grand_slam_offers table for storing generated offers
-- Run this in your Supabase SQL editor if the migration doesn't work automatically

CREATE TABLE IF NOT EXISTS grand_slam_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  business_description TEXT NOT NULL,
  offer_data JSONB NOT NULL,
  total_offer_value TEXT NOT NULL,
  user_tier TEXT NOT NULL CHECK (user_tier IN ('free', 'pro')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grand_slam_offers_user_id ON grand_slam_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_grand_slam_offers_created_at ON grand_slam_offers(created_at);
CREATE INDEX IF NOT EXISTS idx_grand_slam_offers_user_tier ON grand_slam_offers(user_tier);

-- Enable Row Level Security
ALTER TABLE grand_slam_offers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own offers" ON grand_slam_offers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own offers" ON grand_slam_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own offers" ON grand_slam_offers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own offers" ON grand_slam_offers
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON grand_slam_offers TO authenticated;
GRANT ALL ON grand_slam_offers TO service_role;
