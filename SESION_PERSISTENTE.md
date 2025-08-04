# Sistema de Persistencia de Sesión

## Descripción

Este sistema implementa una persistencia de sesión que mantiene al usuario autenticado por **7 días** sin necesidad de volver a ingresar sus credenciales. La sesión se extiende automáticamente cuando el usuario interactúa con la aplicación.

## Características

### ✅ Persistencia Local
- La sesión se mantiene activa incluso si el usuario cierra y reabre el navegador
- Utiliza `browserLocalPersistence` de Firebase Auth
- Los datos de autenticación se almacenan en el localStorage del navegador

### ⏰ Expiración Automática
- **Duración**: 7 días (168 horas)
- **Expiración automática**: La sesión se cierra automáticamente después de 7 días
- **Advertencia**: Se muestra una notificación 1 hora antes de que expire la sesión

### 🔄 Extensión Automática
- La sesión se extiende automáticamente cuando el usuario:
  - Hace clic en cualquier parte de la página
  - Mueve el mouse
  - Presiona una tecla
  - Hace scroll
  - Toca la pantalla (en dispositivos móviles)

### 🚨 Notificaciones
- **Advertencia de expiración**: Aparece 1 hora antes de que expire la sesión
- **Botón de extensión**: Permite al usuario extender manualmente la sesión
- **Posición**: Se muestra en la esquina superior derecha

## Componentes Implementados

### 1. AuthContext (`src/app/components/AuthContext.tsx`)
- Maneja el estado global de autenticación
- Configura la persistencia de Firebase Auth
- Proporciona funciones de login/logout
- Obtiene el rol del usuario desde Firestore

### 2. useSessionExpiration (`src/app/components/useSessionExpiration.ts`)
- Hook personalizado que maneja la expiración de sesión
- Configura timeouts para cerrar la sesión automáticamente
- Proporciona función para extender la sesión manualmente

### 3. SessionExpirationWarning (`src/app/components/SessionExpirationWarning.tsx`)
- Componente que muestra la advertencia de expiración
- Se muestra 1 hora antes de que expire la sesión
- Permite al usuario extender la sesión manualmente

## Configuración

### Firebase Auth
```typescript
// Configuración de persistencia
await setPersistence(auth, browserLocalPersistence);
```

### Variables de Configuración
```typescript
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 días
const WARNING_THRESHOLD = 60 * 60 * 1000; // 1 hora
```

## Uso

### Para Usuarios
1. **Inicio de sesión**: Ingresa tus credenciales una vez
2. **Sesión persistente**: La sesión se mantiene activa por 7 días
3. **Extensión automática**: Cada interacción extiende la sesión
4. **Advertencia**: Recibirás una notificación 1 hora antes de que expire
5. **Extensión manual**: Puedes extender la sesión desde la notificación

### Para Administradores
- El sistema funciona igual para administradores y usuarios normales
- Los administradores mantienen sus permisos durante toda la sesión
- La expiración de sesión no afecta los permisos, solo requiere re-autenticación

## Seguridad

### ✅ Medidas Implementadas
- **Expiración automática**: Previene sesiones indefinidas
- **Verificación de roles**: Se mantiene la verificación de permisos
- **Logout manual**: Los usuarios pueden cerrar sesión manualmente
- **Almacenamiento seguro**: Firebase maneja el almacenamiento de tokens de forma segura

### 🔒 Consideraciones
- Los tokens se almacenan en el localStorage del navegador
- La seguridad depende de la configuración del navegador del usuario
- Se recomienda cerrar sesión en dispositivos compartidos

## Personalización

### Cambiar la Duración de Sesión
```typescript
// En useSessionExpiration.ts
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // Cambiar por el tiempo deseado
```

### Cambiar el Tiempo de Advertencia
```typescript
// En SessionExpirationWarning.tsx
const WARNING_THRESHOLD = 60 * 60 * 1000; // Cambiar por el tiempo deseado
```

### Modificar Eventos de Extensión
```typescript
// En paneldecontrol/page.tsx
const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
// Agregar o quitar eventos según sea necesario
```

## Troubleshooting

### Problemas Comunes

1. **La sesión no persiste**
   - Verificar que el navegador permita localStorage
   - Comprobar que no esté en modo incógnito

2. **No aparecen las advertencias**
   - Verificar que el componente SessionExpirationWarning esté incluido
   - Comprobar la consola del navegador para errores

3. **La sesión expira antes de tiempo**
   - Verificar la configuración de SESSION_DURATION
   - Comprobar que el reloj del sistema sea correcto

### Logs de Debug
El sistema incluye logs detallados en la consola:
- `✅ Persistencia configurada para mantener sesión activa`
- `🔄 Estado de autenticación cambiado`
- `⏰ Sesión expirada automáticamente después de 7 días`

## Compatibilidad

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Dispositivos móviles (iOS/Android)

## Notas Técnicas

- Utiliza Firebase Auth v9+ con modular API
- Compatible con Next.js 13+ App Router
- Implementa TypeScript para type safety
- Sigue las mejores prácticas de React hooks 