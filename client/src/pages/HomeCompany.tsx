import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomeCompany() {
  const navigate = useNavigate();
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [vista, setVista] = useState<'dashboard' | 'crear' | 'ofertas'>('dashboard');
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

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
    if (!empresaId) return;

    setCargando(true);
    try {
      // 🚀 CAMBIO: Ruta pluralizada en inglés para coincidir con index.ts
      const response = await fetch(`http://localhost:5000/api/offers/empresa/${empresaId}`);
      const data = await response.json();
      setOfertas(data);
    } catch (error) {
      console.error("Error al cargar ofertas:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleSubmitOferta = async (e: React.FormEvent) => {
    e.preventDefault();
    const companyId = localStorage.getItem('userId');

    try {
      // 🚀 CAMBIO: Ruta 'api/offers/crear'
      const response = await fetch('http://localhost:5000/api/offers/crear', {
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
            <div style={styles.card}><h3>0</h3><p>Postulantes Totales</p></div>
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
                      <td style={styles.td}>{o.title}</td>
                      <td style={styles.td}>{o.modality}</td>
                      <td style={styles.td}>{o.location}</td>
                      <td style={styles.td}>{o.applicants?.length || 0}</td>
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
      </main>
    </div>
  );
}

// ... (los estilos se mantienen igual)