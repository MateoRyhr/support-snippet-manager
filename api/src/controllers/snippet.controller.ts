// api/src/controllers/snippet.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';

// --- SCHEMAS ---

const createSnippetSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  content: z.string().min(1, "El contenido no puede estar vacío"),
  tags: z.array(z.string()).optional().default([]),
  isPublic: z.boolean().optional().default(false), // Added public flag
  folderId: z.string().uuid().optional().nullable(),
});

const updateSnippetSchema = createSnippetSchema.partial();
const idParamSchema = z.string().uuid("El ID proporcionado no es un UUID válido");

const getSnippetsQuerySchema = z.object({
  tags: z.string().optional(),
  search: z.string().optional(),
});

// --- CONTROLLERS ---

// 1. Get ONLY the snippets belonging to the logged-in user
export const getMySnippets = catchAsync(async (req: Request, res: Response) => {
  const { tags, search } = getSnippetsQuerySchema.parse(req.query);
  const { folderId } = req.query;

  // Security Boundary: Force the query to only look at this user's data
  const whereClause: any = {
    userId: req.user!.id, 
  };

  if (folderId !== undefined) {
    whereClause.folderId = folderId === 'null' ? null : String(folderId);
  }

  if (tags) {
    const tagsArray = tags.split(',').map(tag => tag.trim());
    whereClause.tags = { hasSome: tagsArray };
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

const snippets = await prisma.snippet.findMany({
  where: whereClause,
  orderBy: { createdAt: 'desc' },
  include: { tags: true },
});

  res.status(200).json(snippets);
});

// 2. NEW: Get public snippets for the Community Explorer
// Get all public snippets for the community dashboard
export const getPublicSnippets = catchAsync(async (req: Request, res: Response) => {
  const { tag, search } = req.query;

  // Build the query object
  const query: any = {
    where: {
      isPublic: true,
    },
    include: {
      tags: true,
      author: { // <-- CORREGIDO: Usamos 'author' tal como está en el schema
        select: {
          username: true, // Only show the author's name, keep other data private
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  };

  // Add tag filtering if provided
  if (tag) {
    query.where.tags = {
      some: {
        name: String(tag),
      },
    };
  }

  // Add basic search if provided
  if (search) {
    query.where.OR = [
      { title: { contains: String(search), mode: 'insensitive' } },
      { content: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  const snippets = await prisma.snippet.findMany(query);
  res.status(200).json(snippets);
});

// 3. Create a snippet attached to the user
export const createSnippet = catchAsync(async (req: Request, res: Response) => {
  const validatedData = createSnippetSchema.parse(req.body);
  
  const newSnippet = await prisma.snippet.create({ 
    data: {
      title: validatedData.title,
      content: validatedData.content,
      isPublic: validatedData.isPublic,
      userId: req.user!.id,
      folderId: validatedData.folderId || null,
      // Logic for Many-to-Many relation
      tags: {
        connectOrCreate: validatedData.tags.map((tagName: string) => ({
          where: { name: tagName },
          create: { name: tagName },
        })),
      },
    },
    // We include tags in the response so the frontend receives them immediately
    include: { tags: true }
  });
  
  res.status(201).json(newSnippet);
});

// 4. Get a single snippet (Public or Owned)
export const getSnippetById = catchAsync(async (req: Request, res: Response) => {
  const id = idParamSchema.parse(req.params.id);

  const snippet = await prisma.snippet.findUnique({ where: { id }, include: { tags: true } });
  
  if (!snippet) throw new AppError('Snippet no encontrado', 404);

  // Authorization check: User can only see it if they own it OR if it's public
  if (snippet.userId !== req.user!.id && !snippet.isPublic) {
    throw new AppError('No tienes permiso para ver este snippet', 403);
  }
  
  res.status(200).json(snippet);
});

// 5. Update a snippet (Must be owner)
export const updateSnippet = catchAsync(async (req: Request, res: Response) => {
  const id = idParamSchema.parse(req.params.id);
  const validatedData = updateSnippetSchema.parse(req.body);

  const existingSnippet = await prisma.snippet.findUnique({ where: { id } });
  if (!existingSnippet) throw new AppError('Snippet no encontrado', 404);

  if (existingSnippet.userId !== req.user!.id) {
    throw new AppError('No tienes permiso para editar este snippet', 403);
  }

  const updatedSnippet = await prisma.snippet.update({
    where: { id },
    data: {
      title: validatedData.title,
      content: validatedData.content,
      isPublic: validatedData.isPublic,
      // When updating tags, we use 'set' to replace the old list with the new one
      tags: validatedData.tags ? {
        set: [], // Clear existing relations first
        connectOrCreate: validatedData.tags.map((tagName: string) => ({
          where: { name: tagName },
          create: { name: tagName },
        })),
      } : undefined,
    },
    include: { tags: true }
  });

  res.status(200).json(updatedSnippet);
});

// 6. Delete a snippet (Must be owner)
// api/src/controllers/snippet.controller.ts

export const deleteSnippet = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  // 1. Buscar si el snippet existe
  const existingSnippet = await prisma.snippet.findUnique({ 
    where: { id } 
  });

  if (!existingSnippet) {
    throw new AppError('Snippet no encontrado', 404);
  }

  // 2. Validación de seguridad CRÍTICA: ¿Es el dueño?
  if (existingSnippet.userId !== req.user!.id) {
    throw new AppError('No tienes permiso para eliminar este snippet', 403);
  }

  // 3. Eliminar (Prisma se encarga de limpiar las relaciones Many-to-Many en la tabla intermedia automáticamente)
  await prisma.snippet.delete({ 
    where: { id } 
  });

  // 4. Devolver siempre un JSON, incluso si es un mensaje simple
  res.status(200).json({ message: 'Snippet eliminado exitosamente' });
});