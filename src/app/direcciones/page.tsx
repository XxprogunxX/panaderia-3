'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DireccionesGuardadas from '../components/DireccionesGuardadas';

interface DireccionGuardada {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  estado: string;
  instrucciones?: string;
  esPredeterminada: boolean;
}

export default function DireccionesPage() {
  const router = useRouter();
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<DireccionGuardada | null>(null);

  const handleSeleccionarDireccion = (direccion: DireccionGuardada) => {
    setDireccionSeleccionada(direccion);
  };

  const handleVolver = () => {
    router.back();
  };

  return (
    <div className="direcciones-page">
      <div className="direcciones-page-header">
        <button 
          onClick={handleVolver}
          className="btn-volver"
          aria-label="Volver"
        >
          ← Volver
        </button>
        <h1>Mis Direcciones Guardadas</h1>
      </div>

      <div className="direcciones-page-content">
        <DireccionesGuardadas
          onSeleccionarDireccion={handleSeleccionarDireccion}
          direccionSeleccionada={direccionSeleccionada}
        />
      </div>

      <style jsx>{`
        .direcciones-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
        }

        .direcciones-page-header {
          max-width: 1200px;
          margin: 0 auto 30px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .btn-volver {
          background: #6b7280;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s;
        }

        .btn-volver:hover {
          background: #4b5563;
        }

        .direcciones-page-header h1 {
          margin: 0;
          color: #1f2937;
          font-size: 2rem;
          font-weight: 600;
        }

        .direcciones-page-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .direcciones-page {
            padding: 15px;
          }

          .direcciones-page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .direcciones-page-header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
} 