"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCarrito } from '../components/usecarrito';
import { useMercadoPago } from '../components/useMercadopago';
import "../styles.css";

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

export default function Checkout() {
  const router = useRouter();
  const { carrito, total } = useCarrito();
  const { cargandoPago, handlePagar } = useMercadoPago();
  const [isLoading, setIsLoading] = useState(true);
  const [datos, setDatos] = useState<DatosEnvio>({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    estado: '',
    instrucciones: ''
  });

  useEffect(() => {
    // Verificar el carrito después de la hidratación
    if (carrito.length === 0) {
      router.push('/productos');
    } else {
      setIsLoading(false);
    }
  }, [carrito, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemsParaPago = carrito.map(({ nombre, cantidad, precio }) => ({
      title: nombre,
      quantity: cantidad,
      unit_price: precio,
    }));
    await handlePagar(itemsParaPago, datos);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDatos(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Mostrar un estado de carga consistente
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

        <form onSubmit={handleSubmit} className="formulario-envio">
          <h2>Datos de Envío</h2>
          
          <div className="form-group">
            <label htmlFor="nombre">Nombre completo *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={datos.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={datos.email}
              onChange={handleChange}
              required
              placeholder="Ej: juan@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono *</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={datos.telefono}
              onChange={handleChange}
              required
              placeholder="Ej: 555-123-4567"
            />
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección de entrega *</label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={datos.direccion}
              onChange={handleChange}
              required
              placeholder="Ej: Calle Principal #123"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="codigoPostal">Código Postal *</label>
              <input
                type="text"
                id="codigoPostal"
                name="codigoPostal"
                value={datos.codigoPostal}
                onChange={handleChange}
                required
                placeholder="Ej: 12345"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ciudad">Ciudad *</label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={datos.ciudad}
                onChange={handleChange}
                required
                placeholder="Ej: Ciudad de México"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="estado">Estado *</label>
            <input
              type="text"
              id="estado"
              name="estado"
              value={datos.estado}
              onChange={handleChange}
              required
              placeholder="Ej: CDMX"
            />
          </div>

          <div className="form-group">
            <label htmlFor="instrucciones">Instrucciones de entrega (opcional)</label>
            <textarea
              id="instrucciones"
              name="instrucciones"
              value={datos.instrucciones}
              onChange={handleChange}
              placeholder="Ej: Tocar el timbre, dejar con el portero, etc."
              rows={3}
            />
          </div>

          <button 
            type="submit" 
            className="btn-continuar"
            disabled={cargandoPago}
          >
            {cargandoPago ? "Procesando..." : "Continuar al pago"}
          </button>
        </form>
      </div>
    </div>
  );
} 