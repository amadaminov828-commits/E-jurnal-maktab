import "./globals.css";

export const metadata = {
  title: "E-Jurnal - Elektron Jurnal va Avtomatik Xabarnomalar",
  description: "Repetitorlik markazlari va xususiy maktablar uchun elektron jurnal tizimi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        {children}
      </body>
    </html>
  );
}
