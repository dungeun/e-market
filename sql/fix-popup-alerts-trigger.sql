-- Fix popup_alerts trigger to handle camelCase field names
-- Create a custom trigger function for popup_alerts table that uses "updatedAt" instead of "updated_at"

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS update_popup_alerts_updated_at ON popup_alerts;

-- Create a custom trigger function for popup_alerts table
CREATE OR REPLACE FUNCTION update_popup_alerts_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger for popup_alerts table
CREATE TRIGGER update_popup_alerts_updated_at 
BEFORE UPDATE ON popup_alerts 
FOR EACH ROW EXECUTE FUNCTION update_popup_alerts_updated_at_column();