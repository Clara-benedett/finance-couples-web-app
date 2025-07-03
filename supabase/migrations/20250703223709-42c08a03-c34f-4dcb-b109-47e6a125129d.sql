-- CRITICAL DATABASE FIX Part 1/3: Clean up duplicates and add unique constraints

-- First, check for and clean up duplicate categorization rules
WITH duplicates AS (
  SELECT user_id, COUNT(*) as rule_count
  FROM categorization_rules 
  GROUP BY user_id 
  HAVING COUNT(*) > 1
)
SELECT * FROM duplicates;

-- Clean up any duplicate categorization rules (keep the latest one per user)
DELETE FROM categorization_rules 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM categorization_rules 
    ORDER BY user_id, updated_at DESC
);