import React, { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useDoctors } from '../hooks/useDoctors';
import { Doctor } from '../@types';
import Button from '../components/Button';
import Input from '../components/Input';

const EditAppointment: React.FC = () => {
  const { id } = useParams(); // Puxa o ID da URL
  const navigate = useNavigate();
  const { doctors } = useDoctors(); 

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [type, setType] = useState('consulta');
  const [status, setStatus] = useState('agendado');
  const [loading, setLoading] = useState(true);

  // Vai buscar os dados atuais da consulta para preencher o formulário
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await api.get(`/api/appointments/${id}`);
        const app = response.data;

        // Separa a data e a hora que vêm do banco (formato ISO)
        if (app.date) {
          const dateObj = new Date(app.date);
          setDate(dateObj.toISOString().split('T')[0]); // Formato YYYY-MM-DD
          setTime(dateObj.toTimeString().split(' ')[0].slice(0, 5)); // Formato HH:MM
        }

        setDoctorId(app.doctorId?.toString() || '');
        setType(app.type || 'consulta');
        setStatus(app.status || 'agendado');
      } catch (error) {
        console.error("Erro ao procurar agendamento:", error);
        alert("Erro ao carregar os dados. O agendamento pode não existir.");
        navigate('/appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Junta a data e a hora novamente
    const dateTime = new Date(`${date}T${time}`).toISOString();

    try {
      await api.put(`/api/appointments/${id}`, {
        date: dateTime,
        doctorId: Number(doctorId),
        type,
        status
      });

      alert('Agendamento atualizado com sucesso!');
      navigate('/appointments');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error("Erro ao atualizar agendamento:", axiosError);
      const errorMessage = axiosError.response?.data?.message || 'Erro ao atualizar. Verifique os dados.';
      alert(errorMessage);
    }
  };

  if (loading) {
    return <div className="p-8 text-center mt-20 text-gray-600">A carregar formulário...</div>;
  }

  return (
    <div className="p-8 bg-med-bg min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm w-full max-w-lg flex flex-col gap-6 border-t-4 border-yellow-500">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Editar Agendamento</h1>

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label="Data"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <Input
              label="Hora"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Médico</label>
          <select
            className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 bg-white"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            required
          >
            <option value="" disabled>Selecione um médico...</option>
            {doctors.map((doc: Doctor) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} - {doc.specialty}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Tipo de Atendimento</label>
            <select
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 bg-white"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="consulta">Consulta</option>
              <option value="exame">Exame</option>
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Estado</label>
            <select
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 bg-white"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="agendado">Agendado</option>
              <option value="concluído">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button 
            type="button" 
            onClick={() => navigate('/appointments')} 
            className="w-full bg-gray-200 text-gray-700 py-2 rounded font-medium hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" className="w-full">
            Guardar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditAppointment;