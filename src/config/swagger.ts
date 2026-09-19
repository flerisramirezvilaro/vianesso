// src/config/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc'

import { ENV } from './env'
import { apiComponents, apiPaths } from '../docs'

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ViaNesso API Documentation',
      version: '1.0.0',
      description:
        'Documentación oficial de la API de ViaNesso para la gestión de autenticación, usuarios, tickets, solicitudes de servicio e incidencias.',
      contact: {
        name: 'ViaNesso Team',
      },
    },

    servers: [
      {
        url: ENV.API_URL,
        description:
          ENV.NODE_ENV === 'production'
            ? 'Servidor de Producción'
            : 'Servidor de Desarrollo Local',
      },
    ],

    security: [
      {
        bearerAuth: [],
      },
    ],

    paths: apiPaths,

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Introduce tu token JWT en el formato: Bearer <TOKEN>',
        },
      },

      ...apiComponents,
    },
  },

  apis: [],
}

export const swaggerSpec = swaggerJSDoc(options)