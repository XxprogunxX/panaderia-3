"use client";


import Image from "next/image";
import Link from "next/link";
import "./styles.css";
import { useState } from "react";
import HelpPopup from "./components/bolita-de-ayuda/bolita";
import { image } from "framer-motion/client";
import { url } from "inspector";


const productosPopulares = [
  {
    nombre: "Pan de muerto",
    descripcion: "Tradicional con toque de azahar",
    imagen: "/images/pan_de_muerto.jpg",
    precio: 25,
  },
  {
    nombre: "Concha",
    descripcion: "De vainilla, esponjosa y dulce",
    imagen: "/images/concha.jpg",
    precio: 10,
  },
  {
    nombre: "Bollo integral",
    descripcion: "Con granos naturales",
    imagen: "/images/pan_integral.jpg",
    precio: 12,
  },
];

export default function Home() {
  const [carrito, setCarrito] = useState<
    { nombre: string; precio: number; cantidad: number }[]
  >([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

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

  return (
    <main>
      <header className="header">
        <div className="logo-link-header">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={60}
            height={60}
            className="logo-img"
          />
          <h1 className="logo">Panadería El Pan de Cada Día</h1>
        </div>
        <nav className="nav">
          <ul>
            <li><Link href="/">Inicio</Link></li>
            <li><Link href="/productos">Productos</Link></li>
            <li><Link href="/cafe">Cafe</Link></li>
            <li><Link href="/nosotros">Nosotros</Link></li>
            <li><Link href="/login">Login</Link></li>
            <li>
              <button onClick={toggleCarrito} className="btn-carrito-toggle">
  <span className="icono-carrito">🛒</span>
  <span>Carrito</span>
  {carrito.length > 0 && (
    <span className="notificacion-carrito">
      {carrito.reduce((sum, p) => sum + p.cantidad, 0)}
    </span>
  )}
</button>

            </li>
          </ul>
        </nav>
      </header>

      <section className="hero">
        <div className="intro">
          <h1>
          Bienvenido a <br />
           <span className="anahuac">El Pan de Cada Día</span>
          </h1>

          <p>
            Desde hace más de 30 años, horneamos con pasión panes que conectan generaciones. Cada pieza cuenta una historia de tradición y sabor.
          </p>
          <button>Explora nuestro catálogo</button>
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

      <section id="productos" className="productos-main">
        <div className="productos-hero">
          <h1>Productos Populares</h1>
          <p>Conoce los favoritos de nuestros clientes</p>
        </div>
        <div className="productos-grid">
          {productosPopulares.map((producto, index) => (
            <div key={index} className="producto-card">
              <Image
                src={producto.imagen}
                alt={producto.nombre}
                width={400}
                height={300}
              />
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
                <a href="https://facebook.com" target="_blank">
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
