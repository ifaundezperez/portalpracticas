import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

function HomeCompany() {
  const navigate = useNavigate();
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [vista, setVista] = useState<'dashboard' | 'crear' | 'ofertas' | 'postulantes'>('dashboard');
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [postulantesOferta, setPostulantesOferta] = useState<any[]>([]);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState<string | null>(null);

  // 🔒 VALIDACIÓN DE SEGURIDAD: Si no hay token, redirecciona al login
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'company') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // 1. Sincronizamos los nombres de los campos con el Modelo Offer.ts
  const [nuevaOferta, setNuevaOferta] = useState({
    title: '', 
    description: '', 
    location: '', 
    salary: '', 
    modality: 'Presencial', 
    requirements: ''
  });

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    setNombreEmpresa(storedName || 'Empresa');
    
    if (vista === 'ofertas' || vista === 'dashboard') {
      fetchOfertas();
    }
  }, [vista]);

  const fetchOfertas = async () => {
    const empresaId = localStorage.getItem('userId');
    if (!empresaId) {
      setOfertas([]);
      return;
    }

    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/api/offers/empresa/${empresaId}`);

      // 🛡️ Validar que la respuesta fue exitosa
      if (!response.ok) {
        console.error('Error en servidor:', response.status);
        setOfertas([]);
        return;
      }

      const data = await response.json();
      // 🛡️ Salvaguarda: Si no es array, ponemos uno vacío
      setOfertas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar ofertas:", error);
      setOfertas([]);
    } finally {
      setCargando(false);
    }
  };

  const handleSubmitOferta = async (e: React.FormEvent) => {
    e.preventDefault();
    const companyId = localStorage.getItem('userId');

    try {
      // 🚀 CAMBIO: Ruta 'api/offers/crear'
      const response = await fetch(`${API_URL}/api/offers/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevaOferta,
          companyId, // 👈 Sincronizado con el modelo
          requirements: nuevaOferta.requirements.split(',').map(r => r.trim())
        })
      });

      if (response.ok) {
        alert('✅ Oferta publicada con éxito');
        setVista('ofertas');
        setNuevaOferta({ title: '', description: '', location: '', salary: '', modality: 'Presencial', requirements: '' });
      }
    } catch (error) {
      console.error("Error al publicar:", error);
    }
  };

  const fetchPostulantes = async (offerId: string) => {
    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/api/applications/oferta/${offerId}`);
      const data = await response.json();
      setPostulantesOferta(Array.isArray(data) ? data : []);
      setOfertaSeleccionada(offerId);
      setVista('postulantes');
    } catch (error) {
      console.error("Error al cargar postulantes:", error);
      setPostulantesOferta([]);
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarEstado = async (applicationId: string, nuevoEstado: 'aceptada' | 'rechazada') => {
    try {
      const response = await fetch(`${API_URL}/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoEstado })
      });

      if (response.ok) {
        alert(`✅ Postulante ${nuevoEstado === 'aceptada' ? 'aceptado' : 'rechazado'}`);
        if (ofertaSeleccionada) {
          fetchPostulantes(ofertaSeleccionada);
        }
      }
    } catch (error) {
      alert('Error al actualizar estado');
      console.error(error);
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.sidebar}>
        <h2 style={styles.logo}>PORTAL <span style={{fontSize: '0.6rem'}}>PRÁCTICAS</span></h2>
        <div style={styles.navLinks}>
          <button onClick={() => setVista('dashboard')} style={vista === 'dashboard' ? styles.activeLink : styles.link}>📊 Dashboard</button>
          <button onClick={() => setVista('crear')} style={vista === 'crear' ? styles.activeLink : styles.link}>➕ Publicar Práctica</button>
          <button onClick={() => setVista('ofertas')} style={vista === 'ofertas' ? styles.activeLink : styles.link}>📁 Mis Ofertas</button>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={styles.btnLogout}>Cerrar Sesión</button>
      </nav>

      <main style={styles.main}>
        <header style={styles.header}>
          <h1>Panel de Empresa</h1>
          <p>Bienvenido de vuelta, <strong style={{color: '#198754'}}>{nombreEmpresa}</strong></p>
        </header>

        {vista === 'dashboard' && (
          <div style={styles.grid}>
            <div style={styles.card}><h3>{ofertas.length}</h3><p>Ofertas Activas</p></div>
            <div style={styles.card}><h3>{ofertas.reduce((total, oferta) => total + (oferta.applicants?.length || 0), 0)}</h3><p>Postulantes Totales</p></div>
            <div style={styles.card}><h3>Activo</h3><p>Estado de Cuenta</p></div>
          </div>
        )}

        {vista === 'crear' && (
          <form onSubmit={handleSubmitOferta} style={styles.form}>
            <h2>Publicar Vacante</h2>
            <input type="text" placeholder="Cargo (Ej: Desarrollador Junior)" value={nuevaOferta.title} onChange={e => setNuevaOferta({...nuevaOferta, title: e.target.value})} required style={styles.input} />
            <textarea placeholder="Descripción del cargo y beneficios..." value={nuevaOferta.description} onChange={e => setNuevaOferta({...nuevaOferta, description: e.target.value})} required style={{...styles.input, height: '100px'}} />
            <div style={{display: 'flex', gap: '10px'}}>
                <input type="text" placeholder="Ubicación" value={nuevaOferta.location} onChange={e => setNuevaOferta({...nuevaOferta, location: e.target.value})} required style={styles.input} />
                <select value={nuevaOferta.modality} onChange={e => setNuevaOferta({...nuevaOferta, modality: e.target.value})} style={styles.input}>
                    <option value="Presencial">Presencial</option>
                    <option value="Remoto">Remoto</option>
                    <option value="Híbrido">Híbrido</option>
                </select>
            </div>
            <input type="text" placeholder="Remuneración (Asignación práctica)" value={nuevaOferta.salary} onChange={e => setNuevaOferta({...nuevaOferta, salary: e.target.value})} style={styles.input} />
            <input type="text" placeholder="Requisitos separados por coma (React, SQL, Inglés)" value={nuevaOferta.requirements} onChange={e => setNuevaOferta({...nuevaOferta, requirements: e.target.value})} style={styles.input} />
            <button type="submit" style={styles.btnSubmit}>Confirmar Publicación</button>
          </form>
        )}

        {vista === 'ofertas' && (
          <div style={styles.card}>
            <h3>Gestión de Ofertas</h3>
            {cargando ? <p>Cargando...</p> : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Título</th>
                    <th style={styles.th}>Modalidad</th>
                    <th style={styles.th}>Ubicación</th>
                    <th style={styles.th}>Postulantes</th>
                    <th style={styles.th}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ofertas.map((o) => (
                    <tr key={o._id}>
                      {/* 🚀 CAMBIO: Usamos los campos en inglés según el nuevo modelo */}
                      <td style={{...styles.td, color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline'}} onClick={() => fetchPostulantes(o._id)}>
                        {o.title}
                      </td>
                      <td style={styles.td}>{o.modality}</td>
                      <td style={styles.td}>{o.location}</td>
                      <td style={{...styles.td, cursor: 'pointer', color: '#3b82f6', fontWeight: 'bold'}} onClick={() => fetchPostulantes(o._id)}>
                        {o.applicants?.length || 0}
                      </td>
                      <td style={styles.td}>
                        <span style={{color: o.status === 'Active' ? '#198754' : '#ef4444', fontWeight: 'bold'}}>
                          {o.status === 'Active' ? 'Activa' : 'Cerrada'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {ofertas.length === 0 && <tr><td colSpan={5} style={{textAlign: 'center', padding: '20px'}}>No has publicado ofertas aún.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* VISTA: POSTULANTES DE UNA OFERTA */}
        {vista === 'postulantes' && ofertaSeleccionada && (
          <section style={styles.card}>
            <button onClick={() => { setOfertaSeleccionada(null); setVista('ofertas'); }} style={{marginBottom: '20px', padding: '10px 15px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
              ← Volver a Ofertas
            </button>
            <h2>Postulantes</h2>
            {cargando ? <p>Cargando...</p> : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Carrera</th>
                    <th style={styles.th}>Universidad</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {postulantesOferta.map((p) => (
                    <tr key={p._id}>
                      <td style={styles.td}>{p.studentId?.nombre} {p.studentId?.apellidos}</td>
                      <td style={styles.td}>{p.studentId?.email}</td>
                      <td style={styles.td}>{p.studentId?.carrera}</td>
                      <td style={styles.td}>{p.studentId?.universidad}</td>
                      <td style={styles.td}>
                        <span style={{color: p.status === 'aceptada' ? '#198754' : p.status === 'rechazada' ? '#dc3545' : '#f59e0b', fontWeight: 'bold'}}>
                          {p.status === 'pendiente' ? 'Pendiente' : p.status === 'aceptada' ? 'Aceptado' : 'Rechazado'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => window.open(`/curriculum/${p.studentId._id}`, '_blank')}
                          style={{backgroundColor: '#0ea5e9', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '0.85rem'}}
                        >
                          📄 Ver CV
                        </button>
                        {p.status === 'pendiente' && (
                          <>
                            <button onClick={() => handleCambiarEstado(p._id, 'aceptada')} style={{backgroundColor: '#198754', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '0.85rem'}}>
                              ✓ Aceptar
                            </button>
                            <button onClick={() => handleCambiarEstado(p._id, 'rechazada')} style={{backgroundColor: '#dc3545', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem'}}>
                              ✕ Rechazar
                            </button>
                          </>
                        )}
                        {p.status === 'aceptada' && <span style={{color: '#198754', fontWeight: 'bold'}}>✓ Aceptado</span>}
                        {p.status === 'rechazada' && <span style={{color: '#dc3545', fontWeight: 'bold'}}>✕ Rechazado</span>}
                      </td>
                    </tr>
                  ))}
                  {postulantesOferta.length === 0 && <tr><td colSpan={6} style={{textAlign: 'center', padding: '20px'}}>No hay postulantes.</td></tr>}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>
    </div>
  );
}


// ESTILOS PARA HOMECOMPANY (Igual que HomeStudent pero adaptado)
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  form: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '600px' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem' },
  btnSubmit: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', marginTop: '10px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontWeight: 'bold' },
  td: { padding: '12px', borderBottom: '1px solid #f1f5f9' }
};

export default HomeCompany;