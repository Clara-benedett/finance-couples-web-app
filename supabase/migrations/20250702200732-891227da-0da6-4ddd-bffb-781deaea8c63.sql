-- Update profiles table to store personalized category names
-- The columns already exist, but let's add a function to sync category names

-- Create or replace function to update profile names
CREATE OR REPLACE FUNCTION public.update_profile_names(
  p_person1_name TEXT,
  p_person2_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    person1_name = p_person1_name,
    person2_name = p_person2_name,
    updated_at = NOW()
  WHERE id = auth.uid();
  
  RETURN FOUND;
END;
$$;