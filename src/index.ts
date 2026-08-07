import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './config/db.js';
import authRoutes from './routes/authRoutes.js'; 
import ticketRoutes from './routes/ticketRoutes.js';
import usersRoutes from './routes/userRoutes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import serviceRequestRouter from './routes/serviceRequestRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import uploadRoutes from './routes/uploadRoutes.js';
import technicianRoutes from "./routes/technicianRoutes.js";
import { createServer } from 'node:http';
import { initializeSocket } from './services/socketService.js';

dotenv.config();

const app = express();

// ─── CAMBIO: Configuración explícita de CORS para mayor seguridad ───
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/service-requests', serviceRequestRouter);

// Upload images
app.use('/api/uploads', uploadRoutes);
// Technician
app.use('/api/technician', technicianRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
// Envolvemos la app de Express en un servidor HTTP nativo
const httpServer = createServer(app);

// Inicializamos Socket.io pasándole el servidor HTTP
initializeSocket(httpServer);

httpServer.listen(PORT, async () => {
    console.log(`Server running smoothly on port ---${PORT}`);
    
    try {
        const result = await query('SELECT NOW()');
        console.log('DB Connection verified! Current DB Time:', result.rows[0].now);
    } catch (error) {
        console.error('DB Connection failed. Check your .env credentials:', error);
    }
});

export default app;