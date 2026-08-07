import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class StorageService {
    /**
     * Sube un archivo en memoria a Cloudinary usando Streams de Node.js
     * Retorna la URL segura (HTTPS) del archivo alojado en la nube
     */
    public static async saveFile(file: Express.Multer.File): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'vianesso_uploads', // Carpeta organizada en tu cuenta de Cloudinary
                    resource_type: 'image'
                },
                (error, result) => {
                    if (error || !result) {
                        return reject(new Error('Failed to upload image to Cloudinary.'));
                    }
                    // Retorna la URL segura directa provista por la CDN de Cloudinary
                    resolve(result.secure_url);
                }
            );

            // Escribir el buffer de Multer directamente en el stream de subida
            uploadStream.end(file.buffer);
        });
    }
}
