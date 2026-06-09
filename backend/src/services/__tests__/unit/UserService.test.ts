import { UserService } from '../../UserService';
import { UserRepository } from '../../../repositories/UserRepository';
import { User } from '../../../entities/User';
import { IUser } from '../../../../@types/index';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock do UserRepository
const mockUserRepository: jest.Mocked<UserRepository> = {
  findByEmail: jest.fn(),
  findByCPF: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
} as jest.Mocked<UserRepository>;

// Mock das funções de validação
jest.mock('../../../utils/validators', () => ({
  isValidEmail: jest.fn((email) => email.includes('@')),
  isValidCPF: jest.fn((cpf) => cpf.length === 11),
  isStrongPassword: jest.fn((password) => password.length >= 8),
}));

// Mock do bcrypt e jwt
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(mockUserRepository);
    // Resetar mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData: IUser = {
        nome: 'Test User',
        email: 'test@example.com',
        senha: 'StrongPassword1!',
        nivel: 'paciente',
        cpf: '12345678901',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByCPF.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      mockUserRepository.create.mockResolvedValue(1);

      const result = await userService.register(userData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.findByCPF).toHaveBeenCalledWith(userData.cpf);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.senha, expect.any(Number));
      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({ nome: userData.nome, email: userData.email }));
      expect(result).toEqual(expect.objectContaining({ nome: userData.nome, email: userData.email }));
    });

    it('should throw an error if email is already registered', async () => {
      const userData: IUser = {
        nome: 'Test User',
        email: 'test@example.com',
        senha: 'StrongPassword1!',
        nivel: 'paciente',
        cpf: '12345678901',
      };

      mockUserRepository.findByEmail.mockResolvedValue(new User(userData));

      await expect(userService.register(userData)).rejects.toThrow('E-mail já cadastrado.');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error if password is not strong', async () => {
      const userData: IUser = {
        nome: 'Test User',
        email: 'test@example.com',
        senha: 'weak',
        nivel: 'paciente',
        cpf: '12345678901',
      };

      await expect(userService.register(userData)).rejects.toThrow('A senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais.');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return a token and user data on successful login', async () => {
      const credentials = { email: 'test@example.com', senha: 'password' };
      const foundUser = new User({ id: 1, nome: 'Test User', email: 'test@example.com', senha: 'hashedpassword', nivel: 'paciente' });

      mockUserRepository.findByEmail.mockResolvedValue(foundUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mocked_jwt_token');

      const result = await userService.login(credentials);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(credentials.senha, foundUser.senha);
      expect(jwt.sign).toHaveBeenCalledWith({ id: foundUser.id, nivel: foundUser.nivel }, expect.any(String), expect.any(Object));
      expect(result).toEqual({ token: 'mocked_jwt_token', user: expect.objectContaining({ email: credentials.email }) });
    });

    it('should throw an error for invalid credentials (email not found)', async () => {
      const credentials = { email: 'nonexistent@example.com', senha: 'password' };
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.login(credentials)).rejects.toThrow('Credenciais inválidas.');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw an error for invalid credentials (incorrect password)', async () => {
      const credentials = { email: 'test@example.com', senha: 'wrongpassword' };
      const foundUser = new User({ id: 1, nome: 'Test User', email: 'test@example.com', senha: 'hashedpassword', nivel: 'paciente' });

      mockUserRepository.findByEmail.mockResolvedValue(foundUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(userService.login(credentials)).rejects.toThrow('Credenciais inválidas.');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(credentials.senha, foundUser.senha);
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const userId = 1;
      const existingUser = new User({ id: userId, nome: 'Old Name', email: 'test@example.com', senha: 'oldhashedpassword', nivel: 'paciente', cpf: '12345678901' });
      const updateData = { nome: 'New Name' };

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(new User({ ...existingUser, ...updateData }));

      const result = await userService.update(userId, updateData);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(expect.objectContaining({ nome: updateData.nome }));
    });

    it('should throw an error if user not found', async () => {
      const userId = 99;
      const updateData = { nome: 'New Name' };

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.update(userId, updateData)).rejects.toThrow('Usuário não encontrado.');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if trying to change email', async () => {
      const userId = 1;
      const existingUser = new User({ id: userId, nome: 'Old Name', email: 'test@example.com', senha: 'oldhashedpassword', nivel: 'paciente', cpf: '12345678901' });
      const updateData = { email: 'new@example.com' };

      mockUserRepository.findById.mockResolvedValue(existingUser);

      await expect(userService.update(userId, updateData)).rejects.toThrow('Não é permitido alterar o e-mail.');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should update password if new strong password is provided', async () => {
      const userId = 1;
      const existingUser = new User({ id: userId, nome: 'Old Name', email: 'test@example.com', senha: 'oldhashedpassword', nivel: 'paciente', cpf: '12345678901' });
      const newPassword = 'NewStrongPassword1!';
      const updateData = { senha: newPassword };

      mockUserRepository.findById.mockResolvedValue(existingUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashedpassword');
      mockUserRepository.update.mockResolvedValue(new User({ ...existingUser, senha: 'newhashedpassword' }));

      const result = await userService.update(userId, updateData);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, expect.any(Number));
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, expect.objectContaining({ senha: 'newhashedpassword' }));
      expect(result).toEqual(expect.objectContaining({ nome: existingUser.nome }));
    });

    it('should throw an error if new password is not strong', async () => {
      const userId = 1;
      const existingUser = new User({ id: userId, nome: 'Old Name', email: 'test@example.com', senha: 'oldhashedpassword', nivel: 'paciente', cpf: '12345678901' });
      const weakPassword = 'weak';
      const updateData = { senha: weakPassword };

      mockUserRepository.findById.mockResolvedValue(existingUser);

      await expect(userService.update(userId, updateData)).rejects.toThrow('A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas e minúsculas, números e caracteres especiais.');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });
});
