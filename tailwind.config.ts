/** @type {import('tailwindcss').Config} */
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',  // Rutas de archivos en la app
    './pages/**/*.{js,ts,jsx,tsx}', // Rutas de páginas
    './components/**/*.{js,ts,jsx,tsx}', // Rutas de componentes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
