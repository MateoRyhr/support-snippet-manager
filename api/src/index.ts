import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
// Nuevas importaciones para Prisma 7+
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- INICIALIZACIÓN DE PRISMA 7+ ---
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running beautifully' });
});

// --- VALIDACIONES CON ZOD ---
// Definimos cómo DEBE lucir la petición del cliente
const createSnippetSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  content: z.string().min(1, "El contenido no puede estar vacío"),
  tags: z.array(z.string()).optional().default([]),
});

// --- RUTAS DE SNIPPETS ---
// Crear un nuevo Snippet
app.post('/snippets', async (req, res) => {
  try {
    // 1. Validamos el body con Zod
    const validatedData = createSnippetSchema.parse(req.body);

    // 2. Si pasa la validación, guardamos en la base de datos con Prisma
    const newSnippet = await prisma.snippet.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        tags: validatedData.tags,
      },
    });

    // 3. Devolvemos el registro creado
    res.status(201).json(newSnippet);

  } catch (error) {
    // Zod arroja un error específico si falla la validación
    if (error instanceof z.ZodError) {
       res.status(400).json({ errors: error.errors });
       return;
    }
    // Para errores generales del servidor
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});