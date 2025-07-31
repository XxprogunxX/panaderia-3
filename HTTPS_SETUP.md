# Configuración de HTTPS para Notificaciones

## 🔒 ¿Por qué necesitas HTTPS?

Chrome y otros navegadores modernos requieren HTTPS para las notificaciones de escritorio por motivos de seguridad.

## 🚀 Opciones para configurar HTTPS:

### **Opción A: Vercel (Más fácil)**
Si tu proyecto está en Vercel:
1. Ve a tu dashboard de Vercel
2. Tu sitio ya debería tener HTTPS automáticamente
3. Asegúrate de que el dominio esté configurado correctamente

### **Opción B: Netlify**
1. Sube tu proyecto a Netlify
2. HTTPS se configura automáticamente
3. Usa el dominio `.netlify.app` o configura tu dominio personalizado

### **Opción C: Firebase Hosting**
1. Instala Firebase CLI: `npm install -g firebase-tools`
2. Inicia sesión: `firebase login`
3. Inicializa: `firebase init hosting`
4. Despliega: `firebase deploy`
5. HTTPS se configura automáticamente

### **Opción D: Servidor local con HTTPS**
Para desarrollo local:

1. **Instalar mkcert:**
   ```bash
   # Windows (con chocolatey)
   choco install mkcert
   
   # macOS
   brew install mkcert
   
   # Linux
   sudo apt install mkcert
   ```

2. **Generar certificados locales:**
   ```bash
   mkcert -install
   mkcert localhost 127.0.0.1 ::1
   ```

3. **Configurar Next.js para HTTPS:**
   Crea un archivo `server.js` en la raíz:
   ```javascript
   const { createServer } = require('https');
   const { parse } = require('url');
   const next = require('next');
   const fs = require('fs');

   const dev = process.env.NODE_ENV !== 'production';
   const app = next({ dev });
   const handle = app.getRequestHandler();

   const httpsOptions = {
     key: fs.readFileSync('./localhost-key.pem'),
     cert: fs.readFileSync('./localhost.pem')
   };

   app.prepare().then(() => {
     createServer(httpsOptions, (req, res) => {
       const parsedUrl = parse(req.url, true);
       handle(req, res, parsedUrl);
     }).listen(3000, (err) => {
       if (err) throw err;
       console.log('> Ready on https://localhost:3000');
     });
   });
   ```

4. **Actualizar package.json:**
   ```json
   {
     "scripts": {
       "dev": "node server.js",
       "build": "next build",
       "start": "NODE_ENV=production node server.js"
     }
   }
   ```

## 🔧 **Alternativas si no puedes usar HTTPS:**

### **Opción 1: Notificaciones en la página**
En lugar de notificaciones de escritorio, mostrar alertas en la página:

```javascript
// En lugar de Notification API
const mostrarAlertaEnPagina = (mensaje) => {
  // Crear un toast o alerta en la página
  const alerta = document.createElement('div');
  alerta.className = 'alerta-nuevo-pedido';
  alerta.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    ">
      <h4>🛒 Nuevo Pedido</h4>
      <p>${mensaje}</p>
      <button onclick="this.parentElement.remove()" style="
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        float: right;
      ">×</button>
    </div>
  `;
  document.body.appendChild(alerta);
  
  // Auto-remover después de 5 segundos
  setTimeout(() => {
    if (alerta.parentElement) {
      alerta.remove();
    }
  }, 5000);
};
```

### **Opción 2: Sonido de notificación**
Agregar un sonido cuando llegue un nuevo pedido:

```javascript
const reproducirSonidoNotificacion = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.play().catch(e => console.log('No se pudo reproducir sonido'));
};
```

### **Opción 3: Actualización automática**
Hacer que la página se actualice automáticamente cada cierto tiempo:

```javascript
useEffect(() => {
  const interval = setInterval(() => {
    // Recargar pedidos cada 30 segundos
    cargarPedidos();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

## 📋 **Resumen de recomendaciones:**

1. **Para producción**: Usa Vercel, Netlify o Firebase Hosting (HTTPS automático)
2. **Para desarrollo**: Configura HTTPS local con mkcert
3. **Como alternativa**: Implementa notificaciones en la página o sonidos

## 🎯 **Próximos pasos:**

1. Decide qué opción prefieres
2. Si eliges HTTPS, sigue las instrucciones de arriba
3. Si prefieres alternativas, puedo ayudarte a implementar notificaciones en la página 