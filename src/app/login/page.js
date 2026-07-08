'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Xatolik yuz berdi');
      }

      // Success
      if (data.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/teacher/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-center animate-fade" style={{ minHeight: '100vh', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem', marginBottom: '8px' }}>
            E-<span>Jurnal</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Tizimga kirish</p>
        </div>

        {error && (
          <div 
            style={{ 
              background: 'var(--danger-light)', 
              color: 'var(--danger)', 
              padding: '12px 16px', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.9rem', 
              marginBottom: '20px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="role">Foydalanuvchi roli</label>
            <select
              id="role"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Administrator / Direktor</option>
              <option value="teacher">O'qituvchi</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login">Login</label>
            <input
              id="login"
              type="text"
              className="form-input"
              placeholder="Loginni kiriting"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Parol</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Parolni kiriting"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '16px' }}
            disabled={loading}
          >
            {loading ? 'Kirilmoqda...' : 'Tizimga kirish'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }} className="btn-ghost btn">
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </main>
  );
}
