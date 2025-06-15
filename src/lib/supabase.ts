
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lenyovyegrjcegiucnex.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlbnlvdnllZ3JqY2VnaXVjbmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NzA5MTAsImV4cCI6MjA2NTU0NjkxMH0.WB6t2CnXTbJGNq1Mtg7_2NLSFK17UyDJ_r8P7DmgnFM";

// Supabase is always configured in Lovable
export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
