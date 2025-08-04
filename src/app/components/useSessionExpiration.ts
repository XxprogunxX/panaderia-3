import { useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

export const useSessionExpiration = () => {
  const { user, signOut } = useAuth();
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) {
      // Si no hay usuario, limpiar el timeout
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
      return;
    }

    // Obtener el timestamp del último login desde localStorage
    const lastLoginKey = `lastLogin_${user.uid}`;
    const lastLoginStr = localStorage.getItem(lastLoginKey);
    const lastLogin = lastLoginStr ? parseInt(lastLoginStr) : Date.now();

    // Calcular cuánto tiempo ha pasado desde el último login
    const timeElapsed = Date.now() - lastLogin;
    const timeRemaining = SESSION_DURATION - timeElapsed;

    if (timeRemaining <= 0) {
      // La sesión ya expiró, cerrar sesión
      console.log('⏰ Sesión expirada por tiempo. Cerrando sesión...');
      signOut();
      return;
    }

    // Configurar el timeout para cerrar la sesión cuando expire
    sessionTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Sesión expirada automáticamente después de 7 días');
      signOut();
    }, timeRemaining);

    // Actualizar el timestamp del último login
    localStorage.setItem(lastLoginKey, Date.now().toString());

    // Limpiar el timeout cuando el componente se desmonte o el usuario cambie
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
    };
  }, [user, signOut]);

  // Función para extender la sesión (llamar cuando el usuario interactúa)
  const extendSession = () => {
    if (user) {
      const lastLoginKey = `lastLogin_${user.uid}`;
      localStorage.setItem(lastLoginKey, Date.now().toString());
      
      // Reiniciar el timeout
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      
      sessionTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Sesión expirada automáticamente después de 7 días');
        signOut();
      }, SESSION_DURATION);
    }
  };

  return { extendSession };
}; 