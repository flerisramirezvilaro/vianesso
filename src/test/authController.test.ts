// src/controllers/authController.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

import { register, login } from '../controllers/authController';
import { ValidationError } from '../errors/AppError.js';
import { UserRole } from '../types/index.js';
 // Ajusta si viene de otro archivo de enums

// --- 1. HOISTING SEGURO CON VI.HOISTED ---
const { mocks } = vi.hoisted(() => ({
    mocks: {
        findByEmail: vi.fn(),
        create: vi.fn(),
        validateRegister: vi.fn(),
        validateLogin: vi.fn(),
        handleControllerError: vi.fn(),
        genSalt: vi.fn(),
        hash: vi.fn(),
        compare: vi.fn(),
        sign: vi.fn()
    }
}));

// Mocks de Repositorios usando Clases constructores nativas
vi.mock('../repositories/PostgresUserReadRepository.js', () => ({
    PostgresUserReadRepository: class {
        findByEmail = mocks.findByEmail;
    }
}));

vi.mock('../repositories/PostgresUserWriteRepository.js', () => ({
    PostgresUserWriteRepository: class {
        create = mocks.create;
    }
}));

// Mocks de validadores y manejadores de infraestructura
vi.mock('../utils/authValidators.js', () => ({
    AuthValidator: {
        validateRegister: mocks.validateRegister,
        validateLogin: mocks.validateLogin
    }
}));

vi.mock('../utils/errorHandler.js', () => ({
    handleControllerError: mocks.handleControllerError
}));

// Mocks de librerías de terceros (Criptografía y Tokens)
vi.mock('bcrypt', () => ({
    default: {
        genSalt: mocks.genSalt,
        hash: mocks.hash,
        compare: mocks.compare
    }
}));

vi.mock('jsonwebtoken', () => ({
    default: {
        sign: mocks.sign
    }
}));

// Mock de variables de entorno para evitar romper por configuraciones nulas
vi.mock('../config/env.js', () => ({
    ENV: {
        JWT_SECRET: 'test-secret-key-123',
        JWT_EXPIRES_IN: '24h'
    }
}));

// --- 2. CONFIGURACIÓN DE EXPRESS MOCKS ---
const mockResJson = vi.fn();
const mockResStatus = vi.fn().mockImplementation(() => ({ json: mockResJson }));

const createMockResponse = (): Response => ({
    status: mockResStatus
} as unknown as Response);

const createMockRequest = (body: any = {}): Request => ({
    body
} as unknown as Request);

// --- 3. SUITE DE PRUEBAS ---
describe('authController Unit Tests - viaNesso', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockResStatus.mockReturnValue({ json: mockResJson });

        // Comportamiento base por defecto de validadores (retornar el payload saneado)
        mocks.validateRegister.mockImplementation((input) => input);
        mocks.validateLogin.mockImplementation((input) => input);
    });

    describe('register', () => {
        const validRegisterBody = {
            name: 'Fleris Ramirez',
            email: 'fleris@unad.edu.co',
            password: 'SecurePassword123!',
            role: UserRole.CLIENT
        };

        it('should register a user successfully with status 201 if raw inputs are completely valid', async () => {
            const req = createMockRequest(validRegisterBody);
            const res = createMockResponse();

            mocks.findByEmail.mockResolvedValue(null); // No existe cuenta previa
            mocks.genSalt.mockResolvedValue('mocked-salt');
            mocks.hash.mockResolvedValue('encrypted-hash-xyz');
            mocks.create.mockResolvedValue({
                user_id: 42,
                full_name: 'Fleris Ramirez',
                email: 'fleris@unad.edu.co',
                role: UserRole.CLIENT
            });

            await register(req, res);

            expect(mocks.findByEmail).toHaveBeenCalledWith(validRegisterBody.email);
            expect(mocks.hash).toHaveBeenCalledWith(validRegisterBody.password, 'mocked-salt');
            expect(mockResStatus).toHaveBeenCalledWith(201);
            expect(mockResJson).toHaveBeenCalledWith({
                success: true,
                message: 'User registered successfully! ',
                user: { id: 42, name: 'Fleris Ramirez', email: 'fleris@unad.edu.co', role: UserRole.CLIENT }
            });
        });

        it('should return 400 if user email registration conflicts with an existing account', async () => {
            const req = createMockRequest(validRegisterBody);
            const res = createMockResponse();

            // Simulamos que el repositorio encuentra una cuenta previa registrada
            mocks.findByEmail.mockResolvedValue({ user_id: 42, email: validRegisterBody.email });

            await register(req, res);

            expect(mocks.create).not.toHaveBeenCalled();
            expect(mockResStatus).toHaveBeenCalledWith(400);
            expect(mockResJson).toHaveBeenCalledWith({
                message: 'An account with this email already exists.'
            });
        });

        it('should intercept validation structural failures and pass them cleanly to handleControllerError', async () => {
            const req = createMockRequest({ email: 'malicious-input' });
            const res = createMockResponse();

            mocks.validateRegister.mockImplementation(() => {
                throw new ValidationError('Validation mismatch structural failure.');
            });

            await register(req, res);

            expect(mocks.handleControllerError).toHaveBeenCalledWith(
                res,
                expect.any(ValidationError),
                'Error during user registration'
            );
        });
    });

    describe('login', () => {
        const validLoginBody = {
            email: 'fleris@unad.edu.co',
            password: 'SecurePassword123!'
        };

        it('should authenticate user and return 200 with JWT if passwords match perfectly', async () => {
            const req = createMockRequest(validLoginBody);
            const res = createMockResponse();

            const mockDbUser = {
                user_id: 42,
                full_name: 'Fleris Ramirez',
                email: 'fleris@unad.edu.co',
                password: 'encrypted-hash-xyz',
                role: UserRole.CLIENT
            };

            mocks.findByEmail.mockResolvedValue(mockDbUser);
            mocks.compare.mockResolvedValue(true); // Las contraseñas coinciden
            mocks.sign.mockReturnValue('generated.jwt.token');

            await login(req, res);

            expect(mocks.findByEmail).toHaveBeenCalledWith(validLoginBody.email);
            expect(mocks.compare).toHaveBeenCalledWith(validLoginBody.password, 'encrypted-hash-xyz');
            expect(mockResStatus).toHaveBeenCalledWith(200);
            expect(mockResJson).toHaveBeenCalledWith({
                success: true,
                message: 'Login successful! ',
                token: 'generated.jwt.token',
                user: { id: 42, name: 'Fleris Ramirez', email: 'fleris@unad.edu.co', role: UserRole.CLIENT }
            });
        });

        it('should return 401 if user email is not found or has no credentials', async () => {
            const req = createMockRequest(validLoginBody);
            const res = createMockResponse();

            mocks.findByEmail.mockResolvedValue(null); // No se encuentra en la BD

            await login(req, res);

            expect(mockResStatus).toHaveBeenCalledWith(401);
            expect(mockResJson).toHaveBeenCalledWith({ message: 'Invalid credentials.' });
        });

        it('should return 401 if cryptographic hash integrity check fails (wrong password)', async () => {
            const req = createMockRequest(validLoginBody);
            const res = createMockResponse();

            mocks.findByEmail.mockResolvedValue({ user_id: 42, password: 'correct-hash' });
            mocks.compare.mockResolvedValue(false); // No coinciden las claves

            await login(req, res);

            expect(mocks.sign).not.toHaveBeenCalled();
            expect(mockResStatus).toHaveBeenCalledWith(401);
        });
    });
});