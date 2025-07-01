"use client";
import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { createClient } from '@supabase/supabase-js';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import "./panel.css";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Configura Supabase - Usar variables de entorno en producción
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vvtqfedsnthxeqaejhzg.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dHFmZWRzbnRoeGVxYWVqaHpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI5NTIyOCwiZXhwIjoyMDYzODcxMjI4fQ.nxeSUTZ2429JBZVONXE9oRpkpFFJ6YAtcDvb-BKfJ-k';

const supabase = createClient(supabaseUrl, supabaseKey);

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
  providerData: unknown[];
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
};

type Cafe = {
  id?: string;
  nombre: string;
  precio: string;
  descripcion: string;
  imagen: File | null;
  imagenUrl?: string;
  origen: string;
  intensidad: number;
  tipo: string;
  notas: string;
  tueste: string;
};

// Agrego tipo Pedido
type Pedido = {
  id: string;
  productos: { nombre: string; cantidad: number; precio: number }[];
  total: number;
  estado: string;
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
  guiaEnvio?: string;
};

// Definir tipo para los documentos agrupados por UID
interface UsuarioDocumento {
  id: string;
  data: FirestoreData;
}

// Tipo para datos de Firestore
interface FirestoreData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerData: unknown[];
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  rol?: string;
}

const SUPER_ADMIN_EMAIL = "oscar73986@gmail.com";

const PanelControl = () => {
  const router = useRouter();
  // useState hooks
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [activeTab, setActiveTab] = useState<"productos" | "categorias" | "usuarios" | "estadisticas" | "cafes" | "pedidos">("productos");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [nuevoProducto, setNuevoProducto] = useState<Producto>({
    nombre: "",
    precio: "",
    categoria: "",
    descripcion: "",
    imagen: null
  });
  const [nuevoCafe, setNuevoCafe] = useState<Cafe>({
    nombre: "",
    precio: "",
    descripcion: "",
    imagen: null,
    origen: "",
    intensidad: 3,
    tipo: "Arábica",
    notas: "",
    tueste: "Medio"
  });
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: "" });
  const [edicionId, setEdicionId] = useState<string | null>(null);
  const [edicionCafeId, setEdicionCafeId] = useState<string | null>(null);
  const [edicionCategoriaId, setEdicionCategoriaId] = useState<string | null>(null);
  const [edicionUsuarioId, setEdicionUsuarioId] = useState<string | null>(null);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [editandoGuiaId, setEditandoGuiaId] = useState<string | null>(null);
  const [nuevaGuia, setNuevaGuia] = useState<string>("");

  // Funciones de utilidad - definidas antes de los useEffect que las usan
  const cargarUsuarios = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const usuariosMap = new Map<string, Usuario>();
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreData;
        const usuario: Usuario = {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          emailVerified: data.emailVerified,
          providerData: data.providerData || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          lastLogin: data.lastLogin
        };
        
        // Solo agregar si no existe (evitar duplicados)
        if (!usuariosMap.has(usuario.uid)) {
          usuariosMap.set(usuario.uid, usuario);
        }
      });
      
      // Convertir el Map a array
      const lista = Array.from(usuariosMap.values());
      setUsuarios(lista);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  }, []);

  const limpiarUsuariosDuplicados = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const usuariosPorUid = new Map<string, UsuarioDocumento[]>();
      
      // Agrupar documentos por UID
      querySnapshot.forEach((doc) => {
        const data = doc.data() as unknown as FirestoreData;
        const uid = data.uid;
        if (!usuariosPorUid.has(uid)) {
          usuariosPorUid.set(uid, []);
        }
        usuariosPorUid.get(uid)!.push({ id: doc.id, data });
      });
      
      // Eliminar duplicados, mantener solo el más reciente
      for (const [, documentos] of usuariosPorUid.entries()) {
        if (documentos.length > 1) {
          // Ordenar por fecha de creación/actualización
          documentos.sort((a, b) => {
            const dataA = a.data;
            const dataB = b.data;
            const fechaA = new Date(dataA.updatedAt || dataA.createdAt || 0);
            const fechaB = new Date(dataB.updatedAt || dataB.createdAt || 0);
            return fechaB.getTime() - fechaA.getTime();
          });
          // Mantener el primero (más reciente) y eliminar el resto
          const [, ...eliminar] = documentos;
          for (const docElim of eliminar) {
            await deleteDoc(doc(db, "usuarios", docElim.id));
          }
        }
      }
    } catch (error) {
      console.error("Error limpiando usuarios duplicados:", error);
    }
  }, []);

  const guardarUsuario = useCallback(async (usuario: Usuario) => {
    try {
      // Verificar si el usuario ya existe
      const userDoc = await getDocs(query(collection(db, "usuarios"), where("uid", "==", usuario.uid)));
      
      if (userDoc.empty) {
        // Usuario no existe, agregarlo
        await addDoc(collection(db, "usuarios"), {
          uid: usuario.uid,
          email: usuario.email,
          displayName: usuario.displayName,
          photoURL: usuario.photoURL,
          emailVerified: usuario.emailVerified,
          providerData: usuario.providerData,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      } else {
        // Usuario existe, actualizar último login
        const docRef = doc(db, "usuarios", userDoc.docs[0].id);
        await updateDoc(docRef, {
          lastLogin: new Date().toISOString(),
          email: usuario.email,
          displayName: usuario.displayName,
          photoURL: usuario.photoURL,
          emailVerified: usuario.emailVerified,
          providerData: usuario.providerData
        });
      }
    } catch (error) {
      console.error("Error guardando usuario:", error);
    }
  }, []);

  const verificarUsuarioActual = useCallback(async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const usuarioData: Usuario = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          providerData: user.providerData
        };
        await guardarUsuario(usuarioData);
      }
    } catch (error) {
      console.error("Error verificando usuario actual:", error);
    }
  }, [guardarUsuario]);

  const cargarProductos = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "productos"));
      const lista: Producto[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as {
          product: string;
          price: number;
          category: string;
          description: string;
          pic: string;
        };
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
  }, []);

  const cargarCafes = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "cafes"));
      const lista: Cafe[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as {
          nombre?: string;
          precio?: number;
          descripcion?: string;
          imagenUrl?: string;
          origen?: string;
          intensidad?: number;
          tipo?: string;
          notas?: string;
          tueste?: string;
        };
        lista.push({
          id: doc.id,
          nombre: data.nombre || "",
          precio: data.precio ? data.precio.toString() : "",
          descripcion: data.descripcion || "",
          imagen: null,
          imagenUrl: data.imagenUrl || "",
          origen: data.origen || "",
          intensidad: data.intensidad ?? 3,
          tipo: data.tipo || "",
          notas: data.notas || "",
          tueste: data.tueste || ""
        });
      });
      setCafes(lista);
    } catch (error) {
      console.error("Error cargando cafés:", error);
      throw new Error("No se pudieron cargar los cafés");
    }
  }, []);

  const cargarCategorias = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categorias"));
      const lista: Categoria[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as { nombre: string };
        lista.push({
          id: doc.id,
          nombre: data.nombre
        });
      });
      setCategorias(lista);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      throw new Error("No se pudieron cargar las categorías");
    }
  }, []);

  const cargarDatosIniciales = useCallback(async () => {
    setCargando(true);
    try {
      await Promise.all([cargarProductos(), cargarCategorias(), cargarCafes()]);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setCargando(false);
    }
  }, [cargarProductos, cargarCategorias, cargarCafes]);

  const cargarPedidos = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "pedidos"));
      const lista: Pedido[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as {
          productos?: { nombre: string; cantidad: number; precio: number }[];
          total?: number;
          estado?: string;
          fechaCreacion?: string;
          datosEnvio?: {
            nombre: string;
            email: string;
            telefono: string;
            direccion: string;
            codigoPostal: string;
            ciudad: string;
            estado: string;
            instrucciones?: string;
          };
          guiaEnvio?: string;
        };
        lista.push({
          id: doc.id,
          productos: data.productos || [],
          total: data.total || 0,
          estado: data.estado || 'pendiente',
          fechaCreacion: data.fechaCreacion || '',
          datosEnvio: data.datosEnvio || {
            nombre: '',
            email: '',
            telefono: '',
            direccion: '',
            codigoPostal: '',
            ciudad: '',
            estado: ''
          },
          guiaEnvio: data.guiaEnvio || ''
        });
      });
      setPedidos(lista.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()));
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    }
  }, []);

  // useEffect hooks
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      try {
        if (!user) {
          router.replace("/login");
          setCheckingAuth(false);
          return;
        }
        
        // Verificar si es el super admin por email
        if (user.email === SUPER_ADMIN_EMAIL) {
          setUsuarioActual({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            providerData: user.providerData
          });
          setCheckingAuth(false);
          return;
        }
        
        // Consultar Firestore para obtener el rol
        const userQuery = await getDocs(query(collection(db, "usuarios"), where("uid", "==", user.uid)));
        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          const data = userDoc.data() as FirestoreData;
          if (data.rol === "admin") {
            setUsuarioActual({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              emailVerified: user.emailVerified,
              providerData: user.providerData
            });
          } else {
            console.log("Usuario no tiene rol de admin:", user.email);
            router.replace("/login");
          }
        } else {
          console.log("Usuario no encontrado en Firestore:", user.email);
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error verificando rol de usuario:", error);
        router.replace("/login");
      } finally {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!checkingAuth) {
      cargarPedidos();
    }
  }, [checkingAuth, cargarPedidos]);

  // Cargar datos iniciales
  useEffect(() => {
    const inicializarDatos = async () => {
      try {
        await limpiarUsuariosDuplicados(); // Limpiar duplicados primero
        await cargarDatosIniciales();
        await verificarUsuarioActual();
        await cargarUsuarios();
      } catch (error) {
        console.error("Error inicializando datos:", error);
      }
    };
    
    inicializarDatos();
  }, [limpiarUsuariosDuplicados, cargarDatosIniciales, verificarUsuarioActual, cargarUsuarios]);

  // Escuchar cambios en la autenticación
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        await guardarUsuario({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          providerData: user.providerData
        });
        await cargarUsuarios(); // Recargar lista de usuarios
      }
    });

    return () => unsubscribe();
  }, [guardarUsuario, cargarUsuarios]);

  // Manejar carga de imágenes para prevenir bug visual
  useEffect(() => {
    if (typeof window === 'undefined') return; // Evitar errores en SSR
    
    const handleImageLoad = () => {
      try {
        const images = document.querySelectorAll('.producto-imagen img, .cafe-imagen img');
        images.forEach((img) => {
          if (img instanceof HTMLImageElement) {
            if (img.complete) {
              img.classList.add('loaded');
            } else {
              img.addEventListener('load', () => {
                img.classList.add('loaded');
              });
              img.addEventListener('error', () => {
                img.style.display = 'none';
              });
            }
          }
        });
      } catch (error) {
        console.error("Error manejando carga de imágenes:", error);
      }
    };

    // Ejecutar después de que el DOM se actualice
    const timer = setTimeout(handleImageLoad, 100);
    
    return () => clearTimeout(timer);
  }, [productos, cafes]);

  if (checkingAuth) {
    return <div style={{padding: 40, textAlign: 'center'}}>Cargando...</div>;
  }

  // Verificación adicional de seguridad
  if (!usuarioActual) {
    return <div style={{padding: 40, textAlign: 'center'}}>Acceso denegado. Redirigiendo...</div>;
  }

  // Componente para mostrar imagen con placeholder
  const ImagenConPlaceholder = React.memo(({ src, alt }: { src?: string; alt: string }) => {
    const [imgError, setImgError] = useState(false);

    if (!src || imgError) {
      return <div className="placeholder-imagen">Sin imagen</div>;
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={200}
        height={200}
        className="loaded"
        onError={() => setImgError(true)}
        style={{ objectFit: 'cover' }}
        priority={false}
      />
    );
  });

  ImagenConPlaceholder.displayName = 'ImagenConPlaceholder';



  // Subir imagen a Supabase Storage
  const subirImagen = useCallback(async (file: File): Promise<string> => {
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
  }, []);

  // Manejar envío de formulario de producto
  const manejarSubmitProducto = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    
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
  }, [nuevoProducto, edicionId, subirImagen, cargarProductos]);

  // Manejar envío de formulario de café
  const manejarSubmitCafe = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    
    if (!nuevoCafe.nombre?.trim()) {
      setError("Por favor ingresa un nombre válido para el café");
      return;
    }

    if (!nuevoCafe.precio || isNaN(parseFloat(nuevoCafe.precio))) {
      setError("Por favor ingresa un precio válido");
      return;
    }

    if (parseFloat(nuevoCafe.precio) < 4) {
      setError("El precio debe ser mayor que 4");
      return;
    }

    if (!edicionCafeId && !nuevoCafe.imagen) {
      setError("Por favor selecciona una imagen para el café");
      return;
    }

    try {
      let imagenUrl = nuevoCafe.imagenUrl || "";
      
      if (nuevoCafe.imagen) {
        try {
          imagenUrl = await subirImagen(nuevoCafe.imagen);
        } catch (error) {
          throw new Error(`No se pudo subir la imagen: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      const cafeData = {
        nombre: nuevoCafe.nombre.trim(),
        precio: parseFloat(nuevoCafe.precio),
        descripcion: nuevoCafe.descripcion.trim(),
        imagenUrl: imagenUrl,
        origen: nuevoCafe.origen,
        intensidad: nuevoCafe.intensidad,
        tipo: nuevoCafe.tipo,
        notas: nuevoCafe.notas,
        tueste: nuevoCafe.tueste,
        updatedAt: new Date().toISOString(),
        ...(!edicionCafeId && { createdAt: new Date().toISOString() })
      };

      if (edicionCafeId) {
        await updateDoc(doc(db, "cafes", edicionCafeId), cafeData);
      } else {
        await addDoc(collection(db, "cafes"), cafeData);
      }

      setNuevoCafe({
        nombre: "",
        precio: "",
        descripcion: "",
        imagen: null,
        origen: "",
        intensidad: 3,
        tipo: "Arábica",
        notas: "",
        tueste: "Medio"
      });
      setEdicionCafeId(null);
      
      await cargarCafes();
    } catch (error) {
      console.error("Error al guardar café:", error);
      setError(`Error al guardar café: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  }, [nuevoCafe, edicionCafeId, subirImagen, cargarCafes]);

  // Editar producto
  const editarProducto = useCallback((producto: Producto) => {
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
  }, []);

  // Editar café
  const editarCafe = useCallback((cafe: Cafe) => {
    setNuevoCafe({
      nombre: cafe.nombre,
      precio: cafe.precio,
      descripcion: cafe.descripcion,
      imagen: null,
      imagenUrl: cafe.imagenUrl,
      origen: cafe.origen,
      intensidad: cafe.intensidad,
      tipo: cafe.tipo,
      notas: cafe.notas,
      tueste: cafe.tueste
    });
    setEdicionCafeId(cafe.id || null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Eliminar producto (con imagen en Supabase)
  const eliminarProducto = useCallback(async (id: string, imagenUrl?: string) => {
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
  }, [cargarProductos]);

  // Eliminar café (con imagen en Supabase)
  const eliminarCafe = useCallback(async (id: string, imagenUrl?: string) => {
    if (!confirm("¿Estás seguro de eliminar este café permanentemente?")) {
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

      await deleteDoc(doc(db, "cafes", id));
      await cargarCafes();
    } catch (error) {
      console.error("Error al eliminar café:", error);
      setError(`Error al eliminar café: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  }, [cargarCafes]);

  // Agregar nueva categoría
  const agregarCategoria = useCallback(async () => {
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
  }, [nuevaCategoria.nombre, cargarCategorias]);

  // Editar categoría
  const editarCategoria = useCallback((categoria: Categoria) => {
    setNuevaCategoria({ nombre: categoria.nombre });
    setEdicionCategoriaId(categoria.id || null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Actualizar categoría
  const actualizarCategoria = useCallback(async () => {
    if (!edicionCategoriaId) return;
    
    if (!nuevaCategoria.nombre.trim()) {
      setError("Por favor ingresa un nombre para la categoría");
      return;
    }

    setCargando(true);
    setError(null);
    try {
      await updateDoc(doc(db, "categorias", edicionCategoriaId), {
        nombre: nuevaCategoria.nombre.trim(),
        updatedAt: new Date().toISOString()
      });
      setNuevaCategoria({ nombre: "" });
      setEdicionCategoriaId(null);
      await cargarCategorias();
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      setError(`Error al actualizar categoría: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  }, [edicionCategoriaId, nuevaCategoria.nombre, cargarCategorias]);

  // Eliminar categoría
  const eliminarCategoria = useCallback(async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría? Esto también eliminará todos los productos asociados.")) {
      return;
    }

    setCargando(true);
    setError(null);
    try {
      await deleteDoc(doc(db, "categorias", id));
      await cargarCategorias();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      setError(`Error al eliminar categoría: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  }, [cargarCategorias]);

  // Eliminar usuario
  const eliminarUsuario = useCallback(async (uid: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) {
      return;
    }

    setCargando(true);
    setError(null);
    try {
      // Buscar el documento del usuario por UID
      const userQuery = await getDocs(query(collection(db, "usuarios"), where("uid", "==", uid)));
      
      if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        await deleteDoc(doc(db, "usuarios", userDoc.id));
        await cargarUsuarios();
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      setError(`Error al eliminar usuario: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  }, [cargarUsuarios]);

  // Editar usuario
  const editarUsuario = useCallback((usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setEdicionUsuarioId(usuario.uid);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Actualizar usuario
  const actualizarUsuario = useCallback(async () => {
    if (!edicionUsuarioId || !usuarioEditando) return;
    
    if (!usuarioEditando.email?.trim()) {
      setError("Por favor ingresa un email válido");
      return;
    }

    setCargando(true);
    setError(null);
    try {
      // Buscar el documento del usuario por UID
      const userQuery = await getDocs(query(collection(db, "usuarios"), where("uid", "==", edicionUsuarioId)));
      
      if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        await updateDoc(doc(db, "usuarios", userDoc.id), {
          email: usuarioEditando.email.trim(),
          displayName: usuarioEditando.displayName?.trim() || null,
          photoURL: usuarioEditando.photoURL,
          emailVerified: usuarioEditando.emailVerified,
          updatedAt: new Date().toISOString()
        });
        
        setUsuarioEditando(null);
        setEdicionUsuarioId(null);
        await cargarUsuarios();
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      setError(`Error al actualizar usuario: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  }, [edicionUsuarioId, usuarioEditando, cargarUsuarios]);



  // Función para marcar como completado y eliminar
  const marcarComoPagado = useCallback(async (pedidoId: string) => {
    if (!confirm("¿Estás seguro de marcar este pedido como completado? Se eliminará permanentemente.")) {
      return;
    }
    
    setCargando(true);
    setError(null);
    try {
      await deleteDoc(doc(db, "pedidos", pedidoId));
      await cargarPedidos();
    } catch (error) {
      console.error("Error al completar el pedido:", error);
      setError("Error al completar el pedido");
    } finally {
      setCargando(false);
    }
  }, [cargarPedidos]);

  // Función para guardar guía de envío
  const guardarGuiaEnvio = useCallback(async (pedidoId: string) => {
    if (!nuevaGuia.trim()) {
      setError("Por favor ingresa la guía de envío");
      return;
    }
    setCargando(true);
    setError(null);
    try {
      await updateDoc(doc(db, "pedidos", pedidoId), { guiaEnvio: nuevaGuia });
      setEditandoGuiaId(null);
      setNuevaGuia("");
      await cargarPedidos();
    } catch (error) {
      console.error("Error al guardar la guía de envío:", error);
      setError("Error al guardar la guía de envío");
    } finally {
      setCargando(false);
    }
  }, [nuevaGuia, cargarPedidos]);

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
          className={activeTab === "cafes" ? "active" : ""}
          onClick={() => setActiveTab("cafes")}
        >
          Cafés
        </button>
        <button
          className={activeTab === "pedidos" ? "active" : ""}
          onClick={() => setActiveTab("pedidos")}
        >
          Pedidos
        </button>
      </nav>

      <div className="panel-control">
        <header className="panel-header">
          <h1>Panel de Control</h1>
          <p>Administra tus productos y categorías</p>
          {usuarioActual && (
            <div style={{marginTop: 10, fontSize: '14px', color: '#666'}}>
              Conectado como: <strong>{usuarioActual.email}</strong>
              {usuarioActual.email === SUPER_ADMIN_EMAIL && (
                <span style={{marginLeft: 10, color: '#28a745'}}>👑 Super Admin</span>
              )}
            </div>
          )}
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
                    min="4.00"
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
                  <label>Imagen {!edicionId && "*"}</label>
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
                      <Image 
                        src={nuevoProducto.imagenUrl} 
                        alt="Preview" 
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover' }}
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
                        <div className="producto-imagen">
                          <ImagenConPlaceholder src={producto.imagenUrl} alt={producto.nombre} />
                        </div>
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

          {activeTab === "cafes" && (
            <div className="cafes-tab">
              <h2>Gestión de Cafés</h2>
              
              <form onSubmit={manejarSubmitCafe} className="form">
                <div className="form-group">
                  <label>Nombre del Café *</label>
                  <input
                    type="text"
                    value={nuevoCafe.nombre}
                    onChange={(e) => setNuevoCafe({ ...nuevoCafe, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Precio (MXN) *</label>
                  <input
                    type="number"
                    value={nuevoCafe.precio}
                    onChange={(e) => setNuevoCafe({ ...nuevoCafe, precio: e.target.value })}
                    required
                    step="0.01"
                    min="4.00"
                  />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    value={nuevoCafe.descripcion}
                    onChange={(e) => setNuevoCafe({ ...nuevoCafe, descripcion: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Origen</label>
                  <input
                    type="text"
                    value={nuevoCafe.origen}
                    onChange={(e) => setNuevoCafe({ ...nuevoCafe, origen: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Intensidad (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={nuevoCafe.intensidad}
                    onChange={(e) => setNuevoCafe({ ...nuevoCafe, intensidad: parseInt(e.target.value) || 3 })}
                  />
                </div>

                <div className="form-group">
                  <label>Tipo</label>
                  <select
                    value={nuevoCafe.tipo}
                    onChange={(e) => setNuevoCafe({ ...nuevoCafe, tipo: e.target.value })}
                  >
                    <option value="Arábica">Arábica</option>
                    <option value="Robusta">Robusta</option>
                    <option value="Mezcla">Mezcla</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notas de cata</label>
                  <input
                    type="text"
                    value={nuevoCafe.notas}
                    onChange={(e) => setNuevoCafe({ ...nuevoCafe, notas: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Tueste</label>
                  <select
                    value={nuevoCafe.tueste}
                    onChange={(e) => setNuevoCafe({ ...nuevoCafe, tueste: e.target.value })}
                  >
                    <option value="Ligero">Ligero</option>
                    <option value="Medio">Medio</option>
                    <option value="Oscuro">Oscuro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Imagen {!edicionCafeId && "*"}</label>
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNuevoCafe({ ...nuevoCafe, imagen: e.target.files[0] });
                      }
                    }}
                  />
                  {nuevoCafe.imagenUrl && (
                    <div className="imagen-preview">
                      <Image 
                        src={nuevoCafe.imagenUrl} 
                        alt="Preview" 
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover' }}
                      />
                      <span>Imagen actual</span>
                    </div>
                  )}
                  {nuevoCafe.imagen && (
                    <div className="imagen-preview">
                      <span>Nueva imagen seleccionada: {nuevoCafe.imagen.name}</span>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={cargando}>
                    {edicionCafeId ? "Actualizar Café" : "Agregar Café"}
                  </button>
                  {edicionCafeId && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setEdicionCafeId(null);
                        setNuevoCafe({
                          nombre: "",
                          precio: "",
                          descripcion: "",
                          imagen: null,
                          origen: "",
                          intensidad: 3,
                          tipo: "Arábica",
                          notas: "",
                          tueste: "Medio"
                        });
                      }}
                      disabled={cargando}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              <div className="cafes-list">
                <h3>Lista de Cafés ({cafes.length})</h3>
                {cafes.length === 0 ? (
                  <p>No hay cafés registrados</p>
                ) : (
                  <div className="productos-grid">
                    {cafes.map((cafe) => (
                      <div key={cafe.id} className="producto-card">
                        <div className="producto-imagen">
                          <ImagenConPlaceholder src={cafe.imagenUrl} alt={cafe.nombre} />
                        </div>
                        <div className="producto-info">
                          <h4>{cafe.nombre}</h4>
                          <p className="precio">${parseFloat(cafe.precio).toFixed(2)} MXN</p>
                          <p className="origen"><strong>Origen:</strong> {cafe.origen}</p>
                          <p className="tipo"><strong>Tipo:</strong> {cafe.tipo}</p>
                          <p className="intensidad"><strong>Intensidad:</strong> {cafe.intensidad}/10</p>
                          <p className="tueste"><strong>Tueste:</strong> {cafe.tueste}</p>
                          {cafe.descripcion && (
                            <p className="descripcion"><strong>Descripción:</strong> {cafe.descripcion}</p>
                          )}
                          {cafe.notas && (
                            <p className="notas"><strong>Notas:</strong> {cafe.notas}</p>
                          )}
                        </div>
                        <div className="producto-acciones">
                          <button 
                            onClick={() => editarCafe(cafe)}
                            className="btn-editar"
                            disabled={cargando}
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => cafe.id && eliminarCafe(cafe.id, cafe.imagenUrl)}
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
                <div className="form-actions">
                  <button 
                    onClick={edicionCategoriaId ? actualizarCategoria : agregarCategoria}
                    className="btn-primary"
                    disabled={cargando}
                  >
                    {edicionCategoriaId ? "Actualizar Categoría" : "Agregar Categoría"}
                  </button>
                  {edicionCategoriaId && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setEdicionCategoriaId(null);
                        setNuevaCategoria({ nombre: "" });
                      }}
                      disabled={cargando}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
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
                          <button 
                            onClick={() => editarCategoria(categoria)}
                            className="btn-editar" 
                            disabled={cargando}
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => categoria.id && eliminarCategoria(categoria.id)}
                            className="btn-eliminar" 
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

          {activeTab === "usuarios" && (
            <div className="usuarios-tab">
              <h2>Gestión de Usuarios</h2>
              
              {edicionUsuarioId && usuarioEditando && (
                <form onSubmit={(e) => { e.preventDefault(); actualizarUsuario(); }} className="form">
                  <h3>Editar Usuario</h3>
                  
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={usuarioEditando.email || ""}
                      onChange={(e) => setUsuarioEditando({ ...usuarioEditando, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Nombre de Usuario</label>
                    <input
                      type="text"
                      value={usuarioEditando.displayName || ""}
                      onChange={(e) => setUsuarioEditando({ ...usuarioEditando, displayName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>URL de Foto de Perfil</label>
                    <input
                      type="url"
                      value={usuarioEditando.photoURL || ""}
                      onChange={(e) => setUsuarioEditando({ ...usuarioEditando, photoURL: e.target.value })}
                      placeholder="https://ejemplo.com/foto.jpg"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={usuarioEditando.emailVerified}
                        onChange={(e) => setUsuarioEditando({ ...usuarioEditando, emailVerified: e.target.checked })}
                      />
                      Email Verificado
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={cargando}>
                      Actualizar Usuario
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setEdicionUsuarioId(null);
                        setUsuarioEditando(null);
                      }}
                      disabled={cargando}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
              
              {usuarios.length === 0 ? (
                <p>No hay usuarios registrados</p>
              ) : (
                <div className="usuarios-list">
                  <h3>Lista de Usuarios ({usuarios.length})</h3>
                  <div className="usuarios-grid">
                    {usuarios.map((usuario) => (
                      <div key={usuario.uid} className="usuario-card">
                        <div className="usuario-info">
                          {usuario.photoURL ? (
                            <div className="usuario-avatar">
                              <Image src={usuario.photoURL} alt="Avatar" width={80} height={80} style={{ objectFit: 'cover' }} />
                            </div>
                          ) : (
                            <div className="usuario-avatar">
                              <div className="avatar-placeholder">
                                {usuario.displayName ? usuario.displayName.charAt(0).toUpperCase() : 'U'}
                              </div>
                            </div>
                          )}
                          <div className="usuario-datos">
                            <h4>{usuario.displayName || 'Sin nombre'}</h4>
                            <p><strong>Email:</strong> {usuario.email || 'No proporcionado'}</p>
                            <p><strong>ID:</strong> {usuario.uid}</p>
                            <p><strong>Verificado:</strong> {usuario.emailVerified ? 'Sí' : 'No'}</p>
                            <p><strong>Proveedor:</strong> {(() => {
                              const provider = usuario.providerData[0];
                              if (provider && typeof provider === 'object' && 'providerId' in provider) {
                                return (provider as { providerId?: string }).providerId || 'Desconocido';
                              }
                              return 'Desconocido';
                            })()}</p>
                          </div>
                        </div>
                        <div className="usuario-acciones">
                          <button 
                            onClick={() => editarUsuario(usuario)}
                            className="btn-editar"
                            disabled={cargando}
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => eliminarUsuario(usuario.uid)}
                            className="btn-eliminar"
                            disabled={cargando}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "pedidos" && (
            <div className="pedidos-tab">
              <h2>Gestión de Pedidos</h2>
              <div className="pedidos-lista">
                <h3>Lista de Pedidos ({pedidos.length})</h3>
                {pedidos.length === 0 ? (
                  <p>No hay pedidos registrados</p>
                ) : (
                  <div className="pedidos-grid">
                    {pedidos.map((pedido) => (
                      <div key={pedido.id} className="pedido-card">
                        <div className="pedido-header">
                          <span className={`estado-pedido ${pedido.estado === 'pagado' ? 'completado' : pedido.estado === 'pendiente' ? 'pendiente' : 'cancelado'}`}>{pedido.estado === 'pagado' ? 'Pagado' : pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}</span>
                          <span className="fecha-pedido">{new Date(pedido.fechaCreacion).toLocaleString()}</span>
                        </div>
                        <div className="pedido-productos">
                          <h4>Productos</h4>
                          {pedido.productos.map((prod, idx) => (
                            <div key={idx} className="pedido-producto-item">
                              <span>{prod.nombre} x {prod.cantidad}</span>
                              <span>${prod.precio} c/u</span>
                            </div>
                          ))}
                        </div>
                        <div className="pedido-footer">
                          <div className="pedido-total">
                            Total: ${pedido.total.toFixed(2)} MXN
                          </div>
                        </div>
                        <div className="datos-cliente">
                          <h4>Datos del Cliente</h4>
                          <p><strong>Nombre:</strong> {pedido.datosEnvio?.nombre}</p>
                          <p><strong>Email:</strong> {pedido.datosEnvio?.email}</p>
                          <p><strong>Teléfono:</strong> {pedido.datosEnvio?.telefono}</p>
                          <p><strong>Dirección:</strong> {pedido.datosEnvio?.direccion}, {pedido.datosEnvio?.ciudad}, {pedido.datosEnvio?.estado}, CP {pedido.datosEnvio?.codigoPostal}</p>
                          {pedido.datosEnvio?.instrucciones && <p><strong>Instrucciones:</strong> {pedido.datosEnvio.instrucciones}</p>}
                        </div>
                        <div className="pedido-acciones">
                          <button onClick={() => marcarComoPagado(pedido.id)} className="btn-primary" disabled={cargando}>
                            <span role="img" aria-label="Completado">✅</span> Completar y eliminar
                          </button>
                          {editandoGuiaId === pedido.id ? (
                            <div className="numero-guia-input">
                              <input
                                type="text"
                                value={nuevaGuia}
                                onChange={e => setNuevaGuia(e.target.value)}
                                placeholder="Guía de envío"
                                autoFocus
                              />
                              <button onClick={() => guardarGuiaEnvio(pedido.id)} className="btn-primary" disabled={cargando}>
                                <span role="img" aria-label="Guardar">💾</span> Guardar
                              </button>
                              <button onClick={() => { setEditandoGuiaId(null); setNuevaGuia(""); }} className="btn-secondary" disabled={cargando}>
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="numero-guia-input">
                              <span><strong>Guía de envío:</strong> {pedido.guiaEnvio || 'No asignada'}</span>
                              <button onClick={() => { setEditandoGuiaId(pedido.id); setNuevaGuia(pedido.guiaEnvio || ""); }} className="btn-editar" disabled={cargando}>
                                {pedido.guiaEnvio ? 'Editar' : 'Agregar'}
                              </button>
                              {pedido.guiaEnvio && pedido.datosEnvio?.telefono && (
                                <a
                                  href={`https://wa.me/52${pedido.datosEnvio.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${pedido.datosEnvio.nombre}, tu pedido ha sido enviado. Tu guía de envío es: ${pedido.guiaEnvio}`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-whatsapp"
                                >
                                  <svg width="22" height="22" viewBox="0 0 32 32" style={{ marginRight: 8, verticalAlign: 'middle' }}>
                                    <path fill="#fff" d="M16 3C9.373 3 4 8.373 4 15c0 2.65.87 5.1 2.36 7.1L4 29l7.18-2.31C13.1 27.13 14.53 27.5 16 27.5c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.3 0-2.57-.25-3.75-.74l-.27-.11-4.27 1.37 1.37-4.27-.11-.27C6.25 17.57 6 16.3 6 15c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.07-7.75c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.36-.26.29-1 1-.99 2.43.01 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.23.69.28 1.23.45 1.65.58.69.22 1.32.19 1.81.12.55-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/>
                                  </svg>
                                  Enviar por WhatsApp
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "estadisticas" && (
            <div className="estadisticas-tab">
              <h2>Estadísticas</h2>
              <div className="estadisticas-contenido">
                <p>Aquí irán las estadísticas del negocio</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PanelControl;