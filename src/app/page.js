import Link from 'next/link';

export default function Home() {
  return (
    <main className="animate-fade" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header / Navbar */}
      <header style={{ borderBottom: '1px solid var(--border-color)', padding: '20px 0', background: 'var(--bg-surface)' }}>
        <div className="container flex-between">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem' }}>
            E-Jurnal
          </div>
          <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '8px 20px' }}>
              Kirish
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '80px 0', flex: 1, display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '24px' }}>Yangi Avlod Elektron Jurnali</span>
          <h1 style={{ 
            fontFamily: 'var(--font-display)', 
            fontWeight: 800, 
            fontSize: '3.5rem', 
            lineHeight: 1.2, 
            marginBottom: '24px',
            background: 'linear-gradient(to right, #ffffff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            O'quv markazlari va xususiy maktablar uchun elektron jurnal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '40px', lineHeight: 1.6 }}>
            Qog'oz jurnallardan voz keching. O'qituvchilar davomat va baholarni kiritishlari bilan tizim avtomatik ravishda ota-onalariga Telegram bot orqali xabar beradi.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link href="/login" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '1.05rem' }}>
              Tizimga kirish
            </Link>
            <a href="https://t.me/ejurnal_bot" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '14px 36px', fontSize: '1.05rem' }}>
              Telegram Bot
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '80px 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2.2rem', marginBottom: '16px' }}>
              Tizimning asosiy imkoniyatlari
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              E-Jurnal tizimi o'qituvchi, direktor va ota-onalar orasidagi aloqani to'liq avtomatlashtiradi.
            </p>
          </div>

          <div className="grid-cols-3">
            <div className="card card-glow">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '12px' }}>O'qituvchi Paneli</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Mobil qurilmalarga moslashgan veb-panel orqali o'qituvchilar dars vaqtida tezkorlik bilan davomat va baholarni kirita oladilar.
              </p>
            </div>

            <div className="card card-glow">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '12px' }}>Telegram Bot</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Ota-onalar farzandlarining darsga kelgan-kelmaganligini, olgan baholari va e'lonlarini real vaqt rejimida bot orqali oladilar.
              </p>
            </div>

            <div className="card card-glow">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '12px' }}>Direktor Paneli</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Markaz bo'yicha umumiy statistikalar, o'zlashtirish foizlari va chorak yakunida Excel yoki PDF hisobotlarini bitta tugma orqali yuklab olish imkoniyati.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '30px 0', background: 'var(--bg-app)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <p>&copy; {new Date().getFullYear()} E-Jurnal. Barcha huquqlar himoyalangan.</p>
      </footer>
    </main>
  );
}
