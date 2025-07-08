"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
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
  stock?: string;
  estado?: string;
  marca?: string;
  presentacion?: string;
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
  rol?: string; // Add rol to the Usuario type
};

type Presentacion = { tamanio: string; stock: number };

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
  estado: string;
  presentaciones?: Presentacion[];
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

const SUPER_ADMIN_EMAIL = "admin11@gmail.com";

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
    tueste: "Medio",
    estado: "",
    presentaciones: []
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
  // Añadir estados para los campos temporales de nueva presentación
  const [nuevaPresentacionTamanio, setNuevaPresentacionTamanio] = useState("");
  const [nuevaPresentacionStock, setNuevaPresentacionStock] = useState("");

  // Refs para evitar dependencias problemáticas en useCallback
  // These refs are crucial for `useCallback` functions to always get the latest state without re-creating the function.
  const nuevoProductoRef = useRef(nuevoProducto);
  const nuevoCafeRef = useRef(nuevoCafe);
  const nuevaCategoriaRef = useRef(nuevaCategoria);
  const usuarioEditandoRef = useRef(usuarioEditando);
  const nuevaGuiaRef = useRef(nuevaGuia);

  // Update refs when state changes
  useEffect(() => {
    nuevoProductoRef.current = nuevoProducto;
  }, [nuevoProducto]);

  useEffect(() => {
    nuevoCafeRef.current = nuevoCafe;
  }, [nuevoCafe]);

  useEffect(() => {
    nuevaCategoriaRef.current = nuevaCategoria;
  }, [nuevaCategoria]);

  useEffect(() => {
    usuarioEditandoRef.current = usuarioEditando;
  }, [usuarioEditando]);

  useEffect(() => {
    nuevaGuiaRef.current = nuevaGuia;
  }, [nuevaGuia]);


  // Funciones de utilidad - definidas antes de los useEffect que las usan
  const cargarUsuarios = useCallback(async () => {
    try {
      console.log("Loading users from Firestore...");
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const usuariosMap = new Map<string, Usuario>();
      
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as FirestoreData;
        const usuario: Usuario = {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          emailVerified: data.emailVerified,
          providerData: data.providerData || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          lastLogin: data.lastLogin,
          rol: data.rol // Make sure to include the rol when loading users
        };
        
        // Solo agregar si no existe (evitar duplicados lógicos en el estado)
        // Note: The `limpiarUsuariosDuplicados` function handles physical duplicates in Firestore.
        if (!usuariosMap.has(usuario.uid)) {
          usuariosMap.set(usuario.uid, usuario);
        }
      });
      
      const lista = Array.from(usuariosMap.values());
      setUsuarios(lista);
      console.log(`Loaded ${lista.length} users.`);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setError(`Error al cargar usuarios: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  const limpiarUsuariosDuplicados = useCallback(async () => {
    try {
      console.log("Cleaning duplicate user documents...");
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const usuariosPorUid = new Map<string, UsuarioDocumento[]>();
      
      // Usar for...of para await dentro del ciclo
      for (const documento of querySnapshot.docs) {
        const data = documento.data() as FirestoreData;
        if (data.uid) {
          if (!usuariosPorUid.has(data.uid)) {
            usuariosPorUid.set(data.uid, []);
          }
          usuariosPorUid.get(data.uid)!.push({ id: documento.id, data });
        } else {
          console.warn("Documento de usuario sin UID encontrado, eliminando:", documento.id);
          await deleteDoc(doc(db, "usuarios", documento.id)); // ahora sí funciona bien
        }
      }
      
      for (const [, documentos] of usuariosPorUid.entries()) {
        if (documentos.length > 1) {
          documentos.sort((a, b) => {
            const dataA = a.data;
            const dataB = b.data;
            const fechaA = new Date(dataA.updatedAt || dataA.createdAt || 0).getTime();
            const fechaB = new Date(dataB.updatedAt || dataB.createdAt || 0).getTime();
            return fechaB - fechaA; // Sort descending, most recent first
          });
          
          const [, ...toDelete] = documentos; // Keep the first (most recent)
          for (const docElim of toDelete) {
            console.log("Deleting duplicate user document:", docElim.id, "for UID:", docElim.data.uid);
            await deleteDoc(doc(db, "usuarios", docElim.id));
          }
        }
      }
      console.log("Duplicate user documents cleaning complete.");
    } catch (error) {
      console.error("Error limpiando usuarios duplicados:", error);
      setError(`Error al limpiar usuarios duplicados: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  const guardarUsuario = useCallback(async (usuario: User) => { // Accept Firebase User object directly
    try {
      console.log("Attempting to save or update user in Firestore:", usuario.uid);
      const userDocQuery = await getDocs(query(collection(db, "usuarios"), where("uid", "==", usuario.uid)));
      
      const userDataToSave = {
        uid: usuario.uid,
        email: usuario.email,
        displayName: usuario.displayName,
        photoURL: usuario.photoURL,
        emailVerified: usuario.emailVerified,
        providerData: usuario.providerData.map(p => ({
          providerId: p.providerId,
          uid: p.uid,
          displayName: p.displayName,
          email: p.email,
          phoneNumber: p.phoneNumber,
          photoURL: p.photoURL
        })), // Sanitize providerData if necessary
        updatedAt: new Date().toISOString(),
      };

      if (userDocQuery.empty) {
        console.log("User not found in Firestore, adding new document.");
        await addDoc(collection(db, "usuarios"), {
          ...userDataToSave,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          rol: "cliente" // Default role for new users
        });
      } else {
        console.log("User found in Firestore, updating lastLogin and other fields.");
        const docRef = doc(db, "usuarios", userDocQuery.docs[0].id);
        await updateDoc(docRef, {
          ...userDataToSave,
          lastLogin: new Date().toISOString(),
          // Preserve existing 'rol' if it exists, otherwise set default 'cliente'
          rol: userDocQuery.docs[0].data().rol || "cliente"
        });
      }
      console.log("User data saved/updated successfully in Firestore.");
    } catch (error) {
      console.error("Error guardando usuario en Firestore:", error);
      // Do not set global error here, as this might be part of an auth flow.
      // Log the error for debugging.
    }
  }, []);

  const verificarUsuarioActual = useCallback(async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        // Only save/update if the user is genuinely authenticated via Firebase Auth
        await guardarUsuario(user);
      } else {
        console.log("No current Firebase authenticated user to verify/save.");
      }
    } catch (error) {
      console.error("Error verificando y guardando usuario actual:", error);
      // This is less critical to display to the user on initial load
    }
  }, [guardarUsuario]);


  const cargarProductos = useCallback(async () => {
    try {
      console.log("Loading products...");
      const querySnapshot = await getDocs(collection(db, "productos"));
      const lista: Producto[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lista.push({
          id: doc.id,
          nombre: data.nombre || data.product || "",
          precio: (data.precio || data.price || 0).toString(),
          categoria: data.categoria || data.category || "",
          descripcion: data.descripcion || data.description || "",
          imagen: null,
          imagenUrl: data.imagenUrl || data.pic || "",
          // campos extra
          stock: data.stock ?? "",
          estado: data.estado || "",
          marca: data.marca || "",
          presentacion: data.presentacion || "",
          // agrega aquí cualquier otro campo que quieras mostrar
        });
      });
      setProductos(lista);
      console.log(`Loaded ${lista.length} products.`);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setError("No se pudieron cargar los productos. Por favor, inténtalo de nuevo."); // Set specific error message
      // No need to throw new Error here, as we catch it in `cargarDatosIniciales`
    }
  }, []);

  const cargarCafes = useCallback(async () => {
    try {
      console.log("Loading coffees...");
      const querySnapshot = await getDocs(collection(db, "cafes"));
      const lista: Cafe[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        lista.push({
          id: docSnapshot.id,
          nombre: data.nombre || "",
          precio: data.precio ? data.precio.toString() : "",
          descripcion: data.descripcion || "",
          imagen: null,
          imagenUrl: data.imagenUrl || "",
          origen: data.origen || "",
          intensidad: data.intensidad ?? "",
          tipo: data.tipo || "",
          notas: data.notas || "",
          tueste: data.tueste || "",
          estado: data.estado || "",
          presentaciones: data.presentaciones || [],
        });
      });
      setCafes(lista);
      console.log(`Loaded ${lista.length} coffees.`);
    } catch (error) {
      console.error("Error cargando cafés:", error);
      setError("No se pudieron cargar los cafés. Por favor, inténtalo de nuevo."); // Set specific error message
    }
  }, []);

  const cargarCategorias = useCallback(async () => {
    try {
      console.log("Loading categories...");
      const querySnapshot = await getDocs(collection(db, "categorias"));
      const lista: Categoria[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as { nombre: string };
        lista.push({
          id: docSnapshot.id,
          nombre: data.nombre
        });
      });
      setCategorias(lista);
      console.log(`Loaded ${lista.length} categories.`);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      setError("No se pudieron cargar las categorías. Por favor, inténtalo de nuevo."); // Set specific error message
    }
  }, []);
  
  // Moved cargarPedidos definition BEFORE cargarDatosIniciales
  const cargarPedidos = useCallback(async () => {
    try {
      console.log("Loading orders...");
      const querySnapshot = await getDocs(collection(db, "pedidos"));
      const lista: Pedido[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as {
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
          id: docSnapshot.id,
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
      // Sort orders by creation date, most recent first
      setPedidos(lista.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()));
      console.log(`Loaded ${lista.length} orders.`);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      setError(`Error al cargar pedidos: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  const cargarDatosIniciales = useCallback(async () => {
    setCargando(true);
    setError(null); // Clear previous errors
    try {
      console.log("Starting initial data load...");
      // Ensure these run sequentially if cleaning duplicates is a prerequisite for loading users
      await limpiarUsuariosDuplicados();
      // Use Promise.all for concurrent fetching of products, categories, and cafes
      await Promise.all([cargarProductos(), cargarCategorias(), cargarCafes()]);
      await cargarUsuarios(); // Load users after cleaning duplicates and other data
      await cargarPedidos(); // Load orders
      console.log("Initial data load complete.");
    } catch (error) {
      console.error("Error during initial data loading:", error);
      // Specific error messages are set in individual loading functions
      setError(prev => prev || "Hubo un problema cargando los datos iniciales."); // Generic fallback
    } finally {
      setCargando(false);
    }
  }, [cargarProductos, cargarCategorias, cargarCafes, cargarUsuarios, limpiarUsuariosDuplicados, cargarPedidos]); // Added all dependencies


  // Removed direct rendering based on checkingAuth and usuarioActual here
  // These checks are now handled by the main return statement after the `if (cargando)` block.


  // Componente para mostrar imagen con placeholder
  const ImagenConPlaceholder = React.memo(({ src, alt }: { src?: string; alt: string }) => {
    const [imgError, setImgError] = useState(false);

    // If src is provided but is an empty string, treat it as no image
    if (!src || imgError) {
      return <div className="placeholder-imagen">Sin imagen</div>;
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={200}
        height={200}
        className="loaded" // Add loaded class initially, or after load event if preferred
        onError={() => {
          console.error(`Error loading image: ${src}`);
          setImgError(true);
        }}
        style={{ objectFit: 'cover' }}
        priority={false} // Adjust based on your needs, but false is often better for lists
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
      const filePath = `productos/${fileName}`; // Ensure correct bucket and path

      console.log(`Uploading image to Supabase: ${filePath}`);
      const { data, error: uploadError } = await supabase.storage
        .from('imagenes-productos') // Your Supabase bucket name
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false // Set to true if you want to allow overwriting
        });

      if (uploadError) {
        console.error("Error al subir imagen a Supabase:", uploadError);
        throw new Error(`Error al subir la imagen: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('imagenes-productos')
        .getPublicUrl(data.path);

      console.log("Image uploaded successfully, public URL:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Error en subirImagen (Subase hook):", error);
      throw error; // Re-throw to be caught by the calling function
    }
  }, []);

  // Manejar envío de formulario de producto
  const manejarSubmitProducto = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    
    const producto = nuevoProductoRef.current; // Use ref for latest state
    
    if (!producto.nombre?.trim()) {
      setError("Por favor ingresa un nombre válido para el producto");
      setCargando(false);
      return;
    }

    const parsedPrecio = parseFloat(producto.precio);
    if (isNaN(parsedPrecio) || parsedPrecio < 4) {
      setError("Por favor ingresa un precio válido (mayor o igual a 4 MXN)");
      setCargando(false);
      return;
    }

    if (!producto.categoria) {
      setError("Por favor selecciona una categoría");
      setCargando(false);
      return;
    }
    // Only require image if it's a new product AND no existing image URL
    if (!edicionId && !producto.imagen && !producto.imagenUrl) {
      setError("Por favor selecciona una imagen para el producto");
      setCargando(false);
      return;
    }

    try {
      let imagenUrl = producto.imagenUrl || ""; // Start with existing URL if any
      
      if (producto.imagen) { // If a new file is selected
        try {
          console.log("New product image detected, uploading...");
          imagenUrl = await subirImagen(producto.imagen);
        } catch (error) {
          setError(`No se pudo subir la imagen: ${error instanceof Error ? error.message : String(error)}`);
          setCargando(false);
          return; // Stop if image upload fails
        }
      } else if (!edicionId && !imagenUrl) {
          // This case should ideally be caught by the above !producto.imagen && !producto.imagenUrl check,
          // but good for an extra layer for new products.
          setError("Se requiere una imagen para el nuevo producto.");
          setCargando(false);
          return;
      }


      const productDataToSave = {
        product: producto.nombre.trim(),
        price: parsedPrecio,
        category: producto.categoria,
        description: producto.descripcion.trim(),
        pic: imagenUrl, // Use the new or existing image URL
        updatedAt: new Date().toISOString(),
        ...(!edicionId && { createdAt: new Date().toISOString() }) // Only add createdAt for new products
      };

      if (edicionId) {
        console.log("Updating product:", edicionId);
        await updateDoc(doc(db, "productos", edicionId), productDataToSave);
      } else {
        console.log("Adding new product.");
        await addDoc(collection(db, "productos"), productDataToSave);
      }

      // Reset form and ID
      setNuevoProducto({
        nombre: "",
        precio: "",
        categoria: "",
        descripcion: "",
        imagen: null,
        imagenUrl: "" // Clear image URL too
      });
      setEdicionId(null);
      
      await cargarProductos(); // Reload products to update the list
      setError(null); // Clear error on success
    } catch (error) {
      console.error("Error al guardar producto:", error);
      setError(`Error al guardar producto: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  }, [edicionId, subirImagen, cargarProductos]); // Added cargarProductos to dependencies

  // Manejar envío de formulario de café
  const manejarSubmitCafe = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    
    const cafe = nuevoCafeRef.current; // Use ref for latest state
    
    if (!cafe.nombre?.trim()) {
      setError("Por favor ingresa un nombre válido para el café");
      setCargando(false);
      return;
    }

    const parsedPrecio = parseFloat(cafe.precio);
    if (isNaN(parsedPrecio) || parsedPrecio < 4) {
      setError("Por favor ingresa un precio válido (mayor o igual a 4 MXN)");
      setCargando(false);
      return;
    }

    if (!edicionCafeId && !cafe.imagen && !cafe.imagenUrl) {
      setError("Por favor selecciona una imagen para el café");
      setCargando(false);
      return;
    }

    try {
      let imagenUrl = cafe.imagenUrl || "";
      
      if (cafe.imagen) {
        try {
          console.log("New coffee image detected, uploading...");
          imagenUrl = await subirImagen(cafe.imagen);
        } catch (error) {
          setError(`No se pudo subir la imagen del café: ${error instanceof Error ? error.message : String(error)}`);
          setCargando(false);
          return;
        }
      } else if (!edicionCafeId && !imagenUrl) {
        setError("Se requiere una imagen para el nuevo café.");
        setCargando(false);
        return;
      }

      const cafeDataToSave = {
        nombre: cafe.nombre.trim(),
        precio: parsedPrecio,
        descripcion: cafe.descripcion.trim(),
        imagenUrl: imagenUrl,
        origen: cafe.origen,
        intensidad: cafe.intensidad,
        tipo: cafe.tipo,
        notas: cafe.notas,
        tueste: cafe.tueste,
        estado: cafe.estado,
        presentaciones: cafe.presentaciones || [],
        updatedAt: new Date().toISOString(),
        ...(!edicionCafeId && { createdAt: new Date().toISOString() })
      };

      if (edicionCafeId) {
        console.log("Updating coffee:", edicionCafeId);
        await updateDoc(doc(db, "cafes", edicionCafeId), cafeDataToSave);
      } else {
        console.log("Adding new coffee.");
        await addDoc(collection(db, "cafes"), cafeDataToSave);
      }

      setNuevoCafe({
        nombre: "",
        precio: "",
        descripcion: "",
        imagen: null,
        imagenUrl: "", // Clear image URL too
        origen: "",
        intensidad: 3,
        tipo: "Arábica",
        notas: "",
        tueste: "Medio",
        estado: "",
        presentaciones: []
      });
      setEdicionCafeId(null);
      
      await cargarCafes();
      setError(null);
    } catch (error) {
      console.error("Error al guardar café:", error);
      setError(`Error al guardar café: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  }, [edicionCafeId, subirImagen, cargarCafes]); // Added cargarCafes to dependencies

  // Editar producto
  const editarProducto = useCallback((producto: Producto) => {
    // Ensure `imagenUrl` is passed when setting `nuevoProducto` for editing
    setNuevoProducto({
      nombre: producto.nombre,
      precio: producto.precio,
      categoria: producto.categoria,
      descripcion: producto.descripcion,
      imagen: null, // Don't pre-fill file input
      imagenUrl: producto.imagenUrl // Keep the current image URL
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
      tueste: cafe.tueste,
      estado: cafe.estado,
      presentaciones: cafe.presentaciones || []
    });
    setEdicionCafeId(cafe.id || null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Eliminar producto (con imagen en Supabase)
  const eliminarProducto = useCallback(async (id: string, imagenUrl?: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto permanentemente? Esta acción no se puede deshacer.")) {
      return;
    }

    setCargando(true);
    setError(null);
    try {
      if (imagenUrl) {
        // Correctly parse the path from the URL
        const url = new URL(imagenUrl);
        // Supabase path often starts after /storage/v1/object/public/{bucket_name}/
        const pathSegments = url.pathname.split('/');
        const bucketIndex = pathSegments.indexOf('imagenes-productos'); // Find your bucket name index
        
        let filePath = '';
        if (bucketIndex !== -1 && bucketIndex + 1 < pathSegments.length) {
            filePath = pathSegments.slice(bucketIndex + 1).join('/');
        } else {
            console.warn("Could not extract file path from URL for deletion:", imagenUrl);
        }

        if (filePath) {
            console.log("Attempting to delete image from Supabase:", filePath);
            const { error: deleteError } = await supabase.storage
                .from('imagenes-productos')
                .remove([filePath]);
                
            if (deleteError) {
                console.error("Error al eliminar imagen de Supabase:", deleteError);
                // Continue to delete Firestore document even if image deletion fails, or handle differently
                setError(`Producto eliminado de Firestore, pero hubo un error al eliminar la imagen: ${deleteError.message}`);
            } else {
                console.log("Image successfully deleted from Supabase:", filePath);
            }
        }
      }

      console.log("Deleting product document from Firestore:", id);
      await deleteDoc(doc(db, "productos", id));
      await cargarProductos();
      setError(null); // Clear error on success
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      setError(`Error al eliminar producto: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  }, [cargarProductos]); // Removed unused subirImagen from dependencies, added cargarProductos

  // Eliminar café (con imagen en Supabase)
  const eliminarCafe = useCallback(async (id: string, imagenUrl?: string) => {
    if (!confirm("¿Estás seguro de eliminar este café permanentemente? Esta acción no se puede deshacer.")) {
      return;
    }

    setCargando(true);
    setError(null);
    try {
      if (imagenUrl) {
        const url = new URL(imagenUrl);
        const pathSegments = url.pathname.split('/');
        const bucketIndex = pathSegments.indexOf('imagenes-productos');
        
        let filePath = '';
        if (bucketIndex !== -1 && bucketIndex + 1 < pathSegments.length) {
            filePath = pathSegments.slice(bucketIndex + 1).join('/');
        } else {
            console.warn("Could not extract file path from URL for deletion:", imagenUrl);
        }

        if (filePath) {
            console.log("Attempting to delete coffee image from Supabase:", filePath);
            const { error: deleteError } = await supabase.storage
                .from('imagenes-productos')
                .remove([filePath]);
                
            if (deleteError) {
                console.error("Error al eliminar imagen de café de Supabase:", deleteError);
                setError(`Café eliminado de Firestore, pero hubo un error al eliminar la imagen: ${deleteError.message}`);
            } else {
                console.log("Coffee image successfully deleted from Supabase:", filePath);
            }
        }
      }

      console.log("Deleting coffee document from Firestore:", id);
      await deleteDoc(doc(db, "cafes", id));
      await cargarCafes();
      setError(null);
    } catch (error) {
      console.error("Error al eliminar café:", error);
      setError(`Error al eliminar café: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  }, [cargarCafes]);

  // Agregar nueva categoría
  const agregarCategoria = useCallback(async () => {
    const categoria = nuevaCategoriaRef.current; // Use ref for latest state
    
    if (!categoria.nombre.trim()) {
      setError("Por favor ingresa un nombre para la categoría");
      return;
    }

    setCargando(true);
    setError(null);
    try {
      await addDoc(collection(db, "categorias"), {
        nombre: categoria.nombre.trim(),
        createdAt: new Date().toISOString()
      });
      setNuevaCategoria({ nombre: "" });
      await cargarCategorias();
      setError(null);
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      setError(`Error al agregar categoría: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  }, [cargarCategorias]); // Added cargarCategorias to dependencies

  // Editar categoría - already correct
  const editarCategoria = useCallback((categoria: Categoria) => {
    setNuevaCategoria({ nombre: categoria.nombre });
    setEdicionCategoriaId(categoria.id || null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Actualizar categoría
  const actualizarCategoria = useCallback(async () => {
    if (!edicionCategoriaId) return;
    
    const categoria = nuevaCategoriaRef.current; // Use ref for latest state
    
    if (!categoria.nombre.trim()) {
      setError("Por favor ingresa un nombre para la categoría");
      return;
    }

    setCargando(true);
    setError(null);
    try {
      await updateDoc(doc(db, "categorias", edicionCategoriaId), {
        nombre: categoria.nombre.trim(),
        updatedAt: new Date().toISOString()
      });
      setNuevaCategoria({ nombre: "" });
      setEdicionCategoriaId(null);
      await cargarCategorias();
      setError(null);
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      setError(`Error al actualizar categoría: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  }, [edicionCategoriaId, cargarCategorias]); // Added cargarCategorias to dependencies

  // Eliminar categoría
  const eliminarCategoria = useCallback(async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría? Esto también eliminará todos los productos asociados con esta categoría.")) {
      return;
    }

    setCargando(true);
    setError(null);
    try {
      // Opcional: Eliminar productos asociados. Esto puede ser costoso en Firestore.
      // Si hay muchos productos, considera una Cloud Function o un proceso batch.
      // const productosAsociados = await getDocs(query(collection(db, "productos"), where("category", "==", categorias.find(c => c.id === id)?.nombre || "")));
      // const batch = writeBatch(db);
      // productosAsociados.forEach(pDoc => batch.delete(pDoc.ref));
      // await batch.commit();

      await deleteDoc(doc(db, "categorias", id));
      await cargarCategorias();
      await cargarProductos(); // Reload products as categories might affect them
      setError(null);
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      setError(`Error al eliminar categoría: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  }, [cargarCategorias, cargarProductos, categorias]); // Added categorias to dependencies to access category name for product deletion (if implemented)

  // Eliminar usuario
  const eliminarUsuario = useCallback(async (uid: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) {
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const userQuery = await getDocs(query(collection(db, "usuarios"), where("uid", "==", uid)));
      
      if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        console.log("Deleting user document:", userDoc.id, "for UID:", uid);
        await deleteDoc(doc(db, "usuarios", userDoc.id));
        await cargarUsuarios();
        setError(null);
      } else {
        setError("Usuario no encontrado en la base de datos.");
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
    if (!edicionUsuarioId || !usuarioEditandoRef.current) {
      setError("No hay usuario para actualizar.");
      return;
    }
    
    const usuario = usuarioEditandoRef.current; // Use ref for latest state
    
    if (!usuario.email?.trim()) {
      setError("Por favor ingresa un email válido");
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const userQuery = await getDocs(query(collection(db, "usuarios"), where("uid", "==", edicionUsuarioId)));
      
      if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        console.log("Updating user document:", userDoc.id, "for UID:", edicionUsuarioId);
        await updateDoc(doc(db, "usuarios", userDoc.id), {
          email: usuario.email.trim(),
          displayName: usuario.displayName?.trim() || null,
          photoURL: usuario.photoURL,
          emailVerified: usuario.emailVerified,
          // Do not update providerData here unless it's explicitly managed
          updatedAt: new Date().toISOString()
        });
        
        setUsuarioEditando(null);
        setEdicionUsuarioId(null);
        await cargarUsuarios();
        setError(null);
      } else {
        setError("No se encontró el documento del usuario para actualizar.");
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      setError(`Error al actualizar usuario: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  }, [edicionUsuarioId, cargarUsuarios]);


  // Función para marcar como completado y eliminar
  const marcarComoPagado = useCallback(async (pedidoId: string) => {
    if (!confirm("¿Estás seguro de marcar este pedido como completado? Se eliminará permanentemente de la lista de pedidos pendientes.")) {
      return;
    }
    
    setCargando(true);
    setError(null);
    try {
      console.log("Deleting order as completed:", pedidoId);
      await deleteDoc(doc(db, "pedidos", pedidoId));
      await cargarPedidos();
      setError(null);
    } catch (error) {
      console.error("Error al completar el pedido:", error);
      setError(`Error al completar el pedido: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  }, [cargarPedidos]);

  // Función para guardar guía de envío
  const guardarGuiaEnvio = useCallback(async (pedidoId: string) => {
    const guia = nuevaGuiaRef.current; // Use ref for latest state
    
    if (!guia.trim()) {
      setError("Por favor ingresa la guía de envío");
      return;
    }
    setCargando(true);
    setError(null);
    try {
      console.log("Updating shipping guide for order:", pedidoId);
      await updateDoc(doc(db, "pedidos", pedidoId), { guiaEnvio: guia.trim() });
      setEditandoGuiaId(null);
      setNuevaGuia("");
      await cargarPedidos();
      setError(null);
    } catch (error) {
      console.error("Error al guardar la guía de envío:", error);
      setError(`Error al guardar la guía de envío: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCargando(false);
    }
  }, [cargarPedidos]);


  // Primary Authentication Effect
  useEffect(() => {
    console.log("🔍 Starting authentication check via onAuthStateChanged...");
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      console.log("👤 Auth state changed. User:", user?.email || "No authenticated user");
      try {
        if (!user) {
          console.warn("No authenticated user found. Redirecting to login.");
          setUsuarioActual(null); // Explicitly clear user
          router.replace("/login");
          return; // Crucial: exit early if no user
        }

        // If it's the super admin by email (highest privilege)
        if (user.email === SUPER_ADMIN_EMAIL) {
          console.log("👑 User is SUPER_ADMIN_EMAIL. Granting access.");
          setUsuarioActual({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            providerData: user.providerData,
            rol: "super_admin" // Explicitly set role for super admin
          });
          // Also save/update this user in Firestore with their proper data
          await guardarUsuario(user);
          return; // Exit here, super admin has immediate access
        }

        // Consult Firestore for role if not super admin email
        console.log("🔍 Querying Firestore for user role for UID:", user.uid);
        const userQuery = await getDocs(query(collection(db, "usuarios"), where("uid", "==", user.uid)));

        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          const data = userDoc.data() as FirestoreData;
          console.log("📋 User document found in Firestore. Data:", data);

          if (data.rol === "admin") {
            console.log("✅ User has 'admin' role. Setting usuarioActual.");
            setUsuarioActual({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              emailVerified: user.emailVerified,
              providerData: user.providerData,
              rol: "admin" // Explicitly set role
            });
            // Also save/update this user in Firestore with their proper data
            await guardarUsuario(user);
          } else {
            console.warn(`User ${user.email} (UID: ${user.uid}) does not have 'admin' role. Redirecting.`);
            setUsuarioActual(null); // Ensure user state is cleared
            router.replace("/login");
          }
        } else {
          console.warn(`User ${user.email} (UID: ${user.uid}) not found in Firestore 'usuarios' collection. Redirecting.`);
          setUsuarioActual(null); // Ensure user state is cleared
          router.replace("/login");
        }
      } catch (error) {
        console.error("🚨 Critical Error during authentication or role verification:", error);
        setError(`Error de autenticación: ${error instanceof Error ? error.message : String(error)}. Por favor, intenta de nuevo.`);
        setUsuarioActual(null); // Clear user state on error
        router.replace("/login"); // Redirect on critical error
      } finally {
        console.log("🏁 Authentication check complete. Setting checkingAuth(false).");
        setCheckingAuth(false); // Always set to false here to dismiss initial loading overlay
      }
    });

    return () => unsubscribe(); // Cleanup the listener
  }, [router, guardarUsuario]); // Added guardarUsuario as a dependency for this effect

  // Effect to load initial data *after* authentication check is done AND a user is authenticated
  useEffect(() => {
    if (!checkingAuth && usuarioActual) {
      console.log("✅ Auth check complete and user authenticated. Starting initial data fetch.");
      cargarDatosIniciales(); // This includes all other data loading
    } else if (!checkingAuth && !usuarioActual) {
      console.log("❌ Auth check complete, but no admin user authenticated. No data fetch initiated.");
      // The user would have been redirected by the auth effect
    }
  }, [checkingAuth, usuarioActual, cargarDatosIniciales]); // Added cargarDatosIniciales as a dependency

  // Manejar carga de imágenes para prevenir bug visual
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
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
                img.style.display = 'none'; // Hide broken images
                img.classList.remove('loaded'); // Ensure 'loaded' class is removed
              });
            }
          }
        });
      } catch (error) {
        console.error("Error manejando carga de imágenes:", error);
      }
    };

    // Re-run this effect when products or cafes change
    const timer = setTimeout(handleImageLoad, 200); // Give DOM a moment to update
    
    return () => clearTimeout(timer);
  }, [productos, cafes, activeTab]); // Added activeTab to re-run on tab change


  // --- Conditional Rendering for Loading and Access Denied ---
  if (checkingAuth) {
    return (
      <div className="cargando-overlay">
        <div className="cargando-contenido">
          <div className="spinner"></div>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Once authentication check is done, if no user is authenticated, show access denied
  if (!usuarioActual) {
    return <div style={{padding: 40, textAlign: 'center', color: 'red', fontSize: '1.2em'}}>Acceso denegado. Por favor, inicia sesión con una cuenta de administrador.</div>;
  }

  // If a user is authenticated, but other data operations are loading
  if (cargando) {
    return (
      <div className="cargando-overlay">
        <div className="cargando-contenido">
          <div className="spinner"></div>
          <p>Procesando datos...</p>
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
          <p>Administra tus productos, categorías, cafés, usuarios y pedidos.</p>
          {usuarioActual && (
            <div style={{marginTop: 10, fontSize: '14px', color: '#666'}}>
              Conectado como: <strong>{usuarioActual.email}</strong>
              {(usuarioActual.rol === "super_admin" || usuarioActual.email === SUPER_ADMIN_EMAIL) && (
                <span style={{marginLeft: 10, color: '#28a745'}}>👑 Super Admin</span>
              )}
              {usuarioActual.rol === "admin" && usuarioActual.email !== SUPER_ADMIN_EMAIL && (
                <span style={{marginLeft: 10, color: '#007bff'}}>⭐ Admin</span>
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
                          imagen: null,
                          imagenUrl: "" // Clear image URL too
                        });
                        setError(null); // Clear error on cancel
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
                  <div className="productos-grid-simple">
                    {productos.map((producto) => (
                      <div key={producto.id} className="producto-card-simple">
                        {producto.imagenUrl && (
                          <ImagenConPlaceholder src={producto.imagenUrl} alt={producto.nombre} />
                        )}
                        <h4>{producto.nombre}</h4>
                        <p className="precio">
                          {parseFloat(producto.precio).toLocaleString('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                            minimumFractionDigits: 2
                          })}
                        </p>
                        <p className="categoria">Categoría: {producto.categoria}</p>
                        <p className="categoria">Stock: {producto.stock}</p>
                        <p className="categoria">Estado: {producto.estado}</p>
                        <p className="categoria">Marca: {producto.marca}</p>
                        <p className="categoria">Presentación: {producto.presentacion}</p>
                        {producto.descripcion && (
                          <p className="descripcion">{producto.descripcion}</p>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button className="btn-editar" onClick={() => editarProducto(producto)}>Editar</button>
                          <button className="btn-eliminar" onClick={() => eliminarProducto(producto.id!, producto.imagenUrl ?? "")}>Eliminar</button>
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
                  <label>Estado*</label>
                  <select
                    value={nuevoCafe.estado}
                    onChange={(e) => setNuevoCafe({ ...nuevoCafe, estado: e.target.value })}
                    required
                  >
                    <option value="">Selecciona el estado</option>
                    <option value="molido">Molido</option>
                    <option value="grano">En grano</option>
                    <option value="otro">Otro</option>
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

                <div className="form-group">
                  <label>Presentaciones</label>
                  {nuevoCafe.presentaciones && nuevoCafe.presentaciones.length > 0 && (
                    <ul style={{ marginBottom: 10 }}>
                      {nuevoCafe.presentaciones.map((pres, idx) => (
                        <li key={idx} style={{ marginBottom: 6 }}>
                          <span style={{ fontWeight: 'bold' }}>{pres.tamanio}</span> - {pres.stock} piezas
                          <button type="button" className="btn-eliminar" style={{ marginLeft: 10, padding: '2px 10px', fontSize: '0.9em' }} onClick={() => {
                            setNuevoCafe({
                              ...nuevoCafe,
                              presentaciones: nuevoCafe.presentaciones!.filter((_, i) => i !== idx)
                            });
                          }}>Eliminar</button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Tamaño (ej: 1 kilo, 500g)"
                      value={nuevaPresentacionTamanio}
                      onChange={e => setNuevaPresentacionTamanio(e.target.value)}
                      style={{ flex: 2 }}
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Stock"
                      value={nuevaPresentacionStock}
                      onChange={e => setNuevaPresentacionStock(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.95em' }}
                      onClick={() => {
                        if (nuevaPresentacionTamanio && nuevaPresentacionStock) {
                          setNuevoCafe({
                            ...nuevoCafe,
                            presentaciones: [
                              ...(nuevoCafe.presentaciones || []),
                              {
                                tamanio: nuevaPresentacionTamanio,
                                stock: parseInt(nuevaPresentacionStock)
                              }
                            ]
                          });
                          setNuevaPresentacionTamanio("");
                          setNuevaPresentacionStock("");
                        }
                      }}
                    >Agregar</button>
                  </div>
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
                          imagenUrl: "", // Clear image URL too
                          origen: "",
                          intensidad: 3,
                          tipo: "Arábica",
                          notas: "",
                          tueste: "Medio",
                          estado: "",
                          presentaciones: []
                        });
                        setError(null); // Clear error on cancel
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
                  <div className="productos-grid-simple">
                    {cafes.map((cafe) => (
                      <div key={cafe.id} className="producto-card-simple">
                        {cafe.imagenUrl && (
                          <ImagenConPlaceholder src={cafe.imagenUrl} alt={cafe.nombre} />
                        )}
                        <h4>{cafe.nombre}</h4>
                        <p className="precio">
                          {parseFloat(cafe.precio).toLocaleString('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                            minimumFractionDigits: 2
                          })}
                        </p>
                        <p className="categoria">Origen: {cafe.origen}</p>
                        <p className="categoria">Tipo: {cafe.tipo}</p>
                        <p className="categoria">Intensidad: {cafe.intensidad}</p>
                        <p className="categoria">Tueste: {cafe.tueste}</p>
                        {/* Estado visual mejorado */}
                        <span className={`badge-estado badge-${cafe.estado}`} style={{marginBottom: 6, marginTop: 4}}>
                          {cafe.estado === 'molido' ? 'Molido' : cafe.estado === 'grano' ? 'En grano' : cafe.estado}
                        </span>
                        {Array.isArray(cafe.presentaciones) && cafe.presentaciones.length > 0 && (
                          <ul style={{marginTop: 8}}>
                            {cafe.presentaciones.map((pres, idx) => (
                              <li key={idx}>
                                {pres.tamanio} - <span style={{fontWeight: pres.stock <= 2 ? 'bold' : 'normal', color: pres.stock <= 2 ? '#e67e22' : undefined}}>{pres.stock} piezas{pres.stock <= 2 && ' ¡Stock bajo!'}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {cafe.descripcion && (
                          <p className="descripcion">{cafe.descripcion}</p>
                        )}
                        {cafe.notas && (
                          <p className="descripcion">Notas: {cafe.notas}</p>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button className="btn-editar" onClick={() => editarCafe(cafe)}>Editar</button>
                          <button className="btn-eliminar" onClick={() => eliminarCafe(cafe.id!, cafe.imagenUrl ?? "")}>Eliminar</button>
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
                        setError(null); // Clear error on cancel
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

                  {/* Add role editing only if current user is SUPER_ADMIN_EMAIL */}
                  {(usuarioActual?.email === SUPER_ADMIN_EMAIL) && (
                    <div className="form-group">
                      <label>Rol</label>
                      <select
                        value={usuarioEditando.rol || "cliente"} // Default to 'cliente' if not set
                        onChange={(e) => setUsuarioEditando({ ...usuarioEditando, rol: e.target.value })}
                      >
                        <option value="cliente">Cliente</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  )}

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
                        setError(null); // Clear error on cancel
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
                                {usuario.displayName ? usuario.displayName.charAt(0).toUpperCase() : (usuario.email ? usuario.email.charAt(0).toUpperCase() : 'U')}
                              </div>
                            </div>
                          )}
                          <div className="usuario-datos">
                            <h4>{usuario.displayName || 'Sin nombre'}</h4>
                            <p><strong>Email:</strong> {usuario.email || 'No proporcionado'}</p>
                            <p><strong>ID:</strong> {usuario.uid}</p>
                            <p><strong>Rol:</strong> {usuario.rol ? (usuario.rol === 'admin' ? 'Administrador' : 'Cliente') : 'Cliente (por defecto)'}</p>
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
                          {/* Allow super admin to delete any user, regular admin cannot delete other admins or super admin */}
                          {usuarioActual?.email === SUPER_ADMIN_EMAIL && usuario.uid !== usuarioActual.uid && (
                            <button 
                              onClick={() => eliminarUsuario(usuario.uid)}
                              className="btn-eliminar"
                              disabled={cargando}
                            >
                              Eliminar
                            </button>
                          )}
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
                              <span>${prod.precio.toFixed(2)} c/u</span> {/* Ensure price is formatted */}
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
                              <button onClick={() => { setEditandoGuiaId(null); setNuevaGuia(""); setError(null); }} className="btn-secondary" disabled={cargando}>
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="numero-guia-input">
                              <span><strong>Guía de envío:</strong> {pedido.guiaEnvio || 'No asignada'}</span>
                              <button onClick={() => { setEditandoGuiaId(pedido.id); setNuevaGuia(pedido.guiaEnvio || ""); setError(null); }} className="btn-editar" disabled={cargando}>
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