"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useCarrito } from "../components/CarritoContext";
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
}

export default function Productos() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { productos: carrito, agregarProducto, eliminarProducto } = useCarrito();
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  
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
          });
        });

        setProductos(lista);
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

  const categoriasUnicas = [...new Set(productos.map((p) => p.categoria))];

  const productosFiltrados = productos.filter(
    (p) =>
      (p.nombre?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
      (p.descripcion?.toLowerCase() || '').includes(busqueda.toLowerCase())
  );

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
        </section>

        <section className={styles.categoriasProductos}>
          {productosFiltrados.length > 0 ? (
            categoriasUnicas.map((categoria) => {
              const productosPorCategoria = productosFiltrados.filter(
                (p) => p.categoria === categoria
              );

              if (productosPorCategoria.length === 0) return null;

              return (
                <div key={categoria}>
                  <h2 className={styles.categoriaTitulo}>{categoria}</h2>
                  <div className={styles.productosGrid}>
                    {productosPorCategoria.map((producto) => (
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
                          <p className={styles.precio}>${producto.precio} MXN</p>
                          <button 
                            className={styles.btnPedir} 
                            onClick={() => agregarProducto({ ...producto, cantidad: 1 })}
                          >
                            Añadir al carrito
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
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
                          onClick={() => eliminarProducto(nombre as any)}
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