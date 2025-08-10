'use client';

import { usePathname } from 'next/navigation';
import ConditionalHeader from './Header';
import CafeHeader from './CafeHeader';

export default function HeaderConditional() {
  const pathname = usePathname();

  // Rutas donde NO quieres mostrar el header
  const rutasSinHeader = ['/login', '/registro', '/paneldecontrol', '/sesion-activa' ];

  // Rutas específicas para el header de café
  const rutasCafe = ['/cafe', '/cafeproductos'];

  if (rutasSinHeader.includes(pathname)) return null;

  if (rutasCafe.includes(pathname)) {
    return <CafeHeader />;
  }

  return <ConditionalHeader />;
}
