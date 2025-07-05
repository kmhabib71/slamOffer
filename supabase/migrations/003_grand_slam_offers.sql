-- Create grand_slam_offers table for storing generated offers
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
-- Users can only see their own offers
CREATE POLICY "Users can view their own offers" ON grand_slam_offers
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own offers
CREATE POLICY "Users can insert their own offers" ON grand_slam_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own offers
CREATE POLICY "Users can update their own offers" ON grand_slam_offers
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own offers
CREATE POLICY "Users can delete their own offers" ON grand_slam_offers
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_grand_slam_offers_updated_at
  BEFORE UPDATE ON grand_slam_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON grand_slam_offers TO authenticated;
GRANT ALL ON grand_slam_offers TO service_role;
