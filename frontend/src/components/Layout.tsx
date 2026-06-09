import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-med-bg">
      {/* O Menu Lateral Fixo */}
      <Sidebar />
      
      {/* A área principal onde as telas (Home, Médicos, etc) vão renderizar */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;