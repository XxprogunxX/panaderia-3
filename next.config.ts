import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de imágenes externas
  images: {
    domains: ['firebasestorage.googleapis.com'], // o el dominio donde estén tus imágenes
  },

  // Configuración opcional de Tailwind (esto en realidad no se pone aquí por defecto)
  // tailwindcss: {
  //   config: './tailwind.config.js',
  // },
};

export default nextConfig;
