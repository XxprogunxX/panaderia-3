'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import EditarPerfil from '../components/EditarPerfil';

export default function PerfilPage() {
  const router = useRouter();

  const handleVolver = () => {
    router.back();
  };

  const handleGuardar = () => {
    // Opcional: redirigir después de guardar
    router.push('/');
  };

  return (
    <div className="perfil-page">
      <div className="perfil-page-header">
        <button
          onClick={handleVolver}
          className="btn-volver"
          aria-label="Volver"
        >
          ← Volver
        </button>
        <h1>Editar Mi Perfil</h1>
      </div>

      <div className="perfil-page-content">
        <EditarPerfil 
          onClose={handleVolver}
          onSave={handleGuardar}
        />
      </div>


    </div>
  );
} 