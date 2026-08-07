import { Router } from 'express';
import { createTicket, deleteTicket, getClientTickets,getTicketById, updateClientTicket } from '../controllers/ticketController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

// - Protegido por Token
router.post('/', verifyToken , createTicket);
router.get('/', verifyToken, getClientTickets);
router.get('/:id', verifyToken, getTicketById);
router.delete('/:id', verifyToken, deleteTicket)
router.put('/:id', verifyToken, updateClientTicket);

export default router;