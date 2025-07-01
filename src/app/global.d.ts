export {};

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options: { locale: string }) => unknown;
    mercadoPagoInstance?: unknown;
  }
}
