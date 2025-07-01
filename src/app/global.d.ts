export {};

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options: { locale: string }) => MercadoPagoInstance;
    mercadoPagoInstance?: MercadoPagoInstance;
  }
}

interface MercadoPagoInstance {
  bricks: {
    create: (type: string, settings: unknown) => unknown;
  };
  preference: {
    create: (preference: unknown) => Promise<{ id: string }>;
  };
}
