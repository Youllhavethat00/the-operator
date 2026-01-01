/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '') as string;
const supabaseUrl = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`) : '';
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '') as string;

if (!supabaseUrl || !supabaseKey) {
  if (import.meta.env.PROD) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  } else {
    // In development, don't crash the dev server — warn and export a safe stub
    // Consumers should handle lack of auth/data gracefully when running locally
    console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set — Supabase disabled in dev.');
  }
}

const _realClient: SupabaseClient | null = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const supabase: SupabaseClient | Record<string, unknown> = _realClient ?? {
  auth: {
    onAuthStateChange: (_cb?: unknown) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: async () => ({ data: { session: null } }),
    signInWithPassword: async () => ({ error: { message: 'Supabase not configured' } }),
    signUp: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
    signOut: async () => ({ error: null })
  },
  from: (_: string) => ({
    select: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    insert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    upsert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    update: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    delete: async () => ({ data: null, error: { message: 'Supabase not configured' } })
  }),
  channel: (_: string) => ({ on: () => ({}), subscribe: () => ({}), unsubscribe: () => ({}) }),
  removeChannel: () => {}
} as Record<string, unknown>;

export { supabase };
