-- Add unique constraint to prevent multiple categorization rule sets per user
ALTER TABLE categorization_rules 
ADD CONSTRAINT unique_user_categorization_rules 
UNIQUE (user_id);