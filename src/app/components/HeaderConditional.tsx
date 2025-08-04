'use client';

import { usePathname } from 'next/navigation';
import ConditionalHeader from './Header';

export default function HeaderConditional() {
  const pathname = usePathname();

  // Rutas donde NO quieres mostrar el header
  const rutasSinHeader = ['/login', '/registro', '/cafe', '/cafeproductos', '/paneldecontrol', '/sesion-activa' ];

  if (rutasSinHeader.includes(pathname)) return null;

  return <ConditionalHeader />;
}
