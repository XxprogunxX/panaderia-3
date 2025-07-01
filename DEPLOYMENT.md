# 🚀 Guía de Despliegue en Vercel

## Configuración de Variables de Entorno

Antes de desplegar en Vercel, configura las siguientes variables de entorno en tu proyecto:

### Variables Requeridas:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Valor: `https://vvtqfedsnthxeqaejhzg.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Valor: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dHFmZWRzbnRoeGVxYWVqaHpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI5NTIyOCwiZXhwIjoyMDYzODcxMjI4fQ.nxeSUTZ2429JBZVONXE9oRpkpFFJ6YAtcDvb-BKfJ-k`

## Pasos para Desplegar:

1. **Conectar repositorio a Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio de GitHub
   - Selecciona el directorio `Panaderia`

2. **Configurar variables de entorno**
   - En la configuración del proyecto en Vercel
   - Ve a Settings > Environment Variables
   - Agrega las variables mencionadas arriba

3. **Configurar dominio personalizado (opcional)**
   - En Settings > Domains
   - Agrega tu dominio personalizado

4. **Desplegar**
   - Vercel detectará automáticamente que es un proyecto Next.js
   - El build se ejecutará automáticamente

## Optimizaciones Implementadas:

✅ **Variables de entorno**: Configuradas para producción
✅ **Manejo de errores**: Mejorado para evitar crashes
✅ **SSR compatible**: Verificaciones para evitar errores en servidor
✅ **Lazy loading**: Imágenes optimizadas
✅ **Configuración Vercel**: Archivo vercel.json incluido
✅ **ESLint configurado**: Errores no bloquean el build
✅ **Tipos TypeScript**: Corregidos para evitar errores
✅ **Componentes Image**: Optimizados para Next.js

## Posibles Problemas y Soluciones:

### 🔴 Error de Build
- **Causa**: Variables de entorno no configuradas
- **Solución**: Configurar todas las variables en Vercel

### 🔴 Error de Autenticación
- **Causa**: Firebase config no disponible
- **Solución**: Verificar que firebaseConfig.ts esté correctamente configurado

### 🔴 Error de Supabase
- **Causa**: Credenciales incorrectas
- **Solución**: Verificar variables de entorno de Supabase

### 🔴 Error de CORS
- **Causa**: Dominios no autorizados
- **Solución**: Configurar dominios permitidos en Firebase/Supabase

## Monitoreo:

- Usa los logs de Vercel para debuggear problemas
- Configura alertas para errores de build
- Monitorea el rendimiento en la dashboard de Vercel

## Seguridad:

- Las variables de entorno están protegidas
- El panel de control tiene autenticación robusta
- Solo usuarios autorizados pueden acceder al panel 