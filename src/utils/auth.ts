/**
 * Server-side auth utilities
 * Use these in server components and server actions
 */
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
