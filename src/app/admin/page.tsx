/**
 * Admin page
 * Event management dashboard for authenticated users
 */
import { redirect } from 'next/navigation';
import { requireAuth } from '@/utils/auth';
import AdminDashboard from './AdminDashboard';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Require authentication
  await requireAuth();

  return <AdminDashboard />;
}
