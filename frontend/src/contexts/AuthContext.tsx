import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, AuthContextData } from '../@types';

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storagedUser = localStorage.getItem('@MedicalBooking:user');
    const storagedToken = localStorage.getItem('@MedicalBooking:token');

    if (storagedToken && storagedUser && storagedUser !== "undefined") {
      try {
        setUser(JSON.parse(storagedUser));
      } catch (error) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  async function signIn(credentials: { email: string; password: string }) {
    try {
      // O 'await' espera a resposta do seu servidor Node (porta 3000)
      const response = await api.post('/api/users/login', {
        email: credentials.email,
        senha: credentials.password,
      });

      const { token, user: userData } = response.data;
      if (!token || !userData) throw new Error('Resposta inválida do servidor.');

      localStorage.setItem('@MedicalBooking:token', token);
      localStorage.setItem('@MedicalBooking:user', JSON.stringify(userData));

      setUser(userData);
      return userData;

    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
  }

  function updateUser(updatedUser: User) {
    setUser(updatedUser);
    localStorage.setItem('@MedicalBooking:user', JSON.stringify(updatedUser));
  }

  function signOut() {
    localStorage.removeItem('@MedicalBooking:token');
    localStorage.removeItem('@MedicalBooking:user');
    setUser(null);
    window.location.href = '/';
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};