import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import '../styles/Register.css';

function RegisterCompany() {
  const navigate = useNavigate();
  
  // 1. El "cerebro": Estado para capturar los datos
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    rutEmpresa: '',
    rubro: '',
    email: '',
    password: ''
  });

  // 2. Los "nervios": Función para actualizar el estado cuando escribes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. El "músculo": Función que envía los datos al servidor
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🚀 Intentando registrar empresa...");
    console.log("📦 Datos:", formData);

    try {
      const response = await fetch(`${API_URL}/api/auth/register-company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      console.log("📡 Status del servidor:", response.status);

      if (response.ok) {
        alert("¡Cuenta de empresa creada con éxito!");
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("❌ ERROR DE CONEXIÓN:", error);
      alert("No se pudo conectar con el servidor. ¿Está encendido?");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registro Empresa</h2>
        <p>Encuentra el mejor talento y publica tus ofertas de práctica.</p>
        
        {/* 4. Conectamos la función al formulario */}
        <form onSubmit={handleSubmit} className="register-form">
          <input 
            name="nombreEmpresa" 
            placeholder="Nombre de la Empresa" 
            onChange={handleChange} 
            value={formData.nombreEmpresa}
            required 
          />
          <input 
            name="rutEmpresa" 
            placeholder="RUT Empresa" 
            onChange={handleChange} 
            value={formData.rutEmpresa}
            required 
          />
          <input 
            name="rubro" 
            placeholder="Rubro (TI, Minería, etc.)" 
            onChange={handleChange} 
            value={formData.rubro}
            required 
          />
          <input 
            name="email" 
            type="email" 
            placeholder="Correo Corporativo" 
            onChange={handleChange} 
            value={formData.email}
            required 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Contraseña" 
            onChange={handleChange} 
            value={formData.password}
            required 
          />
          
          <button type="submit" className="btn-register">
            Crear Cuenta Empresa
          </button>
        </form>

        <div className="back-link">
          <Link to="/login">¿Ya tienes cuenta? Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterCompany;