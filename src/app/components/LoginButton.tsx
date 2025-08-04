'use client';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LoginButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function LoginButton({ onClick, children, className }: LoginButtonProps) {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }

    // Si el usuario ya está autenticado, redirigir según su rol
    if (user && !authLoading) {
      e.preventDefault();
      
      if (userRole === 'admin' || userRole === 'super_admin') {
        console.log('🔄 Usuario administrador autenticado, redirigiendo a sesión activa');
        router.push('/sesion-activa');
      } else {
        console.log('🔄 Usuario normal autenticado, redirigiendo a página principal');
        router.push('/');
      }
    }
    // Si no está autenticado, el enlace normal funcionará (ir a /login)
  };

  return (
    <Link 
      href="/login" 
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  );
} 