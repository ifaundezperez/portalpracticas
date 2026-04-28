import './Login.css';

function Login() {
  return (
    <div className="login-split-container">
      
      {/* LADO IZQUIERDO: ESTUDIANTES */}
      <div className="login-side student-side">
        <div className="login-box">
          <h2>Acceso Estudiantes</h2>
          <p>Usa tu correo institucional</p>
          <input type="email" placeholder="ejemplo@uandresbello.edu" />
          <input type="password" placeholder="Contraseña" />
          <button className="btn-student">Entrar como Estudiante</button>
          
          <div className="register-text">
            ¿No tienes cuenta? <br />
            <a href="#">Regístrate como Estudiante</a>
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
            <a href="#">Regístrate como Empresa</a>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;