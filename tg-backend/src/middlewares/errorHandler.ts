import { NextFunction, Request, Response } from 'express';
import BaseError from '../errors/BaseError';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof BaseError) {
    return err.sendResponse(res);
  }

  if (err?.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path;
    const message = field === 'email'
      ? 'Este e-mail já está cadastrado.'
      : field === 'sku'
        ? 'Já existe um produto com este SKU.'
        : 'Registro duplicado.';
    return new BaseError(message, 409).sendResponse(res);
  }

  if (err?.name === 'SequelizeValidationError') {
    return new BaseError(err.errors?.[0]?.message || 'Dados inválidos.', 400).sendResponse(res);
  }

  console.error(err);
  return new BaseError('Erro interno do servidor.', 500).sendResponse(res);
}
