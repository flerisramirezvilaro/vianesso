import { Router } from 'express';
import { acceptServiceRequest } from '../controllers/technicianController';
import { verifyToken } from '../middlewares/authMiddleware';

// import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js'; 

const router = Router();


router.put('/requests/:id/accept', verifyToken, acceptServiceRequest);

export default router;