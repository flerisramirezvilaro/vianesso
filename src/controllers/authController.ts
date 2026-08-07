import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PostgresUserReadRepository } from '../repositories/PostgresUserReadRepository.js';
import { PostgresUserWriteRepository } from '../repositories/PostgresUserWriteRepository.js';
import { AuthValidator } from '../utils/authValidators.js';
import { LoginInput, RegisterInput } from '../types/auth.types.js';
import { handleControllerError } from '../utils/errorHandler.js';
import { ENV } from '../config/env.js';
const userReadRepository = new PostgresUserReadRepository();
const userWriteRepository = new PostgresUserWriteRepository();

export const register = async (req: Request & { body: Partial<RegisterInput> }, res: Response): Promise<void> => {
    try {
        //  1. Validación y Saneamiento estricto contra código malicioso
        const validatedData = AuthValidator.validateRegister(req.body);

        //  2. Verificar existencia de cuenta de forma defensiva
        const existingUser = await userReadRepository.findByEmail(validatedData.email);
        if (existingUser) {
            res.status(400).json({ message: 'An account with this email already exists.' });
            return;
        }

        // 3. Hasheo seguro
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(validatedData.password, salt);

        //  4. Almacenamiento usando el repositorio de escritura
        const createdUser = await userWriteRepository.create({
            full_name: validatedData.name,
            email: validatedData.email,
            passwordHash: hashedPassword,
            phone: validatedData.phone || null,
            role: validatedData.role
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully! ',
            user: {
                id: createdUser.user_id,
                name: createdUser.full_name,
                email: createdUser.email,
                role: createdUser.role
            }
        });

    } catch (error) {
        // Capturamos los errores controlados de validación o del sistema
        handleControllerError(res, error, 'Error during user registration');
    }
};

export const login = async (req: Request & { body: Partial<LoginInput> }, res: Response): Promise<void> => {
    try {
        //  1. Validación y Saneamiento de credenciales entrantes
        const validatedCredentials = AuthValidator.validateLogin(req.body);



        //  2. Búsqueda segura en el repositorio de lectura
        const user = await userReadRepository.findByEmail(validatedCredentials.email);
        
        if (!user?.password) {
            res.status(401).json({ message: 'Invalid credentials.' }); 
            return;
        }

        // 3. Verificación de Hash
        const isMatch = await bcrypt.compare(validatedCredentials.password, user.password);
        console.log("¿La contraseña coincide?:", isMatch);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }

       
        

        const payload = {
            userId: user.user_id,
            role: user.role
        };

        const token = jwt.sign(payload, ENV.JWT_SECRET, { 
            expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
        });

        res.status(200).json({
            success: true,
            message: 'Login successful! ',
            token,
            user: {
                id: user.user_id,
                name: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        handleControllerError(res, error, 'Error during user login');
    }
};
