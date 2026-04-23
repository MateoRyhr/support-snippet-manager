// api/src/middleware/requireAuth.ts
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

// Define the expected structure of our JWT payload
interface JwtPayload {
  id: string;
}

// Extend the Express Request interface globally to include our user object
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
      };
    }
  }
}

export const requireAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1. Extract the token from the Authorization header
  let token: string | undefined;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('You are not logged in. Please log in to access this resource.', 401);
  }

  // 2. Verify the token signature and expiration
  // We use 'as JwtPayload' to instruct TypeScript about the decoded object structure
  const decoded = jwt.verify(token, process.env.JWT_PASSWORD as string) as JwtPayload;

  // 3. Check if the user still exists in the database
  // Using 'select' ensures we don't accidentally pull the password hash into memory
  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { 
      id: true, 
      username: true, 
      email: true 
    },
  });

  if (!currentUser) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }

  // 4. Attach the safe user object to the request and proceed
  req.user = currentUser;
  next();
});