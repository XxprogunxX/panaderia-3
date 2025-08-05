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

  // Detectar si es móvil
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Cerrar menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    // Agregar listeners para mouse y touch
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Cerrar menú al hacer scroll en móvil
  useEffect(() => {
    if (isMobile && showMenu) {
      const handleScroll = () => {
        setShowMenu(false);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isMobile, showMenu]);

  const handleAvatarClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handlePanelControl = () => {
    setShowMenu(false);
    if (onClick) onClick();
    
    if (userRole === 'admin' || userRole === 'super_admin') {
      router.push('/sesion-activa');
    } else {
      router.push('/');
    }
  };

  const handleCerrarSesion = async () => {
    setShowMenu(false);
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  };

  const handleEditarPerfil = () => {
    setShowMenu(false);
    router.push('/perfil');
  };

  const handleHistorialCompras = () => {
    setShowMenu(false);
    router.push('/historial');
  };

  const handleDireccionesGuardadas = () => {
    setShowMenu(false);
    router.push('/direcciones');
  };



  // Si el usuario está autenticado, mostrar avatar con menú
  if (user && !authLoading) {
    const userInitial = user.email?.charAt(0).toUpperCase() || 'U';
    const displayName = user.displayName || user.email?.split('@')[0] || 'Usuario';

    return (
      <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
        <button 
          onClick={handleAvatarClick}
          onTouchEnd={handleAvatarClick}
          className={`${styles.avatarButton} ${showMenu ? styles.active : ''}`}
          title={`${displayName} (${userRole === 'admin' || userRole === 'super_admin' ? 'Administrador' : 'Usuario'})`}
          aria-label={`Menú de ${displayName}`}
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
          <>
            {/* Overlay para móviles */}
            {isMobile && (
              <div 
                className={styles.menuOverlay}
                onClick={() => setShowMenu(false)}
                aria-hidden="true"
              />
            )}
            
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
                {/* Solo mostrar opciones de usuario para usuarios normales */}
                {!(userRole === 'admin' || userRole === 'super_admin') && (
                  <>
                    <button 
                      onClick={handleEditarPerfil}
                      className={styles.menuOption}
                      aria-label="Editar perfil"
                    >
                      <span className={styles.menuIcon}>👤</span>
                      Editar Perfil
                    </button>

                    <button 
                      onClick={handleDireccionesGuardadas}
                      className={styles.menuOption}
                      aria-label="Gestionar direcciones"
                    >
                      <span className={styles.menuIcon}>📍</span>
                      Mis Direcciones
                    </button>

                    <button 
                      onClick={handleHistorialCompras}
                      className={styles.menuOption}
                      aria-label="Ver historial de compras"
                    >
                      <span className={styles.menuIcon}>📋</span>
                      Historial de Compras
                    </button>
                  </>
                )}

                {/* Solo mostrar panel de control para administradores */}
                {(userRole === 'admin' || userRole === 'super_admin') && (
                  <button 
                    onClick={handlePanelControl}
                    className={styles.menuOption}
                    aria-label="Ir al panel de control"
                  >
                    <span className={styles.menuIcon}>⚙️</span>
                    Panel de Control
                  </button>
                )}
                
                <button 
                  onClick={handleCerrarSesion}
                  className={`${styles.menuOption} ${styles.menuOptionLogout}`}
                  aria-label="Cerrar sesión"
                >
                  <span className={styles.menuIcon}>🚪</span>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Si no está autenticado, mostrar el enlace normal
  return (
    <>
      <Link 
        href="/login" 
        onClick={onClick}
        className={className}
      >
        {children}
      </Link>


    </>
  );
} 