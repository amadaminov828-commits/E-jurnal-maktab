import { checkTeacherSession } from '@/lib/serverAuth';
import { redirect } from 'next/navigation';
import TeacherSidebar from './TeacherSidebar';

export default function TeacherLayout({ children }) {
  const user = checkTeacherSession();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="dashboard-layout">
      <TeacherSidebar user={user} />
      <main className="main-content animate-slide">
        {children}
      </main>
    </div>
  );
}
