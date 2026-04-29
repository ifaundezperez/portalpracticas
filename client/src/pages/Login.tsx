import { Link } from 'react-router-dom'; // 1. IMPORTAR EL COMPONENTE DE RUTAS
import '../styles/Login.css';

function Login() {
  return (
    <div className="login-split-container">
      
      {/* LADO IZQUIERDO: ESTUDIANTES */}
      <div className="login-side student-side">
        <div className="login-box">
          <h2>Acceso Estudiantes</h2>
          <p>Usa tu correo electrónico</p>
          <input type="email" placeholder="ejemplo@correo.cl" />
          <input type="password" placeholder="Contraseña" />
          <button className="btn-student">Entrar como Estudiante</button>
          
          <div className="register-text">
            ¿No tienes cuenta? <br />
            {/* 2. CAMBIAR <a> POR <Link> Y APUNTAR A LA RUTA CORRECTA */}
            <Link to="/registro-estudiante">Regístrate como Estudiante</Link>
          </div>
        </div>
      </div>

      {/* LADO DERECHO: EMPRESAS */}
      <div className="login-side company-side">
        <div className="login-box">
          <h2>Acceso Empresas</h2>
          <p>Publica vacantes de práctica</p>
          <input type="email" placeholder="correo@empresa.com" />
          <input type="password" placeholder="Contraseña" />
          <button className="btn-company">Entrar como Empresa</button>
          
          <div className="register-text">
            ¿Buscas talento? <br />
            {/* 3. LO MISMO PARA EL LADO DE EMPRESA */}
            <Link to="/registro-empresa">Regístrate como Empresa</Link>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;