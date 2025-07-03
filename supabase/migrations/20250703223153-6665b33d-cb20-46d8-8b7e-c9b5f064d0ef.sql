-- First, clean up duplicate proportion settings for users
DELETE FROM proportion_settings 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM proportion_settings 
    ORDER BY user_id, updated_at DESC
);

-- Add a unique constraint to prevent duplicate user settings
ALTER TABLE proportion_settings 
ADD CONSTRAINT unique_user_proportion_settings 
UNIQUE (user_id);