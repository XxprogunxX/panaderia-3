import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

// Definimos la interfaz para los ítems que Mercado Pago espera
interface MercadoPagoItem {
  title: string;
  quantity: number;
  unit_price: number;
}

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

/**
 * Hook personalizado para manejar la lógica de pago con Mercado Pago.
 * @returns Un objeto con el estado de carga y la función para iniciar el pago.
 */
export function useMercadoPago() {
  const [cargandoPago, setCargandoPago] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  /**
   * Crea un nuevo pedido en Firestore
   */
  const crearPedido = async (items: MercadoPagoItem[], datosEnvio: DatosEnvio) => {
    try {
      const total = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
      
      const pedidoData = {
        productos: items.map(item => ({
          nombre: item.title,
          cantidad: item.quantity,
          precio: item.unit_price
        })),
        total,
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString(),
        datosEnvio,
      };

      const docRef = await addDoc(collection(db, "pedidos"), pedidoData);
      return docRef.id;
    } catch (error) {
      console.error("Error al crear el pedido:", error);
      throw error;
    }
  };

  /**
   * Inicia el proceso de pago con Mercado Pago.
   * @param items Los ítems del carrito a enviar a Mercado Pago.
   * @param datosEnvio Los datos de envío del cliente.
   */
  const handlePagar = async (items: MercadoPagoItem[], datosEnvio: DatosEnvio) => {
    if (items.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    setCargandoPago(true);

    try {
      // Primero creamos el pedido en Firestore
      const pedidoId = await crearPedido(items, datosEnvio);

      // Luego iniciamos el proceso de pago con Mercado Pago
      const respuesta = await fetch("http://localhost:5000/create_preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          items,
          pedidoId, // Enviamos el ID del pedido para referencia
          datosEnvio // Enviamos los datos de envío al backend
        }),
      });

      const data = await respuesta.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("Error al generar el pago");
      }
    } catch (error) {
      console.error("Error en pago:", error);
      alert("Error al procesar el pago. Por favor, intenta nuevamente.");
    } finally {
      setCargandoPago(false);
    }
  };

  const toggleFormulario = () => {
    setMostrarFormulario(!mostrarFormulario);
  };

  return {
    cargandoPago,
    handlePagar,
    mostrarFormulario,
    toggleFormulario
  };
}