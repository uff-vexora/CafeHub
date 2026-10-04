import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Graceful fallback dummy client if credentials aren't set yet
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://mock-supabase-cafehub.supabase.co', 'mock-anon-key');
