# Sistema de Direcciones Guardadas

## Descripción General

El sistema de direcciones guardadas permite a los usuarios autenticados guardar múltiples direcciones de envío para facilitar el proceso de compra. Los usuarios pueden:

- Guardar múltiples direcciones de envío
- Establecer una dirección predeterminada
- Seleccionar rápidamente una dirección guardada durante el checkout
- Agregar nuevas direcciones desde el formulario de envío
- Eliminar direcciones que ya no necesiten

## Características Principales

### 1. Gestión de Direcciones
- **Agregar direcciones**: Los usuarios pueden agregar nuevas direcciones desde el formulario de checkout
- **Editar direcciones**: Las direcciones se pueden modificar (funcionalidad futura)
- **Eliminar direcciones**: Los usuarios pueden eliminar direcciones que ya no necesiten
- **Dirección predeterminada**: Se puede establecer una dirección como predeterminada

### 2. Integración con Checkout
- **Selección automática**: La dirección predeterminada se selecciona automáticamente
- **Opciones de dirección**: Los usuarios pueden elegir entre usar una dirección guardada o ingresar una nueva
- **Validación**: El formulario valida que se seleccione una dirección antes de continuar

### 3. Almacenamiento en Firestore
- Las direcciones se guardan en la colección `usuarios` en el campo `direcciones`
- Cada dirección tiene un ID único y un flag `esPredeterminada`
- Las direcciones se sincronizan en tiempo real

## Estructura de Datos

```typescript
interface DireccionGuardada {
  id: string;                    // ID único de la dirección
  nombre: string;                // Nombre completo del destinatario
  email: string;                 // Correo electrónico
  telefono: string;              // Número de teléfono
  direccion: string;             // Dirección de entrega
  codigoPostal: string;          // Código postal
  ciudad: string;                // Ciudad
  estado: string;                // Estado
  instrucciones?: string;        // Instrucciones de entrega (opcional)
  esPredeterminada: boolean;     // Si es la dirección predeterminada
}
```

## Componentes Implementados

### 1. DireccionesGuardadas.tsx
Componente principal para gestionar las direcciones guardadas.

**Funcionalidades:**
- Cargar direcciones desde Firestore
- Mostrar lista de direcciones guardadas
- Agregar nuevas direcciones
- Eliminar direcciones existentes
- Establecer dirección predeterminada
- Seleccionar dirección para el checkout

### 2. FormularioEnvio.tsx (Modificado)
Formulario de envío actualizado para integrar direcciones guardadas.

**Nuevas funcionalidades:**
- Opciones para usar dirección guardada o nueva dirección
- Integración con el componente DireccionesGuardadas
- Validación mejorada del formulario
- Manejo de datos de dirección seleccionada

## Flujo de Usuario

### Para Usuarios Nuevos
1. El usuario llega al checkout
2. Ve la opción de "Usar dirección guardada" (deshabilitada inicialmente)
3. Selecciona "Usar nueva dirección"
4. Completa el formulario de envío
5. Durante el proceso, puede optar por guardar la dirección

### Para Usuarios con Direcciones Guardadas
1. El usuario llega al checkout
2. Ve sus direcciones guardadas
3. Puede seleccionar una dirección existente o agregar una nueva
4. Si selecciona una dirección guardada, se pre-llenan los datos automáticamente
5. Continúa con el proceso de pago

## Estilos CSS

El sistema incluye estilos completos para:
- Lista de direcciones guardadas
- Modal para agregar nuevas direcciones
- Botones de acción (seleccionar, eliminar, predeterminada)
- Diseño responsive para móviles
- Estados visuales (hover, seleccionado, etc.)

## Seguridad y Validación

- Solo usuarios autenticados pueden acceder a direcciones guardadas
- Validación de campos requeridos
- Manejo de errores en operaciones de Firestore
- Confirmaciones para acciones destructivas (eliminar)

## Mejoras Futuras

1. **Edición de direcciones**: Permitir modificar direcciones existentes
2. **Validación de direcciones**: Integración con APIs de validación de direcciones
3. **Autocompletado**: Sugerencias de direcciones basadas en entrada del usuario
4. **Direcciones de facturación**: Separar direcciones de envío y facturación
5. **Importar direcciones**: Desde contactos del dispositivo o servicios externos

## Instalación y Configuración

El sistema está completamente integrado y no requiere configuración adicional. Solo asegúrate de que:

1. Firebase esté configurado correctamente
2. Los usuarios estén autenticados para acceder a las direcciones guardadas
3. Los permisos de Firestore permitan lectura/escritura en la colección `usuarios`

## Uso del Sistema

### Para Desarrolladores

```typescript
// Importar el componente
import DireccionesGuardadas from './components/DireccionesGuardadas';

// Usar en el formulario de envío
<DireccionesGuardadas
  onSeleccionarDireccion={handleSeleccionarDireccion}
  direccionSeleccionada={direccionSeleccionada}
/>
```

### Para Usuarios

1. **Agregar dirección**: Hacer clic en "+ Agregar Nueva Dirección"
2. **Seleccionar dirección**: Hacer clic en "Seleccionar" en la dirección deseada
3. **Eliminar dirección**: Hacer clic en "Eliminar" en la dirección
4. **Establecer predeterminada**: Hacer clic en "Hacer Predeterminada"

## Consideraciones Técnicas

- **Rendimiento**: Las direcciones se cargan una vez y se mantienen en estado local
- **Sincronización**: Cambios en tiempo real usando Firestore onSnapshot
- **Responsive**: Diseño adaptativo para todos los dispositivos
- **Accesibilidad**: Controles accesibles con teclado y lectores de pantalla 