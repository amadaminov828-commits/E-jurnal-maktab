'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';

export default function AdminSidebar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: "Panel", href: "/admin/dashboard", icon: "📊" },
    { name: "Sinflar", href: "/admin/classes", icon: "🏫" },
    { name: "Fanlar", href: "/admin/subjects", icon: "📚" },
    { name: "O'qituvchilar", href: "/admin/teachers", icon: "👨‍🏫" },
    { name: "O'quvchilar", href: "/admin/students", icon: "🎓" },
    { name: "E'lonlar", href: "/admin/announcements", icon: "📢" },
    { name: "Hisobotlar", href: "/admin/reports", icon: "📄" },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <div className="mobile-header-logo">
          E-<span>Jurnal</span>
        </div>
        <button 
          className="menu-toggle-btn" 
          onClick={toggleMenu}
          aria-label="Menyuni ochish"
        >
          ☰
        </button>
      </header>

      {/* Backdrop Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={closeMenu} 
      />

      {/* Sidebar Drawer */}
      <aside className={`sidebar animate-fade ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div>
            E-<span>Jurnal</span>
          </div>
          <button 
            className="sidebar-close-btn" 
            onClick={closeMenu}
            aria-label="Menyuni yopish"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span>{item.icon}</span> {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
            {user.fullName}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '16px' }}>
            {user.schoolName}
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
