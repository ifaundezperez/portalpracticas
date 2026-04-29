import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">PORTAL PRÁCTICAS</div>
        <div className="nav-links">
          <Link to="/login" className="btn-acceso">Acceso / Registro</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="hero">
        <h1>CONECTA CON TU FUTURO PROFESIONAL</h1>
        <p>Simplifica tu búsqueda de práctica, genera tu CV automático y encuentra la empresa ideal.</p>
        <Link to="/login" className="cta-button">Empezar Ahora</Link>
      </header>

      {/* SECCIÓN DE VALOR (Los 3 pilares) */}
      <section className="features">
        <div className="feature-card">
          <h3>CV Automático</h3>
          <p>Generación profesional instantánea basada en tu perfil.</p>
        </div>
        <div className="feature-card">
          <h3>Marketplace de Ofertas</h3>
          <p>Acceso directo a las mejores empresas del país.</p>
        </div>
        <div className="feature-card">
          <h3>Conexión Rápida</h3>
          <p>Postulaciones en un clic y seguimiento en tiempo real.</p>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;