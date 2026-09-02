import { Router } from 'express';
import { createRequest, getClientDashboardMetrics, getClientRequests, getServiceRequestDetail } from '../controllers/serviceRequestController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { uploadImage } from '../middlewares/uploadMiddleware.js';

const router = Router();

//  Rutas protegidas siguiendo tu estándar estricto
//router.post('/', verifyToken, createRequest);
router.post('/', verifyToken, uploadImage.array('evidence', 5), createRequest);
router.get('/my-requests', verifyToken, getClientRequests);
router.get('/dashboard-metrics', verifyToken, getClientDashboardMetrics);
router.get('/:id', verifyToken, getServiceRequestDetail);


export default router;