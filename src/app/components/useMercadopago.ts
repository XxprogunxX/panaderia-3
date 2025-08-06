import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

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
   * Simula un pago exitoso para testing
   */
  const simularPagoExitoso = async (pedidoId: string) => {
    try {
      // Actualizar el estado del pedido a "completado"
      const pedidoRef = doc(db, "pedidos", pedidoId);
      await updateDoc(pedidoRef, {
        estado: 'completada',
        fechaPago: new Date().toISOString()
      });

      // Limpiar el carrito del localStorage (para compatibilidad)
      localStorage.removeItem('carritoItems');
      localStorage.removeItem('carritoTotal');
      localStorage.removeItem('carrito');

      // Mostrar mensaje de éxito
      alert("¡Pago simulado exitoso! Tu pedido ha sido procesado.");
      
      // Redirigir a la página principal
      window.location.href = '/';
    } catch (error) {
      console.error("Error al simular pago:", error);
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
      console.log("Iniciando proceso de pago...");
      console.log("Items:", items);
      console.log("Datos de envío:", datosEnvio);

      // Primero creamos el pedido en Firestore
      console.log("Creando pedido en Firestore...");
      const pedidoId = await crearPedido(items, datosEnvio);
      console.log("Pedido creado con ID:", pedidoId);

      // Luego iniciamos el proceso de pago con Mercado Pago
      console.log("Enviando solicitud a Mercado Pago...");
      
      // Intentar con el endpoint principal
      let respuesta;
      try {
        respuesta = await fetch("https://pagos-ml.onrender.com/create_preference", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            items,
            pedidoId,
            datosEnvio
          }),
        });
      } catch (error) {
        console.log("Error con endpoint principal, ofreciendo pago simulado...");
        // Si falla, ofrecer pago simulado para testing
        const usarPagoSimulado = confirm(
          "El servidor de pagos no está disponible. ¿Deseas usar el modo de pago simulado para testing?"
        );
        
        if (usarPagoSimulado) {
          await simularPagoExitoso(pedidoId);
          return;
        } else {
          throw new Error("Pago cancelado por el usuario.");
        }
      }

      console.log("Respuesta del servidor:", respuesta.status, respuesta.statusText);

      if (!respuesta.ok) {
        throw new Error(`Error del servidor: ${respuesta.status} ${respuesta.statusText}`);
      }

      const data = await respuesta.json();
      console.log("Datos de respuesta:", data);

      if (data.init_point) {
        console.log("Redirigiendo a Mercado Pago:", data.init_point);
        
        // Guardar información del pedido para cuando regrese del pago
        localStorage.setItem('pedidoPendiente', JSON.stringify({
          pedidoId,
          items,
          datosEnvio,
          preferenceId: data.id // ID de preferencia de Mercado Pago
        }));
        
        window.location.href = data.init_point;
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("No se recibió el enlace de pago del servidor");
      }
    } catch (error) {
      console.error("Error en pago:", error);
      
      let mensajeError = "Error al procesar el pago. Por favor, intenta nuevamente.";
      
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          mensajeError = "Error de conexión. Verifica tu conexión a internet e intenta nuevamente.";
        } else if (error.message.includes("Error del servidor")) {
          mensajeError = "Error en el servidor de pagos. Por favor, intenta más tarde.";
        } else {
          mensajeError = error.message;
        }
      }
      
      alert(mensajeError);
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