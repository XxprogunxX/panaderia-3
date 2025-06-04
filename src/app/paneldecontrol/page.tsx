"use client";
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { createClient } from '@supabase/supabase-js';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import  "./panel.css"; // Importa el archivo CSS

// Configura Supabase
const supabase = createClient(
  'https://vvtqfedsnthxeqaejhzg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dHFmZWRzbnRoeGVxYWVqaHpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI5NTIyOCwiZXhwIjoyMDYzODcxMjI4fQ.nxeSUTZ2429JBZVONXE9oRpkpFFJ6YAtcDvb-BKfJ-k'
);

// Tipos de datos
type Producto = {
  id?: string;
  nombre: string;
  precio: string;
  categoria: string;
  descripcion: string;
  imagen: File | null;
  imagenUrl?: string;
};

type Categoria = {
  id?: string;
  nombre: string;
};

type Pedido = {
  id: string;
  productos: {
    nombre: string;
    cantidad: number;
    precio: number;
  }[];
  total: number;
  estado: 'pendiente' | 'completado' | 'cancelado';
  fechaCreacion: string;
  datosEnvio: {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    codigoPostal: string;
    ciudad: string;
    estado: string;
    instrucciones?: string;
  };
  numeroGuia?: string;
};

type Usuario = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerData: any[];
};

type Oferta = {
  id?: string;
  titulo: string;
  descripcion: string;
  imagen: File | null;
  imagenUrl?: string;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
};

const PanelControl = () => {
  // Estados
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [activeTab, setActiveTab] = useState<"productos" | "categorias" | "usuarios" | "estadisticas" | "ofertas">("productos");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [nuevoProducto, setNuevoProducto] = useState<Producto>({
    nombre: "",
    precio: "",
    categoria: "",
    descripcion: "",
    imagen: null
  });
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: "" });
  const [edicionId, setEdicionId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedidosCargando, setPedidosCargando] = useState<{ [key: string]: boolean }>({});
  const [guiasTemporales, setGuiasTemporales] = useState<{ [key: string]: string }>({});
  const [nuevaOferta, setNuevaOferta] = useState<Oferta>({
    titulo: "",
    descripcion: "",
    imagen: null,
    fechaInicio: "",
    fechaFin: "",
    activa: true
  });

  const cargarUsuarios = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        setUsuarios([{
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          providerData: user.providerData
        }]);
      } else {
        setUsuarios([]);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setError("Error al cargar los usuarios");
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
    cargarUsuarios();
    cargarPedidos();
  }, []);

  const cargarDatosIniciales = async () => {
    setCargando(true);
    setError(null);
    try {
      await Promise.all([cargarProductos(), cargarCategorias(), cargarOfertas()]);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setError("Error al cargar los datos iniciales");
    } finally {
      setCargando(false);
    }
  };

  // Cargar productos desde Firestore
  const cargarProductos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "productos"));
      const lista: Producto[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lista.push({
          id: doc.id,
          nombre: data.product,
          precio: data.price.toString(),
          categoria: data.category,
          descripcion: data.description,
          imagen: null,
          imagenUrl: data.pic
        });
      });
      setProductos(lista);
    } catch (error) {
      console.error("Error cargando productos:", error);
      throw new Error("No se pudieron cargar los productos");
    }
  };

  // Cargar categorías desde Firestore
  const cargarCategorias = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categorias"));
      const lista: Categoria[] = [];
      querySnapshot.forEach((doc) => {
        lista.push({
          id: doc.id,
          nombre: doc.data().nombre
        });
      });
      setCategorias(lista);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      throw new Error("No se pudieron cargar las categorías");
    }
  };

  // Cargar pedidos desde Firestore
  const cargarPedidos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "pedidos"));
      const lista: Pedido[] = [];
      querySnapshot.forEach((doc) => {
        lista.push({
          id: doc.id,
          ...doc.data()
        } as Pedido);
      });
      setPedidos(lista);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      setError("Error al cargar los pedidos");
    }
  };

  // Cargar ofertas desde Firestore
  const cargarOfertas = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "ofertas"));
      const lista: Oferta[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lista.push({
          id: doc.id,
          titulo: data.titulo,
          descripcion: data.descripcion,
          imagen: null,
          imagenUrl: data.imagen,
          fechaInicio: data.fechaInicio,
          fechaFin: data.fechaFin,
          activa: data.activa
        });
      });
      setOfertas(lista);
    } catch (error) {
      console.error("Error cargando ofertas:", error);
      throw new Error("No se pudieron cargar las ofertas");
    }
  };

  // Subir imagen a Supabase Storage
  const subirImagen = async (file: File): Promise<string> => {
    try {
      const formatosPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
      if (!formatosPermitidos.includes(file.type)) {
        throw new Error("Solo se permiten imágenes JPEG, PNG o WebP");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("La imagen no puede ser mayor a 5MB");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `productos/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('imagenes-productos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Error al subir imagen:", uploadError);
        throw new Error("Error al subir la imagen");
      }

      const { data: { publicUrl } } = supabase.storage
        .from('imagenes-productos')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error("Error en subirImagen:", error);
      throw error;
    }
  };

  // Manejar envío de formulario de producto
  const manejarSubmitProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!nuevoProducto.nombre?.trim()) {
      setError("Por favor ingresa un nombre válido para el producto");
      return;
    }

    if (!nuevoProducto.precio || isNaN(parseFloat(nuevoProducto.precio))) {
      setError("Por favor ingresa un precio válido");
      return;
    }

    if (parseFloat(nuevoProducto.precio) < 4) {
      setError("El precio debe ser mayor que 4");
      return;
    }

    if (!nuevoProducto.categoria) {
      setError("Por favor selecciona una categoría");
      return;
    }
     if (!edicionId && !nuevoProducto.imagen) {
     setError("Por favor selecciona una imagen para el producto");
      return;
    }

    setCargando(true);
    try {
      let imagenUrl = nuevoProducto.imagenUrl || "";
      
      if (nuevoProducto.imagen) {
        try {
          imagenUrl = await subirImagen(nuevoProducto.imagen);
        } catch (error) {
          throw new Error(`No se pudo subir la imagen: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      const productoData = {
        product: nuevoProducto.nombre.trim(),
        price: parseFloat(nuevoProducto.precio),
        category: nuevoProducto.categoria,
        description: nuevoProducto.descripcion.trim(),
        pic: imagenUrl,
        updatedAt: new Date().toISOString(),
        ...(!edicionId && { createdAt: new Date().toISOString() })
      };

      if (edicionId) {
        await updateDoc(doc(db, "productos", edicionId), productoData);
      } else {
        await addDoc(collection(db, "productos"), productoData);
      }

      setNuevoProducto({
        nombre: "",
        precio: "",
        categoria: "",
        descripcion: "",
        imagen: null
      });
      setEdicionId(null);
      
      await cargarProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      setError(`Error al guardar producto: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  };

  // Editar producto
  const editarProducto = (producto: Producto) => {
    setNuevoProducto({
      nombre: producto.nombre,
      precio: producto.precio,
      categoria: producto.categoria,
      descripcion: producto.descripcion,
      imagen: null,
      imagenUrl: producto.imagenUrl
    });
    setEdicionId(producto.id || null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Eliminar producto (con imagen en Supabase)
  const eliminarProducto = async (id: string, imagenUrl?: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto permanentemente?")) {
      return;
    }

    setCargando(true);
    setError(null);
    try {
      if (imagenUrl) {
        const pathStart = imagenUrl.indexOf('productos/');
        if (pathStart !== -1) {
          const filePath = imagenUrl.substring(pathStart);
          const { error: deleteError } = await supabase.storage
            .from('imagenes-productos')
            .remove([filePath]);
            
          if (deleteError) {
            console.error("Error al eliminar imagen:", deleteError);
          }
        }
      }

      await deleteDoc(doc(db, "productos", id));
      await cargarProductos();
    } catch (error) {
      console.error("Error al eliminar:", error);
      setError(`Error al eliminar producto: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  };

  // Agregar nueva categoría
  const agregarCategoria = async () => {
    if (!nuevaCategoria.nombre.trim()) {
      setError("Por favor ingresa un nombre para la categoría");
      return;
    }

    setCargando(true);
    setError(null);
    try {
      await addDoc(collection(db, "categorias"), {
        nombre: nuevaCategoria.nombre.trim(),
        createdAt: new Date().toISOString()
      });
      setNuevaCategoria({ nombre: "" });
      await cargarCategorias();
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      setError(`Error al agregar categoría: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  };

  // Función para calcular estadísticas
  const calcularEstadisticas = () => {
    // Filtramos los pedidos cancelados
    const pedidosActivos = pedidos.filter(p => p.estado !== 'cancelado');
    
    const ventasTotales = pedidosActivos.reduce((total, pedido) => total + pedido.total, 0);
    const totalPedidos = pedidosActivos.length;
    const pedidosCompletados = pedidosActivos.filter(p => p.estado === 'completado').length;
    const pedidosPendientes = pedidosActivos.filter(p => p.estado === 'pendiente').length;
    
    // Productos más vendidos con más detalles (excluyendo pedidos cancelados)
    const productosVendidos = pedidosActivos.reduce((acc, pedido) => {
      pedido.productos.forEach(prod => {
        if (!acc[prod.nombre]) {
          acc[prod.nombre] = {
            nombre: prod.nombre,
            cantidadTotal: 0,
            ventasTotal: 0,
            vecesComprado: 0,
            ultimaCompra: pedido.fechaCreacion
          };
        }
        acc[prod.nombre].cantidadTotal += prod.cantidad;
        acc[prod.nombre].ventasTotal += prod.cantidad * prod.precio;
        acc[prod.nombre].vecesComprado += 1;
        // Actualizar fecha si es más reciente
        if (new Date(pedido.fechaCreacion) > new Date(acc[prod.nombre].ultimaCompra)) {
          acc[prod.nombre].ultimaCompra = pedido.fechaCreacion;
        }
      });
      return acc;
    }, {} as { [key: string]: {
      nombre: string;
      cantidadTotal: number;
      ventasTotal: number;
      vecesComprado: number;
      ultimaCompra: string;
    }});

    const productosMasVendidos = Object.values(productosVendidos)
      .sort((a, b) => b.cantidadTotal - a.cantidadTotal)
      .slice(0, 5);

    return {
      ventasTotales,
      totalPedidos,
      pedidosCompletados,
      pedidosPendientes,
      productosMasVendidos
    };
  };

  // Función para actualizar el estado de un pedido
  const actualizarEstadoPedido = async (pedidoId: string, nuevoEstado: 'pendiente' | 'completado' | 'cancelado') => {
    try {
      setPedidosCargando(prev => ({ ...prev, [pedidoId]: true }));
      
      if (nuevoEstado === 'cancelado') {
        // Si el pedido se cancela, lo eliminamos de Firestore
        await deleteDoc(doc(db, "pedidos", pedidoId));
        // Actualizamos el estado local eliminando el pedido
        setPedidos(prev => prev.filter(p => p.id !== pedidoId));
      } else {
        // Si no se cancela, actualizamos su estado normalmente
        await updateDoc(doc(db, "pedidos", pedidoId), {
          estado: nuevoEstado,
          fechaActualizacion: new Date().toISOString()
        });
        // Actualizamos el estado local del pedido
        setPedidos(prev => prev.map(p => 
          p.id === pedidoId 
            ? { ...p, estado: nuevoEstado } 
            : p
        ));
      }
    } catch (error) {
      console.error("Error actualizando pedido:", error);
      setError("Error al actualizar el estado del pedido");
    } finally {
      setPedidosCargando(prev => ({ ...prev, [pedidoId]: false }));
    }
  };

  const enviarMensajeWhatsApp = (pedido: Pedido) => {
    const mensaje = pedido.numeroGuia 
      ? `¡Hola ${pedido.datosEnvio.nombre}! Tu pedido ha sido enviado. Número de guía: ${pedido.numeroGuia}`
      : `¡Hola ${pedido.datosEnvio.nombre}! Tu pedido ha sido confirmado y está siendo procesado.`;
    
    const telefono = pedido.datosEnvio.telefono.replace(/[^0-9]/g, '');
    const mensajeCodificado = encodeURIComponent(mensaje);
    window.open(`https://wa.me/${telefono}?text=${mensajeCodificado}`, '_blank');
  };

  const actualizarNumeroGuia = async (pedidoId: string, numeroGuia: string) => {
    try {
      setPedidosCargando(prev => ({ ...prev, [pedidoId]: true }));
      await updateDoc(doc(db, "pedidos", pedidoId), {
        numeroGuia,
        fechaActualizacion: new Date().toISOString()
      });
      // Actualizar solo el pedido modificado en el estado local
      setPedidos(prev => prev.map(p => 
        p.id === pedidoId 
          ? { ...p, numeroGuia } 
          : p
      ));
      // Limpiar el estado temporal de la guía
      setGuiasTemporales(prev => {
        const newState = { ...prev };
        delete newState[pedidoId];
        return newState;
      });
    } catch (error) {
      console.error("Error actualizando número de guía:", error);
      setError("Error al actualizar el número de guía");
    } finally {
      setPedidosCargando(prev => ({ ...prev, [pedidoId]: false }));
    }
  };

  const handleGuiaChange = (pedidoId: string, valor: string) => {
    setGuiasTemporales(prev => ({
      ...prev,
      [pedidoId]: valor
    }));
  };

  const handleGuiaKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, pedidoId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const numeroGuia = guiasTemporales[pedidoId]?.trim() || '';
      actualizarNumeroGuia(pedidoId, numeroGuia);
    }
  };

  const handleGuiaBlur = (pedidoId: string) => {
    const numeroGuia = guiasTemporales[pedidoId]?.trim() || '';
    if (numeroGuia !== pedidos.find(p => p.id === pedidoId)?.numeroGuia) {
      actualizarNumeroGuia(pedidoId, numeroGuia);
    }
  };

  // Agregar nueva oferta
  const agregarOferta = async () => {
    if (!nuevaOferta.titulo || !nuevaOferta.fechaInicio || !nuevaOferta.fechaFin) {
      setError("Por favor complete los campos obligatorios");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      let imagenUrl = "";
      if (nuevaOferta.imagen) {
        imagenUrl = await subirImagen(nuevaOferta.imagen);
      }

      const ofertaData = {
        titulo: nuevaOferta.titulo,
        descripcion: nuevaOferta.descripcion,
        imagen: imagenUrl,
        fechaInicio: nuevaOferta.fechaInicio,
        fechaFin: nuevaOferta.fechaFin,
        activa: nuevaOferta.activa
      };

      await addDoc(collection(db, "ofertas"), ofertaData);
      
      setNuevaOferta({
        titulo: "",
        descripcion: "",
        imagen: null,
        fechaInicio: "",
        fechaFin: "",
        activa: true
      });

      await cargarOfertas();
    } catch (error) {
      console.error("Error agregando oferta:", error);
      setError("Error al agregar la oferta");
    } finally {
      setCargando(false);
    }
  };

  // Eliminar oferta
  const eliminarOferta = async (id: string, imagenUrl?: string) => {
    if (!window.confirm("¿Está seguro de que desea eliminar esta oferta?")) {
      return;
    }

    setCargando(true);
    setError(null);

    try {
      await deleteDoc(doc(db, "ofertas", id));
      
      if (imagenUrl) {
        const imagePath = imagenUrl.split('/').pop();
        if (imagePath) {
          await supabase.storage.from('productos').remove([`productos/${imagePath}`]);
        }
      }

      await cargarOfertas();
    } catch (error) {
      console.error("Error eliminando oferta:", error);
      setError("Error al eliminar la oferta");
    } finally {
      setCargando(false);
    }
  };

  // Editar oferta
  const editarOferta = (oferta: Oferta) => {
    setNuevaOferta({
      ...oferta,
      imagen: null
    });
    setEdicionId(oferta.id);
  };

  // Actualizar oferta
  const actualizarOferta = async () => {
    if (!edicionId || !nuevaOferta.titulo || !nuevaOferta.fechaInicio || !nuevaOferta.fechaFin) {
      setError("Por favor complete los campos obligatorios");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      let imagenUrl = nuevaOferta.imagenUrl;
      if (nuevaOferta.imagen) {
        imagenUrl = await subirImagen(nuevaOferta.imagen);
      }

      const ofertaData = {
        titulo: nuevaOferta.titulo,
        descripcion: nuevaOferta.descripcion,
        imagen: imagenUrl,
        fechaInicio: nuevaOferta.fechaInicio,
        fechaFin: nuevaOferta.fechaFin,
        activa: nuevaOferta.activa
      };

      await updateDoc(doc(db, "ofertas", edicionId), ofertaData);
      
      setNuevaOferta({
        titulo: "",
        descripcion: "",
        imagen: null,
        fechaInicio: "",
        fechaFin: "",
        activa: true
      });
      setEdicionId(null);

      await cargarOfertas();
    } catch (error) {
      console.error("Error actualizando oferta:", error);
      setError("Error al actualizar la oferta");
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="cargando-overlay">
        <div className="cargando-contenido">
          <div className="spinner"></div>
          <p>Procesando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <nav className="tabs"> {/* Aquí se coloca la barra lateral */}
        <button
          onClick={() => setActiveTab("productos")}
          className={activeTab === "productos" ? "active" : ""}
        >
          Productos
        </button>
        <button
          onClick={() => setActiveTab("categorias")}
          className={activeTab === "categorias" ? "active" : ""}
        >
          Categorías
        </button>
        <button
          onClick={() => setActiveTab("usuarios")}
          className={activeTab === "usuarios" ? "active" : ""}
        >
          Usuarios
        </button>
        <button
          onClick={() => setActiveTab("estadisticas")}
          className={activeTab === "estadisticas" ? "active" : ""}
        >
          Pedidos
        </button>
        <button
          onClick={() => setActiveTab("ofertas")}
          className={activeTab === "ofertas" ? "active" : ""}
        >
          Ofertas
        </button>
      </nav>

      <div className="panel-control"> {/* Este es el contenido principal */}
        <header className="panel-header">
          <h1>Panel de Control</h1>
          <p>Administra tus productos y categorías</p>
        </header>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} className="cerrar-error">
              ×
            </button>
          </div>
        )}

        <main className="tab-content">
          {activeTab === "productos" && (
            <div className="productos-tab">
              <h2>Gestión de Productos</h2>
              
              <form onSubmit={manejarSubmitProducto} className="form">
                <div className="form-group">
                  <label>Nombre del Producto *</label>
                  <input
                    type="text"
                    value={nuevoProducto.nombre}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Precio (MXN) *</label>
                  <input
                    type="number"
                    value={nuevoProducto.precio}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
                    required
                    step="0.01"
                    min="4.00" // Precio mínimo de 4.00 MXN
                  />
                </div>

                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    value={nuevoProducto.categoria}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, categoria: e.target.value })}
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.nombre}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    value={nuevoProducto.descripcion}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Imagen {!edicionId }</label>
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNuevoProducto({ ...nuevoProducto, imagen: e.target.files[0] });
                      }
                    }}
                  />
                  {nuevoProducto.imagenUrl && (
                    <div className="imagen-preview">
                      <img 
                        src={nuevoProducto.imagenUrl} 
                        alt="Preview" 
                        width="100"
                      />
                      <span>Imagen actual</span>
                    </div>
                  )}
                  {nuevoProducto.imagen && (
                    <div className="imagen-preview">
                      <span>Nueva imagen seleccionada: {nuevoProducto.imagen.name}</span>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={cargando}>
                    {edicionId ? "Actualizar Producto" : "Agregar Producto"}
                  </button>
                  {edicionId && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setEdicionId(null);
                        setNuevoProducto({
                          nombre: "",
                          precio: "",
                          categoria: "",
                          descripcion: "",
                          imagen: null
                        });
                      }}
                      disabled={cargando}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              <div className="productos-list">
                <h3>Lista de Productos ({productos.length})</h3>
                {productos.length === 0 ? (
                  <p>No hay productos registrados</p>
                ) : (
                  <div className="productos-grid">
                    {productos.map((producto) => (
                      <div key={producto.id} className="producto-card">
                        {producto.imagenUrl && (
                          <div className="producto-imagen">
                            <img
                              src={producto.imagenUrl}
                              alt={producto.nombre}
                              width="200"
                              height="200"
                            />
                          </div>
                        )}
                        <div className="producto-info">
                          <h4>{producto.nombre}</h4>
                          <p className="precio">${parseFloat(producto.precio).toFixed(2)} MXN</p>
                          <p className="categoria">{producto.categoria}</p>
                          {producto.descripcion && (
                            <p className="descripcion">{producto.descripcion}</p>
                          )}
                        </div>
                        <div className="producto-acciones">
                          <button 
                            onClick={() => editarProducto(producto)}
                            className="btn-editar"
                            disabled={cargando}
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => producto.id && eliminarProducto(producto.id, producto.imagenUrl)}
                            className="btn-eliminar"
                            disabled={cargando}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "categorias" && (
            <div className="categorias-tab">
              <h2>Gestión de Categorías</h2>
              
              <div className="form-categoria">
                <div className="form-group">
                  <label>Nombre de la Categoría *</label>
                  <input
                    type="text"
                    value={nuevaCategoria.nombre}
                    onChange={(e) => setNuevaCategoria({ nombre: e.target.value })}
                    required
                  />
                </div>
                <button 
                  onClick={agregarCategoria}
                  className="btn-primary"
                  disabled={cargando}
                >
                  Agregar Categoría
                </button>
              </div>

              <div className="categorias-list">
                <h3>Lista de Categorías ({categorias.length})</h3>
                {categorias.length === 0 ? (
                  <p>No hay categorías registradas</p>
                ) : (
                  <ul className="categorias-grid">
                    {categorias.map((categoria) => (
                      <li key={categoria.id} className="categoria-item">
                        <span>{categoria.nombre}</span>
                        <div className="categoria-acciones">
                          <button className="btn-editar" disabled={cargando}>Editar</button>
                          <button className="btn-eliminar" disabled={cargando}>Eliminar</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {activeTab === "usuarios" && (
            <div className="usuarios-tab">
              <h2>Gestión de Usuarios</h2>
              
              {usuarios.length === 0 ? (
                <p>No hay usuarios registrados</p>
              ) : (
                <div className="usuarios-list">
                  <h3>Lista de Usuarios ({usuarios.length})</h3>
                  <div className="usuarios-grid">
                    {usuarios.map((usuario) => (
                      <div key={usuario.uid} className="usuario-card">
                        <div className="usuario-info">
                          {usuario.photoURL && (
                            <div className="usuario-avatar">
                              <img src={usuario.photoURL} alt="Avatar" width="80" height="80" />
                            </div>
                          )}
                          <div className="usuario-datos">
                            <h4>{usuario.displayName || 'Sin nombre'}</h4>
                            <p><strong>Email:</strong> {usuario.email || 'No proporcionado'}</p>
                            <p><strong>ID:</strong> {usuario.uid}</p>
                            <p><strong>Verificado:</strong> {usuario.emailVerified ? 'Sí' : 'No'}</p>
                            <p><strong>Proveedor:</strong> {usuario.providerData[0]?.providerId}</p>
                          </div>
                        </div>
                        <div className="usuario-acciones">
                          <button className="btn-editar">Editar</button>
                          <button className="btn-eliminar">Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "estadisticas" && (
            <div className="estadisticas-tab">
              <h2>Estadísticas de Ventas</h2>
              
              <div className="estadisticas-grid">
                {(() => {
                  const stats = calcularEstadisticas();
                  return (
                    <>
                      <div className="stat-card">
                        <h3>Ventas Totales</h3>
                        <p className="stat-value">${stats.ventasTotales.toFixed(2)} MXN</p>
                      </div>
                      <div className="stat-card">
                        <h3>Total de Pedidos</h3>
                        <p className="stat-value">{stats.totalPedidos}</p>
                      </div>
                      <div className="stat-card">
                        <h3>Pedidos Completados</h3>
                        <p className="stat-value">{stats.pedidosCompletados}</p>
                      </div>
                      <div className="stat-card">
                        <h3>Pedidos Pendientes</h3>
                        <p className="stat-value">{stats.pedidosPendientes}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="productos-populares">
                <h3>Productos Más Vendidos</h3>
                <div className="productos-populares-grid">
                  {calcularEstadisticas().productosMasVendidos.map((producto) => (
                    <div key={producto.nombre} className="producto-popular-card">
                      <div className="producto-popular-header">
                        <h4>{producto.nombre}</h4>
                        <span className="badge-ventas">Top Ventas</span>
                      </div>
                      <div className="producto-popular-stats">
                        <div className="stat-item">
                          <span className="stat-label">Unidades Vendidas</span>
                          <span className="stat-value">{producto.cantidadTotal}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Veces Comprado</span>
                          <span className="stat-value">{producto.vecesComprado}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Total Ventas</span>
                          <span className="stat-value">${producto.ventasTotal.toFixed(2)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Última Compra</span>
                          <span className="stat-value">
                            {new Date(producto.ultimaCompra).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pedidos-lista">
                <h3>Lista de Pedidos</h3>
                <div className="pedidos-grid">
                  {pedidos.map((pedido) => (
                    <div key={pedido.id} className="pedido-card">
                      <div className="pedido-header">
                        <span className={`estado-pedido ${pedido.estado}`}>
                          {pedido.estado.toUpperCase()}
                        </span>
                        <span className="fecha-pedido">
                          {new Date(pedido.fechaCreacion).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="datos-cliente">
                        <h4>Datos del Cliente</h4>
                        <p><strong>Nombre:</strong> {pedido.datosEnvio.nombre}</p>
                        <p><strong>Email:</strong> {pedido.datosEnvio.email}</p>
                        <p><strong>Teléfono:</strong> {pedido.datosEnvio.telefono}</p>
                        <p><strong>Dirección:</strong> {pedido.datosEnvio.direccion}</p>
                        <p><strong>Ciudad:</strong> {pedido.datosEnvio.ciudad}, {pedido.datosEnvio.estado}</p>
                        <p><strong>CP:</strong> {pedido.datosEnvio.codigoPostal}</p>
                        {pedido.datosEnvio.instrucciones && (
                          <p><strong>Instrucciones:</strong> {pedido.datosEnvio.instrucciones}</p>
                        )}
                      </div>

                      <div className="pedido-productos">
                        <h4>Productos</h4>
                        {pedido.productos.map((prod, idx) => (
                          <div key={idx} className="pedido-producto-item">
                            <span>{prod.nombre} x {prod.cantidad}</span>
                            <span>${(prod.precio * prod.cantidad).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pedido-footer">
                        <p className="pedido-total">Total: ${pedido.total.toFixed(2)}</p>
                        
                        <div className="pedido-acciones">
                          <div className="numero-guia-input">
                            <input
                              type="text"
                              placeholder="Número de guía"
                              value={guiasTemporales[pedido.id] ?? pedido.numeroGuia ?? ''}
                              onChange={(e) => handleGuiaChange(pedido.id, e.target.value)}
                              onBlur={() => handleGuiaBlur(pedido.id)}
                              onKeyPress={(e) => handleGuiaKeyPress(e, pedido.id)}
                              disabled={pedidosCargando[pedido.id]}
                            />
                            {pedidosCargando[pedido.id] && (
                              <span className="guia-loading">
                                <div className="spinner-small"></div>
                              </span>
                            )}
                          </div>

                          <select
                            value={pedido.estado}
                            onChange={(e) => actualizarEstadoPedido(pedido.id, e.target.value as 'pendiente' | 'completado' | 'cancelado')}
                            className="estado-selector"
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="completado">Completado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>

                          <button 
                            className="btn-whatsapp"
                            onClick={() => enviarMensajeWhatsApp(pedido)}
                          >
                            Enviar WhatsApp
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "ofertas" && (
            <div className="ofertas-tab">
              <h2>Gestión de Ofertas</h2>
              
              <div className="form-oferta">
                <div className="form-group">
                  <label>Título de la Oferta *</label>
                  <input
                    type="text"
                    value={nuevaOferta.titulo}
                    onChange={(e) => setNuevaOferta({ ...nuevaOferta, titulo: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    value={nuevaOferta.descripcion}
                    onChange={(e) => setNuevaOferta({ ...nuevaOferta, descripcion: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Imagen</label>
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNuevaOferta({ ...nuevaOferta, imagen: e.target.files[0] });
                      }
                    }}
                  />
                  {nuevaOferta.imagen && (
                    <div className="imagen-preview">
                      <span>Nueva imagen seleccionada: {nuevaOferta.imagen.name}</span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Fecha de Inicio *</label>
                  <input
                    type="datetime-local"
                    value={nuevaOferta.fechaInicio}
                    onChange={(e) => setNuevaOferta({ ...nuevaOferta, fechaInicio: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Fin *</label>
                  <input
                    type="datetime-local"
                    value={nuevaOferta.fechaFin}
                    onChange={(e) => setNuevaOferta({ ...nuevaOferta, fechaFin: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Activa</label>
                  <input
                    type="checkbox"
                    checked={nuevaOferta.activa}
                    onChange={(e) => setNuevaOferta({ ...nuevaOferta, activa: e.target.checked })}
                  />
                </div>
                <button 
                  onClick={() => edicionId ? actualizarOferta() : agregarOferta()}
                  className="btn-primary"
                  disabled={cargando}
                >
                  {edicionId ? "Actualizar Oferta" : "Agregar Oferta"}
                </button>
              </div>

              <div className="ofertas-list">
                <h3>Lista de Ofertas ({ofertas.length})</h3>
                {ofertas.length === 0 ? (
                  <p>No hay ofertas registradas</p>
                ) : (
                  <ul className="ofertas-grid">
                    {ofertas.map((oferta) => (
                      <li key={oferta.id} className="oferta-item">
                        <span>{oferta.titulo}</span>
                        <div className="oferta-acciones">
                          <button 
                            className="btn-editar" 
                            onClick={() => editarOferta(oferta)} 
                            disabled={cargando}
                          >
                            Editar
                          </button>
                          <button 
                            className="btn-eliminar" 
                            onClick={() => eliminarOferta(oferta.id, oferta.imagenUrl)} 
                            disabled={cargando}
                          >
                            Eliminar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      
    </div>
  );
};

export default PanelControl;