"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCarrito } from '../components/CarritoContext';
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

export default function Checkout() {
  const router = useRouter();
  const { carrito, total } = useCarrito();
  const [isLoading, setIsLoading] = useState(true);
  const { cargandoPago, handlePagar } = useMercadoPago();

  const mpPublicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

  useEffect(() => {
    if (carrito.length === 0) {
      router.push('/productos');
    } else {
      setIsLoading(false);
    }
  }, [carrito, router]);

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
        </div>
      </div>
    </>
  );
}
