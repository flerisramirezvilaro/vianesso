import { Router } from 'express';
import { createTicket } from '../controllers/ticketController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

// POST /api/tickets -> Protegido y verificado de extremo a extremo
router.post('/', verifyToken, createTicket);

export default router;