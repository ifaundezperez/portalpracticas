import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import '../styles/Login.css';

function Login() {
  const navigate = useNavigate();

  // Estados para Estudiantes
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPass, setStudentPass] = useState('');

  // Estados para Empresas
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPass, setCompanyPass] = useState('');

  // Manejador Login Estudiante
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/login-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: studentEmail, password: studentPass })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', 'student');
        localStorage.setItem('userName', data.user.firstName);
        localStorage.setItem('userId', data.user.id); // Guardamos el ID del estudiante
        alert(`¡Bienvenido, ${data.user.firstName}!`);
        navigate('/home-student');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    }
  };

  // Manejador Login Empresa
  const handleCompanyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/login-company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: companyEmail, password: companyPass })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', 'company');
        localStorage.setItem('userName', data.user.companyName);
        localStorage.setItem('userId', data.user.id);

        alert(`¡Bienvenido, ${data.user.companyName}!`);
        navigate('/home-company');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="login-split-container">
      
      <button className="btn-back-home" onClick={() => navigate('/')}>
        ← Volver al Inicio
      </button>

      {/* LADO IZQUIERDO: ESTUDIANTES */}
      <div className="login-side student-side">
        <form className="login-box" onSubmit={handleStudentLogin}>
          <h2>Acceso Estudiantes</h2>
          <p>Usa tu correo electrónico</p>
          <input 
            type="email" 
            placeholder="ejemplo@correo.cl" 
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={studentPass}
            onChange={(e) => setStudentPass(e.target.value)}
            required 
          />
          <button type="submit" className="btn-student">Entrar como Estudiante</button>
          
          <div className="register-text">
            ¿No tienes cuenta? <br />
            <Link to="/register-student">Regístrate como Estudiante</Link>
          </div>
        </form>
      </div>

      {/* LADO DERECHO: EMPRESAS */}
      <div className="login-side company-side">
        <form className="login-box" onSubmit={handleCompanyLogin}>
          <h2>Acceso Empresas</h2>
          <p>Publica vacantes de práctica</p>
          <input 
            type="email" 
            placeholder="correo@empresa.com" 
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={companyPass}
            onChange={(e) => setCompanyPass(e.target.value)}
            required 
          />
          <button type="submit" className="btn-company">Entrar como Empresa</button>
          
          <div className="register-text">
            ¿Buscas talento? <br />
            <Link to="/register-company">Regístrate como Empresa</Link>
          </div>
        </form>
      </div>

    </div>
  );
}

export default Login;