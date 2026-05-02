import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRole: 'student' | 'company';
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const location = useLocation();

  // 📝 LOG DE DEPURACIÓN (Míralo en la consola F12)
  console.log(`[RBAC Check] Ruta: ${location.pathname} | Requerido: ${allowedRole} | Encontrado: ${userRole}`);

  // 1. Si no hay token, no está logueado
  if (!token) {
    console.warn("Acceso denegado: Token ausente.");
    return <Navigate to="/login" replace />;
  }

  // 2. Validación de Rol (Case Insensitive)
  // Usamos ?.toLowerCase() para que no importe si en la DB dice "Student" o "student"
  if (userRole?.toLowerCase() !== allowedRole.toLowerCase()) {
    console.error(`Acceso denegado: Rol ${userRole} no coincide con ${allowedRole}`);
    
    // Si el rol es incorrecto, lo devolvemos al login por seguridad
    return <Navigate to="/login" replace />;
  }

  // 3. Si todo está en orden, renderizamos el Home correspondiente
  return children;
};

export default ProtectedRoute;