"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface SessionExpirationWarningProps {
  onExtendSession: () => void;
}

export const SessionExpirationWarning: React.FC<SessionExpirationWarningProps> = ({ onExtendSession }) => {
  const { user } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 días
  const WARNING_THRESHOLD = 60 * 60 * 1000; // 1 hora antes de expirar

  useEffect(() => {
    if (!user) return;

    const checkSessionExpiration = () => {
      const lastLoginKey = `lastLogin_${user.uid}`;
      const lastLoginStr = localStorage.getItem(lastLoginKey);
      
      if (!lastLoginStr) return;

      const lastLogin = parseInt(lastLoginStr);
      const timeElapsed = Date.now() - lastLogin;
      const timeRemaining = SESSION_DURATION - timeElapsed;

      if (timeRemaining <= WARNING_THRESHOLD && timeRemaining > 0) {
        setShowWarning(true);
        setTimeRemaining(timeRemaining);
      } else {
        setShowWarning(false);
      }
    };

    // Verificar cada minuto
    const interval = setInterval(checkSessionExpiration, 60000);
    checkSessionExpiration(); // Verificar inmediatamente

    return () => clearInterval(interval);
  }, [user]);

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} hora${hours > 1 ? 's' : ''} y ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    }
    return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
  };

  const handleExtendSession = () => {
    onExtendSession();
    setShowWarning(false);
  };

  if (!showWarning) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      maxWidth: '350px',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ fontSize: '20px' }}>⏰</div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#856404', fontSize: '16px' }}>
            Sesión por expirar
          </h4>
          <p style={{ margin: '0 0 12px 0', color: '#856404', fontSize: '14px' }}>
            Tu sesión expirará en {formatTimeRemaining(timeRemaining)}.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleExtendSession}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Extender sesión
            </button>
            <button
              onClick={() => setShowWarning(false)}
              style={{
                backgroundColor: 'transparent',
                color: '#856404',
                border: '1px solid #856404',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}; 