'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from '../footer.module.css';

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.footerContainer}>
      <div className={styles.footerSection + ' ' + styles.logoSection}>
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={130}
          height={130}
          className={styles.footerLogo}
        />
      </div>
      <div className={styles.footerSection}>
        <h3 className={styles.footerSectionTitle}>Navegación</h3>
        <ul className={styles.footerLinks}>
          <li>
            <Link href="/nosotros">Nosotros</Link>
          </li>
          <li>
            <Link href="/productos">Productos</Link>
          </li>
          <li>
            <Link href="/cafe">Cafe</Link>
          </li>
          <li>
            <Link href="/">Inicio</Link>
          </li>
        </ul>
      </div>
      <div className={styles.footerSection}>
        <h3 className={styles.footerSectionTitle}>Síguenos</h3>
        <ul className={styles.footerLinks}>
          <li>
            <a href="https://facebook.com/NINDOCAFE" target="_blank" rel="noopener noreferrer">
              <span className={styles.socialIcon} aria-label="Facebook">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.406.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.674V1.326C24 .592 23.406 0 22.675 0"/>
                </svg>
              </span>
              Facebook
            </a>
          </li>
          <li>
            <a href="https://wa.me/522380000000" target="_blank" rel="noopener noreferrer">
              <span className={styles.socialIcon} aria-label="WhatsApp">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.3 5.3.16 12 .16c3.17 0 6.155 1.237 8.413 3.488A11.822 11.822 0 0 1 23.84 12c0 6.627-5.373 12-12 12a11.87 11.87 0 0 1-5.943-1.59L.057 24zm6.597-3.807c1.735.995 3.276 1.591 5.346 1.591 5.448 0 9.886-4.438 9.886-9.884 0-2.641-1.033-5.122-2.905-6.994A9.825 9.825 0 0 0 12 2.117c-5.448 0-9.884 4.438-9.884 9.885 0 2.063.604 3.604 1.599 5.34l-.999 3.648 3.638-.997zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.03-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.363.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </span>
              WhatsApp
            </a>
          </li>
        </ul>
      </div>
      <div className={styles.footerSection + ' ' + styles.address}>
        <h3 className={styles.footerSectionTitle}>Contáctanos</h3>
        <p>Calle del Sabor 123, Col. La Hogaza</p>
        <p>75700 Tehuacán, Pue.</p>
        <p>Tel: +52 238 123 4567</p>
        <p>pedidos@elpandecadadia.com</p>
      </div>
    </div>
  </footer>
);

export default Footer; 