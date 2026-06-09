  import { Request, Response } from 'express';
  import { UserController } from '../../../controllers/UserController';
  import { UserService } from '../../../services/UserService';
  import { IUser, IUserCredentials } from '../../../../@types/index';

  // Mock do UserService
  jest.mock('../../../services/UserService');

  describe('UserController', () => {
    let userController: UserController;
    let mockUserService: jest.Mocked<UserService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
      mockUserService = {
        register: jest.fn(),
        login: jest.fn(),
        update: jest.fn(),
        getById: jest.fn(),
        delete: jest.fn(),
      } as jest.Mocked<UserService>;
      userController = new UserController(mockUserService);

      jsonMock = jest.fn();
      statusMock = jest.fn().mockReturnValue({ json: jsonMock });
      mockResponse = {
        status: statusMock,
        json: jsonMock,
      };
    });

    describe('register', () => {
      it('should register a user successfully', async () => {
        const userData: IUser = {
          nome: 'Test User',
          email: 'test@example.com',
          senha: 'password123',
          nivel: 'paciente',
        };
        const registeredUser = { id: 1, ...userData };

        mockUserService.register.mockResolvedValue(registeredUser);
        mockRequest = { body: userData };

        await userController.register(mockRequest as Request, mockResponse as Response);

        expect(mockUserService.register).toHaveBeenCalledWith(userData);
        expect(statusMock).toHaveBeenCalledWith(201);
        expect(jsonMock).toHaveBeenCalledWith({ success: true, data: registeredUser });
      });

      it('should handle registration error', async () => {
        const userData: IUser = {
          nome: 'Test User',
          email: 'test@example.com',
          senha: 'password123',
          nivel: 'paciente',
        };
        const error = new Error('Registration failed');

        mockUserService.register.mockRejectedValue(error);
        mockRequest = { body: userData };

        await userController.register(mockRequest as Request, mockResponse as Response);

        expect(mockUserService.register).toHaveBeenCalledWith(userData);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ success: false, message: 'Registration failed' });
      });
    });

    describe('login', () => {
      it('should login a user successfully', async () => {
        const credentials: IUserCredentials = {
          email: 'test@example.com',
          senha: 'password123',
        };
        const token = 'jwt-token';
        const user: Omit<IUser, 'senha'> = {
          id: 1,
          nome: 'Test User',
          email: 'test@example.com',
          nivel: 'paciente',
        };

        mockUserService.login.mockResolvedValue({ token, user });
        mockRequest = { body: credentials };

        await userController.login(mockRequest as Request, mockResponse as Response);

        expect(mockUserService.login).toHaveBeenCalledWith(credentials);
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({ success: true, token, user });
      });

      it('should handle login error', async () => {
        const credentials: IUserCredentials = {
          email: 'test@example.com',
          senha: 'password123',
        };
        const error = new Error('Invalid credentials');

        mockUserService.login.mockRejectedValue(error);
        mockRequest = { body: credentials };

        await userController.login(mockRequest as Request, mockResponse as Response);

        expect(mockUserService.login).toHaveBeenCalledWith(credentials);
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
      });
    });
  });