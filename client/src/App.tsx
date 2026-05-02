import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import RegisterStudent from './pages/RegisterStudent';
import RegisterCompany from './pages/RegisterCompany';
import HomeStudent from './pages/HomeStudent';
import HomeCompany from './pages/HomeCompany';
import ProtectedRoute from './components/ProtectedRoute';
import CurriculumView from './pages/CurriculumView'; // Importación confirmada

function App() {
  return (
    <Router>
      <Routes>
        {/* LADO PÚBLICO */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-student" element={<RegisterStudent />} />
        <Route path="/register-company" element={<RegisterCompany />} />

        {/* 
           RUTA DEL CURRICULUM ESTANDARIZADO 
           La dejamos fuera de los Home para que cargue sin Sidebars.
           Maneja el parámetro :id para identificar al estudiante.
        */}
        <Route path="/curriculum/:id" element={<CurriculumView />} />

        {/* LADO PROTEGIDO: Estudiantes */}
        <Route 
          path="/home-student" 
          element={
            <ProtectedRoute allowedRole="student">
              <HomeStudent />
            </ProtectedRoute>
          } 
        />

        {/* LADO PROTEGIDO: Empresas */}
        <Route 
          path="/home-company" 
          element={
            <ProtectedRoute allowedRole="company">
              <HomeCompany />
            </ProtectedRoute>
          } 
        />

        {/* Redirección por seguridad para rutas inexistentes */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;