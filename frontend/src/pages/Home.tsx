import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import PatientDashboard from '../components/PatientDashboard';
import DoctorDashboard from '../components/DoctorDashboard';

const Home: React.FC = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-med-bg">
        <div className="text-center">
          <p className="text-xl text-gray-700">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user.nivel === 'paciente' ? (
        <PatientDashboard />
      ) : user.nivel === 'medico' ? (
        <DoctorDashboard />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-med-bg">
          <div className="text-center">
            <p className="text-xl text-gray-700">Tipo de usuário não identificado</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;