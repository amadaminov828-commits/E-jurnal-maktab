import { checkAdminSession } from '@/lib/serverAuth';
import { redirect } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  const user = checkAdminSession();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="dashboard-layout">
      <AdminSidebar user={user} />
      <main className="main-content animate-slide">
        {children}
      </main>
    </div>
  );
}
