// File: routes/contactRoutes.js
import { Router } from 'express';
import { sendContactEmail } from '../controllers/contact-controller.js';

const contactRouter = Router();

// ✅ Email-only contact submission
contactRouter.post('/send-email', sendContactEmail);

export { contactRouter };
