import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './src/app/firebaseConfig';
// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('__session')?.value;
  const protectedPaths = ['/paneldecontrol', '/admin'];
  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Si es una ruta protegida y no hay token, redirigir al login
  if (isProtected && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar el token si es una ruta protegida
  if (isProtected && sessionToken) {
    try {
      const verifiedToken = await verifyFirebaseToken(sessionToken);
      if (!verifiedToken) {
        throw new Error('Token inválido');
      }
    } catch (error) {
      console.error('Error de verificación:', error);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'session_expired');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

async function verifyFirebaseToken(token: string) {
  // En producción, implementa esto con Firebase Admin SDK
  // Esto es solo un ejemplo básico
  return { uid: 'user-id', email: 'user@example.com' };
}