// api/src/controllers/snippet.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';

const createSnippetSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  content: z.string().min(1, "El contenido no puede estar vacío"),
  tags: z.array(z.string()).optional().default([]),
});

// Zod schema para actualizar (todos los campos son opcionales usando .partial())
const updateSnippetSchema = createSnippetSchema.partial();
const idParamSchema = z.uuid("El ID proporcionado no es un UUID válido");

// 1. Actualizamos el esquema para aceptar 'search'
const getSnippetsQuerySchema = z.object({
  tags: z.string().optional(),
  search: z.string().optional(), // NUEVO: Parámetro para texto libre
});

export const getSnippets = catchAsync(async (req: Request, res: Response) => {
  // Extraemos ambos parámetros
  const { tags, search } = getSnippetsQuerySchema.parse(req.query);

  const whereClause: any = {};

  // Filtro 1: Por Tags (El que ya teníamos)
  if (tags) {
    const tagsArray = tags.split(',').map(tag => tag.trim());
    whereClause.tags = {
      hasSome: tagsArray,
    };
  }

  // Filtro 2: Por Texto Libre (NUEVO)
  if (search) {
    whereClause.OR = [
      {
        title: {
          contains: search,
          mode: 'insensitive', // Ignora mayúsculas y minúsculas (Ej: 'Hola' == 'hola')
        },
      },
      {
        content: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  // Buscamos en la base de datos
  const snippets = await prisma.snippet.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json(snippets);
});

export const createSnippet = catchAsync(async (req: Request, res: Response) => {
  const validatedData = createSnippetSchema.parse(req.body);
  const newSnippet = await prisma.snippet.create({ data: validatedData });
  res.status(201).json(newSnippet);
});

export const getSnippetById = catchAsync(async (req: Request, res: Response) => {
  // 2. Zod extrae el ID, valida que sea UUID y le garantiza a TypeScript que es un string
  const id = idParamSchema.parse(req.params.id);

  const snippet = await prisma.snippet.findUnique({ where: { id } });
  
  if (!snippet) throw new AppError('Snippet no encontrado', 404);
  
  res.status(200).json(snippet);
});

export const updateSnippet = catchAsync(async (req: Request, res: Response) => {
  const id = idParamSchema.parse(req.params.id); // Validación Zod
  const validatedData = updateSnippetSchema.parse(req.body);

  const existingSnippet = await prisma.snippet.findUnique({ where: { id } });
  if (!existingSnippet) throw new AppError('Snippet no encontrado', 404);

  const updatedSnippet = await prisma.snippet.update({
    where: { id },
    data: validatedData,
  });

  res.status(200).json(updatedSnippet);
});

export const deleteSnippet = catchAsync(async (req: Request, res: Response) => {
  const id = idParamSchema.parse(req.params.id); // Validación Zod

  const existingSnippet = await prisma.snippet.findUnique({ where: { id } });
  if (!existingSnippet) throw new AppError('Snippet no encontrado', 404);

  await prisma.snippet.delete({ where: { id } });

  res.status(204).send();
});