"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMercadoPago } from '../components/useMercadopago';
import "../styles.css";
import FormularioEnvio from '../components/FormularioEnvio';
import Script from "next/script";

interface DatosEnvio {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  estado: string;
  instrucciones?: string;
}

interface ItemPago {
  title: string;
  quantity: number;
  unit_price: number;
}

interface ItemCarrito {
  nombre: string;
  precio: number;
  cantidad: number;
}

export default function Checkout() {
  const router = useRouter();
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { cargandoPago, handlePagar } = useMercadoPago();

  const mpPublicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

  useEffect(() => {
    // Leer carrito del localStorage
    const carritoItems = localStorage.getItem('carritoItems');
    const carritoTotal = localStorage.getItem('carritoTotal');
    
    if (carritoItems && carritoTotal) {
      const items = JSON.parse(carritoItems);
      setCarrito(items);
      setTotal(parseFloat(carritoTotal));
      setIsLoading(false);
    } else {
      // Si no hay carrito, redirigir a productos
      router.push('/productos');
    }
  }, [router]);

  const handleSubmit = async (datosEnvio: DatosEnvio) => {
    const itemsParaPago: ItemPago[] = carrito.map(({ nombre, cantidad, precio }) => ({
      title: nombre,
      quantity: cantidad,
      unit_price: precio,
    }));
    await handlePagar(itemsParaPago, datosEnvio);
  };

  if (isLoading) {
    return (
      <div className="checkout-container">
        <div className="checkout-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {mpPublicKey && (
        <Script
          src="https://sdk.mercadopago.com/js/v2"
          strategy="afterInteractive"
          onLoad={() => {
            if (window.MercadoPago) {
              window.mercadoPagoInstance = new window.MercadoPago(mpPublicKey, { locale: "es-MX" });
            }
          }}
        />
      )}
      <div className="checkout-container">
        <div className="checkout-content">
          <h1>Finalizar Compra</h1>

          <div className="resumen-pedido">
            <h2>Resumen del Pedido</h2>
            <ul>
              {carrito.map(({ nombre, precio, cantidad }) => (
                <li key={nombre} className="resumen-item">
                  <span>{nombre} x {cantidad}</span>
                  <span>${precio * cantidad} MXN</span>
                </li>
              ))}
            </ul>
            <div className="total-checkout">
              <strong>Total: </strong>${total} MXN
            </div>
          </div>

          <h2>Datos de Envío</h2>
          <FormularioEnvio onSubmit={handleSubmit} isLoading={cargandoPago} />
          
          {/* Botón de pago simulado para testing */}
          <div style={{ marginTop: '20px', padding: '20px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0c4a6e' }}>🛠️ Modo Testing</h3>
            <p style={{ margin: '0 0 15px 0', color: '#0369a1', fontSize: '14px' }}>
              Si el pago normal no funciona, puedes usar este botón para simular un pago exitoso y probar el flujo completo.
            </p>
            <button 
              onClick={async () => {
                const datosEnvio = {
                  nombre: 'Usuario Test',
                  email: 'test@example.com',
                  telefono: '1234567890',
                  direccion: 'Dirección de prueba',
                  codigoPostal: '12345',
                  ciudad: 'Ciudad Test',
                  estado: 'Estado Test'
                };
                await handleSubmit(datosEnvio);
              }}
              style={{
                background: '#0ea5e9',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Simular Pago Exitoso
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
