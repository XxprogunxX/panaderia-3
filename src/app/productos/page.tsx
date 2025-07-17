"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useCarrito } from '../components/CarritoContext';
import { useMercadoPago } from "../components/useMercadopago"; 
import footerStyles from "../footer.module.css";
import styles from './productos.module.css';
import Footer from '../components/Footer';

interface Producto {
  nombre: string;
  descripcion: string;
  imagen: string;
  precio: number;
  categoria: string;
  stock?: number;
  cantidad?: number;
}

export default function Productos() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { carrito, agregarAlCarrito, eliminarDelCarrito } = useCarrito();
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [cantidades, setCantidades] = useState<{ [key: string]: number }>({});
  
  const { /*cargandoPago, handlePagar*/ } = useMercadoPago();

  // Carga inicial de productos
  useEffect(() => {
    setIsClient(true);
    const obtenerProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const lista: Producto[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          lista.push({
            nombre: data.product,
            descripcion: data.description,
            imagen: data.pic || "/images/default.jpg",
            precio: data.price,
            categoria: data.category,
            stock: data.stock ?? 0,
          });
        });

        setProductos(lista);
        
        // Inicializar cantidades en 1 para cada producto
        const cantidadesIniciales: { [key: string]: number } = {};
        lista.forEach(producto => {
          cantidadesIniciales[producto.nombre] = 1;
        });
        setCantidades(cantidadesIniciales);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    obtenerProductos();
  }, []);

  // Manejo optimizado del cambio de búsqueda
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  }, []);

  // Cambiar handleCantidadChange, incrementarCantidad y decrementarCantidad para respetar el stock
  const handleCantidadChange = (nombre: string, nuevaCantidad: number) => {
    const producto = productos.find(p => p.nombre === nombre);
    const max = producto?.stock ?? 99;
    if (nuevaCantidad >= 1 && nuevaCantidad <= max) {
      setCantidades(prev => ({
        ...prev,
        [nombre]: nuevaCantidad
      }));
    }
  };

  const incrementarCantidad = (nombre: string) => {
    const producto = productos.find(p => p.nombre === nombre);
    const max = producto?.stock ?? 99;
    setCantidades(prev => ({
      ...prev,
      [nombre]: Math.min((prev[nombre] || 1) + 1, max)
    }));
  };

  const decrementarCantidad = (nombre: string) => {
    setCantidades(prev => ({
      ...prev,
      [nombre]: Math.max(1, (prev[nombre] || 1) - 1)
    }));
  };

  // Agregar al carrito con la cantidad seleccionada (usando el hook correcto)
  const handleAgregarAlCarrito = (producto: Producto) => {
    const cantidad = cantidades[producto.nombre] || 1;
    agregarAlCarrito(producto, cantidad);
  };

  const categoriasUnicas = [...new Set(productos.map((p) => p.categoria))]
  .filter((cat) => cat && cat.toLowerCase() !== "café");

const productosFiltrados = productos.filter(
  (p) => {
    const coincideBusqueda = (p.nombre?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
                            (p.descripcion?.toLowerCase() || '').includes(busqueda.toLowerCase());
    const coincideCategoria = !categoriaSeleccionada || p.categoria === categoriaSeleccionada;
    const noEsCafe = p.categoria?.toLowerCase() !== "café";
    return coincideBusqueda && coincideCategoria && noEsCafe;
  }
);

const limpiarFiltros = () => {
  setBusqueda("");
  setCategoriaSeleccionada("");
};

  const esImagenExterna = (url: string) => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const irACheckout = () => {
    router.push('/checkout');
  };

  const toggleCarrito = () => setMostrarCarrito(!mostrarCarrito);

  if (!isClient || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className={styles.productos}>
      <main>
        <section className={styles.productosHero}>
          <h1>Nuestros Productos</h1>
          <p>Descubre toda nuestra variedad de panes y repostería</p>
          <input
            type="text"
            placeholder="Buscar pan..."
            value={busqueda}
            onChange={handleSearchChange}
            className={styles.buscador}
            onFocus={(e) => e.target.select()}
            autoFocus
          />
          
          {/* Submenú de categorías */}
          <div className={styles.categoriasMenu}>
            <button
              className={`${styles.categoriaBtn} ${!categoriaSeleccionada ? styles.activo : ''}`}
              onClick={() => setCategoriaSeleccionada("")}
            >
              Todos
            </button>
            {categoriasUnicas.map((categoria) => (
              <button
                key={categoria}
                className={`${styles.categoriaBtn} ${categoriaSeleccionada === categoria ? styles.activo : ''}`}
                onClick={() => setCategoriaSeleccionada(categoria)}
              >
                {categoria}
              </button>
            ))}
            {(busqueda || categoriaSeleccionada) && (
              <button
                className={styles.limpiarBtn}
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </section>

        <section className={styles.categoriasProductos}>
          {productosFiltrados.length > 0 ? (
            <div className={styles.productosGrid}>
              {productosFiltrados.map((producto) => (
                <div key={producto.nombre} className={styles.card}>
                  <div className={styles.imagenContainer}>
                    {esImagenExterna(producto.imagen) ? (
                      <Image
                        src={producto.imagen}
                        alt={producto.nombre}
                        width={300}
                        height={200}
                        className={styles.imagen}
                        style={{ objectFit: "cover" }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/images/default.jpg') target.src = '/images/default.jpg';
                        }}
                      />
                    ) : (
                      <Image
                        src={producto.imagen}
                        alt={producto.nombre}
                        width={300}
                        height={200}
                        className={styles.imagen}
                        style={{ objectFit: "cover" }}
                        priority
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/images/default.jpg') target.src = '/images/default.jpg';
                        }}
                      />
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <h3>{producto.nombre}</h3>
                    <p className={styles.descripcion}>{producto.descripcion}</p>
                    <p className={styles.precio}>
                      ${producto.precio} MXN
                    </p>
                    <p className={styles.stock}>
                      Stock disponible: {producto.stock ?? 0}
                    </p>
                    {/* Controles de cantidad */}
                    <div className={styles.cantidadContainer}>
                      <label htmlFor={`cantidad-${producto.nombre}`}>Cantidad:</label>
                      <div className={styles.cantidadControls}>
                        <button 
                          type="button"
                          className={styles.btnCantidad}
                          onClick={() => decrementarCantidad(producto.nombre)}
                          disabled={cantidades[producto.nombre] <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          id={`cantidad-${producto.nombre}`}
                          min="1"
                          max={producto.stock ?? 99}
                          value={cantidades[producto.nombre] || 1}
                          onChange={(e) => handleCantidadChange(producto.nombre, parseInt(e.target.value) || 1)}
                          className={styles.cantidadInput}
                        />
                        <button 
                          type="button"
                          className={styles.btnCantidad}
                          onClick={() => incrementarCantidad(producto.nombre)}
                          disabled={cantidades[producto.nombre] >= (producto.stock ?? 99)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      className={styles.btnPedir} 
                      onClick={() => handleAgregarAlCarrito(producto)}
                      disabled={producto.stock === 0}
                    >
                      Añadir al carrito ({cantidades[producto.nombre] || 1})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noResultados}>
              <p>No se encontraron productos que coincidan con tu búsqueda.</p>
            </div>
          )}
        </section>

        {mostrarCarrito && (
          <div className={styles['carrito-overlay']} onClick={toggleCarrito}>
            <div className={styles.carrito} onClick={(e) => e.stopPropagation()}>
              <h2>Tu Carrito</h2>
              {carrito.length === 0 ? (
                <p>Tu carrito está vacío.</p>
              ) : (
                <>
                  <ul>
                    {carrito.map(({ nombre, precio, cantidad }, idx) => (
                      <li key={`${nombre}-${idx}`} className={styles['carrito-item']}>
                        <span>{nombre} x {cantidad}</span>
                        <span>${precio * cantidad} MXN</span>
                        <button 
                          className={styles['btn-eliminar']} 
                          onClick={() => eliminarDelCarrito(nombre as any)}
                        >
                          Eliminar
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className={styles['carrito-total']}>
                    <strong>Total: </strong>${carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0)} MXN
                  </div>
                  <button
                    className={styles['btn-pagar']}
                    onClick={irACheckout}
                    disabled={carrito.length === 0}
                  >
                    Proceder al pago
                  </button>
                </>
              )}
              <button className={styles['btn-cerrar']} onClick={toggleCarrito}>
                Cerrar
              </button>
            </div>
          </div>
        )}

        
      </main>
      <Footer />
    </div>
  );
}