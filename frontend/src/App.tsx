import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Appointments from './pages/Appointments';
import Doctors from './pages/Doctors';
import CreateAppointment from './pages/CreateAppointment';
import EditAppointment from './pages/EditAppointment'; // <-- Nova importação!
import CreateDoctor from './pages/CreateDoctor';
import EditDoctor from './pages/EditDoctor';
import Profile from './pages/Profile';

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rotas Privadas (Protegidas pelo PrivateRoute E com Menu do Layout) */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/appointments/new" element={<CreateAppointment />} />
            <Route path="/appointments/edit/:id" element={<EditAppointment />} /> {/* <-- Rota de Edição! */}
            
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/new" element={<CreateDoctor />} />
            <Route path="/doctors/edit/:id" element={<EditDoctor />} />
          </Route>
        </Route>
        
        {/* Se a URL não existir, joga para a Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;