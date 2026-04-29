import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Register.css';

function RegisterStudent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    rut: '',
    institucion: '',
    carrera: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/register-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("¡Cuenta de estudiante creada! Ya puedes iniciar sesión.");
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error en la conexión:", error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registro de Estudiante</h2>
        <p>Crea tu perfil para conectar con oportunidades de práctica</p>
        
        <form onSubmit={handleSubmit} className="register-form">
          <input name="nombreCompleto" placeholder="Nombre Completo" onChange={handleChange} required />
          <input name="rut" placeholder="RUT (ej: 12345678-9)" onChange={handleChange} required />
          <input name="institucion" placeholder="Universidad / Instituto" onChange={handleChange} required />
          <input name="carrera" placeholder="Carrera" onChange={handleChange} required />
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