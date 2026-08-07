
export const userSchemas = {
    UserProfile: {
        type: 'object',
        description: 'Estructura de la información del perfil de usuario expuesta al Frontend.',
        properties: {
            id: { type: 'integer', example: 42 },
            name: { type: 'string', example: 'Fleris Ramírez' },
            email: { type: 'string', example: 'fleris@vianesso.com' },
            phone: { type: 'string', nullable: true, example: '+573004567890' }
        }
    }
};