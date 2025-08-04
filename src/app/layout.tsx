import './globals.css';
import './home.module.css';
import './styles.css';
import { ReactNode } from 'react';
import HeaderConditional from './components/HeaderConditional';
import { CarritoProvider } from './components/CarritoContext';
import { AuthProvider } from './components/AuthContext';

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
      <body>
        <AuthProvider>
          <CarritoProvider>
            <HeaderConditional />
            {children}
          </CarritoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
