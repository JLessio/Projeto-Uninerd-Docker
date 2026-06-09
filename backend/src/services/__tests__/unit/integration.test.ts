import request from 'supertest';
import app from '../../../server';
import db from '../../../database/connection';

// Função auxiliar para gerar um CPF matematicamente válido
function generateValidCPF() {
  const n = 9;
  const n1 = Math.floor(Math.random() * n);
  const n2 = Math.floor(Math.random() * n);
  const n3 = Math.floor(Math.random() * n);
  const n4 = Math.floor(Math.random() * n);
  const n5 = Math.floor(Math.random() * n);
  const n6 = Math.floor(Math.random() * n);
  const n7 = Math.floor(Math.random() * n);
  const n8 = Math.floor(Math.random() * n);
  const n9 = Math.floor(Math.random() * n);
  
  let d1 = n9*2+n8*3+n7*4+n6*5+n5*6+n4*7+n3*8+n2*9+n1*10;
  d1 = 11 - (d1 % 11);
  if (d1 >= 10) d1 = 0;
  
  let d2 = d1*2+n9*3+n8*4+n7*5+n6*6+n5*7+n4*8+n3*9+n2*10+n1*11;
  d2 = 11 - (d2 % 11);
  if (d2 >= 10) d2 = 0;
  
  return `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}${d1}${d2}`;
}

describe('Integration Tests - SaneaTISS', () => {
  let token: string;
  let userId: number;
  let email: string;
  let validCPF: string;

  beforeAll(async () => {
    // Limpeza de segurança para não dar conflito de e-mail/CPF
    try {
      await db.execute('DELETE FROM agendamentos WHERE id_usuario IN (SELECT id FROM usuarios WHERE email LIKE "testuser%")');
      await db.execute('DELETE FROM usuarios WHERE email LIKE ?', ['testuser+%@example.com']);
    } catch (error) {
      console.log("Aviso: Limpeza inicial pulada (tabelas podem estar vazias).");
    }
  });

  afterAll(async () => {
    // Fecha a conexão com o MySQL para o Jest encerrar corretamente
    await db.end();
  });

  describe('Fluxo de Usuário (CRUD 1)', () => {
    it('should register a new user with valid CPF and strong password', async () => {
      email = `testuser+${Date.now()}@example.com`;
      validCPF = generateValidCPF();

      const response = await request(app)
        .post('/api/users/register')
        .send({
          nome: 'Gustavo Teste',
          email,
          senha: 'Password123!',
          nivel: 'paciente',
          cpf: validCPF
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      userId = response.body.data.id;
    });

    it('should login and receive a valid JWT token', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email,
          senha: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      token = response.body.token;
    });
  });

  describe('Fluxo Médico e Agendamentos (CRUD 2)', () => {
    let appointmentId: number;

    it('should list doctors (Authenticated)', async () => {
      const response = await request(app)
        .get('/api/doctors')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should create an appointment in a future date', async () => {
      // Usando uma data de Dezembro de 2026 para passar em validadores de data retroativa
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          doctorId: 1, // Certifique-se que o médico ID 1 existe no seu banco
          date: '2026-12-01T10:00:00Z',
          type: 'consulta'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('sucesso');
    });

    it('should list appointments and capture the ID for deletion', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      if (response.body.data && response.body.data.length > 0) {
        appointmentId = response.body.data[0].id;
      }
    });

    it('should cancel (Delete) an appointment successfully', async () => {
      if (!appointmentId) return;

      const response = await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Agendamento cancelado com sucesso.');
    });
  });
});