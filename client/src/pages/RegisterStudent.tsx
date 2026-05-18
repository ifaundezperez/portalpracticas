import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import '../styles/Register.css';

function RegisterStudent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentRUT: '',
    email: '',
    password: '',
    phone: '',
    university: '',
    career: '',
    city: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 👈 1. SIEMPRE PRIMERO para evitar que la página parpadee
    
    console.log("🚀 Enviando a:", `${API_URL}/api/auth/register-student`);
    console.log("📦 Datos:", formData);

    try {
      const response = await fetch(`${API_URL}/api/auth/register-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      console.log("📡 Status del servidor:", response.status);

      if (response.ok) {
        alert("¡Cuenta de estudiante creada! Ya puedes iniciar sesión.");
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      // 👈 Si el servidor está apagado, entrará aquí
      console.error("❌ ERROR DE CONEXIÓN:", error);
      alert("No se pudo conectar con el servidor. ¿Está encendido?");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registro de Estudiante</h2>
        <p>Crea tu perfil profesional</p>
        
        <form onSubmit={handleSubmit} className="register-form">
          <input name="firstName" placeholder="Nombre" onChange={handleChange} required />
          <input name="lastName" placeholder="Apellidos" onChange={handleChange} required />
          <input name="studentRUT" placeholder="RUT (ej: 12345678-9)" onChange={handleChange} required />
          <input name="phone" placeholder="Teléfono (+569...)" onChange={handleChange} required />
          <input name="university" placeholder="Universidad / Instituto" onChange={handleChange} required />
          <input name="career" placeholder="Carrera" onChange={handleChange} required />
          <input name="city" placeholder="Ciudad" onChange={handleChange} required />
          <input name="email" type="email" placeholder="Correo electrónico" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required />
          
          <button type="submit" className="btn-register">Crear mi cuenta</button>
        </form>

        <div className="back-link">
          <Link to="/login">¿Ya tienes cuenta? Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterStudent;