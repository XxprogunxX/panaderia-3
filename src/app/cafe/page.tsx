import './cafe.css'; // Ensure your CSS is imported
import Image from 'next/image';

export default function CafePage() {
  return (
    <> 
      

      <main className="cafe-page">
  <section className="hero">
    <nav className="navbar">
      <div className="navbar-container">
          <Image
    src="/images/logo-cafe.png"
    alt="Imagen de Espresso"
    width={200}
    height={200}
    className="navbar-logo"
  />
        <a href="#historia" className="nav-link">Historia</a>
        <a href="#productos" className="nav-link">Productos</a>
        <a href="/" className="nav-link">Panaderia</a>
        <a href="#testimonios" className="nav-link">Testimonios</a>
      </div>
    </nav>
    <div className="hero-text">
      <h1>El Arte del Café</h1>
      <p>Una experiencia sensorial en cada taza.</p>
      <button className="cta-button">Comprar Ahora</button>
    </div>
   
  </section>


        {/* Add id="historia" to the history section */}


        <section id="productos" className="productos">
  <h2 className="productos-titulo">Nuestros Favoritos</h2>
  <div className="productos-grid">
    <div className="producto-card">
      <div className="producto-etiqueta natural">ESPRESSO</div>
      <Image src="/images/cafe-2.avif" alt="Espresso" width={180} height={180} className="producto-img" />
      <div className="producto-info">
        <div className="producto-rating">★★★★★ <span>(12)</span></div>
        <h3 className="producto-nombre">Espresso</h3>
        <p className="producto-precio">Desde $75.00 MXN</p>
        <p className="producto-notas">NOTAS: CHOCOLATE / NUEZ / TOQUE FLORAL</p>
        <p className="producto-tueste">Tueste Medio</p>
      </div>
    </div>

    <div className="producto-card">
      <div className="producto-etiqueta honey">AMERICANO</div>
      <Image src="/images/cafe-2.avif" alt="Americano" width={180} height={180} className="producto-img" />
      <div className="producto-info">
        <div className="producto-rating">★★★★☆ <span>(9)</span></div>
        <h3 className="producto-nombre">Americano</h3>
        <p className="producto-precio">Desde $60.00 MXN</p>
        <p className="producto-notas">NOTAS: CARAMELO / NUEZ / FINAL LIMPIO</p>
        <p className="producto-tueste">Tueste Medio</p>
      </div>
    </div>

    <div className="producto-card">
      <div className="producto-etiqueta lavado">CAPPUCCINO</div>
      <Image src="/images/cafe-2.avif" alt="Cappuccino" width={180} height={180} className="producto-img" />
      <div className="producto-info">
        <div className="producto-rating">★★★★★ <span>(17)</span></div>
        <h3 className="producto-nombre">Cappuccino</h3>
        <p className="producto-precio">Desde $85.00 MXN</p>
        <p className="producto-notas">NOTAS: CREMOSO / VAINILLA / CACAO</p>
        <p className="producto-tueste">Tueste Medio</p>
      </div>
    </div>
     <div className="producto-card">
      <div className="producto-etiqueta lavado">CAPPUCCINO</div>
      <Image src="/images/cafe-2.avif" alt="Cappuccino" width={180} height={180} className="producto-img" />
      <div className="producto-info">
        <div className="producto-rating">★★★★★ <span>(17)</span></div>
        <h3 className="producto-nombre">Cappuccino</h3>
        <p className="producto-precio">Desde $85.00 MXN</p>
        <p className="producto-notas">NOTAS: CREMOSO / VAINILLA / CACAO</p>
        <p className="producto-tueste">Tueste Medio</p>
      </div>
    </div>
    
  </div>
</section>


        <section id="informacion" className="informacion fade-in-up">
  <h2>Información del Café</h2>
  <div className="info-cards-container">
    <article className="info-card left-image">
      <div className="info-image">
        <Image src="/images/origen.jpg" alt="Origen del café" width={300} height={200} />
      </div>
      <div className="info-text">
        <h3>Origen</h3>
        <p>
          Nuestro café proviene de las montañas de Oaxaca, México, cultivado en
          altitudes ideales para un sabor intenso y aroma único.
        </p>
      </div>
    </article>

    <article className="info-card right-image">
      <div className="info-text">
        <h3>Proceso de Tostado</h3>
        <p>
          Tostamos nuestros granos de forma artesanal para preservar los
          matices y la calidad, con perfiles que varían desde ligero hasta
          oscuro.
        </p>
      </div>
      <div className="info-image">
        <Image src="/images/tostado.jpg" alt="Proceso de tostado" width={300} height={200} />
      </div>
    </article>

    <article className="info-card left-image">
      <div className="info-image">
        <Image src="/images/variedades.jpg" alt="Variedades de café" width={300} height={200} />
      </div>
      <div className="info-text">
        <h3>Variedades</h3>
        <p>
          Contamos con variedades arábica y robusta, cada una con características
          especiales que satisfacen todos los gustos.
        </p>
      </div>
    </article>

    <article className="info-card right-image">
      <div className="info-text">
        <h3>Perfil de Sabor</h3>
        <p>
          Nuestros cafés ofrecen notas florales, frutales y un cuerpo balanceado,
          ideal para amantes del café exigentes.
        </p>
      </div>
      <div className="info-image">
        <Image src="/images/perfil-sabor.jpg" alt="Perfil de sabor" width={300} height={200} />
      </div>
    </article>
  </div>
</section>


 


        {/* Add id="testimonios" to the testimonios section */}
        <section id="testimonios" className="testimonios fade-in">
          <h2>Lo que dicen nuestros clientes</h2>
          <blockquote>“El mejor café que he probado. Su aroma es una delicia.”</blockquote>
          {/* Add a source for the testimonial if available */}
          {/* <p>- Nombre del Cliente</p> */}
        </section>
      </main>
    </> // Close the fragment
  );
}