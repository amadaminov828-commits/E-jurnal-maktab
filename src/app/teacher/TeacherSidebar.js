'use client';

import { useState } from 'react';
import LogoutButton from '../admin/LogoutButton';

export default function TeacherSidebar({ user }) {
  const [isOpen, setIsOpen] = useState(false);

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

        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div className="sidebar-item active">
            💼 Ishchi xona
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '16px', borderTop: '1px solid var(--border-color)', marginTop: '20px', lineHeight: '1.6' }}>
            O'qituvchi paneli mobil telefonlarga to'liq moslashgan. Dars jarayonida davomat va baholarni kiritishingiz mumkin.
          </div>
        </div>

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
