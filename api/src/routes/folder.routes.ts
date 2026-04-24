import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  createFolder,
  getMyFolders,
  deleteFolder
} from '../controllers/folder.controller.js';

const router = Router();

// Todas las rutas de carpetas requieren estar autenticado
router.use(requireAuth);

router.post('/', createFolder);
router.get('/', getMyFolders);
router.delete('/:id', deleteFolder);

export default router;