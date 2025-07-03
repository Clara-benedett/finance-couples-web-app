-- Verify database cleanup and constraints

-- Check proportion_settings (should be 1 row per user max)
SELECT 'proportion_settings' as table_name, user_id, COUNT(*) as row_count
FROM proportion_settings 
GROUP BY user_id 
HAVING COUNT(*) > 1

UNION ALL

-- Check categorization_rules (should be 1 row per user max)
SELECT 'categorization_rules' as table_name, user_id, COUNT(*) as row_count
FROM categorization_rules 
GROUP BY user_id 
HAVING COUNT(*) > 1

UNION ALL

-- Check profiles (should be 1 row per user max, id = user_id)
SELECT 'profiles' as table_name, id as user_id, COUNT(*) as row_count
FROM profiles 
GROUP BY id 
HAVING COUNT(*) > 1;

-- Also show current constraint info
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public' 
    AND tc.table_name IN ('proportion_settings', 'categorization_rules', 'profiles')
    AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.table_name;