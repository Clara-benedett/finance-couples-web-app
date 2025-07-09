
-- Create table for card classification rules
CREATE TABLE public.card_classification_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  card_name TEXT NOT NULL,
  classification TEXT NOT NULL CHECK (classification IN ('person1', 'person2', 'shared')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, card_name)
);

-- Enable Row Level Security
ALTER TABLE public.card_classification_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own card rules" 
  ON public.card_classification_rules 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own card rules" 
  ON public.card_classification_rules 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own card rules" 
  ON public.card_classification_rules 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own card rules" 
  ON public.card_classification_rules 
  FOR DELETE 
  USING (auth.uid() = user_id);
