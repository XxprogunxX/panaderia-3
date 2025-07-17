"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import OfertasCarousel from "./components/OfertasCarousel";
import { useCarrito } from "./components/CarritoContext";
import styles from "./home.module.css";
import Footer from "./components/Footer";

interface Producto {
  nombre: string;
  cantidadTotal: number;
  imagen: string;
  precio: number;
  descripcion: string;
  stock?: number;
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
  const [productosPopulares, setProductosPopulares] = useState<Producto[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [cantidades, setCantidades] = useState<{ [key: string]: number }>({});
  const { agregarAlCarrito } = useCarrito();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const cargarProductosPopulares = async () => {
      try {
        const pedidosRef = collection(db, "pedidos");
        const pedidosSnap = await getDocs(pedidosRef);

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
                descripcion: "",
                stock: 0,
              };
            }
            ventasProductos[prod.nombre].cantidadTotal += prod.cantidad;
          });
        });

        const productosOrdenados = Object.values(ventasProductos)
          .sort((a, b) => b.cantidadTotal - a.cantidadTotal)
          .slice(0, 3);

        const productosRef = collection(db, "productos");
        const productosSnap = await getDocs(productosRef);

        productosSnap.forEach((doc) => {
          const producto = doc.data();
          const productoPopular = productosOrdenados.find(
            (p) => p.nombre === producto.product
          );
          if (productoPopular) {
            productoPopular.imagen = producto.pic;
            productoPopular.descripcion = producto.description;
            productoPopular.precio = producto.price;
            productoPopular.stock = producto.stock ?? 0;
          }
        });

        setProductosPopulares(productosOrdenados);
      } catch (error) {
        console.error("Error al cargar productos populares:", error);
      }
    };

    cargarProductosPopulares();
  }, [isClient]);

  const handleAgregarAlCarrito = (producto: Producto) => {
    const cantidad = cantidades[producto.nombre] || 1;
    agregarAlCarrito(
      {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        imagen: producto.imagen,
        precio: producto.precio,
        categoria: "Destacados",
      },
      cantidad
    );
  };

  const handleCantidadChange = (nombre: string, nuevaCantidad: number) => {
    const producto = productosPopulares.find(p => p.nombre === nombre);
    const max = producto?.stock ?? 99;
    if (nuevaCantidad >= 1 && nuevaCantidad <= max) {
      setCantidades(prev => ({
        ...prev,
        [nombre]: nuevaCantidad
      }));
    }
  };

  const incrementarCantidad = (nombre: string) => {
    const producto = productosPopulares.find(p => p.nombre === nombre);
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

  if (!isClient) {
    return (
      <main>
        <div style={{ padding: "2rem", textAlign: "center" }}>
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
              Desde hace más de 30 años, horneamos con pasión panes que conectan
              generaciones. Cada pieza cuenta una historia de tradición y sabor.
            </p>
            <Link href="/productos">
              <button className={styles.ctaButton}>
                Explora nuestro catálogo
              </button>
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
                <source src="/video/panaderia.mp4" type="video/mp4" />
                Tu navegador no soporta el video.
              </video>
              <div className={styles.videoOverlayText}>
                <h2>¡Tradición y sabor en cada bocado!</h2>
              </div>
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
              {producto.imagen && (
                <div className={styles["producto-imagen-container"]}>
                  <Image
                    src={producto.imagen}
                    alt={producto.nombre}
                    width={400}
                    height={300}
                    style={{ objectFit: "cover" }}
                    className={styles["producto-imagen"]}
                    priority={index < 3}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== "/images/default.jpg")
                        target.src = "/images/default.jpg";
                    }}
                  />
                </div>
              )}
              <div className={styles["producto-card-content"]}>
                <h3 style={{ fontWeight: 700, fontSize: "1.2rem", margin: "0.5rem 0" }}>
                  {producto.nombre}
                </h3>
                <p className={styles.descripcion} style={{ minHeight: 40 }}>
                  {producto.descripcion}
                </p>
                <p
                  className={styles.precio}
                  style={{
                    color: "#b6894b",
                    fontWeight: 700,
                    fontSize: "1.3rem",
                    margin: "0.5rem 0",
                  }}
                >
                  ${producto.precio} MXN
                </p>
                <p
                  className={styles.stock}
                  style={{
                    color: producto.stock === 0 ? "#b93b3b" : "#4A3B31",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Stock disponible: {producto.stock ?? 0}
                </p>
                
                {/* Controles de cantidad */}
                {producto.stock !== undefined && producto.stock > 0 && (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    margin: "0.8rem 0",
                    padding: "0.5rem",
                    background: "#f8f0e0",
                    borderRadius: "8px",
                    border: "1px solid #d4a373"
                  }}>
                    <label style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "#4A3B31",
                      marginBottom: "0.3rem"
                    }}>
                      Cantidad:
                    </label>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      background: "white",
                      border: "1px solid #d4a373",
                      borderRadius: "15px",
                      padding: "0.3rem"
                    }}>
                      <button
                        type="button"
                        onClick={() => decrementarCantidad(producto.nombre)}
                        disabled={cantidades[producto.nombre] <= 1}
                        style={{
                          width: "32px",
                          height: "32px",
                          border: "none",
                          background: cantidades[producto.nombre] <= 1 ? "#e0c3a0" : "#d4a373",
                          color: "white",
                          borderRadius: "50%",
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                          cursor: cantidades[producto.nombre] <=1 ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={producto.stock ?? 99}
                        value={cantidades[producto.nombre] || 1}
                        onChange={(e) => handleCantidadChange(producto.nombre, parseInt(e.target.value) || 1)}
                        style={{
                          width: "50px",
                          height: "32px",
                          border: "none",
                          textAlign: "center",
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "#4A3B31",
                          background: "transparent",
                          outline: "none"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => incrementarCantidad(producto.nombre)}
                        disabled={cantidades[producto.nombre] >= (producto.stock ?? 99)}
                        style={{
                          width: "32px",
                          height: "32px",
                          border: "none",
                          background: cantidades[producto.nombre] >= (producto.stock ??99) ? "#e0c3a0" : "#d4a373",
                          color: "white",
                          borderRadius: "50%",
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                          cursor: cantidades[producto.nombre] >= (producto.stock ?? 99) ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
                
                <button
                  className={styles["btn-pedir"]}
                  onClick={() => handleAgregarAlCarrito(producto)}
                  disabled={producto.stock === 0}
                  style={{
                    background: producto.stock === 0 ? "#e0c3a0" : "#d4a373",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "1rem",
                    borderRadius: 12,
                    border: "none",
                    width: "100%",
                    padding: "0.8rem",
                    cursor: producto.stock ===0 ? "not-allowed" : "pointer",
                    marginTop: "0.5rem"
                  }}
                >
                  {producto.stock === 0 
                     ? "Sin stock" 
                     : `Añadir al carrito (${cantidades[producto.nombre] || 1})`
                   }
                 </button>
               </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Home; 