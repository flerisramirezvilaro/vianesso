// src/docs/index.ts
import { authPaths } from './paths/authDocs.js';
import { chatPaths } from './paths/chatDocs.js';
import { serviceRequestPaths } from './paths/serviceRequestDocs.js';
import { technicianPaths } from './paths/technicianDocs.js';
import { ticketPaths } from './paths/ticketDocs.js';
import { uploadPaths } from './paths/uploadDocs.js';
import { userPaths } from './paths/userDocs.js';
import { chatSchemas } from './schemas/chatSchemas.js';
import { serviceRequestSchemas } from './schemas/serviceRequestDocs.js';
import { technicianSchemas } from './schemas/technicianSchemas.js';
import { ticketSchemas } from './schemas/ticketDocs.js';
import { uploadSchemas } from './schemas/uploadSchemas.js';
import { userSchemas } from './schemas/userDocs.js';

export const apiPaths = {
    ...authPaths,
    ...ticketPaths,
    ...userPaths,
    ...serviceRequestPaths,
    ...uploadPaths,
    ...technicianPaths,
    ...chatPaths
};

export const apiComponents = {
    schemas: {
        TicketStatus: ticketSchemas.TicketStatus,
        CompactTicket: ticketSchemas.CompactTicket,
        UserProfile: userSchemas.UserProfile,
        ServiceRequest: serviceRequestSchemas.ServiceRequest,
        uploadSchemas:uploadSchemas.UploadResponse,
            ...chatSchemas,
            ...technicianSchemas
       
    }
};