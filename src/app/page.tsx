"use client";


import Image from "next/image";
import Link from "next/link";

import { useState, useEffect } from "react";
import HelpPopup from "./components/bolita-de-ayuda/bolita";
import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import OfertasCarousel from "./components/OfertasCarousel";

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
  const [productosPopulares, setProductosPopulares] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<
    { nombre: string; precio: number; cantidad: number }[]
  >([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [isClient, setIsClient] = useState(false);

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
          .slice(0, 3);

        // Obtener información adicional de los productos
        const productosRef = collection(db, "productos");
        const productosSnap = await getDocs(productosRef);
        
        productosSnap.forEach((doc) => {
          const producto = doc.data();
          const productoPopular = productosOrdenados.find(p => p.nombre === producto.product);
          if (productoPopular) {
            productoPopular.imagen = producto.pic;
            productoPopular.descripcion = producto.description;
            productoPopular.precio = producto.price;
          }
        });

        setProductosPopulares(productosOrdenados);
      } catch (error) {
        console.error("Error al cargar productos populares:", error);
      }
    };

    cargarProductosPopulares();
  }, [isClient]);

  function agregarAlCarrito(producto: { nombre: string; precio: number }) {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.nombre === producto.nombre);
      if (existe) {
        return prev.map((p) =>
          p.nombre === producto.nombre ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      } else {
        return [...prev, { ...producto, cantidad: 1 }];
      }
    });
  }

  function eliminarDelCarrito(nombre: string) {
    setCarrito((prev) => prev.filter((p) => p.nombre !== nombre));
  }

  function toggleCarrito() {
    setMostrarCarrito(!mostrarCarrito);
  }

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

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
      <section className="hero">
        <div className="intro">
          <h1>
          Bienvenido a <br />
           <span className="anahuac">El Pan de Cada Día</span>
          </h1>

          <p>
            Desde hace más de 30 años, horneamos con pasión panes que conectan generaciones. Cada pieza cuenta una historia de tradición y sabor.
          </p>
          <Link href="/productos">
            <button>Explora nuestro catálogo</button>
          </Link>
          <h2 className="hashtag">#SABORQUESECOMPARTE</h2>
        </div>

             <section className="video-section">
  <div className="video-wrapper">
    <video
      className="video-panaderia"
      autoPlay
      loop
      muted
      playsInline
    >
      <source src="/video/panaderia.mp4" type="video/mp4" />
      Tu navegador no soporta el video.
    </video>
    <div className="video-overlay-text">
      <h2>¡Tradición y sabor en cada bocado!</h2>
    </div>
  </div>
</section>


      </section>

      <OfertasCarousel />

      <section id="productos" className="productos-main">
        <div className="productos-hero">
          <h1>Nuestros Productos Destacados</h1>
          <p>Descubre el sabor de nuestra panadería</p>
        </div>
        <div className="productos-grid">
          {productosPopulares.map((producto, index) => (
            <div key={index} className="producto-card">
              {producto.imagen && (
                <div className="producto-imagen-container">
                  <Image
                    src={producto.imagen}
                    alt={producto.nombre}
                    width={400}
                    height={300}
                    style={{ objectFit: 'cover' }}
                    className="producto-imagen"
                    priority={index < 3}
                  />
                </div>
              )}
              <div className="producto-card-content">
                <h3>{producto.nombre}</h3>
                <p className="descripcion">{producto.descripcion}</p>
                <p className="precio">${producto.precio} MXN</p>
                <button
                  className="btn-pedir"
                  onClick={() => agregarAlCarrito(producto)}
                >
                  Añadir al carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Carrito overlay */}
      {mostrarCarrito && (
        <div className="carrito-overlay" onClick={toggleCarrito}>
          <div className="carrito" onClick={(e) => e.stopPropagation()}>
            <h2>Tu Carrito</h2>
            {carrito.length === 0 ? (
              <p>Tu carrito está vacío.</p>
            ) : (
              <ul>
                {carrito.map(({ nombre, precio, cantidad }) => (
                  <li key={nombre} className="carrito-item">
                    <span>
                      {nombre} x {cantidad}
                    </span>
                    <span>${precio * cantidad} MXN</span>
                    <button
                      className="btn-eliminar"
                      onClick={() => eliminarDelCarrito(nombre)}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="carrito-total">
              <strong>Total: </strong>${total} MXN
            </div>
            <button className="btn-cerrar" onClick={toggleCarrito}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section logo">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="footer-logo"
            />
          </div>
          <div className="footer-section">
            <h3>Navegación</h3>
            <ul>
              <li>
                <Link href="/nosotros">Nosotros</Link>
              </li>
              <li>
                <Link href="/productos">Productos</Link>
              </li>
              <li>
                <Link href="#">Contacto</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Síguenos</h3>
            <ul>
              <li>
                <a href="https://facebook.com/NINDOCAFE" target="_blank">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://wa.me/522380000000" target="_blank">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contáctanos</h3>
            <p>Calle del Sabor 123, Col. La Hogaza</p>
            <p>75700 Tehuacán, Pue.</p>
            <p>Tel: +52 238 123 4567</p>
            <p>pedidos@elpandecadadia.com</p>
          </div>
        </div>
       <HelpPopup />
      </footer>
    </main>
  );
}

export default Home;
