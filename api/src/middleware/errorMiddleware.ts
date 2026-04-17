import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod'; // Importamos Zod
import { AppError } from '../utils/AppError.js';

export const globalErrorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  // 1. Si es un error de validación de Zod, lo atrapamos aquí a nivel global
  if (err instanceof z.ZodError) {
    res.status(400).json({
      status: 'error',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // 2. Errores operacionales controlados (AppError)
  if (err instanceof AppError || err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // 3. Errores críticos desconocidos
  console.error('🔥 [CRITICAL ERROR]:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error. Please try again later.',
  });
};