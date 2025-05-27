"use client";
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { createClient } from '@supabase/supabase-js';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

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

type Usuario = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerData: any[];
};

const PanelControl = () => {
  // Estados
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [activeTab, setActiveTab] = useState<"productos" | "categorias" | "usuarios" | "estadisticas">("productos");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
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

  const cargarUsuarios = async () => {
    try {
      const auth = getAuth();
      const users: Usuario[] = [];
      
      // Observador para cambios en la autenticación
      onAuthStateChanged(auth, (user) => {
        if (user) {
          users.push({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            providerData: user.providerData
          });
          setUsuarios(users);
        }
      });

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
  }, []);

  const cargarDatosIniciales = async () => {
    setCargando(true);
    setError(null);
    try {
      await Promise.all([cargarProductos(), cargarCategorias()]);
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

    if (parseFloat(nuevoProducto.precio) <= 0) {
      setError("El precio debe ser mayor que 0");
      return;
    }

    if (!nuevoProducto.categoria) {
      setError("Por favor selecciona una categoría");
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
      <div className="panel-control">
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

        <nav className="tabs">
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
            Estadísticas
          </button>
        </nav>

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
                    min="0.01"
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
                  <label>Imagen {!edicionId && '(Opcional)'}</label>
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
              <div className="coming-soon">
                <p>Esta sección estará disponible pronto</p>
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 20px;
          background-color: #f5f7fa;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .panel-control {
          width: 95%;
          max-width: 1200px;
          margin: 20px auto;
          padding: 25px;
          border-radius: 12px;
          background: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .panel-header {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eaeaea;
        }
        
        .panel-header h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 28px;
        }
        
        .panel-header p {
          margin: 5px 0 0;
          color: #7f8c8d;
          font-size: 16px;
        }
        
        .error-message {
          position: relative;
          padding: 15px;
          margin-bottom: 20px;
          background-color: #fee2e2;
          color: #b91c1c;
          border-radius: 6px;
          border-left: 4px solid #b91c1c;
        }
        
        .cerrar-error {
          position: absolute;
          top: 5px;
          right: 5px;
          background: none;
          border: none;
          color: #b91c1c;
          font-size: 18px;
          cursor: pointer;
          padding: 0 5px;
        }
        
        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 25px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eaeaea;
        }
        
        .tabs button {
          padding: 10px 20px;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.3s ease;
          font-weight: 500;
          color: #7f8c8d;
        }
        
        .tabs button:hover {
          background-color: #f0f3f7;
          color: #3498db;
        }
        
        .tabs button.active {
          background-color: #3498db;
          color: white;
        }
        
        .tabs button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .form {
          background: #f8fafc;
          padding: 25px;
          border-radius: 10px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #2c3e50;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 15px;
          transition: border 0.3s;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #3498db;
          outline: none;
        }
        
        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }
        
        .imagen-preview {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #64748b;
        }
        
        .imagen-preview img {
          border-radius: 4px;
          border: 1px solid #eee;
        }
        
        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        
        .btn-primary {
          padding: 10px 20px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s;
        }
        
        .btn-primary:hover:not(:disabled) {
          background-color: #2980b9;
        }
        
        .btn-primary:disabled {
          background-color: #b0c4de;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          padding: 10px 20px;
          background-color: #f1f5f9;
          color: #64748b;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .btn-secondary:hover:not(:disabled) {
          background-color: #e2e8f0;
        }
        
        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .productos-list,
        .categorias-list {
          margin-top: 30px;
        }
        
        .productos-list h3,
        .categorias-list h3 {
          color: #2c3e50;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .productos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        
        .producto-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .producto-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .producto-imagen {
          height: 200px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
        }
        
        .producto-imagen img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .producto-info {
          padding: 15px;
        }
        
        .producto-info h4 {
          margin: 0 0 10px;
          color: #2c3e50;
          font-size: 18px;
        }
        
        .producto-info .precio {
          font-weight: bold;
          color: #27ae60;
          margin: 5px 0;
        }
        
        .producto-info .categoria {
          display: inline-block;
          background: #e0f2fe;
          color: #0369a1;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin: 5px 0;
        }
        
        .producto-info .descripcion {
          color: #64748b;
          font-size: 14px;
          margin: 10px 0 0;
          line-height: 1.5;
        }
        
        .producto-acciones {
          display: flex;
          border-top: 1px solid #eee;
          padding: 10px 15px;
          gap: 10px;
        }
        
        .btn-editar {
          padding: 8px 15px;
          background-color: #f0f9ff;
          color: #0369a1;
          border: 1px solid #bae6fd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .btn-editar:hover:not(:disabled) {
          background-color: #e0f2fe;
        }
        
        .btn-editar:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-eliminar {
          padding: 8px 15px;
          background-color: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .btn-eliminar:hover:not(:disabled) {
          background-color: #fee2e2;
        }
        
        .btn-eliminar:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .categorias-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .categoria-item {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s;
        }
        
        .categoria-item:hover {
          background-color: #f8fafc;
        }
        
        .categoria-acciones {
          display: flex;
          gap: 8px;
        }
        
        .coming-soon {
          text-align: center;
          padding: 50px 20px;
          background-color: #f8fafc;
          border-radius: 8px;
          color: #64748b;
        }
        
        .cargando-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .cargando-contenido {
          text-align: center;
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Estilos para la pestaña de usuarios */
        .usuarios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .usuario-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          transition: all 0.3s;
        }
        
        .usuario-card:hover {
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .usuario-info {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
        }
        
        .usuario-avatar {
          flex-shrink: 0;
        }
        
        .usuario-avatar img {
          border-radius: 50%;
          object-fit: cover;
        }
        
        .usuario-datos {
          flex-grow: 1;
        }
        
        .usuario-datos h4 {
          margin: 0 0 10px;
          color: #2c3e50;
        }
        
        .usuario-datos p {
          margin: 5px 0;
          font-size: 14px;
          color: #64748b;
        }
        
        .usuario-datos strong {
          color: #2c3e50;
        }
        
        .usuario-acciones {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }
      `}</style>
    </div>
  );
};

export default PanelControl;