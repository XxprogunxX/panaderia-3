/** @type {import('tailwindcss').Config} */
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',   // Rutas de archivos en la app
    './pages/**/*.{js,ts,jsx,tsx}', // Rutas de páginas
    './components/**/*.{js,ts,jsx,tsx}', // Rutas de componentes
  ],
  theme: {
    extend: {
      fontFamily: {
        // Definición de las fuentes personalizadas
        'Georgia': ['Georgia', 'serif'],
        'Montserrat': ['Montserrat', 'sans-serif'],
        'Playfair_Display': ['"Playfair Display"', 'serif'], // Nota las comillas para nombres con espacios
        'Open_Sans': ['"Open Sans"', 'sans-serif'],           // Nota las comillas para nombres con espacios
      },
      // Puedes añadir más extensiones aquí, como colores personalizados
      colors: {
        'primary-brown': '#4b3a2f', // Ejemplo de un color primario basado en tu diseño
        'light-cream': '#f9f5f1',   // Ejemplo de un color de fondo claro
        'accent-warm': '#a1887f',   // Ejemplo de un color de acento cálido
        'hero-bg': '#fceee3',       // Color de fondo de la sección hero
      },
    },
  },
  plugins: [],
}

export default config