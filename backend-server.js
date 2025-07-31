import express from "express";
import cors from "cors";
import 'dotenv/config'; // Carga las variables de entorno
import * as MercadoPagoModule from 'mercadopago';

// Configuración de Mercado Pago
const MercadoPagoConfig = MercadoPagoModule.default.default;
const Preference = MercadoPagoModule.Preference;

// Variables de entorno
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

console.log("--- DEPURACIÓN DE SERVIDOR ---");
console.log("Valor de MP_ACCESS_TOKEN (parcial):", MP_ACCESS_TOKEN ? MP_ACCESS_TOKEN.substring(0, 10) + '...' : 'NO DEFINIDO');
console.log("Valor de BASE_URL cargado:", BASE_URL);
console.log("-------------------------------");

if (!MP_ACCESS_TOKEN) {
  console.error("ERROR FATAL: MP_ACCESS_TOKEN no está definido en las variables de entorno. Por favor, configúralo en tu archivo .env");
  process.exit(1);
}

const client = new MercadoPagoConfig({
  accessToken: MP_ACCESS_TOKEN,
  locale: "es-MX",
});
const preferencesService = new Preference(client);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/create_preference", async (req, res) => {
  try {
    const { items, pedidoId, datosEnvio } = req.body;

    // Validación básica de los ítems recibidos
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items inválidos: se requiere un array de items no vacío." });
    }
    for (const item of items) {
      if (!item.title || typeof item.title !== 'string' || item.title.trim() === '' ||
          !item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0 ||
          !item.unit_price || typeof item.unit_price !== 'number' || item.unit_price <= 0) {
        return res.status(400).json({ message: `Estructura de item inválida. Cada item debe tener 'title' (string no vacío), 'quantity' (number > 0) y 'unit_price' (number > 0). Item defectuoso: ${JSON.stringify(item)}` });
      }
    }

    // Preparar los datos de la preferencia para Mercado Pago
    const preferenceData = {
      items: items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price.toFixed(2)),
      })),
      back_urls: {
        success: `${BASE_URL}/success`,
        failure: `${BASE_URL}/failure`,
        pending: `${BASE_URL}/pending`,
      },
      // Agregar external_reference para identificar el pedido
      external_reference: pedidoId || undefined,
      // Agregar metadata con información del pedido
      metadata: { 
        pedidoId: pedidoId,
        datosEnvio: datosEnvio 
      },
    };

    console.log("Datos de la preferencia enviados a MP:", JSON.stringify(preferenceData, null, 2));

    // Crea la preferencia de pago usando el servicio de preferencias
    const response = await preferencesService.create({ body: preferenceData });

    console.log("Respuesta exitosa de Mercado Pago (init_point):", response.init_point);
    res.json({ init_point: response.init_point });

  } catch (error) {
    console.error("Error en /create_preference (servidor):", error);
    let errorMessage = "Error desconocido al procesar la solicitud.";
    let errorDetails = {};
    if (error && typeof error === 'object') {
      if (error.message) errorMessage = error.message;
      if (error.status) errorDetails.status = error.status;
      if (error.cause) errorDetails.cause = error.cause;
      if (error.response && error.response.data) {
        errorDetails.apiResponse = error.response.data;
        if (error.response.data.message) errorMessage = error.response.data.message;
      }
    }
    res.status(500).json({
      message: errorMessage,
      details: errorDetails
    });
  }
});

// Nuevo endpoint para verificar el estado de un pago
app.post("/verify_payment", async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ 
        error: 'ID de pago requerido' 
      });
    }

    console.log("Verificando pago con ID:", paymentId);

    // Hacer la petición a la API de MercadoPago para verificar el pago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de MercadoPago:', errorData);
      return res.status(response.status).json({
        error: `Error al verificar pago: ${response.statusText}`,
        details: errorData
      });
    }

    const paymentData = await response.json();

    console.log("Estado del pago verificado:", paymentData.status);

    // Retornar la información del pago
    res.json({
      status: paymentData.status,
      payment_method: {
        type: paymentData.payment_method?.type,
        id: paymentData.payment_method?.id
      },
      transaction_amount: paymentData.transaction_amount,
      currency: paymentData.currency,
      date_created: paymentData.date_created,
      last_updated: paymentData.last_updated
    });

  } catch (error) {
    console.error("Error en /verify_payment:", error);
    res.status(500).json({
      error: 'Error interno del servidor al verificar el pago',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
}); 