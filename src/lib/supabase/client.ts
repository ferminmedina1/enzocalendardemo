/**
 * Supabase client for client-side operations
 * Uses the anon key which is safe to expose in the browser
 * All security is enforced via Row Level Security (RLS) policies
 */
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
