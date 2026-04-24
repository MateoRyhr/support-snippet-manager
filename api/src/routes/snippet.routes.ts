// api/src/routes/snippet.routes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  getMySnippets,
  getPublicSnippets,
  createSnippet,
  getSnippetById,
  updateSnippet,
  deleteSnippet
} from '../controllers/snippet.controller.js';

const router = Router();

// 🛡️ BARRERA DE SEGURIDAD: 
// Todo lo que esté debajo de esta línea requiere que el usuario envíe un Token válido
router.use(requireAuth);

// --- RUTAS DE COLECCIONES (Estáticas) ---
router.get('/community', getPublicSnippets);
router.get('/', getMySnippets);           // GET /api/snippets

// --- RUTAS INDIVIDUALES (Dinámicas) ---
// Deben ir al final para que ':id' no secuestre a '/public'
router.post('/', createSnippet);          // POST /api/snippets
router.get('/:id', getSnippetById);       // GET /api/snippets/:id
router.put('/:id', updateSnippet);        // PUT /api/snippets/:id
router.delete('/:id', deleteSnippet);     // DELETE /api/snippets/:id

export default router;