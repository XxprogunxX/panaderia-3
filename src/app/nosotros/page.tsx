"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./nosotros.module.css";
// If your footer has specific styles imported like this, keep it
// import footerStyles from "./footer.module.css"; // Uncomment if you use a CSS Modules file for the footer

// Import the hooks
import { useCarrito } from "../components/CarritoContext";
 // Adjust the path if necessary
import { useMercadoPago } from "../components/useMercadopago"; // Adjust the path if necessary
import Footer from '../components/Footer';

export default function NosotrosPage() {
  // Use the useCarrito hook to get cart state and toggle function
  const { carrito, toggleCarrito, mostrarCarrito, total } = useCarrito();

  // Use the useMercadoPago hook to get loading state and payment function
  const { cargandoPago, handlePagar } = useMercadoPago(); // <--- NEW

  // Calculate the total number of items in the cart for the notification
  const totalItemsEnCarrito = carrito.reduce((sum, p) => sum + p.cantidad, 0);

  // Function to handle the payment, using the Mercado Pago hook
  const iniciarPago = () => { // <--- NEW
    if (carrito.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    // Prepare items for Mercado Pago
    const itemsMP = carrito.map(({ nombre, cantidad, precio }) => ({
      title: nombre,
      quantity: cantidad,
      unit_price: precio,
    }));
    handlePagar(itemsMP, {
      nombre: "",
      email: "",
      telefono: "",
      direccion: "",
      codigoPostal: "",
      ciudad: "",
      estado: ""
    }); // Pass an empty object or the required shipping data as the second argument
  };

  return (
    <>
      <main>
      
      <section className={styles["nosotros-hero"]}>
        <div className={styles["nosotros-hero-content"]}>
          <h1>Nuestra Historia, Tu Confianza</h1>
          <p>Más de 30 años horneando tradición y calidad</p>
        </div>
      </section>

      <section className={styles["historia-section"]}>
        <div className={styles["historia-container"]}>
          <div className={styles["historia-texto"]}>
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
            <div className={styles["datos-destacados"]}>
              <div className={styles["dato-item"]}>
                <span className={styles["dato-numero"]}>30+</span>
                <span className={styles["dato-texto"]}>Años de experiencia</span>
              </div>
              <div className={styles["dato-item"]}>
                <span className={styles["dato-numero"]}>50+</span>
                <span className={styles["dato-texto"]}>Variedades de pan</span>
              </div>
              <div className={styles["dato-item"]}>
                <span className={styles["dato-numero"]}>10,000+</span>
                <span className={styles["dato-texto"]}>Clientes satisfechos</span>
              </div>
            </div>
          </div>
          <div className={styles["historia-imagen"]}>
            <Image
              src="/images/pan-wl.jpeg"
              alt="Nuestra panadería en los años 90"
              width={600}
              height={400}
              className={styles["historia-img"]}
            />
          </div>
        </div>
      </section>

      <section className={styles["equipo-section"]}>
        <div className={styles["equipo-header"]}>
          <h2>Conoce a Nuestro Equipo</h2>
          <p>Los artesanos detrás de cada delicia</p>
        </div>
        <div className={styles["equipo-grid"]}>
          <div className={styles["miembro-equipo"]}>
            <div className={styles["miembro-imagen"]}>
              <Image
                src="/images/maestro panadero.avif"
                alt="Maestro panadero"
                width={300}
                height={300}
              />
              <div className={styles["miembro-info"]}>
                <h3>Don Javier Martínez</h3>
                <p>Fundador y Maestro Panadero</p>
                <p className={styles["miembro-desc"]}>&quot;La paciencia y el amor son los ingredientes secretos&quot;</p>
              </div>
            </div>
          </div>
          <div className={styles["miembro-equipo"]}>
            <div className={styles["miembro-imagen"]}>
              <Image
                src="/images/repostera.avif"
                alt="Repostera"
                width={300}
                height={300}
              />
              <div className={styles["miembro-info"]}>
                <h3>Ana López</h3>
                <p>Jefa de Repostería</p>
                <p className={styles["miembro-desc"]}>&quot;Cada postre cuenta una historia dulce&quot;</p>
              </div>
            </div>
          </div>
          <div className={styles["miembro-equipo"]}>
            <div className={styles["miembro-imagen"]}>
              <Image
                src="/images/clientes.jpeg"
                alt="Atención a clientes"
                width={300}
                height={300}
              />
              <div className={styles["miembro-info"]}>
                <h3>Carlos Ramírez</h3>
                <p>Atención al Cliente</p>
                <p className={styles["miembro-desc"]}>&quot;Me encanta recomendar el pan perfecto para cada persona&quot;</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles["valores-section"]}>
        <div className={styles["valores-container"]}>
          <h2>Nuestros Valores</h2>
          <div className={styles["valores-grid"]}>
            <div className={styles["valor-card"]}>
              <div className={styles["valor-icono"]}>🍞</div>
              <h3>Tradición</h3>
              <p>Respetamos y mantenemos vivas las recetas y técnicas tradicionales</p>
            </div>
            <div className={styles["valor-card"]}>
              <div className={styles["valor-icono"]}>🌾</div>
              <h3>Calidad</h3>
              <p>Usamos solo ingredientes naturales y de la mejor procedencia</p>
            </div>
            <div className={styles["valor-card"]}>
              <div className={styles["valor-icono"]}>❤️</div>
              <h3>Pasión</h3>
              <p>Amamos lo que hacemos y eso se nota en cada producto</p>
            </div>
            <div className={styles["valor-card"]}>
              <div className={styles["valor-icono"]}>🤝</div>
              <h3>Comunidad</h3>
              <p>Somos parte fundamental del tejido social de Tehuacán</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles["testimonios-section"]}>
        <div className={styles["testimonios-container"]}>
          <h2>Lo que dicen nuestros clientes</h2>
          <div className={styles["testimonios-grid"]}>
            <div className={styles["testimonio-card"]}>
              <div className={styles["testimonio-texto"]}>
                &quot;El mejor pan de muerto que he probado en mi vida. Sabe exactamente como el que hacía mi abuela&quot;
              </div>
              <div className={styles["testimonio-autor"]}>
                <Image
                  src="/images/cliente1.jpg"
                  alt="Cliente María"
                  width={60}
                  height={60}
                  className={styles["testimonio-foto"]}
                />
                <div>
                  <p className={styles["testimonio-nombre"]}>María González</p>
                  <p className={styles["testimonio-desc"]}>Clienta desde 2005</p>
                </div>
              </div>
            </div>
            <div className={styles["testimonio-card"]}>
              <div className={styles["testimonio-texto"]}>
                &quot;No hay mejor manera de empezar el día que con un café y una concha recién horneada&quot;
              </div>
              <div className={styles["testimonio-autor"]}>
                <Image
                  src="/images/cliente2.jpg"
                  alt="Cliente Roberto"
                  width={60}
                  height={60}
                  className={styles["testimonio-foto"]}
                />
                <div>
                  <p className={styles["testimonio-nombre"]}>Roberto Torres</p>
                  <p className={styles["testimonio-desc"]}>Cliente frecuente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     <section className={styles["visitanos-section"]}>
  <div className={styles["visitanos-container"]}>
    <div className={styles["visitanos-info"]}>
      <h2>Visítanos</h2>
      <p>Estamos en el corazón de Tehuacán</p>
      <div className={styles["visitanos-datos"]}>
        <p>📍 Calle del Sabor 123, Col. La Hogaza, Tehuacán, Puebla</p>
        <p>🕒 Horario: Lunes a Sábado 6:00 am - 9:00 pm</p>
        <p>📞 Teléfono: 238 123 4567</p>
        <p>📧 Email: contacto@elpandecadadia.com</p>
      </div>
      {/*
        El botón ahora abrirá la misma dirección de Google Maps.
      */}
      <a
        href="https://maps.app.goo.gl/oHYyx4NLNiQiBNdQA" 
        target="_blank"
        rel="noopener noreferrer"
        className={styles["btn-mapa"]}
      >
        Ver en mapa
      </a>
    </div>
    <div className={styles["visitanos-imagen"]}>
      {/* El iframe ya tiene la URL actualizada */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.4383601596455!2d-97.37770572534913!3d18.463792770907173!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85c5bdb557c4b3d9%3A0xd3391c3e9cc7b23b!2sNINDO%20CAF%C3%89!5e0!3m2!1ses!2smx!4v1748828396037!5m2!1ses!2smx"
        width="600"
        height="450"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className={styles["local-img"]}
        title="Ubicación de nuestra panadería en Google Maps"
      ></iframe>
    </div>
  </div>
</section>


      {/* Overlay del Carrito */}
      {mostrarCarrito && (
        <div className={styles["carrito-overlay"]} onClick={toggleCarrito}>
          <div className={styles["carrito"]} onClick={(e) => e.stopPropagation()}>
            <h2>Tu Carrito</h2>
            {carrito.length === 0 ? (
              <p>Tu carrito está vacío.</p>
            ) : (
              <>
                <ul>
                  {carrito.map(({ nombre, precio, cantidad }) => (
                    <li key={nombre} className={styles["carrito-item"]}>
                      <span>{nombre} x {cantidad}</span>
                      <span>${precio * cantidad} MXN</span>
                      {/* No incluimos botón de eliminar aquí, para que la gestión sea en Productos */}
                    </li>
                  ))}
                </ul>
                <div className={styles["carrito-total"]}>
                  <strong>Total: </strong>${total} MXN
                </div>
                {/* Botón de Pagar usando la función iniciarPago */}
                <button
                  className={styles["btn-pagar"]}
                  onClick={iniciarPago} // <--- NEW: Calls the payment function
                  disabled={cargandoPago || carrito.length === 0} // Disable if loading or cart is empty
                >
                  {cargandoPago ? "Redirigiendo a pago..." : "Pagar con Mercado Pago"}
                </button>
                {/* Opcionalmente, un enlace a productos para editar el carrito */}
                <Link href="/productos" className={styles["btn-editar-carrito"]}>
                   Editar Carrito
                </Link>
              </>
            )}
            <button className={styles["btn-cerrar"]} onClick={toggleCarrito}>
              Cerrar
            </button>
          </div>
        </div>
      )}

     
    </main>
    <Footer />
    </>
  );
}