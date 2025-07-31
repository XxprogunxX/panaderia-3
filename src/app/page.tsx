"use client";


import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
// import HelpPopup from "./components/bolita-de-ayuda/bolita"; // Eliminada
import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import OfertasCarousel from "./components/OfertasCarousel";
import styles from './home.module.css';
import Footer from './components/Footer';
import CarritoFlotante from './components/CarritoFlotante';
import { useCarrito } from './components/CarritoContext';

interface Producto {
  nombre: string;
  cantidadTotal: number;
  imagen: string;
  precio: number;
  descripcion: string;
}

interface ProductoPedido {
  nombre: string;
  cantidad: number;
  precio: number;
}

interface VentasProductos {
  [key: string]: Producto;
}

const Home = () => {
  const router = useRouter();
  const { carrito, agregarProducto, eliminarProducto, total } = useCarrito();
  const [productosPopulares, setProductosPopulares] = useState<Producto[]>([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [isClient, setIsClient] = useState(false);
  // Estado para cantidades por producto
  const [cantidades, setCantidades] = useState<{ [nombre: string]: number }>({});

  // Verificar si estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Función para cargar los productos más vendidos
  useEffect(() => {
    if (!isClient) return;
    
    const cargarProductosPopulares = async () => {
      try {
        const pedidosRef = collection(db, "pedidos");
        const pedidosSnap = await getDocs(pedidosRef);
        
        // Crear un mapa para contar las ventas de cada producto
        const ventasProductos: VentasProductos = {};
        
        pedidosSnap.forEach((doc) => {
          const pedido = doc.data();
          pedido.productos.forEach((prod: ProductoPedido) => {
            if (!ventasProductos[prod.nombre]) {
              ventasProductos[prod.nombre] = {
                nombre: prod.nombre,
                cantidadTotal: 0,
                imagen: "",
                precio: prod.precio,
                descripcion: ""
              };
            }
            ventasProductos[prod.nombre].cantidadTotal += prod.cantidad;
          });
        });

        // Convertir a array y ordenar por cantidad
        const productosOrdenados = Object.values(ventasProductos)
          .sort((a, b) => b.cantidadTotal - a.cantidadTotal)
          .slice(0, 5);

        // Obtener información adicional de los productos y filtrar solo los disponibles
        const productosRef = collection(db, "productos");
        const productosSnap = await getDocs(productosRef);
        
        // Crear un mapa de productos disponibles con su información completa
        const productosDisponiblesMap = new Map();
        
        productosSnap.forEach((doc) => {
          const producto = doc.data();
          const stock = producto.stock || 0;
          
          // Solo incluir productos que tienen stock > 0
          if (stock > 0) {
            productosDisponiblesMap.set(producto.product, {
              nombre: producto.product,
              cantidadTotal: stock,
              imagen: producto.pic || "",
              precio: producto.price || 0,
              descripcion: producto.description || ""
            });
          }
        });

        // Combinar con los productos populares (que tienen ventas)
        const productosFinales: (Producto & { ventas: number })[] = [];
        
        // Primero agregar productos populares que están disponibles
        productosOrdenados.forEach(productoPopular => {
          const productoDisponible = productosDisponiblesMap.get(productoPopular.nombre);
          if (productoDisponible) {
            productosFinales.push({
              ...productoDisponible,
              ventas: productoPopular.cantidadTotal // Mantener el conteo de ventas para ordenamiento
            });
          }
        });

        // Ordenar por ventas (productos más vendidos primero)
        productosFinales.sort((a, b) => b.ventas - a.ventas);
        
        // Tomar solo los primeros 5
        const productosTop5 = productosFinales.slice(0, 5);

        setProductosPopulares(productosTop5);
      } catch (error) {
        console.error("Error al cargar productos populares:", error);
      }
    };

    cargarProductosPopulares();
  }, [isClient]);

  // Función para agregar al carrito usando el contexto
  function agregarAlCarrito(producto: { nombre: string; precio: number }, cantidad: number = 1) {
    // Agregar cada unidad individualmente si es necesario
    for (let i = 0; i < cantidad; i++) {
      agregarProducto({
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1
      });
    }
    setCantidades((prev) => ({ ...prev, [producto.nombre]: 1 }));
    alert(`¡${producto.nombre} agregado al carrito!`);
  }

  function eliminarDelCarrito(nombre: string) {
    // Encontrar el índice del producto y eliminarlo
    const indice = carrito.findIndex(item => item.nombre === nombre);
    if (indice !== -1) {
      eliminarProducto(indice);
    }
  }

  // Función para mostrar/ocultar carrito
  function toggleCarrito() {
    setMostrarCarrito(!mostrarCarrito);
  }

  // Función para actualizar cantidad en carrito (personalizada)
  function modificarCantidad(nombre: string, nuevaCantidad: number) {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(nombre);
      return;
    }
    
    // Encontrar el producto actual
    const productoActual = carrito.find(item => item.nombre === nombre);
    if (!productoActual) return;
    
    const diferenciaCantidar = nuevaCantidad - productoActual.cantidad;
    
    if (diferenciaCantidar > 0) {
      // Agregar más productos
      for (let i = 0; i < diferenciaCantidar; i++) {
        agregarProducto({
          nombre: productoActual.nombre,
          precio: productoActual.precio,
          cantidad: 1
        });
      }
    } else if (diferenciaCantidar < 0) {
      // Eliminar productos
      for (let i = 0; i < Math.abs(diferenciaCantidar); i++) {
        const indice = carrito.findIndex(item => item.nombre === nombre);
        if (indice !== -1) {
          eliminarProducto(indice);
        }
      }
    }
  }

  function procederAlCheckout() {
    if (carrito.length === 0) {
      alert('Tu carrito está vacío. Agrega algunos productos antes de proceder al pago.');
      return;
    }
    
    setMostrarCarrito(false);
    router.push('/checkout');
  }

  // Mostrar estado de carga mientras se hidrata
  if (!isClient) {
    return (
      <main>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Cargando...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.intro}>
            <h1>
              Bienvenido a <br />
              <span className={styles.anahuac}>El Pan de Cada Día</span>
            </h1>
            <p>
            Descubre "El Pan de Cada Día", tu destino para deleitarte con pan tradicional horneado en horno de tabique rojo. Explora recetas de pan dulce, repostería, pasteles y galletas, cada una elaborada con cariño y técnicas ancestrales. Celebra el sabor auténtico y el aroma casero que transformarán tus momentos en delicias inolvidables.
            </p>
            <Link href="/productos">
              <button className={styles.ctaButton}>Explora nuestro catálogo</button>
            </Link>
            <h2 className={styles.hashtag}>#SABORQUESECOMPARTE</h2>
          </div>
          <div className={styles.heroVideo}>
            <div className={styles.videoWrapper}>
              <video
                className={styles.videoPanaderia}
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/video/1313.webm" type="video/mp4" />
                Tu navegador no soporta el video.
              </video>
            </div>
          </div>
        </div>
      </section>

      <OfertasCarousel />

      <section id="productos" className={styles["productos-main"]}>
        <div className={styles["productos-hero"]}>
          <h1>Nuestros Productos Destacados</h1>
          <p>Descubre el sabor de nuestra panadería</p>
        </div>
        <div className={styles["productos-grid"]}>
          {productosPopulares.map((producto, index) => (
            <div key={index} className={styles["producto-card"]}>
              <div className={styles["producto-imagen-container"]}>
                <Image
                  src={producto.imagen || "/images/default.jpg"}
                  alt={producto.nombre}
                  width={70}
                  height={70}
                  className={styles["producto-imagen"]}
                  priority={index < 3}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/images/default.jpg') target.src = '/images/default.jpg';
                  }}
                />
              </div>
              <div className={styles["producto-card-content"]}>
                <h3>{producto.nombre}</h3>
                <p className={styles.descripcion}>{producto.descripcion}</p>
                <p className={styles.precio}>${producto.precio} MXN</p>
                {typeof producto.cantidadTotal === 'number' && (
                  <div className={styles.stock}>Stock disponible: {producto.cantidadTotal}</div>
                )}
                <div className={styles["cantidad-label"]}>Cantidad:</div>
                <div className={styles["cantidad-controls"]}>
                  <button
                    className={styles["cantidad-btn"]}
                    onClick={() => setCantidades((prev) => ({ ...prev, [producto.nombre]: Math.max(1, (prev[producto.nombre] || 1) - 1) }))}
                  >
                    −
                  </button>
                  <span className={styles["cantidad-num"]}>{cantidades[producto.nombre] || 1}</span>
                  <button
                    className={styles["cantidad-btn"]}
                    onClick={() => setCantidades((prev) => ({ ...prev, [producto.nombre]: (prev[producto.nombre] || 1) + 1 }))}
                  >
                    +
                  </button>
                </div>
                <button
                  className={styles["btn-pedir"]}
                  onClick={() => agregarAlCarrito(producto, cantidades[producto.nombre] || 1)}
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '15px 10px',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: 'none',
                    borderRadius: '12px',
                    backgroundColor: '#d4a373',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  Añadir al carrito ({cantidades[producto.nombre] || 1})
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Eliminé <HelpPopup /> */}

      {/* Componente del carrito flotante reutilizable */}
      <CarritoFlotante />

      <Footer />
    </main>
  );
}

export default Home;
