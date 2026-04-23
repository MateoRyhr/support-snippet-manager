// api/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';

// Función auxiliar para firmar el token con tu JWT_PASSWORD
const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_PASSWORD as string, {
    expiresIn: '7d', // El token expira en 7 días
  });
};

export const register = catchAsync(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  // 1. Verificar si el usuario ya existe (por email o username)
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existingUser) {
    throw new AppError('El email o nombre de usuario ya está en uso', 400);
  }

  // 2. Hashear la contraseña con bcrypt (12 rondas de salting)
  const hashedPassword = await bcrypt.hash(password, 12);

  // 3. Crear el usuario en PostgreSQL
  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  // 4. Generar Token
  const token = generateToken(newUser.id);

  // 5. Devolver respuesta exitosa (NUNCA devolver el password hash)
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Buscar usuario por su correo
  const user = await prisma.user.findUnique({ where: { email } });

  // 2. Verificar existencia y comparar contraseña con el hash
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Credenciales incorrectas', 401);
  }

  // 3. Generar token
  const token = generateToken(user.id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    },
  });
});