'use client';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './LoginButton.module.css';

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

  // Si el usuario está autenticado, mostrar avatar circular
  if (user && !authLoading) {
    const userInitial = user.email?.charAt(0).toUpperCase() || 'U';
    const displayName = user.displayName || user.email?.split('@')[0] || 'Usuario';

    return (
      <div className={styles.avatarContainer}>
        <button 
          onClick={handleClick}
          className={styles.avatarButton}
          title={`${displayName} (${userRole === 'admin' || userRole === 'super_admin' ? 'Administrador' : 'Usuario'})`}
        >
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={displayName}
              width={40}
              height={40}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarInitial}>
              {userInitial}
            </div>
          )}
        </button>
      </div>
    );
  }

  // Si no está autenticado, mostrar el enlace normal
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