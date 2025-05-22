// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Panadería El Pan de Cada Día',
  description: 'Horneamos con amor y tradición',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
  <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
     );
}
