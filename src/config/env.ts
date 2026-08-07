// src/config/env.ts
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error(' CRITICAL CONFIGURATION ERROR: JWT_SECRET environment variable is missing.');
}

if (!process.env.JWT_EXPIRES_IN) {
    throw new Error(' CRITICAL CONFIGURATION ERROR: JWT_EXPIRES_IN environment variable is missing.');
}

// Exportamos un objeto de configuración inmutable y tipado de forma estricta
export const ENV = {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN
} as const;