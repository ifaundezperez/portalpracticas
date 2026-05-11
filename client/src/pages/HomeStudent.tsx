import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

function HomeStudent() {
  const navigate = useNavigate();
  const [nombreAlumno, setNombreAlumno] = useState('');
  const [vista, setVista] = useState<'explorar' | 'postulaciones' | 'perfil' | 'curriculum'>('explorar');

  // Estados para datos del Backend
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  // Estado para editar perfil profesional
  const [perfilEditable, setPerfilEditable] = useState({
    resumen: '',
    habilidades: [] as string[],
    experiencias: [] as string[],
    proyectos: [] as string[]
  });

  // 🔒 VALIDACIÓN DE SEGURIDAD: Si no hay token, redirecciona al login
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'student') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    // Recuperamos datos de sesión
    const storedName = localStorage.getItem('userName');
    setNombreAlumno(storedName || 'Alumno');
    
    // Carga inicial según la vista
    if (vista === 'explorar') fetchOfertas();
    if (vista === 'postulaciones') fetchMisPostulaciones();
  }, [vista]); // Se dispara cada vez que cambias de pestaña

  // --- LOGICA DE DATOS (Sincronizada con nuevas rutas) ---

  const fetchOfertas = async () => {
    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/api/offers`); // Ruta pluralizada
      const data = await response.json();
      // 🛡️ Salvaguarda: Si data no es un array, ponemos uno vacío para evitar crash
      setOfertas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar ofertas:", error);
      setOfertas([]);
    } finally {
      setCargando(false);
    }
  };

  const fetchMisPostulaciones = async () => {
    const studentId = localStorage.getItem('userId');
    if (!studentId) return;

    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/api/applications/student/${studentId}`);
      const data = await response.json();
      setPostulaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar postulaciones:", error);
    } finally {
      setCargando(false);
    }
  };

  const handlePostular = async (offerId: string) => {
    const studentId = localStorage.getItem('userId');
    try {
      const response = await fetch(`${API_URL}/api/applications/postular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, studentId }) // Campos en inglés coinciden con el modelo
      });

      const resData = await response.json();
      if (response.ok) {
        alert('✅ Postulación enviada con éxito');
        setVista('postulaciones');
      } else {
        alert(`❌ ${resData.message}`);
      }
    } catch (error) {
      alert('Error de conexión con el servidor');
    }
  };

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    const studentId = localStorage.getItem('userId');

    // Convertir habilidades de string a array si es necesario
    const datosAEnviar = {
      resumen: perfilEditable.resumen,
      habilidades: typeof perfilEditable.habilidades === 'string'
        ? perfilEditable.habilidades.split(',').map(h => h.trim()).filter(h => h)
        : perfilEditable.habilidades,
      experiencias: perfilEditable.experiencias,
      proyectos: perfilEditable.proyectos
    };

    try {
      const response = await fetch(`${API_URL}/api/auth/actualizar-perfil/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosAEnviar)
      });

      if (response.ok) {
        alert('✅ Perfil actualizado correctamente');
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.message}`);
      }
    } catch (error) {
      alert('Error al guardar perfil');
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <nav style={styles.sidebar}>
        <h2 style={styles.logo}>PORTAL <span style={{fontSize: '0.6rem'}}>ALUMNOS</span></h2>
        <div style={styles.navLinks}>
          <button onClick={() => setVista('explorar')} style={vista === 'explorar' ? styles.activeLink : styles.link}>🔍 Explorar Prácticas</button>
          <button onClick={() => setVista('postulaciones')} style={vista === 'postulaciones' ? styles.activeLink : styles.link}>📋 Mis Postulaciones</button>
          <button onClick={() => setVista('curriculum')} style={vista === 'curriculum' ? styles.activeLink : styles.link}>📄 Mi Curriculum</button>
          <button onClick={() => setVista('perfil')} style={vista === 'perfil' ? styles.activeLink : styles.link}>⚙️ Mi Perfil</button>
        </div>
        <button onClick={handleLogout} style={styles.btnLogout}>Cerrar Sesión</button>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main style={styles.main}>
        <header style={styles.header}>
          <h1>Bienvenido, {nombreAlumno}</h1>
          <p>Ingeniería en Computación e Informática - UNAB.</p>
        </header>

        {/* VISTA: EXPLORAR */}
        {vista === 'explorar' && (
          <section>
            <h2 style={{marginBottom: '20px'}}>🔍 Prácticas Disponibles</h2>
            {cargando ? <p>Cargando ofertas...</p> : (
              <div style={styles.offersGrid}>
                {ofertas.map((o) => (
                  <div key={o._id} style={styles.offerCard}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      {/* 🛡️ Usamos campos en inglés: title, modality */}
                      <h3 style={{margin: 0}}>{o.title}</h3>
                      <span style={styles.badge}>{o.modality}</span>
                    </div>
                    {/* 🛡️ Populate: o.companyId trae el objeto de la empresa */}
                    <p style={{color: '#3b82f6', fontWeight: 'bold'}}>
                      {o.companyId?.nombreEmpresa || 'Empresa'}
                    </p>
                    <p style={styles.offerDescription}>{o.description}</p>
                    <div style={styles.offerFooter}>
                      <span style={{fontSize: '0.8rem', color: '#94a3b8'}}>📍 {o.location}</span>
                      <button onClick={() => handlePostular(o._id)} style={styles.btnAction}>Postular ahora</button>
                    </div>
                  </div>
                ))}
                {ofertas.length === 0 && <p>No hay ofertas disponibles por ahora.</p>}
              </div>
            )}
          </section>
        )}

        {/* VISTA: MIS POSTULACIONES */}
        {vista === 'postulaciones' && (
          <section style={styles.card}>
            <h2>Mis Postulaciones</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Empresa</th>
                  <th style={styles.th}>Práctica</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {postulaciones.map((p) => (
                  <tr key={p._id}>
                    {/* Navegación profunda con ?. para evitar errores si el populate falla */}
                    <td style={styles.td}>{p.offerId?.companyId?.nombreEmpresa || 'N/A'}</td>
                    <td style={styles.td}>{p.offerId?.title || 'Oferta eliminada'}</td>
                    <td style={styles.td}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <span style={{
                        color: p.status === 'accepted' ? '#198754' : p.status === 'rejected' ? '#dc3545' : '#f59e0b',
                        fontWeight: 'bold'
                      }}>
                        {p.status === 'pendiente' ? 'Pendiente' : p.status === 'aceptada' ? 'Aceptado' : 'Rechazado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {postulaciones.length === 0 && <p style={{textAlign: 'center', padding: '20px'}}>Aún no has postulado a ninguna práctica.</p>}
          </section>
        )}

        {/* VISTA: MI CURRICULUM */}
        {vista === 'curriculum' && (
          <section style={styles.card}>
            <h2>Mi Curriculum Generado</h2>
            <p style={{color: '#64748b', marginBottom: '20px'}}>Tu CV se genera automáticamente basado en tu perfil. Puedes verlo y descargarlo como PDF.</p>
            <a href={`/curriculum/${localStorage.getItem('userId')}`} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              📄 Ver / Descargar CV
            </a>
          </section>
        )}

        {/* VISTA: MI PERFIL */}
        {vista === 'perfil' && (
          <section style={styles.card}>
            <h2>Mi Perfil Profesional</h2>
            <form onSubmit={handleGuardarPerfil} style={{marginTop: '20px'}}>

              <label style={{display: 'block', marginBottom: '15px'}}>
                <strong>Resumen Profesional:</strong>
                <textarea
                  value={perfilEditable.resumen}
                  onChange={(e) => setPerfilEditable({...perfilEditable, resumen: e.target.value})}
                  placeholder="Cuéntanos sobre ti en máximo 200 palabras..."
                  style={{width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif'}}
                />
              </label>

              <label style={{display: 'block', marginBottom: '15px'}}>
                <strong>Habilidades Técnicas (separadas por coma):</strong>
                <input
                  type="text"
                  value={typeof perfilEditable.habilidades === 'string' ? perfilEditable.habilidades : perfilEditable.habilidades.join(', ')}
                  onChange={(e) => setPerfilEditable({...perfilEditable, habilidades: e.target.value})}
                  placeholder="React, Python, SQL, JavaScript..."
                  style={{width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box'}}
                />
              </label>

              <label style={{display: 'block', marginBottom: '15px'}}>
                <strong>Experiencias y Voluntariado:</strong>
                <textarea
                  value={perfilEditable.experiencias.join('\n')}
                  onChange={(e) => setPerfilEditable({...perfilEditable, experiencias: e.target.value.split('\n').filter(e => e.trim())})}
                  placeholder="Una línea por experiencia&#10;Ej: Voluntariado en ONG XYZ (2023)&#10;Ej: Práctica en Empresa ABC"
                  style={{width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif'}}
                />
              </label>

              <label style={{display: 'block', marginBottom: '15px'}}>
                <strong>Proyectos Destacados:</strong>
                <textarea
                  value={perfilEditable.proyectos.join('\n')}
                  onChange={(e) => setPerfilEditable({...perfilEditable, proyectos: e.target.value.split('\n').filter(p => p.trim())})}
                  placeholder="Una línea por proyecto&#10;Ej: App de gestión de tareas con React&#10;Ej: Sistema de base de datos SQL"
                  style={{width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif'}}
                />
              </label>

              <button type="submit" style={{backgroundColor: '#3b82f6', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold'}}>
                💾 Guardar Cambios
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

// ESTILOS (Manteniendo la estética de la UNAB y COFLICH)
const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#f8fafc' },
  sidebar: { width: '260px', backgroundColor: '#1e293b', color: 'white', padding: '30px', display: 'flex', flexDirection: 'column' },
  logo: { color: '#60a5fa', marginBottom: '40px', letterSpacing: '1px' },
  navLinks: { display: 'flex', flexDirection: 'column', gap: '15px', flexGrow: 1 },
  link: { background: 'none', border: 'none', color: '#94a3b8', textAlign: 'left', padding: '12px', cursor: 'pointer', fontSize: '1rem' },
  activeLink: { backgroundColor: '#334155', border: 'none', color: '#60a5fa', textAlign: 'left', padding: '12px', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' },
  btnLogout: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer' },
  main: { flexGrow: 1, padding: '40px', overflowY: 'auto' },
  header: { marginBottom: '40px' },
  offersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  offerCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  offerDescription: { color: '#64748b', fontSize: '0.9rem', margin: '15px 0', height: '60px', overflow: 'hidden' },
  offerFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' },
  badge: { backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' },
  btnAction: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' },
  card: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #f1f5f9', color: '#64748b' },
  td: { padding: '12px', borderBottom: '1px solid #f1f5f9' }
};

export default HomeStudent;