/**
 * Supabase client for client-side operations
 * Uses the anon key which is safe to expose in the browser
 * All security is enforced via Row Level Security (RLS) policies
 */
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Provide dummy values during build if env vars are missing
  // This allows the build to complete without errors
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not found. Using placeholder values for build.');
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
