import { Request, Response } from 'express';
import { Pool } from 'mysql2/promise';
import { MedicalRepository } from '../repositories/MedicalRepository';

export class MedicalController {
  private medicalRepository: MedicalRepository;

  constructor(private db: Pool) {
    this.medicalRepository = new MedicalRepository(db);
  }

  // 1. BUSCAR MÉDICOS
  public getDoctors = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const specialty = req.query.specialty as string;

      const total = await this.medicalRepository.countDoctors(specialty);
      const doctors = await this.medicalRepository.findDoctors(specialty, limit, (page - 1) * limit);

      res.json({ data: doctors, total, page, last_page: Math.ceil(total / limit) });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ ERRO NO BANCO (getDoctors):', errorMessage);
      res.status(500).json({ message: 'Erro ao buscar médicos' });
    }
  };

  // 2. BUSCAR ESPECIALIDADES
  public getSpecialties = async (req: Request, res: Response) => {
    try {
      const specialties = await this.medicalRepository.findSpecialties();
      res.json(specialties);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ ERRO NO BANCO (getSpecialties):', errorMessage);
      res.status(500).json({ message: 'Erro ao buscar especialidades' });
    }
  };

  public createSpecialty = async (req: Request, res: Response) => {
    try {
      const { nome } = req.body;
      if (!nome) {
        return res.status(400).json({ message: 'Nome da especialidade é obrigatório.' });
      }
      const insertId = await this.medicalRepository.createSpecialty(nome);
      res.status(201).json({ id: insertId, nome });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Erro ao criar especialidade:', errorMessage);
      res.status(500).json({ message: 'Erro ao criar especialidade.' });
    }
  };

  public updateSpecialty = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { nome } = req.body;
      if (!nome) {
        return res.status(400).json({ message: 'Nome da especialidade é obrigatório.' });
      }
      const affectedRows = await this.medicalRepository.updateSpecialty(Number(id), nome);
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Especialidade não encontrada.' });
      }
      res.json({ message: 'Especialidade atualizada com sucesso!' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Erro ao atualizar especialidade:', errorMessage);
      res.status(500).json({ message: 'Erro ao atualizar especialidade.' });
    }
  };

  public deleteSpecialty = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const affectedRows = await this.medicalRepository.deleteSpecialty(Number(id));
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Especialidade não encontrada.' });
      }
      res.json({ message: 'Especialidade deletada com sucesso!' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Erro ao deletar especialidade:', errorMessage);
      res.status(500).json({ message: 'Erro ao deletar especialidade.' });
    }
  };

  // 3. BUSCAR TODOS OS AGENDAMENTOS
  public getAppointments = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.user?.id || 0; // Assumindo que req.user.id existe e é um número
      const userNivel = req.user?.nivel || ''; // Assumindo que req.user.nivel existe

      const total = await this.medicalRepository.countAppointments(userId, userNivel);
      const appointments = await this.medicalRepository.findAppointments(userId, userNivel, limit, (page - 1) * limit);

      res.json({ data: appointments, total, page, last_page: Math.ceil(total / limit) });
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      res.status(500).json({ message: 'Erro ao buscar agendamentos' });
    }
  };

  // 4. BUSCAR UM AGENDAMENTO POR ID
  public getAppointmentById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const appointment = await this.medicalRepository.findAppointmentById(Number(id));

      if (!appointment) {
        return res.status(404).json({ message: 'Agendamento não encontrado.' });
      }

      res.json(appointment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erro ao buscar dados do agendamento:', errorMessage);
      res.status(500).json({ message: 'Erro ao buscar dados do agendamento.' });
    }
  };

  // 5. CRIAR NOVO AGENDAMENTO
  public createAppointment = async (req: Request, res: Response) => {
    try {
      const { doctorId, date } = req.body;
      const patientId = req.body.patientId || req.user?.id;

      if (!doctorId || !date || !patientId) {
        return res.status(400).json({ message: 'Médico, paciente e data são obrigatórios.' });
      }

      const existing = await this.medicalRepository.findExistingAppointment(doctorId, date);
      if (existing) {
        return res.status(409).json({ message: 'Este horário já está ocupado.' });
      }

      await this.medicalRepository.createAppointment(patientId, doctorId, date, 'AGENDADO');

      res.status(201).json({ message: 'Agendamento criado com sucesso' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Erro no INSERT:', errorMessage);
      res.status(500).json({ message: 'Erro ao criar agendamento no banco' });
    }
  };

  // 6. ATUALIZAR AGENDAMENTO
  public updateAppointment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { doctorId, date, status } = req.body;

      const existing = await this.medicalRepository.findExistingAppointment(doctorId, date, Number(id));
      if (existing) {
        return res.status(409).json({ message: 'Este horário já está ocupado.' });
      }

      const affectedRows = await this.medicalRepository.updateAppointment(Number(id), doctorId, date, status);

      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Agendamento não encontrado.' });
      }

      res.json({ message: 'Agendamento atualizado com sucesso!' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erro ao atualizar agendamento:', errorMessage);
      res.status(500).json({ message: 'Erro ao atualizar agendamento.' });
    }
  };

  // 7. DELETAR AGENDAMENTO
  public deleteAppointment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const affectedRows = await this.medicalRepository.deleteAppointment(Number(id));
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Agendamento não encontrado.' });
      }
      return res.json({ message: 'Agendamento cancelado com sucesso.' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erro ao cancelar agendamento:', errorMessage);
      res.status(500).json({ message: 'Erro ao cancelar agendamento.' });
    }
  };
}
