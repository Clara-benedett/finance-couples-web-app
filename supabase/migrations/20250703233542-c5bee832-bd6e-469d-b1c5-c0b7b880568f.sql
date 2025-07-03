-- Add shared_name column to profiles table to allow custom shared expense names
ALTER TABLE public.profiles 
ADD COLUMN shared_name text DEFAULT 'Shared';

-- Update existing profiles to have the default shared name
UPDATE public.profiles 
SET shared_name = 'Shared' 
WHERE shared_name IS NULL;