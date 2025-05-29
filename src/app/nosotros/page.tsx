"use client";

import Image from "next/image";
import Link from "next/link";
import "./styles.css";


export default function NosotrosPage() {
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
            <li><Link href="/nosotros" className="active">Nosotros</Link></li>
            <li><Link href="/login">Login</Link></li>
            <li>
              <Link href="/carrito" className="btn-carrito-toggle">
                <span className="icono-carrito">🛒</span>
                <span>Carrito</span>
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <section className="nosotros-hero">
        <div className="nosotros-hero-content">
          <h1>Nuestra Historia, Tu Confianza</h1>
          <p>Más de 30 años horneando tradición y calidad</p>
        </div>
      </section>

      <section className="historia-section">
        <div className="historia-container">
          <div className="historia-texto">
            <h2>Desde 1990 endulzando tu vida</h2>
            <p>
              Fundada por la familia Martínez en el corazón de Tehuacán, nuestra panadería nació
              del sueño de compartir los sabores auténticos de la panadería tradicional mexicana.
              Lo que comenzó como un pequeño local con un horno de leña, hoy es un referente
              gastronómico en la región.
            </p>
            <p>
              Cada mañana, nuestros maestros panaderos inician su jornada antes del amanecer,
              siguiendo al pie de la letra las recetas que han pasado de generación en generación,
              combinándolas con técnicas modernas que garantizan la máxima calidad.
            </p>
            <div className="datos-destacados">
              <div className="dato-item">
                <span className="dato-numero">30+</span>
                <span className="dato-texto">Años de experiencia</span>
              </div>
              <div className="dato-item">
                <span className="dato-numero">50+</span>
                <span className="dato-texto">Variedades de pan</span>
              </div>
              <div className="dato-item">
                <span className="dato-numero">10,000+</span>
                <span className="dato-texto">Clientes satisfechos</span>
              </div>
            </div>
          </div>
          <div className="historia-imagen">
            <Image
              src="/images/panaderia-antigua.jpg"
              alt="Nuestra panadería en los años 90"
              width={600}
              height={400}
              className="historia-img"
            />
          </div>
        </div>
      </section>

      <section className="equipo-section">
        <div className="equipo-header">
          <h2>Conoce a Nuestro Equipo</h2>
          <p>Los artesanos detrás de cada delicia</p>
        </div>
        <div className="equipo-grid">
          <div className="miembro-equipo">
            <div className="miembro-imagen">
              <Image
                src="/images/maestro-panadero.jpg"
                alt="Maestro panadero"
                width={300}
                height={300}
              />
              <div className="miembro-info">
                <h3>Don Javier Martínez</h3>
                <p>Fundador y Maestro Panadero</p>
                <p className="miembro-desc">"La paciencia y el amor son los ingredientes secretos"</p>
              </div>
            </div>
          </div>
          <div className="miembro-equipo">
            <div className="miembro-imagen">
              <Image
                src="/images/repostera.jpg"
                alt="Repostera"
                width={300}
                height={300}
              />
              <div className="miembro-info">
                <h3>Ana López</h3>
                <p>Jefa de Repostería</p>
                <p className="miembro-desc">"Cada postre cuenta una historia dulce"</p>
              </div>
            </div>
          </div>
          <div className="miembro-equipo">
            <div className="miembro-imagen">
              <Image
                src="/images/atencion-cliente.jpg"
                alt="Atención a clientes"
                width={300}
                height={300}
              />
              <div className="miembro-info">
                <h3>Carlos Ramírez</h3>
                <p>Atención al Cliente</p>
                <p className="miembro-desc">"Me encanta recomendar el pan perfecto para cada persona"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="valores-section">
        <div className="valores-container">
          <h2>Nuestros Valores</h2>
          <div className="valores-grid">
            <div className="valor-card">
              <div className="valor-icono">🍞</div>
              <h3>Tradición</h3>
              <p>Respetamos y mantenemos vivas las recetas y técnicas tradicionales</p>
            </div>
            <div className="valor-card">
              <div className="valor-icono">🌾</div>
              <h3>Calidad</h3>
              <p>Usamos solo ingredientes naturales y de la mejor procedencia</p>
            </div>
            <div className="valor-card">
              <div className="valor-icono">❤️</div>
              <h3>Pasión</h3>
              <p>Amamos lo que hacemos y eso se nota en cada producto</p>
            </div>
            <div className="valor-card">
              <div className="valor-icono">🤝</div>
              <h3>Comunidad</h3>
              <p>Somos parte fundamental del tejido social de Tehuacán</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonios-section">
        <div className="testimonios-container">
          <h2>Lo que dicen nuestros clientes</h2>
          <div className="testimonios-grid">
            <div className="testimonio-card">
              <div className="testimonio-texto">
                "El mejor pan de muerto que he probado en mi vida. Sabe exactamente como el que hacía mi abuela"
              </div>
              <div className="testimonio-autor">
                <Image
                  src="/images/cliente1.jpg"
                  alt="Cliente María"
                  width={60}
                  height={60}
                  className="testimonio-foto"
                />
                <div>
                  <p className="testimonio-nombre">María González</p>
                  <p className="testimonio-desc">Clienta desde 2005</p>
                </div>
              </div>
            </div>
            <div className="testimonio-card">
              <div className="testimonio-texto">
                "No hay mejor manera de empezar el día que con un café y una concha recién horneada"
              </div>
              <div className="testimonio-autor">
                <Image
                  src="/images/cliente2.jpg"
                  alt="Cliente Roberto"
                  width={60}
                  height={60}
                  className="testimonio-foto"
                />
                <div>
                  <p className="testimonio-nombre">Roberto Torres</p>
                  <p className="testimonio-desc">Cliente frecuente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="visitanos-section">
        <div className="visitanos-container">
          <div className="visitanos-info">
            <h2>Visítanos</h2>
            <p>Estamos en el corazón de Tehuacán</p>
            <div className="visitanos-datos">
              <p>📍 Calle del Sabor 123, Col. La Hogaza, Tehuacán, Puebla</p>
              <p>🕒 Horario: Lunes a Sábado 6:00 am - 9:00 pm</p>
              <p>📞 Teléfono: 238 123 4567</p>
              <p>📧 Email: contacto@elpandecadadia.com</p>
            </div>
            <button className="btn-mapa">Ver en mapa</button>
          </div>
          <div className="visitanos-imagen">
            <Image
              src="/images/local-panaderia.jpg"
              alt="Nuestro local"
              width={600}
              height={400}
              className="local-img"
            />
          </div>
        </div>
      </section>

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
              <li><Link href="/nosotros">Nosotros</Link></li>
              <li><Link href="/productos">Productos</Link></li>
              <li><Link href="#">Contacto</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Síguenos</h3>
            <ul>
              <li><a href="https://facebook.com" target="_blank">Facebook</a></li>
              <li><a href="https://wa.me/522380000000" target="_blank">WhatsApp</a></li>
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
      </footer>
    </main>
  );
}