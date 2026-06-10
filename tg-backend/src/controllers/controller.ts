import { CreationAttributes, Includeable, Model } from 'sequelize';
import { NextFunction, Request, Response } from 'express';
import NotFoundError from '../errors/NotFoundError';
import Services from '../services/Services';

class Controller<T extends Model> {
  constructor(protected readonly service: Services<T>) { }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const createData: CreationAttributes<T> = req.body;
      await this.service.create(createData);

      res.status(201).send();
    } catch (error) {
      next(error);
    }
  }

  async getAll(
    req: Request,
    res: Response,
    next: NextFunction,
    include?: Includeable[],
    exclude?: string[],
  ) {
    try {
      const {
        page = '1',
        pageSize = '1000',
        onlyInactive = 'false',
        order = 'id:ASC',
        ...filters
      } = req.query;

      const pageNumber = parseInt(page as string);
      const pageSizeNumber = parseInt(pageSize as string);
      const showOnlyInactive = onlyInactive === 'true';
      const orderParam: string[] = Array.isArray(order)
        ? (order as string[])
        : (order as string).split(',').map(s => s.trim());

      const registers = await this.service.getAll(
        pageNumber,
        pageSizeNumber,
        include,
        exclude,
        filters,
        showOnlyInactive,
        orderParam,
      );

      if (!registers.length) throw new NotFoundError('No registers found');

      res.status(200).send(registers);
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
    include?: Includeable[],
    exclude?: string[],
  ) {
    try {
      const id = Number(req.params.id);
      const register = await this.service.getById(id, include, exclude);

      if (!register) throw new NotFoundError('Register not found');

      res.status(200).send(register);
    } catch (error) {
      next(error);
    }
  }

  async updateById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data: CreationAttributes<T> = req.body;

      await this.service.updateById(id, data);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await this.service.deleteById(id);

      if (!result) throw new NotFoundError('Register not found');

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
  
  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await this.service.restore(id);

      if (!result) throw new NotFoundError('Register not found');

      res.status(200).send({ message: 'Register restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default Controller;
