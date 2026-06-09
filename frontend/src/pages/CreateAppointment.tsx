import React, { useState, useContext, useEffect } from 'react';
import { AxiosError } from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useAppointments } from '../hooks/useAppointments';
import { useDoctors } from '../hooks/useDoctors';
import api from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { Appointment, Doctor } from '../@types';

const CreateAppointment: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { createAppointment } = useAppointments();
  const { doctors } = useDoctors(); 
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const doctorIdFromUrl = searchParams.get('doctorId');

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [doctorId, setDoctorId] = useState(doctorIdFromUrl || '');
  const [type, setType] = useState('consulta');
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);

  const today = new Date().toISOString().split('T')[0];

  const baseHours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  useEffect(() => {
    if (doctorIdFromUrl) {
      setDoctorId(doctorIdFromUrl);
    }
  }, [doctorIdFromUrl]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get('/api/appointments');
        setAllAppointments(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (err: unknown) {
        console.error("Erro ao buscar ocupação", err);
        setAllAppointments([]);
      }
    };
    fetchAll();
  }, []);

  const getAvailableHours = () => {
    // Se não houver data ou médico, ou se allAppointments não for uma lista, retorna tudo livre
    if (!date || !doctorId || !Array.isArray(allAppointments)) return baseHours;

    const occupiedTimes = allAppointments
      .filter(app => {
        // SEGURANÇA: Verifica se o agendamento tem uma data válida
        if (!app || !app.date) return false;

        const appDate = new Date(app.date);
        const y = appDate.getFullYear();
        const m = String(appDate.getMonth() + 1).padStart(2, '0');
        const d = String(appDate.getDate()).padStart(2, '0');
        const appDateStr = `${y}-${m}-${d}`;
        
        return appDateStr === date && Number(app.doctorId) === Number(doctorId);
      })
      .map(app => {
        const d = new Date(app.date);
        return String(d.getHours()).padStart(2, '0') + ":00";
      });

    return baseHours.filter(h => !occupiedTimes.includes(h));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!time) return alert("Selecione um horário.");

    const dateTime = `${date}T${time}:00`;

    try {
      await createAppointment({
        date: dateTime,
        doctorId: Number(doctorId),
        patientId: user?.id,
        type: type
      });
      alert('Agendamento criado com sucesso!');
      navigate('/appointments'); 
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Erro ao criar agendamento.');
    }
  };

  return (
    <div className="p-8 bg-med-bg min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm w-full max-w-lg flex flex-col gap-6 border-t-4 border-blue-500">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Novo Agendamento</h1>

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label="Data"
              type="date"
              value={date}
              min={today}
              onChange={(e) => {
                setDate(e.target.value);
                setTime(''); 
              }}
              required
            />
          </div>
          
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Hora</label>
            <select
              className="border border-gray-300 rounded p-[9px] focus:outline-none focus:border-blue-500 bg-white"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            >
              <option value="" disabled>--:--</option>
              {getAvailableHours().map(hour => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Médico</label>
          <select
            className={`border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 ${doctorIdFromUrl ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            value={doctorId}
            onChange={(e) => {
              setDoctorId(e.target.value);
              setTime(''); 
            }}
            disabled={!!doctorIdFromUrl}
            required
          >
            <option value="" disabled>Selecione um médico...</option>
            {/* SEGURANÇA: Adicionado ?. para evitar erro se doctors for null */}
            {doctors?.map((doc: Doctor) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} - {doc.specialty}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
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

        <div className="flex gap-4 mt-4">
          <button type="button" onClick={() => navigate('/appointments')} className="w-full bg-gray-200 text-gray-700 py-2 rounded font-medium hover:bg-gray-300 transition-colors">
            Cancelar
          </button>
          <Button type="submit" className="w-full">Confirmar Agendamento</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateAppointment;