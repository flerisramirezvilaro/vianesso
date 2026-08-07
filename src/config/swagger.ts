// src/config/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';

import { apiComponents, apiPaths,  } from '../docs/index.js';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ViaNesso API Documentation',
            version: '1.0.0',
            description: 'Documentación oficial y búnker de pruebas de los endpoints de viaNesso (Technical Support Management System).',
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1',
                description: 'Servidor de Desarrollo Local',
            },
        ],
        // 🛡️ DEFINICIÓN DIRECTA DE OPERACIONES (Inmune a fallos de lectura de archivos .ts)
        paths: apiPaths,
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Introduce tu token JWT en el formato: Bearer <TOKEN>',
                },
            },
            ...apiComponents
        },
    },
   
    apis: [], 
};

export const swaggerSpec = swaggerJSDoc(options);