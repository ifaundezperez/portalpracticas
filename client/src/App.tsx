import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import RegisterStudent from './pages/RegisterStudent';
import RegisterCompany from './pages/RegisterCompany';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. La página de inicio (Landing) */}
        <Route path="/" element={<LandingPage />} />
        
        {/* 2. El Login dividido */}
        <Route path="/login" element={<Login />} />
        
        {/* 3. El formulario de alumnos */}
        <Route path="/registro-estudiante" element={<RegisterStudent />} />
        
        {/* 4. El formulario de empresas */}
        <Route path="/registro-empresa" element={<RegisterCompany />} />
      </Routes>
    </Router>
  );
}

export default App;