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

// /snippets/...
router.get('/', getSnippets);
router.post('/', createSnippet);
router.get('/:id', getSnippetById);  
router.patch('/:id', updateSnippet); 
router.delete('/:id', deleteSnippet);

export default router;