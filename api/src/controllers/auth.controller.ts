// api/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // <-- IMPORTANTE: Agregado
import { prisma } from '../lib/prisma.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { sendVerificationEmail } from '../services/email.js';

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

  // 3. Generar token de verificación y fecha de expiración (24 horas)
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // 4. Crear el usuario con el token y isVerified: false
  const newUser = await prisma.user.create({
    data: {
      email,     // <-- LIMPIEZA: Usamos las variables desestructuradas
      username,  // <-- LIMPIEZA
      password: hashedPassword,
      isVerified: false,
      verificationToken: verificationToken,
      verificationTokenExpires: tokenExpires,
    },
  });

  // 5. Enviar el email asincrónicamente
  try {
    await sendVerificationEmail(newUser.email, verificationToken);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Opcional: Podrías eliminar el usuario aquí si quieres forzar que el email funcione sí o sí
  }

  // 6. Responder al frontend
  res.status(201).json({
    message: 'Registration successful. Please check your email to verify your account.',
  });
});

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const token = (req.query.token as string) || req.body.token;

  if (!token) {
    throw new AppError('Token de verificación no proporcionado', 400);
  }

  // 1. Buscar al usuario con ese token que NO haya expirado
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpires: {
        gt: new Date(), // "gt" significa "greater than" (mayor que ahora)
      },
    },
  });

  if (!user) {
    throw new AppError('El enlace de verificación es inválido o ha expirado', 400);
  }

  // 2. Actualizar el usuario: marcar como verificado y limpiar los campos del token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  // 3. Generar el JWT para loguearlo automáticamente (Mejor UX)
  const jwtToken = generateToken(user.id);

  // 4. Responder al frontend
  res.status(200).json({
    message: 'Email verificado exitosamente',
    token: jwtToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    }
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Verificar que vengan los datos
  if (!email || !password) {
    throw new AppError('Por favor proporciona email y contraseña', 400);
  }

  // 2. Buscar al usuario en la base de datos (puedes adaptarlo para aceptar username también si lo prefieres)
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // 3. Si no existe o la contraseña es incorrecta (se evalúan juntas por seguridad)
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Credenciales incorrectas', 401);
  }

  // 4. ¡LA REGLA DE ORO! Verificar si el email fue confirmado
  if (!user.isVerified) {
    throw new AppError('Por favor verifica tu correo electrónico antes de iniciar sesión', 403);
  }

  // 5. Generar el JWT
  const jwtToken = generateToken(user.id);

  // 6. Responder con el token y datos básicos del usuario
  res.status(200).json({
    status: 'success',
    token: jwtToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
});