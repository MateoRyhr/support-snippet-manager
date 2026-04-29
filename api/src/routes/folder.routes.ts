import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  createFolder,
  getMyFolders,
  updateFolder,
  deleteFolder
} from '../controllers/folder.controller.js';

const router = Router();

// Todas las rutas de carpetas requieren estar autenticado
router.use(requireAuth);

router.post('/', createFolder);
router.get('/', getMyFolders);
router.delete('/:id', deleteFolder);
// Importa updateFolder arriba...
router.put('/:id', updateFolder);

export default router;