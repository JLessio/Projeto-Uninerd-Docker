import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class MedicalRepository {
  constructor(private readonly db: Pool) {}

  // Doctors
  public async findDoctors(specialty?: string, limit: number = 10, offset: number = 0): Promise<RowDataPacket[]> {
    let query = `
      SELECT 
        u.id, 
        u.nome as name, 
        u.nivel,
        e.nome as specialty,
        u.crm_numero,
        u.crm_uf
      FROM usuarios u 
      LEFT JOIN especialidades e ON u.id_especialidade = e.id
      WHERE u.nivel = 'medico'
    `;
    const params: (string | number)[] = [];

    if (specialty && specialty.trim() !== "") {
      query += ` AND e.nome LIKE ?`;
      params.push(`%${specialty}%`);
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await this.db.execute<RowDataPacket[]>(query, params);
    return rows;
  }

  public async countDoctors(specialty?: string): Promise<number> {
    let countQuery = `
      SELECT COUNT(*) as count
      FROM usuarios u 
      LEFT JOIN especialidades e ON u.id_especialidade = e.id
      WHERE u.nivel = 'medico'
    `;
    const params: (string | number)[] = [];

    if (specialty && specialty.trim() !== "") {
      countQuery += ` AND e.nome LIKE ?`;
      params.push(`%${specialty}%`);
    }

    const [totalRows] = await this.db.execute<RowDataPacket[]>(countQuery, params);
    return totalRows[0].count;
  }

  // Specialties
  public async findSpecialties(): Promise<RowDataPacket[]> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      'SELECT id, nome as name FROM especialidades'
    );
    return rows;
  }

  public async createSpecialty(nome: string): Promise<number> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'INSERT INTO especialidades (nome) VALUES (?)',
      [nome]
    );
    return result.insertId;
  }

  public async updateSpecialty(id: number, nome: string): Promise<number> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'UPDATE especialidades SET nome = ? WHERE id = ?',
      [nome, id]
    );
    return result.affectedRows;
  }

  public async deleteSpecialty(id: number): Promise<number> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'DELETE FROM especialidades WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Appointments
  public async findAppointments(userId: number, userNivel: string, limit: number = 10, offset: number = 0): Promise<RowDataPacket[]> {
    let query = `
      SELECT 
        a.id, 
        a.id_medico as doctorId, 
        a.data_consulta as date, 
        m.nome as doctorName, 
        u.nome as patientName, 
        a.status
      FROM agendamentos a 
      JOIN usuarios m ON a.id_medico = m.id 
      JOIN usuarios u ON a.id_usuario = u.id
    `;
    const params: (string | number)[] = [];

    if (userNivel === 'paciente') {
      query += ' WHERE a.id_usuario = ?';
      params.push(userId);
    } else if (userNivel === 'medico') {
      query += ' WHERE a.id_medico = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY a.data_consulta ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await this.db.execute<RowDataPacket[]>(query, params);
    return rows;
  }

  public async countAppointments(userId: number, userNivel: string): Promise<number> {
    let countQuery = `
      SELECT COUNT(*)
      FROM agendamentos a 
      JOIN usuarios m ON a.id_medico = m.id 
      JOIN usuarios u ON a.id_usuario = u.id
    `;
    const params: (string | number)[] = [];

    if (userNivel === 'paciente') {
      countQuery += ' WHERE a.id_usuario = ?';
      params.push(userId);
    } else if (userNivel === 'medico') {
      countQuery += ' WHERE a.id_medico = ?';
      params.push(userId);
    }

    const [totalRows] = await this.db.execute<RowDataPacket[]>(countQuery, params);
    return totalRows[0]['COUNT(*)'];
  }

  public async findAppointmentById(id: number): Promise<RowDataPacket | null> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT id, id_medico as doctorId, data_consulta as date, status 
       FROM agendamentos WHERE id = ?`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  public async findExistingAppointment(doctorId: number, date: string, excludeId?: number): Promise<RowDataPacket | null> {
    let query = 'SELECT id FROM agendamentos WHERE id_medico = ? AND data_consulta = ?';
    const params: (string | number)[] = [doctorId, date];

    if (excludeId) {
      query += ' AND id <> ?';
      params.push(excludeId);
    }

    const [existing] = await this.db.execute<RowDataPacket[]>(query, params);
    return existing.length > 0 ? existing[0] : null;
  }

  public async createAppointment(patientId: number, doctorId: number, date: string, status: string): Promise<number> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'INSERT INTO agendamentos (id_usuario, id_medico, data_consulta, status) VALUES (?, ?, ?, ?)',
      [patientId, doctorId, date, status]
    );
    return result.insertId;
  }

  public async updateAppointment(id: number, doctorId: number, date: string, status: string): Promise<number> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'UPDATE agendamentos SET id_medico = ?, data_consulta = ?, status = ? WHERE id = ?',
      [doctorId, date, status, id]
    );
    return result.affectedRows;
  }

  public async deleteAppointment(id: number): Promise<number> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'DELETE FROM agendamentos WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}
