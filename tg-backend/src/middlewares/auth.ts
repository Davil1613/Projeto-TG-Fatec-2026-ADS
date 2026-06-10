import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUser } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token não informado.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    if (!decoded?.id || !decoded?.tenantId) {
      return res.status(401).json({ error: 'Token inválido.' });
    }

    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores.' });
  }

  return next();
}
