import { commonErrors, successResponse } from '../utils/swaggerHelpers.js';

export const uploadPaths = {
    '/uploads/images': {
        post: {
            summary: 'Subir archivo de imagen a la nube',
            description: 'Permite a los usuarios autenticados subir un archivo binario. El sistema lo procesa en memoria y lo aloja en Cloudinary de manera segura.',
            tags: ['Infraestructura y Multimedia'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            required: ['image'],
                            properties: {
                                image: {
                                    type: 'string',
                                    format: 'binary',
                                    description: 'Archivo de imagen en formatos permitidos (.png, .jpg, .jpeg, .webp). Tamaño máximo: 5MB.'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: successResponse('Imagen cargada con éxito en la infraestructura.', {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'File uploaded successfully to Cloudinary.' },
                    url: { type: 'string', format: 'uri', example: 'https://res.cloudinary.com/xombrsnn/image/upload/v1783735088/vianesso_uploads/a4h0sdfrav0mdf8mlyks.png' }
                }),
                400: commonErrors.badRequest,
                401: commonErrors.unauthorized
            }
        }
    }
};