import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user, signOut } = useContext(AuthContext);
  const location = useLocation();

  // Lista base de links
  const menuItems = [
    { path: '/', label: 'Início / Agenda', icon: '🏠' },
    { path: '/appointments', label: 'Lista de Consultas', icon: '📅' },
    { path: '/doctors', label: 'Buscar Médicos', icon: '🩺' },
    { path: '/profile', label: 'Meu Perfil', icon: '👤' },
  ];

  // FILTRAGEM DE ACESSO
  const filteredMenuItems = menuItems.filter((item) => {
    if (user?.nivel === 'paciente') {
      // Paciente não vê a aba "Médicos" (pois ele já tem a busca no Dashboard)
      return item.path !== '/doctors';
    }
    
    if (user?.nivel === 'medico') {
      // Médico vê a Agenda (Dashboard), Lista e Perfil. 
      // NÃO vê "Buscar Médicos", pois médico não marca consulta.
      return item.path !== '/doctors';
    }

    return true;
  });

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shadow-sm">
      {/* Cabeçalho */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-blue-600">MedicalBooking</h2>
        <p className="text-sm text-gray-500 mt-1">
          {user?.nivel === 'medico' ? 'Dr(a). ' : 'Olá, '}
          {user?.nome?.split(' ')[0]}
        </p>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4 flex flex-col gap-2">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé / Sair */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <span className="text-lg">🚪</span>
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;