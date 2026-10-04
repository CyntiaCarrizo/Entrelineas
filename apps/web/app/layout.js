import { Literata, Public_Sans } from 'next/font/google';
import './globals.css';

const literata = Literata({
  variable: '--font-literata',
  subsets: ['latin'],
});

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});

export const metadata = {
  title: {
    default: 'Entrelíneas — Librería de barrio',
    template: '%s · Entrelíneas',
  },
  description: 'Librería de barrio. Mirá qué libros hay, armá tu pedido y envialo por WhatsApp.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR" className={`${literata.variable} ${publicSans.variable} antialiased`}>
      <body className="min-h-screen bg-papel text-tinta">{children}</body>
    </html>
  );
}
