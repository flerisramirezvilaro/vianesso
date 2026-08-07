export const uploadSchemas = {
    UploadResponse: {
        type: 'object',
        description: 'Estructura de la respuesta exitosa tras subir un archivo de imagen a la nube.',
        properties: {
            success: { 
                type: 'boolean', 
                example: true, 
                description: 'Indica si el archivo se procesó y guardó correctamente.' 
            },
            message: { 
                type: 'string', 
                example: 'File uploaded successfully to Cloudinary.', 
                description: 'Mensaje informativo sobre el estado de la operación.' 
            },
            url: { 
                type: 'string', 
                format: 'uri', 
                example: 'https://res.cloudinary.com/xombrsnn/image/upload/v1783735088/vianesso_uploads/a4h0sdfrav0mdf8mlyks.png',
                description: 'URL segura (HTTPS) provista por la CDN para acceder a la imagen públicamente.' 
            }
        }
    }
};