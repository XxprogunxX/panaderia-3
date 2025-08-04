'use client';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import styles from './LoginButton.module.css';

interface LoginButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function LoginButton({ onClick, children, className }: LoginButtonProps) {
  const { user, userRole, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(!showMenu);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handlePanelControl = () => {
    setShowMenu(false);
    if (onClick) onClick();
    
    if (userRole === 'admin' || userRole === 'super_admin') {
      console.log('🔄 Usuario administrador, redirigiendo a sesión activa');
      router.push('/sesion-activa');
    } else {
      console.log('🔄 Usuario normal, redirigiendo a página principal');
      router.push('/');
    }
  };

  const handleCerrarSesion = async () => {
    setShowMenu(false);
    try {
      await signOut();
      console.log('👋 Sesión cerrada exitosamente');
      router.push('/');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  };

  // Si el usuario está autenticado, mostrar avatar con menú
  if (user && !authLoading) {
    const userInitial = user.email?.charAt(0).toUpperCase() || 'U';
    const displayName = user.displayName || user.email?.split('@')[0] || 'Usuario';

    return (
      <div className={styles.avatarContainer} ref={menuRef}>
        <button 
          onClick={handleAvatarClick}
          className={`${styles.avatarButton} ${showMenu ? styles.active : ''}`}
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

        {/* Menú desplegable */}
        {showMenu && (
          <div className={styles.dropdownMenu} onClick={handleMenuClick}>
            <div className={styles.menuHeader}>
              <div className={styles.menuAvatar}>
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={displayName}
                    width={32}
                    height={32}
                    className={styles.menuAvatarImage}
                  />
                ) : (
                  <div className={styles.menuAvatarInitial}>
                    {userInitial}
                  </div>
                )}
              </div>
              <div className={styles.menuUserInfo}>
                <div className={styles.menuUserName}>{displayName}</div>
                <div className={styles.menuUserEmail}>{user.email}</div>
                <div className={styles.menuUserRole}>
                  {userRole === 'admin' || userRole === 'super_admin' ? 'Administrador' : 'Usuario'}
                </div>
              </div>
            </div>

            <div className={styles.menuDivider}></div>

            <div className={styles.menuOptions}>
              {(userRole === 'admin' || userRole === 'super_admin') && (
                <button 
                  onClick={handlePanelControl}
                  className={styles.menuOption}
                >
                  <span className={styles.menuIcon}>⚙️</span>
                  Panel de Control
                </button>
              )}
              
              <button 
                onClick={handleCerrarSesion}
                className={`${styles.menuOption} ${styles.menuOptionLogout}`}
              >
                <span className={styles.menuIcon}>🚪</span>
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Si no está autenticado, mostrar el enlace normal
  return (
    <Link 
      href="/login" 
      onClick={onClick}
      className={className}
    >
      {children}
    </Link>
  );
} 