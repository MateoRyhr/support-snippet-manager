// api/src/routes/snippet.routes.ts
import { Router } from 'express';
import { 
  getSnippets, 
  createSnippet, 
  getSnippetById, 
  updateSnippet, 
  deleteSnippet 
} from '../controllers/snippet.controller.js';

const router = Router();

router.get('/', getSnippets);
router.post('/', createSnippet);
router.get('/:id', getSnippetById);     // NUEVO
router.patch('/:id', updateSnippet);    // NUEVO (PATCH es mejor que PUT para actualizaciones parciales)
router.delete('/:id', deleteSnippet);   // NUEVO

export default router;