
-- Add card_member and account_number columns to transactions table
ALTER TABLE public.transactions 
ADD COLUMN card_member TEXT,
ADD COLUMN account_number TEXT;

-- Add index for better performance when filtering by card_member
CREATE INDEX IF NOT EXISTS transactions_card_member_idx ON public.transactions(card_member);
