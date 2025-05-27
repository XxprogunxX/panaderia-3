import type { NextConfig } from "next";
module.exports = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}
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
