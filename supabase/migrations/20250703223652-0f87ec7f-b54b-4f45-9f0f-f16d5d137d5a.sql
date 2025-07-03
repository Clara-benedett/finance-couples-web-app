-- CRITICAL DATABASE FIX Part 1/3: Clean up duplicates and add unique constraints

-- Check for duplicate categorization rules per user
SELECT user_id, COUNT(*) as rule_count
FROM categorization_rules 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Clean up any duplicate categorization rules (keep the latest one per user)
DELETE FROM categorization_rules 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM categorization_rules 
    ORDER BY user_id, updated_at DESC
);

-- Add unique constraint to prevent multiple categorization rule sets per user
ALTER TABLE categorization_rules 
ADD CONSTRAINT IF NOT EXISTS unique_user_categorization_rules 
UNIQUE (user_id);

-- Check for duplicate profiles (there shouldn't be any since id is primary key)
SELECT id, COUNT(*) as profile_count
FROM profiles 
GROUP BY id 
HAVING COUNT(*) > 1;

-- Ensure profiles table has proper constraints (id should already be unique as primary key)
-- No additional constraints needed for profiles since id = user_id and should be 1:1

-- Check for potential duplicate transactions (same user, date, amount, description)
SELECT user_id, date, amount, description, COUNT(*) as transaction_count
FROM transactions 
GROUP BY user_id, date, amount, description 
HAVING COUNT(*) > 1
LIMIT 10;

-- Note: Transactions are allowed to have duplicates (same person, same amount, same day)
-- so we don't add unique constraints there

-- Verify proportion_settings is now clean (should show 1 row per user max)
SELECT user_id, COUNT(*) as settings_count
FROM proportion_settings 
GROUP BY user_id 
HAVING COUNT(*) > 1;