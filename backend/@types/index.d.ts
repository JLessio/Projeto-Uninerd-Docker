  // @types/index.d.ts

  import 'express';

  declare module 'express-serve-static-core' {
    interface Request {
      user?: {
        id:    number;
        nivel: string;
      };
    }
  }

  export interface IUser {
    id?:          number;
    nome:         string;
    email:        string;
    senha?:       string;
    cpf?:         string;
    crm_numero?:  string;
    crm_uf?:      string;
    id_especialidade?: number;
    especialidade?: string;
    nivel:        'medico' | 'paciente';
  }

  export interface IUserCredentials {
    email: string;
    senha: string;
  }

  export interface ISpecialty {
    id?: number;
    name: string;
  }
