// api/src/routes/auth.routes.ts
import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validateResource.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

// Endpoint: POST /auth/register
router.post('/register', validate(registerSchema), register);

// Endpoint: POST /auth/login
router.post('/login', validate(loginSchema), login);

export default router;