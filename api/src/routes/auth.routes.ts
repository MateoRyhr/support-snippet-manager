import { Router } from 'express';
import { register, verifyEmail, login } from '../controllers/auth.controller.js'; // <-- Agregamos login
import { validate } from '../middleware/validateResource.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

// Endpoint: POST /auth/register
router.post('/register', validate(registerSchema), register);

// Endpoint: POST /auth/verify
router.post('/verify', verifyEmail);
// Endpoint: GET /auth/verify
router.get('/verify', verifyEmail);

// Endpoint: POST /auth/login
router.post('/login', validate(loginSchema), login); 

export default router;