import { createClient } from '@supabase/supabase-js';

const globalProcess = typeof globalThis !== 'undefined' ? (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process : undefined;
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (globalProcess?.env || {});
const rawUrl = ((env.VITE_SUPABASE_URL as string) || '').trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = ((env.VITE_SUPABASE_ANON_KEY as string) || '').trim();

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
