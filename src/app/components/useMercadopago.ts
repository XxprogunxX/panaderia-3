import { useState } from "react";

// Definimos la interfaz para los ítems que Mercado Pago espera
interface MercadoPagoItem {
  title: string;
  quantity: number;
  unit_price: number;
}

/**
 * Hook personalizado para manejar la lógica de pago con Mercado Pago.
 * @returns Un objeto con el estado de carga y la función para iniciar el pago.
 */
export function useMercadoPago() {
  const [cargandoPago, setCargandoPago] = useState(false);

  /**
   * Inicia el proceso de pago con Mercado Pago.
   * @param items Los ítems del carrito a enviar a Mercado Pago.
   */
  const handlePagar = async (items: MercadoPagoItem[]) => {
    if (items.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    setCargandoPago(true);

    try {
      const respuesta = await fetch("http://localhost:5000/create_preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      const data = await respuesta.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("Error al generar el pago");
      }
    } catch (error) {
      console.error("Error en pago:", error);
      alert("Error al comunicarse con el servidor de pagos");
    } finally {
      setCargandoPago(false);
    }
  };

  return {
    cargandoPago,
    handlePagar,
  };
}