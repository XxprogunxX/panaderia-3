'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../components/AuthContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseConfig';

function PagoExitosoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    procesarPagoExitoso();
  }, []);

  const procesarPagoExitoso = async () => {
    try {
      // Obtener parámetros de la URL de Mercado Pago
      const paymentId = searchParams.get('payment_id');
      const status = searchParams.get('status');
      const preferenceId = searchParams.get('preference_id');

      console.log('Parámetros de pago:', { paymentId, status, preferenceId });

      if (!paymentId || !status) {
        throw new Error('Información de pago incompleta');
      }

      // Obtener información del pedido guardada
      const pedidoPendiente = localStorage.getItem('pedidoPendiente');
      if (!pedidoPendiente) {
        throw new Error('No se encontró información del pedido');
      }

      const { pedidoId, items, datosEnvio } = JSON.parse(pedidoPendiente);

      // Consultar estado detallado del pago
      const respuestaPago = await fetch(`/api/mercadopago/payment/${paymentId}`);
      if (!respuestaPago.ok) {
        throw new Error('Error al consultar estado del pago');
      }

      const dataPago = await respuestaPago.json();
      console.log('Datos del pago:', dataPago);

      // Actualizar el pedido en Firestore con la información del pago
      const pedidoRef = doc(db, "pedidos", pedidoId);
      await updateDoc(pedidoRef, {
        estado: status === 'approved' ? 'completada' : 'pendiente',
        estadoPago: dataPago.status,
        idPago: paymentId,
        fechaPago: dataPago.date_approved || new Date().toISOString(),
        datosEnvio: datosEnvio
      });

      // Agregar al historial del usuario
      if (user) {
        const userRef = doc(db, "usuarios", user.uid);
        const compraParaHistorial = {
          id: pedidoId,
          fecha: new Date().toISOString(),
          total: items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0),
          productos: items.map((item: any) => ({
            nombre: item.title,
            precio: item.unit_price,
            cantidad: item.quantity
          })),
          estado: status === 'approved' ? 'completada' : 'pendiente',
          estadoPago: dataPago.status,
          idPago: paymentId,
          fechaPago: dataPago.date_approved || new Date().toISOString(),
          direccionEntrega: `${datosEnvio.direccion}, ${datosEnvio.ciudad}, ${datosEnvio.estado}`,
          datosEnvio: datosEnvio
        };

        await updateDoc(userRef, {
          historialCompras: arrayUnion(compraParaHistorial)
        });
      }

      // Limpiar localStorage
      localStorage.removeItem('pedidoPendiente');
      localStorage.removeItem('carritoItems');
      localStorage.removeItem('carritoTotal');
      localStorage.removeItem('carrito');

      setLoading(false);

    } catch (error) {
      console.error('Error al procesar pago exitoso:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setLoading(false);
    }
  };

  const handleContinuar = () => {
    router.push('/');
  };

  const handleVerHistorial = () => {
    router.push('/historial');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ color: '#1f2937', marginBottom: '16px' }}>Procesando tu pago...</h2>
          <p style={{ color: '#6b7280' }}>Estamos confirmando tu transacción con Mercado Pago.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>❌</div>
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>Error en el pago</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={handleContinuar}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✅</div>
        <h2 style={{ color: '#059669', marginBottom: '16px' }}>¡Pago Exitoso!</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Tu pago ha sido procesado correctamente. Recibirás un correo de confirmación pronto.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleContinuar}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Continuar Comprando
          </button>
          
          <button
            onClick={handleVerHistorial}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Ver Historial
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
        <h2 style={{ color: '#1f2937', marginBottom: '16px' }}>Cargando...</h2>
        <p style={{ color: '#6b7280' }}>Preparando la página de confirmación de pago.</p>
      </div>
    </div>
  );
}

export default function PagoExitosoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PagoExitosoContent />
    </Suspense>
  );
} 