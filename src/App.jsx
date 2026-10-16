import './App.css'

export default function App() {
  return (
    <>
      {/* HEADER */}
      <header className="site-header">
        <div className="container nav-container">
          <a href="#" className="brand-logo">
            <span className="brand-avengers">AVENGER'S</span>
            <span className="brand-shop">SHOP</span>
          </a>

          <nav>
            <ul className="nav-menu">
              <li><a href="#" className="nav-link active">Inicio</a></li>
              <li><a href="#catalogo" className="nav-link">Cómics</a></li>
              <li><a href="#catalogo" className="nav-link">Figuras & Juguetes</a></li>
              <li><a href="#catalogo" className="nav-link">Tazas & Hogar</a></li>
              <li><a href="#catalogo" className="nav-link">Exclusivos</a></li>
            </ul>
          </nav>

          <div className="nav-actions">
            <div className="cart-indicator">
              <span>ARSENAL</span>
              <span className="badge">0</span>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-strip"></div>
        <div className="container hero-content">
          <div>
            <span className="hero-tagline">Ediciones Limitadas & Réplicas Oficiales</span>
            <h1 className="hero-title">EQUÍPATE CON EL PODER DE <span>LOS VENGADORES</span></h1>
            <p className="hero-desc">
              Desde clásicos del noveno arte hasta reliquias cinemáticas de coleccionista. Explora nuestro catálogo de cómics, tazas temáticas y réplicas de combate premium.
            </p>
            <div className="hero-buttons">
              <a href="#catalogo" class="btn btn-primary" className="btn btn-primary">Ver Arsenal</a>
              <a href="#exclusive" className="btn btn-secondary">Piezas del Infinito</a>
            </div>
          </div>

          <div className="hero-visual">
            <svg className="shield-showcase" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="95" fill="#E62429" stroke="#9F0000" strokeWidth="4"/>
              <circle cx="100" cy="100" r="75" fill="#ECEFF1" stroke="#CFD8DC" strokeWidth="2"/>
              <circle cx="100" cy="100" r="55" fill="#E62429" stroke="#9F0000" strokeWidth="2"/>
              <circle cx="100" cy="100" r="35" fill="#005B94" stroke="#003B64" strokeWidth="2"/>
              <polygon points="100,68 108,86 127,87 112,99 117,118 100,107 83,118 88,99 73,87 92,86" fill="#FFFFFF"/>
            </svg>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <div className="categories-bar">
        <div className="container">
          <div className="categories-list">
            <a href="#" className="category-chip active">Todo el Catálogo</a>
            <a href="#" className="category-chip">Cómics & Novelas Gráficas</a>
            <a href="#" className="category-chip">Tazas & Tazas 3D</a>
            <a href="#" className="category-chip">Figuras de Acción</a>
            <a href="#" className="category-chip">Réplicas de Combate</a>
            <a href="#" className="category-chip">Ropa & Accesorios</a>
          </div>
        </div>
      </div>

      {/* CATÁLOGO */}
      <main className="container catalogue-section" id="catalogo">
        <div className="section-header">
          <div>
            <h2 className="section-title">Merchandising Destacado</h2>
          </div>
          <span className="inventory-status">6 ARTEFACTOS DISPONIBLES</span>
        </div>

        <div className="products-grid">
          {/* Taza Iron Man */}
          <article className="product-card">
            <span className="product-badge">Más Vendido</span>
            <div className="product-image-container">
              <svg className="product-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <rect x="25" y="30" width="60" height="60" rx="8" fill="#E62429" stroke="#9F0000" strokeWidth="2"/>
                <path d="M 85 45 C 105 45, 105 75, 85 75" fill="none" stroke="#E62429" strokeWidth="8" strokeLinecap="round"/>
                <polygon points="40,45 80,45 75,75 45,75" fill="#FFB703"/>
                <circle cx="60" cy="60" r="10" fill="#00A8FF"/>
              </svg>
            </div>
            <div className="product-details">
              <span className="product-category">Tazas & Hogar</span>
              <h3 className="product-name">Taza 3D Casco Iron Man Mark 85</h3>
              <p className="product-desc">Cerámica de alta densidad inspirada en la nanotecnología de Tony Stark con reactor reflectante.</p>
              <div className="product-footer">
                <span className="product-price">18,99 €</span>
                <button className="btn btn-buy" type="button">Adquirir</button>
              </div>
            </div>
          </article>

          {/* Guantelete */}
          <article className="product-card">
            <span className="product-badge gold">Exclusivo</span>
            <div className="product-image-container">
              <svg className="product-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <path d="M 40 40 L 80 40 L 75 95 L 45 95 Z" fill="#FFB703" stroke="#B27B00" strokeWidth="2"/>
                <circle cx="60" cy="55" r="7" fill="#FFA500"/>
                <circle cx="48" cy="45" r="4" fill="#9C27B0"/>
                <circle cx="56" cy="45" r="4" fill="#00A8FF"/>
                <circle cx="64" cy="45" r="4" fill="#E62429"/>
                <circle cx="72" cy="45" r="4" fill="#4CAF50"/>
                <rect x="52" y="75" width="16" height="10" rx="3" fill="#E65100"/>
              </svg>
            </div>
            <div className="product-details">
              <span className="product-category">Réplicas & Figuras</span>
              <h3 className="product-name">Guantelete del Infinito Articulado</h3>
              <p className="product-desc">Réplica a escala 1:1 con gemas iluminadas por LED y sonido FX de chasquido cósmico.</p>
              <div className="product-footer">
                <span className="product-price">124,90 €</span>
                <button className="btn btn-buy" type="button">Adquirir</button>
              </div>
            </div>
          </article>

          {/* Cómic */}
          <article className="product-card">
            <span className="product-badge">Edición Facsímil</span>
            <div className="product-image-container">
              <svg className="product-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <rect x="35" y="20" width="50" height="75" rx="3" fill="#FFF" stroke="#E62429" strokeWidth="3"/>
                <rect x="35" y="20" width="50" height="15" fill="#E62429"/>
                <rect x="38" y="42" width="44" height="30" fill="#15161E"/>
                <text x="42" y="32" fontFamily="sans-serif" fontWeight="900" fontSize="8" fill="#FFF">MARVEL</text>
                <circle cx="60" cy="57" r="8" fill="#FFB703"/>
              </svg>
            </div>
            <div className="product-details">
              <span className="product-category">Cómics</span>
              <h3 className="product-name">Secret Wars (1984) #1 Facsímil</h3>
              <p className="product-desc">El evento que definió el universo superheroico moderno. Portada original remasterizada.</p>
              <div className="product-footer">
                <span className="product-price">22,50 €</span>
                <button className="btn btn-buy" type="button">Adquirir</button>
              </div>
            </div>
          </article>

          {/* Mjolnir */}
          <article className="product-card">
            <div className="product-image-container">
              <svg className="product-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <rect x="30" y="35" width="60" height="32" rx="4" fill="#90A4AE" stroke="#455A64" strokeWidth="2"/>
                <rect x="56" y="67" width="8" height="42" rx="2" fill="#5D4037"/>
                <circle cx="60" cy="51" r="5" fill="#ECEFF1" stroke="#455A64"/>
              </svg>
            </div>
            <div className="product-details">
              <span className="product-category">Juguetes & Rol</span>
              <h3 className="product-name">Mjolnir Electrónico Thor Legends</h3>
              <p className="product-desc">Construcción con empuñadura de cuero y runas de Odín que reaccionan por voz.</p>
              <div className="product-footer">
                <span className="product-price">89,95 €</span>
                <button className="btn btn-buy" type="button">Adquirir</button>
              </div>
            </div>
          </article>

          {/* Máscara Spider-Man */}
          <article className="product-card">
            <span className="product-badge">Colección Clásica</span>
            <div className="product-image-container">
              <svg className="product-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="60" cy="60" rx="35" ry="42" fill="#E62429" stroke="#9F0000" strokeWidth="2"/>
                <polygon points="40,55 52,65 52,50" fill="#FFF" stroke="#111" strokeWidth="2"/>
                <polygon points="80,55 68,65 68,50" fill="#FFF" stroke="#111" strokeWidth="2"/>
                <line x1="60" y1="20" x2="60" y2="100" stroke="#111" strokeWidth="1"/>
                <line x1="25" y1="60" x2="95" y2="60" stroke="#111" strokeWidth="1"/>
              </svg>
            </div>
            <div className="product-details">
              <span className="product-category">Ropa & Disfraces</span>
              <h3 class="product-name" className="product-name">Máscara Spidey Ojos Móviles</h3>
              <p className="product-desc">Tejido premium transpirable con selector manual de aperturas oculares expresivas.</p>
              <div className="product-footer">
                <span className="product-price">44,99 €</span>
                <button className="btn btn-buy" type="button">Adquirir</button>
              </div>
            </div>
          </article>

          {/* Wolverine */}
          <article className="product-card">
            <div className="product-image-container">
              <svg className="product-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <polygon points="30,25 45,75 75,75 90,25 75,45 45,45" fill="#0B0C10" stroke="#FFB703" strokeWidth="2"/>
                <polygon points="45,45 75,45 68,75 52,75" fill="#FFB703"/>
                <ellipse cx="60" cy="65" rx="8" ry="4" fill="#00A8FF"/>
              </svg>
            </div>
            <div className="product-details">
              <span className="product-category">Figuras de Acción</span>
              <h3 className="product-name">Figura Wolverine Traje Amarillo</h3>
              <p className="product-desc">Edición 50 Aniversario con garras de adamantium desmontables y base de exhibición.</p>
              <div className="product-footer">
                <span className="product-price">16,00 €</span>
                <button className="btn btn-buy" type="button">Adquirir</button>
              </div>
            </div>
          </article>
        </div>

        {/* BANNER EXCLUSIVO */}
        <section className="avengers-exclusive" id="exclusive">
          <div>
            <div className="exclusive-tag">★ Club Oficial Avengers</div>
            <h3 className="exclusive-title">¿BUSCAS PIEZAS DESCATALOGADAS?</h3>
            <p className="exclusive-desc">
              Únete al registro de coleccionistas para recibir alertas sobre stock limitado de réplicas maestras, cómics firmados por creadores y preventas mundiales exclusivas.
            </p>
          </div>
          <button className="btn btn-primary btn-nowrap" type="button">Solicitar Acceso</button>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="brand-logo footer-brand">
                <span className="brand-avengers">AVENGER'S</span>
                <span className="brand-shop">SHOP</span>
              </div>
              <p>La plataforma definitiva de merchandising, objetos de culto, cómics y réplicas con licencia para fanáticos de todo el multiverso.</p>
            </div>

            <div>
              <h4 className="footer-title">Categorías</h4>
              <ul className="footer-links">
                <li><a href="#">Cómics & Novelas</a></li>
                <li><a href="#">Figuras y Juguetes</a></li>
                <li><a href="#">Tazas & Utensilios</a></li>
                <li><a href="#">Ropa & Complementos</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-title">Colecciones</h4>
              <ul className="footer-links">
                <li><a href="#">Avengers Campus</a></li>
                <li><a href="#">Spider-Man Verse</a></li>
                <li><a href="#">X-Men Mutantes</a></li>
                <li><a href="#">Línea Infinity Saga</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-title">Soporte</h4>
              <ul className="footer-links">
                <li><a href="#">Estado del Pedido</a></li>
                <li><a href="#">Autenticidad & Licencias</a></li>
                <li><a href="#">Envíos Globales</a></li>
                <li><a href="#">Contacto con la Base</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>&copy; 2026 AVENGER'S SHOP. Proyecto de maquetación UI / Merchandising.</div>
            <div className="legal-notice">Todos los logotipos y marcas son propiedad intelectual de Marvel Characters, Inc.</div>
          </div>
        </div>
      </footer>
    </>
  )
}