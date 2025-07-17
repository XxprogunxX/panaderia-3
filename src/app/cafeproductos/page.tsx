"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import './productos-cafe.css';
import footerStyles from "../footer.module.css";
import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useCarrito } from '../components/CarritoContext';

interface PresentacionCafe {
  tamanio: string;
  stock: number;
}

interface Cafe {
  id?: string;
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  precio: number;
  origen: string;
  intensidad: number;
  tipo: string;
  notas: string;
  tueste: string;
  presentaciones?: PresentacionCafe[];
  estado?: string; // Added for badge
}

export default function Cafe() {
  const router = useRouter();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [busqueda, setBusqueda] = useState("");

  const { carrito, agregarAlCarrito, eliminarDelCarrito, mostrarCarrito, toggleCarrito, total } = useCarrito();

  useEffect(() => {
    const obtenerCafes = async () => {
      const querySnapshot = await getDocs(collection(db, "cafes"));
      const lista: Cafe[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lista.push({
          id: doc.id,
          nombre: data.nombre,
          descripcion: data.descripcion,
          imagenUrl: data.imagenUrl || "/images/default.jpg",
          precio: data.precio,
          origen: data.origen,
          intensidad: data.intensidad,
          tipo: data.tipo,
          notas: data.notas,
          tueste: data.tueste,
          presentaciones: data.presentaciones || [],
          estado: data.estado // Assuming 'estado' is part of the data
        });
      });

      setCafes(lista);
    };

    obtenerCafes();
  }, []);

  // Filtrar cafés que tengan presentaciones y al menos una con stock > 0
  const cafesFiltrados = cafes.filter(
    (cafe) =>
      Array.isArray(cafe.presentaciones) &&
      cafe.presentaciones.length > 0 &&
      cafe.presentaciones.some((pres) => pres.stock > 0) &&
      ((busqueda === "") ||
        (cafe.nombre?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
        (cafe.descripcion?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
        (cafe.origen?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
        (cafe.tipo?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
        (cafe.tueste?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
        (cafe.notas?.toLowerCase() || '').includes(busqueda.toLowerCase())
      )
  );
  const esImagenExterna = (url: string) => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const irACheckout = () => {
    router.push('/checkout');
  };

  return (
    <main className="cafe-page">
      <nav className="navbar">
        <div className="navbar-brand-container">
          <Link href="/" className="nav-link logo-text">Cafetería</Link>
        </div>

        <div className="navbar-links-container">
          <Link href="/cafe" className="nav-link">Inicio</Link>
          <Link href="/cafeproductos" className="nav-link">Productos</Link>
          <Link href="/" className="nav-link">Panadería</Link>
          <a href="#testimonios" className="nav-link">Testimonios</a>

          <Image
            src="/images/logo-cafe.png"
            alt="Logo de la Cafetería"
            width={50}
            height={50}
            className="navbar-logo-image"
          />
        </div>
      </nav>

      <section className="productos-hero">
        <h1>Nuestros Cafés</h1>
        <p>Explora nuestra deliciosa selección de cafés artesanales</p>
        <input
          type="text"
          placeholder="Buscar café..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="buscador-productos"
        />
      </section>

      <section className="categoria-cafe">
        <h2 className="titulo-categoria">Café</h2>
        <div className="cafe-grid">
          {cafesFiltrados.length > 0 ? (
            cafesFiltrados.map((cafe) => {
              // Calcular el stock total sumando todas las presentaciones
              const stockTotal = Array.isArray(cafe.presentaciones)
                ? cafe.presentaciones.reduce((acc, pres) => acc + (pres.stock || 0), 0)
                : 0;
              return (
                <div key={cafe.id} className="cafe-card">
                  <div className="cafe-imagen-container">
                    {esImagenExterna(cafe.imagenUrl) ? (
                      <Image
                        src={cafe.imagenUrl}
                        alt={cafe.nombre}
                        width={180}
                        height={180}
                        className="cafe-imagen"
                        style={{ objectFit: "cover" }}
                        priority
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/images/default.jpg') target.src = '/images/default.jpg';
                        }}
                      />
                    ) : (
                      <Image
                        src={cafe.imagenUrl}
                        alt={cafe.nombre}
                        width={180}
                        height={180}
                        className="cafe-imagen"
                        style={{ objectFit: "cover" }}
                        priority
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/images/default.jpg') target.src = '/images/default.jpg';
                        }}
                      />
                    )}
                  </div>
                  <div className="cafe-card-content">
                    <h3>{cafe.nombre}</h3>
                    <p className="descripcion">{cafe.descripcion}</p>
                    <div className="cafe-details">
                      <p><strong>Origen:</strong> {cafe.origen}</p>
                      <p><strong>Tipo:</strong> {cafe.tipo}</p>
                      <p><strong>Intensidad:</strong> {cafe.intensidad}/10</p>
                      <p><strong>Tueste:</strong> {cafe.tueste}</p>
                      {cafe.estado && (
                        <p><strong>Estado:</strong> {cafe.estado === 'molido' ? 'Molido' : cafe.estado === 'grano' ? 'En grano' : cafe.estado}</p>
                      )}
                      {cafe.notas && <p><strong>Notas:</strong> {cafe.notas}</p>}
                      {/* Mostrar presentaciones y stock */}
                      {Array.isArray(cafe.presentaciones) && cafe.presentaciones.length > 0 && (
                        <ul style={{marginTop: 8}}>
                          {cafe.presentaciones.filter(p => p.stock > 0).map((pres, idx) => (
                            <li key={idx}>
                              {pres.tamanio} - <span style={{fontWeight: pres.stock <= 2 ? 'bold' : 'normal', color: pres.stock <= 2 ? '#e67e22' : undefined}}>{pres.stock} piezas{pres.stock <= 2 && ' ¡Stock bajo!'}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <p className="precio">${cafe.precio} MXN</p>
                    <button
                      className="btn-pedir"
                      onClick={() => agregarAlCarrito({
                        nombre: cafe.nombre,
                        descripcion: cafe.descripcion,
                        imagen: cafe.imagenUrl,
                        precio: cafe.precio,
                        categoria: "Café"
                      }, 1)}
                    >
                      Añadir al carrito
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-resultados">No se encontraron cafés que coincidan con tu búsqueda.</p>
          )}
        </div>
      </section>

      {mostrarCarrito && (
        <div className="carrito-overlay" onClick={toggleCarrito}>
          <div className="carrito" onClick={(e) => e.stopPropagation()}>
            <h2>Tu Carrito</h2>
            {carrito.length === 0 ? (
              <p>Tu carrito está vacío.</p>
            ) : (
              <>
                <ul>
                  {carrito.map(({ nombre, precio, cantidad }) => (
                    <li key={nombre} className="carrito-item">
                      <span>{nombre} x {cantidad}</span>
                      <span>${precio * cantidad} MXN</span>
                      <button className="btn-eliminar" onClick={() => eliminarDelCarrito(nombre)}>
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="carrito-total">
                  <strong>Total: </strong>${total} MXN
                </div>
                <button
                  className="btn-pagar"
                  onClick={irACheckout}
                  disabled={carrito.length === 0}
                >
                  Proceder al pago
                </button>
              </>
            )}
            <button className="btn-cerrar" onClick={toggleCarrito}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      <footer className={footerStyles.footer}>
        {/* Aquí tu footer */}
      </footer>
    </main>
  );
}