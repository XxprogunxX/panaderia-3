# Guía de Solución de Problemas - Autenticación

## Problemas Comunes y Soluciones

### 1. Error: `auth/invalid-credential`

**Descripción:** Las credenciales proporcionadas (email o contraseña) son incorrectas.

**Soluciones:**
- Verifica que el email esté escrito correctamente
- Asegúrate de que la contraseña sea la correcta
- Si olvidaste tu contraseña, usa la opción "¿Olvidaste tu contraseña?"
- Verifica que no haya espacios extra al inicio o final del email/contraseña

### 2. Error: `auth/too-many-requests`

**Descripción:** Se han realizado demasiados intentos fallidos de inicio de sesión.

**Soluciones:**
- Espera 5-10 minutos antes de intentar nuevamente
- Firebase implementa rate limiting para prevenir ataques de fuerza bruta
- Si el problema persiste, contacta al administrador

### 3. Error: `auth/user-not-found`

**Descripción:** No existe una cuenta con el email proporcionado.

**Soluciones:**
- Verifica que el email esté correcto
- Si es la primera vez, crea una nueva cuenta usando el formulario de registro
- Asegúrate de que la cuenta no haya sido eliminada

### 4. Error: `auth/network-request-failed`

**Descripción:** Problemas de conectividad con los servidores de Firebase.

**Soluciones:**
- Verifica tu conexión a internet
- Intenta nuevamente en unos minutos
- Si usas una VPN, desactívala temporalmente
- Verifica que no haya bloqueadores de anuncios interfiriendo

### 5. Error: `auth/operation-not-allowed`

**Descripción:** El método de autenticación no está habilitado en Firebase.

**Soluciones:**
- Contacta al administrador del sistema
- Verifica la configuración de Firebase Authentication

## Acceso al Panel de Control

### Requisitos:
- Solo los administradores pueden acceder al panel de control
- El email debe estar en la lista de administradores autorizados
- La cuenta debe estar activa y verificada

### Emails Autorizados:
- `oscar73986@gmail.com` (Super Admin)

### Si no puedes acceder:
1. Verifica que tu email esté en la lista de administradores
2. Asegúrate de que la cuenta esté creada y activa
3. Contacta al administrador principal para solicitar acceso

## Consejos de Seguridad

1. **Contraseñas fuertes:** Usa contraseñas de al menos 8 caracteres con letras, números y símbolos
2. **No compartir credenciales:** Nunca compartas tu email y contraseña
3. **Cerrar sesión:** Siempre cierra sesión cuando termines de usar el panel
4. **Dispositivos seguros:** Solo accede desde dispositivos de confianza
5. **Actualizar contraseña:** Cambia tu contraseña regularmente

## Contacto

Si continúas teniendo problemas, contacta al administrador del sistema:
- Email: oscar73986@gmail.com
- Proporciona detalles específicos del error que estás viendo
- Incluye capturas de pantalla si es posible

## Notas Técnicas

- El sistema usa Firebase Authentication para la autenticación
- Los datos de usuario se almacenan en Firestore
- Se implementa rate limiting para prevenir ataques
- Los errores se muestran en español para mejor experiencia de usuario 