import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function HomeCompany() {
  const navigate = useNavigate();
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [vista, setVista] = useState<'dashboard' | 'crear' | 'ofertas' | 'postulantes' | 'perfil'>('dashboard');
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

  // Estados para editar oferta
  const [ofertaEnEdicion, setOfertaEnEdicion] = useState<string | null>(null);

  // Estados para búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Estados para perfil de empresa
  const [datosEmpresa, setDatosEmpresa] = useState({
    companyName: '',
    companyRUT: '',
    industry: '',
    phone: '',
    website: '',
    description: ''
  });

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    setNombreEmpresa(storedName || 'Empresa');

    if (vista === 'ofertas' || vista === 'dashboard') {
      fetchOfertas();
    }
    if (vista === 'perfil') {
      fetchEmpresaPerfil();
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
      const url = ofertaEnEdicion
        ? `${API_URL}/api/offers/${ofertaEnEdicion}`
        : `${API_URL}/api/offers/crear`;
      const method = ofertaEnEdicion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevaOferta,
          ...(method === 'POST' && { companyId }),
          requirements: nuevaOferta.requirements.split(',').map(r => r.trim())
        })
      });

      if (response.ok) {
        alert(ofertaEnEdicion ? '✅ Oferta actualizada con éxito' : '✅ Oferta publicada con éxito');
        setVista('ofertas');
        setNuevaOferta({ title: '', description: '', location: '', salary: '', modality: 'Presencial', requirements: '' });
        setOfertaEnEdicion(null);
        fetchOfertas();
      }
    } catch (error) {
      console.error("Error al guardar oferta:", error);
    }
  };

  const handleEditarOferta = (oferta: any) => {
    setNuevaOferta({
      title: oferta.title,
      description: oferta.description,
      location: oferta.location,
      salary: oferta.salary,
      modality: oferta.modality,
      requirements: Array.isArray(oferta.requirements) ? oferta.requirements.join(', ') : oferta.requirements
    });
    setOfertaEnEdicion(oferta._id);
    setVista('crear');
  };

  const handleEliminarOferta = async (offerId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta oferta? Se eliminarán todas las postulaciones pendientes y rechazadas.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/offers/${offerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Oferta eliminada. Se eliminaron ${data.postulacionesEliminadas} postulaciones.`);
        fetchOfertas();
      } else {
        alert('❌ Error al eliminar la oferta');
      }
    } catch (error) {
      console.error("Error al eliminar oferta:", error);
      alert('Error al eliminar la oferta');
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

  // Función para filtrar ofertas
  const ofertasFiltradas = ofertas.filter(oferta => {
    const coincideBusqueda = oferta.title.toLowerCase().includes(busqueda.toLowerCase()) ||
                             oferta.description.toLowerCase().includes(busqueda.toLowerCase());
    const coincideModalidad = !filtroModalidad || oferta.modality === filtroModalidad;
    const coincideEstado = !filtroEstado || oferta.status === filtroEstado;

    return coincideBusqueda && coincideModalidad && coincideEstado;
  });

  // Cargar datos de la empresa
  const fetchEmpresaPerfil = async () => {
    const empresaId = localStorage.getItem('userId');
    if (!empresaId) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/company/${empresaId}`);
      const data = await response.json();
      setDatosEmpresa({
        companyName: data.companyName || '',
        companyRUT: data.companyRUT || '',
        industry: data.industry || '',
        phone: data.phone || '',
        website: data.website || '',
        description: data.description || ''
      });
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    }
  };

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    const empresaId = localStorage.getItem('userId');

    try {
      const response = await fetch(`${API_URL}/api/auth/update-company-profile/${empresaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEmpresa)
      });

      if (response.ok) {
        alert('✅ Perfil actualizado exitosamente');
        setNombreEmpresa(datosEmpresa.companyName);
        localStorage.setItem('userName', datosEmpresa.companyName);
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert('Error al guardar el perfil');
    }
  };

  // Datos para el gráfico (ofertas vs postulantes)
  const datosGrafico = ofertas.map(oferta => ({
    name: oferta.title.length > 15 ? oferta.title.substring(0, 15) + '...' : oferta.title,
    postulantes: oferta.applicants?.length || 0
  }));

  // Contar postulantes nuevos esta semana
  const haceUnaSemana = new Date();
  haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);

  let postulantesEstaSemana = 0;
  ofertas.forEach(oferta => {
    oferta.applicants?.forEach((postulante: any) => {
      // Nota: Aquí asumimos que podemos acceder a createdAt del postulante
      // Si no está disponible, necesitaremos traer las applications directamente
    });
  });

  // Alternativa: Contar ofertas creadas esta semana
  const ofertasEstaSemana = ofertas.filter(oferta => {
    const fechaOferta = new Date(oferta.createdAt);
    return fechaOferta >= haceUnaSemana;
  }).length;

  return (
    <div style={styles.container}>
      <nav style={styles.sidebar}>
        <h2 style={styles.logo}>PORTAL <span style={{fontSize: '0.6rem'}}>PRÁCTICAS</span></h2>
        <div style={styles.navLinks}>
          <button onClick={() => setVista('dashboard')} style={vista === 'dashboard' ? styles.activeLink : styles.link}>📊 Dashboard</button>
          <button onClick={() => setVista('crear')} style={vista === 'crear' ? styles.activeLink : styles.link}>➕ Publicar Práctica</button>
          <button onClick={() => setVista('ofertas')} style={vista === 'ofertas' ? styles.activeLink : styles.link}>📁 Mis Ofertas</button>
          <button onClick={() => setVista('perfil')} style={vista === 'perfil' ? styles.activeLink : styles.link}>⚙️ Mi Perfil</button>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={styles.btnLogout}>Cerrar Sesión</button>
      </nav>

      <main style={styles.main}>
        <header style={styles.header}>
          <h1>Panel de Empresa</h1>
          <p>Bienvenido de vuelta, <strong style={{color: '#198754'}}>{nombreEmpresa}</strong></p>
        </header>

        {vista === 'dashboard' && (
          <div>
            {/* KPIs */}
            <div style={styles.grid}>
              <div style={styles.card}><h3>{ofertas.length}</h3><p>Ofertas Activas</p></div>
              <div style={styles.card}><h3>{ofertas.reduce((total, oferta) => total + (oferta.applicants?.length || 0), 0)}</h3><p>Postulantes Totales</p></div>
              <div style={styles.card}><h3>{ofertasEstaSemana}</h3><p>Ofertas esta Semana</p></div>
            </div>

            {/* GRÁFICO */}
            <div style={{...styles.card, marginTop: '20px'}}>
              <h3 style={{marginBottom: '20px'}}>📊 Postulantes por Oferta</h3>
              {datosGrafico.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} style={{fontSize: '0.8rem'}} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="postulantes" fill="#3b82f6" name="Postulantes" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{textAlign: 'center', color: '#94a3b8'}}>No hay ofertas para mostrar</p>
              )}
            </div>
          </div>
        )}

        {vista === 'crear' && (
          <form onSubmit={handleSubmitOferta} style={styles.form}>
            <h2>{ofertaEnEdicion ? 'Editar Vacante' : 'Publicar Vacante'}</h2>
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
            <div style={{display: 'flex', gap: '10px'}}>
              <button type="submit" style={styles.btnSubmit}>{ofertaEnEdicion ? 'Actualizar Oferta' : 'Confirmar Publicación'}</button>
              {ofertaEnEdicion && (
                <button type="button" onClick={() => { setOfertaEnEdicion(null); setNuevaOferta({ title: '', description: '', location: '', salary: '', modality: 'Presencial', requirements: '' }); setVista('ofertas'); }} style={{...styles.btnSubmit, backgroundColor: '#94a3b8'}}>Cancelar</button>
              )}
            </div>
          </form>
        )}

        {vista === 'ofertas' && (
          <div style={styles.card}>
            <h3>Gestión de Ofertas</h3>

            {/* BÚSQUEDA Y FILTROS */}
            <div style={{marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
              <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end'}}>
                <div>
                  <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#475569', marginBottom: '5px'}}>Buscar</label>
                  <input
                    type="text"
                    placeholder="Título o descripción..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{...styles.input, marginBottom: 0, padding: '10px'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#475569', marginBottom: '5px'}}>Modalidad</label>
                  <select
                    value={filtroModalidad}
                    onChange={(e) => setFiltroModalidad(e.target.value)}
                    style={{...styles.input, marginBottom: 0, padding: '10px'}}
                  >
                    <option value="">Todas</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Remoto">Remoto</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#475569', marginBottom: '5px'}}>Estado</label>
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    style={{...styles.input, marginBottom: 0, padding: '10px'}}
                  >
                    <option value="">Todos</option>
                    <option value="Active">Activas</option>
                    <option value="Closed">Cerradas</option>
                  </select>
                </div>
                {(busqueda || filtroModalidad || filtroEstado) && (
                  <button
                    onClick={() => {setBusqueda(''); setFiltroModalidad(''); setFiltroEstado('');}}
                    style={{backgroundColor: '#94a3b8', color: 'white', padding: '10px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500'}}
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <div style={{marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <p style={{color: '#64748b', fontSize: '0.9rem', margin: 0}}>
                  <strong>{ofertasFiltradas.length}</strong> de <strong>{ofertas.length}</strong> ofertas
                </p>
              </div>
            </div>

            {cargando ? <p>Cargando...</p> : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Título</th>
                    <th style={styles.th}>Modalidad</th>
                    <th style={styles.th}>Ubicación</th>
                    <th style={styles.th}>Postulantes</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ofertasFiltradas.map((o) => (
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
                      <td style={styles.td}>
                        <button onClick={() => handleEditarOferta(o)} style={{backgroundColor: '#3b82f6', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '0.85rem'}}>
                          ✏️ Editar
                        </button>
                        <button onClick={() => handleEliminarOferta(o._id)} style={{backgroundColor: '#ef4444', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem'}}>
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {ofertasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{textAlign: 'center', padding: '20px', color: '#94a3b8'}}>
                        {ofertas.length === 0 ? 'No has publicado ofertas aún.' : 'No hay ofertas que coincidan con los filtros.'}
                      </td>
                    </tr>
                  )}
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
                      <td style={styles.td}>{p.studentId?.firstName} {p.studentId?.lastName}</td>
                      <td style={styles.td}>{p.studentId?.email}</td>
                      <td style={styles.td}>{p.studentId?.career}</td>
                      <td style={styles.td}>{p.studentId?.university}</td>
                      <td style={styles.td}>
                        <span style={{color: p.status === 'accepted' ? '#198754' : p.status === 'rejected' ? '#dc3545' : '#f59e0b', fontWeight: 'bold'}}>
                          {p.status === 'pending' ? 'Pendiente' : p.status === 'accepted' ? 'Aceptado' : 'Rechazado'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => window.open(`/curriculum/${p.studentId._id}`, '_blank')}
                          style={{backgroundColor: '#0ea5e9', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '0.85rem'}}
                        >
                          📄 Ver CV
                        </button>
                        {p.status === 'pending' && (
                          <>
                            <button onClick={() => handleCambiarEstado(p._id, 'accepted')} style={{backgroundColor: '#198754', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '0.85rem'}}>
                              ✓ Aceptar
                            </button>
                            <button onClick={() => handleCambiarEstado(p._id, 'rejected')} style={{backgroundColor: '#dc3545', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem'}}>
                              ✕ Rechazar
                            </button>
                          </>
                        )}
                        {p.status === 'accepted' && <span style={{color: '#198754', fontWeight: 'bold'}}>✓ Aceptado</span>}
                        {p.status === 'rejected' && <span style={{color: '#dc3545', fontWeight: 'bold'}}>✕ Rechazado</span>}
                      </td>
                    </tr>
                  ))}
                  {postulantesOferta.length === 0 && <tr><td colSpan={6} style={{textAlign: 'center', padding: '20px'}}>No hay postulantes.</td></tr>}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* VISTA: MI PERFIL */}
        {vista === 'perfil' && (
          <section style={styles.card}>
            <h2>⚙️ Mi Perfil de Empresa</h2>
            <form onSubmit={handleGuardarPerfil} style={{marginTop: '20px'}}>
              <label style={{display: 'block', marginBottom: '15px'}}>
                <strong>Nombre de la Empresa:</strong>
                <input
                  type="text"
                  value={datosEmpresa.companyName}
                  onChange={(e) => setDatosEmpresa({...datosEmpresa, companyName: e.target.value})}
                  required
                  style={styles.input}
                />
              </label>

              <label style={{display: 'block', marginBottom: '15px'}}>
                <strong>RUT:</strong>
                <input
                  type="text"
                  value={datosEmpresa.companyRUT}
                  onChange={(e) => setDatosEmpresa({...datosEmpresa, companyRUT: e.target.value})}
                  required
                  style={styles.input}
                />
              </label>

              <label style={{display: 'block', marginBottom: '15px'}}>
                <strong>Rubro/Industria:</strong>
                <input
                  type="text"
                  value={datosEmpresa.industry}
                  onChange={(e) => setDatosEmpresa({...datosEmpresa, industry: e.target.value})}
                  required
                  style={styles.input}
                />
              </label>

              <label style={{display: 'block', marginBottom: '15px'}}>
                <strong>Teléfono:</strong>
                <input
                  type="tel"
                  value={datosEmpresa.phone}
                  onChange={(e) => setDatosEmpresa({...datosEmpresa, phone: e.target.value})}
                  placeholder="+56912345678"
                  style={styles.input}
                />
              </label>

              <label style={{display: 'block', marginBottom: '15px'}}>
                <strong>Sitio Web:</strong>
                <input
                  type="url"
                  value={datosEmpresa.website}
                  onChange={(e) => setDatosEmpresa({...datosEmpresa, website: e.target.value})}
                  placeholder="https://www.miempresa.com"
                  style={styles.input}
                />
              </label>

              <label style={{display: 'block', marginBottom: '15px'}}>
                <strong>Descripción de la Empresa:</strong>
                <textarea
                  value={datosEmpresa.description}
                  onChange={(e) => setDatosEmpresa({...datosEmpresa, description: e.target.value})}
                  placeholder="Cuéntanos sobre tu empresa..."
                  style={{...styles.input, height: '100px', fontFamily: 'Arial, sans-serif'}}
                />
              </label>

              <button type="submit" style={styles.btnSubmit}>
                💾 Guardar Cambios
              </button>
            </form>
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