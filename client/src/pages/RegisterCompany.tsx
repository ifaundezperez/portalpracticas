import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Register.css'; // 👈 Asegúrate de que apunte al archivo de arriba

function RegisterCompany() {
  // ... (mantenemos la lógica de estado y handleSubmit que ya tienes)

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registro Empresa</h2>
        <p>Encuentra el mejor talento y publica tus ofertas de práctica.</p>
        
        <form className="register-form">
          <input name="nombreEmpresa" placeholder="Nombre de la Empresa" required />
          <input name="rutEmpresa" placeholder="RUT Empresa" required />
          <input name="rubro" placeholder="Rubro (TI, Minería, etc.)" required />
          <input name="email" type="email" placeholder="Correo Corporativo" required />
          <input name="password" type="password" placeholder="Contraseña" required />
          
          {/* ⚠️ ESTA ES LA CLAVE: Debe ser btn-register */}
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