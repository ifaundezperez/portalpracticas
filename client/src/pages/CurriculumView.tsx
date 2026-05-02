import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function CurriculumView() {
  const { id } = useParams();
  const [estudiante, setEstudiante] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/auth/estudiante/${id}`)
      .then(res => res.json())
      .then(data => setEstudiante(data))
      .catch(err => console.error("Error:", err));
  }, [id]);

  if (!estudiante) return <p style={{textAlign: 'center', marginTop: '50px'}}>Cargando perfil profesional...</p>;

  return (
    <div style={styles.container}>
      <button onClick={() => window.print()} style={styles.btnPrint}>🖨️ Imprimir / PDF</button>

      <header style={styles.header}>
        <h1 style={styles.name}>{estudiante.nombre}</h1>
        <p style={styles.subtitle}>{estudiante.carrera} | {estudiante.universidad}</p>
        <p style={styles.contact}>📧 {estudiante.email}</p>
      </header>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>RESUMEN PROFESIONAL</h3>
        <p style={styles.text}>{estudiante.resumen || "Sin resumen especificado."}</p>
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>HABILIDADES TÉCNICAS</h3>
        <div style={styles.tags}>
          {estudiante.habilidades?.map((h: string, i: number) => (
            <span key={i} style={styles.tag}>{h}</span>
          ))}
        </div>
      </section>

      {/* 🚀 SECCIONES DINÁMICAS QUE AGREGAMOS RECIÉN */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>EXPERIENCIA Y VOLUNTARIADO</h3>
        {estudiante.experiencias?.length > 0 ? (
          estudiante.experiencias.map((exp: string, i: number) => (
            <p key={i} style={styles.listItem}>• {exp}</p>
          ))
        ) : <p style={styles.text}>No se han registrado experiencias.</p>}
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>PROYECTOS DESTACADOS</h3>
        {estudiante.proyectos?.length > 0 ? (
          estudiante.proyectos.map((proj: string, i: number) => (
            <div key={i} style={styles.projectCard}>{proj}</div>
          ))
        ) : <p style={styles.text}>No se han registrado proyectos.</p>}
      </section>
    </div>
  );
}

// Estilos dinámicos para el CV
const styles: { [key: string]: React.CSSProperties } = {
  container: { maxWidth: '800px', margin: '20px auto', padding: '40px', backgroundColor: 'white', border: '1px solid #eee' },
  header: { borderBottom: '2px solid #334155', paddingBottom: '20px', marginBottom: '20px' },
  name: { fontSize: '2.2rem', margin: 0, color: '#1e293b' },
  subtitle: { fontSize: '1.1rem', color: '#64748b', margin: '5px 0' },
  contact: { fontSize: '0.9rem', color: '#475569' },
  section: { marginBottom: '25px' },
  sectionTitle: { borderBottom: '1px solid #cbd5e1', paddingBottom: '5px', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 'bold', color: '#334155' },
  text: { fontSize: '0.95rem', lineHeight: '1.5', color: '#334155' },
  tags: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  tag: { backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' },
  listItem: { fontSize: '0.95rem', margin: '5px 0', color: '#334155' },
  projectCard: { borderLeft: '4px solid #3b82f6', backgroundColor: '#f8fafc', padding: '10px', marginBottom: '10px', fontSize: '0.95rem' },
  btnPrint: { position: 'fixed', top: '20px', right: '20px', padding: '10px 15px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
};

export default CurriculumView;