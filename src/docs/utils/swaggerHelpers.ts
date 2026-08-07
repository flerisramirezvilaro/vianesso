// src/docs/utils/swaggerHelpers.ts

// 🛡️ 1. Generador de respuestas de error estándar (400, 401, 404, 500)
export const errorResponse = (description: string, exampleMessage: string) => ({
    description,
    content: {
        'application/json': {
            schema: {
                type: 'object',
                properties: {
                    message: { type: 'string', example: exampleMessage }
                }
            }
        }
    }
});

// 🛡️ 2. Generador de respuestas de éxito estándar (200/201) con Schemas o data personalizada
export const successResponse = (description: string, dataProperties: Record<string, any>) => ({
    description,
    content: {
        'application/json': {
            schema: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    ...dataProperties
                }
            }
        }
    }
});

// 🛡️ 3. Atajos para los errores más repetitivos de tu Búnker
export const commonErrors = {
    badRequest: errorResponse('Error de validación o datos corruptos.', 'Validation failed. '),
    unauthorized: errorResponse('Token JWT faltante, inválido o expirado.', 'Unauthorized access.'),
    forbidden: errorResponse('El rol asignado no tiene permisos para este recurso.', 'Forbidden resource.'),
    notFound: errorResponse('El recurso solicitado no existe o pertenece a otro cliente.', 'Resource not found. 🔍'),
    internalServerError: errorResponse('Fallo crítico en el servidor.', 'Internal Server Error. ')
};


export const pathParameter = (name: string, description: string) => [
    {
        name,
        in: 'path',
        required: true,
        description,
        schema: { type: 'string', format: 'uuid' }
    }
];