// Declaraciones globales para Mercado Pago en window
interface Window {
  MercadoPago?: new (publicKey: string, options: { locale: string }) => unknown;
  mercadoPagoInstance?: unknown;
} 