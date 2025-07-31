"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './cafe.module.css';
import Footer from '../components/Footer';


export default function CafePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <main className={styles["cafe-page"]} suppressHydrationWarning>
        <section className={styles["cafe-hero"]}>
          {/* Navbar ajustado para el diseño de la imagen */}
          <nav className={styles["cafe-navbar"]}>
            {/* Contenedor para el logo y el nombre de la cafetería (centro de la navbar) */}
            <div className={styles["cafe-navbar-brand-container"]}>
              <Link href="/cafe" className={styles["cafe-nav-link"] + ' ' + styles["cafe-logo-text"]}>Cafetería</Link>
              {/* Logo NINDÓ CAFÉ para móvil */}
              <div className={styles["cafe-mobile-logo"]}>
                <div className={styles["cafe-mobile-deer"]}>🦌</div>
                <div className={styles["cafe-mobile-brand"]}>
                  <span className={styles["cafe-mobile-brand-name"]}>NINDÓ CAFÉ</span>
                  <span className={styles["cafe-mobile-brand-tagline"]}>EL QUE TE HACE VOLAR</span>
                </div>
              </div>
            </div>
            {/* Links de navegación (ocultos en móvil) */}
            <div
              className={
                styles["cafe-navbar-links-container"] +
                " " +
                (menuOpen ? styles["cafe-navbar-links-open"] : "")
              }
            >
              <Link href="/cafe" className={styles["cafe-nav-link"]}>Inicio</Link>
              <Link href="/cafeproductos" className={styles["cafe-nav-link"]}>Productos</Link>
              <Link href="/" className={styles["cafe-nav-link"]}>Panadería</Link>
            </div>
            {/* Botón hamburguesa separado (derecha de la navbar) */}
            <button
              className={styles["cafe-hamburger"]}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menú"
              type="button"
            >
              <span />
              <span />
              <span />
            </button>
          </nav>
          <div className={styles["cafe-hero-text"]}>
            <h1>El Arte del Café</h1>
            <p>Una experiencia sensorial en cada taza.</p>
          </div>
          <Link href="/cafeproductos" className={styles["cafe-cta-button"]}>
            Comprar Ahora
          </Link>
        </section>
        {/* Sección de enlaces de menú inferior */}
        
      
        <section id="productos" className={styles["cafe-productos"]}>
          <h2 className={styles["cafe-productos-titulo"]}>Nuestros Favoritos</h2>
          <div className={styles["cafe-productos-grid"]}>
            <div className={styles["cafe-producto-card"]}>
              <div className={styles["cafe-producto-etiqueta"] + ' natural'}>ESPRESSO</div>
              <Image src="/images/cafe.png" alt="Espresso" width={180} height={180} className={styles["cafe-producto-img"]} />
              <div className={styles["cafe-producto-info"]}>
                <div className={styles["cafe-producto-rating"]}>★★★★★ <span>(12)</span></div>
                <h3 className={styles["cafe-producto-nombre"]}>Espresso</h3>
                <p className={styles["cafe-producto-precio"]}>Desde $75.00 MXN</p>
                <p className={styles["cafe-producto-notas"]}>NOTAS: CHOCOLATE / NUEZ / TOQUE FLORAL</p>
                <p className={styles["cafe-producto-tueste"]}>Tueste Medio</p>
              </div>
            </div>
            <div className={styles["cafe-producto-card"]}>
              <div className={styles["cafe-producto-etiqueta"] + ' honey'}>AMERICANO</div>
              <Image src="/images/cafe.png" alt="Americano" width={180} height={180} className={styles["cafe-producto-img"]} />
              <div className={styles["cafe-producto-info"]}>
                <div className={styles["cafe-producto-rating"]}>★★★★☆ <span>(9)</span></div>
                <h3 className={styles["cafe-producto-nombre"]}>Americano</h3>
                <p className={styles["cafe-producto-precio"]}>Desde $60.00 MXN</p>
                <p className={styles["cafe-producto-notas"]}>NOTAS: CARAMELO / NUEZ / FINAL LIMPIO</p>
                <p className={styles["cafe-producto-tueste"]}>Tueste Medio</p>
              </div>
            </div>
            <div className={styles["cafe-producto-card"]}>
              <div className={styles["cafe-producto-etiqueta"] + ' lavado'}>CAPPUCCINO</div>
              <Image src="/images/cafe.png" alt="Cappuccino" width={180} height={180} className={styles["cafe-producto-img"]} />
              <div className={styles["cafe-producto-info"]}>
                <div className={styles["cafe-producto-rating"]}>★★★★★ <span>(17)</span></div>
                <h3 className={styles["cafe-producto-nombre"]}>Cappuccino</h3>
                <p className={styles["cafe-producto-precio"]}>Desde $85.00 MXN</p>
                <p className={styles["cafe-producto-notas"]}>NOTAS: CREMOSO / VAINILLA / CACAO</p>
                <p className={styles["cafe-producto-tueste"]}>Tueste Medio</p>
              </div>
            </div>
             <div className={styles["cafe-producto-card"]}>
              <div className={styles["cafe-producto-etiqueta"] + ' lavado'}>LATTE</div>
              <Image src="/images/cafe.png" alt="Latte" width={180} height={180} className={styles["cafe-producto-img"]} />
              <div className={styles["cafe-producto-info"]}>
                <div className={styles["cafe-producto-rating"]}>★★★★★ <span>(15)</span></div>
                <h3 className={styles["cafe-producto-nombre"]}>Latte</h3>
                <p className={styles["cafe-producto-precio"]}>Desde $80.00 MXN</p>
                <p className={styles["cafe-producto-notas"]}>NOTAS: SUAVE / LECHE / DULCE</p>
                <p className={styles["cafe-producto-tueste"]}>Tueste Ligero</p>
              </div>
            </div>
          </div>
        </section>
        <section id="informacion" className={styles["cafe-informacion"] + ' ' + styles["cafe-fade-in-up"]}>
          <h2>Información del Café</h2>
          <div className={styles["cafe-info-cards-container"]}>
            <article className={styles["cafe-info-card"] + ' ' + styles["cafe-left-image"]}>
              <div className={styles["cafe-info-image"]}>
                <Image src="/images/origen-del cafe.jpeg" alt="Origen del café" width={500} height={300}/>
              </div>
              <div className={styles["cafe-info-text"]}>
                <h3>Origen</h3>
                <p>
                  Nuestro café proviene de las montañas de Oaxaca, México, cultivado en
                  altitudes ideales para un sabor intenso y aroma único.
                </p>
              </div>
            </article>
            <article className={styles["cafe-info-card"] + ' ' + styles["cafe-right-image"]}>
              <div className={styles["cafe-info-image"]}>
                <Image src="/images/tostado.jpeg" alt="Proceso de tostado" width={500} height={300}/>
              </div>
              <div className={styles["cafe-info-text"]}>
                <h3>Proceso de Tostado</h3>
                <p>
                  Tostamos nuestros granos de forma artesanal para preservar los matices y la calidad, con perfiles que varían desde ligero hasta oscuro.
                </p>
              </div>
            </article>
            <article className={styles["cafe-info-card"] + ' ' + styles["cafe-left-image"]}>
              <div className={styles["cafe-info-image"]}>
                <Image src="/images/variedades-cafe.jpg" alt="Variedades de café" width={500} height={300} />
              </div>
              <div className={styles["cafe-info-text"]}>
                <h3>Variedades</h3>
                <p>
                  Contamos con variedades arábica y robusta, cada una con características
                  especiales que satisfacen todos los gustos.
                </p>
              </div>
            </article>
            <article className={styles["cafe-info-card"] + ' ' + styles["cafe-right-image"]}>
              <div className={styles["cafe-info-text"]}>
                <h3>Perfil de Sabor</h3>
                <p>
                  Nuestros cafés ofrecen notas florales, frutales y un cuerpo balanceado,
                  ideal para amantes del café exigentes.
                </p>
              </div>
              <div className={styles["cafe-info-image"]}>
                <Image src="/images/sabor cafe.jpeg" alt="Perfil de sabor" width={500} height={300} />
              </div>
            </article>
          </div>
        </section>
        
        {/* Logo de NINDÓ CAFÉ en la parte inferior */}
        <section className={styles["cafe-logo-section"]}>
          <div className={styles["cafe-logo-container"]}>
            <div className={styles["cafe-logo-image"]}>
              {/* Aquí puedes agregar la imagen del logo del ciervo */}
              <div className={styles["cafe-deer-logo"]}>🦌</div>
            </div>
            <div className={styles["cafe-logo-text"]}>
              <h3 className={styles["cafe-brand-name"]}>NINDÓ CAFÉ</h3>
              <p className={styles["cafe-brand-tagline"]}>EL QUE TE HACE VOLAR</p>
            </div>
          </div>
        </section>
       
      </main>
      <Footer />
    </>
  );
}