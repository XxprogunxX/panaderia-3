'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthContext';
import { useSessionExpiration } from '../components/useSessionExpiration';
import styles from './SesionActiva.module.css';

export default function SesionActiva() {
  const router = useRouter();
  const { user, userRole, loading: authLoading } = useAuth();
  const { extendSession } = useSessionExpiration();
  const [isLoading, setIsLoading] = useState(false);

  // Verificar si el usuario está autenticado
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        console.log('❌ No hay sesión activa, redirigiendo al login');
        router.push('/login');
        return;
      }

      if (userRole !== 'admin' && userRole !== 'super_admin') {
        console.log('❌ Usuario no es administrador, redirigiendo a página principal');
        router.push('/');
        return;
      }

      console.log('✅ Sesión activa verificada para:', user.email);
    }
  }, [user, userRole, authLoading, router]);

  const handleAccederPanel = async () => {
    setIsLoading(true);
    
    try {
      // Extender la sesión al hacer clic
      extendSession();
      
      // Pequeña pausa para mostrar el efecto de carga
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🚀 Accediendo al panel de control');
      router.push('/paneldecontrol');
    } catch (error) {
      console.error('❌ Error al acceder al panel:', error);
      setIsLoading(false);
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingMessage}>
          Verificando sesión...
        </div>
      </div>
    );
  }

  // Si no hay usuario o no es administrador, no mostrar nada (el useEffect se encargará de la redirección)
  if (!user || (userRole !== 'admin' && userRole !== 'super_admin')) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Sesión Activa</h1>
          <p className={styles.subtitle}>
            Bienvenido de vuelta, {user.email}
          </p>
        </div>

        <div className={styles.circleContainer}>
          <button 
            className={`${styles.activeCircle} ${isLoading ? styles.loading : ''}`}
            onClick={handleAccederPanel}
            disabled={isLoading}
            aria-label="Acceder al panel de control"
          >
            <div className={styles.circleInner}>
              <span className={styles.letter}>A</span>
            </div>
            {isLoading && (
              <div className={styles.spinner}>
                <div className={styles.spinnerInner}></div>
              </div>
            )}
          </button>
          
          <p className={styles.clickMessage}>
            {isLoading ? 'Accediendo...' : 'Haz clic para acceder al panel de control'}
          </p>
        </div>

        <div className={styles.info}>
          <p className={styles.sessionInfo}>
            Tu sesión permanecerá activa por 7 días
          </p>
          <p className={styles.roleInfo}>
            Rol: {userRole === 'super_admin' ? 'Super Administrador' : 'Administrador'}
          </p>
        </div>
      </div>
    </div>
  );
} 