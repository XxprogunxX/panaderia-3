"use client";

import Image from "next/image";
import Link from "next/link";
import "../styles.css";
import footerStyles from "../footer.module.css";
import { useState } from "react";

const categoriasProductos = [
  {
    id: "panes-tradicionales",
    nombre: "Panes Tradicionales",
    productos: [
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
        nombre: "Cuerno",
        descripcion: "Hojaldrado con mantequilla",
        imagen: "/images/cuerno.jpg",
        precio: 15,
      },
    ],
  },
  {
    id: "panes-especiales",
    nombre: "Panes Especiales",
    productos: [
      {
        nombre: "Bollo integral",
        descripcion: "Con granos naturales",
        imagen: "/images/Pan_integral.jpg",
        precio: 12,
      },
      {
        nombre: "Pan de centeno",
        descripcion: "Alto en fibra y nutrientes",
        imagen: "/images/pan_centeno.jpg",
        precio: 30,
      },
      {
        nombre: "Pan de ajo",
        descripcion: "Delicioso acompañamiento",
        imagen: "/images/pan-de-ajo.jpg",
        precio: 20,
      },
    ],
  },
  {
    id: "reposteria",
    nombre: "Repostería",
    productos: [
      {
        nombre: "Pastel de chocolate",
        descripcion: "Esponjoso y delicioso",
        imagen: "/images/pastelchoco.webp",
        precio: 150,
      },
      {
        nombre: "Galletas de mantequilla",
        descripcion: "Crujientes y doradas",
        imagen: "/images/galletas.jpg",
        precio: 45,
      },
      {
        nombre: "Pay de queso",
        descripcion: "Cremoso y suave",
        imagen: "/images/pay_queso.jpg",
        precio: 120,
      },
    ],
  },
];

export default function Productos() {
  const [carrito, setCarrito] = useState<
    { nombre: string; precio: number; cantidad: number }[]
  >([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const agregarAlCarrito = (producto: { nombre: string; precio: number }) => {
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
  };

  const eliminarDelCarrito = (nombre: string) => {
    setCarrito((prev) => prev.filter((p) => p.nombre !== nombre));
  };

  const toggleCarrito = () => {
    setMostrarCarrito(!mostrarCarrito);
  };

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  // Filtrar productos basados en la búsqueda
  const categoriasFiltradas = categoriasProductos
    .map(categoria => ({
      ...categoria,
      productos: categoria.productos.filter(producto => 
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      )
    }))
    .filter(categoria => categoria.productos.length > 0);

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
            <li><Link href="#nosotros">Nosotros</Link></li>
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

      <section className="productos-hero">
        <h1>Nuestros Productos</h1>
        <p>Descubre toda nuestra variedad de panes y repostería</p>
        <input
          type="text"
          placeholder="Buscar pan..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="buscador-productos"
        />
      </section>

      <section className="categorias-productos">
        {categoriasFiltradas.length > 0 ? (
          categoriasFiltradas.map((categoria) => (
            <div key={categoria.id} id={categoria.id} className="categoria-productos">
              <h2 className="titulo-categoria">
                {categoria.nombre}
              </h2>
              <div className="productos-grid">
                {categoria.productos.map((producto, index) => (
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
            </div>
          ))
        ) : (
          <div className="no-resultados">
            <p>No se encontraron productos que coincidan con tu búsqueda.</p>
          </div>
        )}
      </section>

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

      <footer className={footerStyles.footer}>
        <div className={footerStyles.footerContainer}>
          <div
            className={`${footerStyles.footerSection} ${footerStyles.logoSection}`}
          >
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className={footerStyles.footerLogo}
            />
            <p className={footerStyles.footerBrand}>
              Panadería El Pan de Cada Día
            </p>
          </div>
          <div className={footerStyles.footerSection}>
            <h3 className={footerStyles.footerSectionTitle}>NAVEGACIÓN</h3>
            <ul className={footerStyles.footerLinks}>
              <li><Link href="/">Inicio</Link></li>
              <li><Link href="/productos">Productos</Link></li>
              <li><Link href="#novedades">Novedades</Link></li>
              <li><Link href="#nosotros">Nosotros</Link></li>
            </ul>
          </div>
          <div className={footerStyles.footerSection}>
            <h3 className={footerStyles.footerSectionTitle}>SÍGUENOS</h3>
            <ul className={footerStyles.footerLinks}>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/522380000000"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
          <div className={footerStyles.footerSection}>
            <h3 className={footerStyles.footerSectionTitle}>CONTÁCTANOS</h3>
            <address className={footerStyles.address}>
              <p>Calle del Sabor 123, Col. La Hogaza</p>
              <p>75700 Tehuacán, Pue.</p>
              <p>Tel: +52 238 123 4567</p>
              <p>Email: pedidos@elpandecadadia.com</p>
            </address>
          </div>
        </div>

        <div className={footerStyles.footerBottom}>
          <p>
            &copy; {new Date().getFullYear()} Panadería El Pan de Cada Día. Todos
            los derechos reservados.
          </p>
        </div>

      </footer>
    </main>
  );
}
