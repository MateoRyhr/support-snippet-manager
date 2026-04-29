import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { z } from 'zod';

// Esquema de validación
const createFolderSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo'),
});

export const createFolder = catchAsync(async (req: Request, res: Response) => {
  const { name } = createFolderSchema.parse(req.body);
  const userId = req.user!.id;

  // Validación: Evitar carpetas duplicadas para el mismo usuario
  const existingFolder = await prisma.folder.findFirst({
    where: { name, userId }
  });

  if (existingFolder) {
    throw new AppError('Ya tienes una carpeta con este nombre', 400);
  }

  const newFolder = await prisma.folder.create({
    data: { name, userId }
  });

  res.status(201).json(newFolder);
});

export const getMyFolders = catchAsync(async (req: Request, res: Response) => {
  const folders = await prisma.folder.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    // 🔥 Toque Senior: Le pedimos a Prisma que nos devuelva el conteo de snippets
    include: {
      _count: {
        select: { snippets: true }
      }
    }
  });

  res.status(200).json(folders);
});

export const deleteFolder = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const folder = await prisma.folder.findUnique({ where: { id } });

  if (!folder) throw new AppError('Carpeta no encontrada', 404);
  if (folder.userId !== req.user!.id) throw new AppError('No tienes permiso para eliminar esta carpeta', 403);

  // Execute a database transaction to ensure both operations succeed or fail together
  await prisma.$transaction([
    // 1. Delete all snippets that belong to this folder
    prisma.snippet.deleteMany({ 
      where: { folderId: id } 
    }),
    
    // 2. Delete the folder itself
    prisma.folder.delete({ 
      where: { id } 
    })
  ]);

  res.status(200).json({ message: 'Folder and all its snippets deleted successfully' });
});

// Asegúrate de exportarlo junto a los demás
export const updateFolder = catchAsync(async (req: Request, res: Response) => {
  // Reutilizamos el esquema que ya tenías para crear
  const { name } = createFolderSchema.parse(req.body);
  const id = req.params.id as string;
  const userId = req.user!.id;

  const folder = await prisma.folder.findUnique({ where: { id } });

  if (!folder) throw new AppError('Carpeta no encontrada', 404);
  if (folder.userId !== userId) throw new AppError('No tienes permiso', 403);

  // Verificamos que no exista OTRA carpeta con el mismo nombre
  const existingFolder = await prisma.folder.findFirst({
    where: { name, userId, id: { not: id } }
  });

  if (existingFolder) {
    throw new AppError('Ya tienes otra carpeta con este nombre', 400);
  }

  const updatedFolder = await prisma.folder.update({
    where: { id },
    data: { name }
  });

  res.status(200).json(updatedFolder);
});