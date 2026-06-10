import {
  CreationAttributes,
  FindOptions,
  Includeable,
  Model,
  ModelStatic,
  Op,
  Transaction,
} from 'sequelize';
import { FilterProcessor } from '../utils/FilterProcessor';
import NotFoundError from '../errors/NotFoundError';

class Services<T extends Model> {
  protected model: ModelStatic<T>;
  protected filterProcessor: FilterProcessor<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
    this.filterProcessor = new FilterProcessor<T>(model);
  }

  getModelAttributes() {
    return this.model.getAttributes();
  }

  async create(data: CreationAttributes<T>, transaction?: Transaction) {
    const ownTransaction = !transaction;
    const t = transaction || await this.model.sequelize!.transaction();

    try {
      const result = await this.model.create(data, { transaction });

      if (ownTransaction) await t.commit();

      return result;
    } catch (error) {
      if (ownTransaction) await t.rollback();
      throw error;
    }
  }

  async getAll(
    page: number,
    pageSize: number,
    include: Includeable[] = [],
    exclude: string[] = [],
    filters?: any,
    onlyInactive?: boolean,
    order: string[] = ['id:ASC'],
  ) {
    const {
      processedInclude,
      mainWhere,
      mainOrder,
    } = this.filterProcessor.processFilters(include, filters, order);

    const options: FindOptions = {
      attributes: { exclude },
      include: processedInclude,
      where: mainWhere,
      order: mainOrder,
      offset: (page - 1) * pageSize,
      limit: pageSize,
    };

    if (onlyInactive) {
      options.paranoid = false;
      options.where = {
        ...options.where,
        deletedAt: { [Op.ne]: null },
      };
    }

    return await this.model.findAll(options);
  }

  async getById(
    id: number,
    include: Includeable[] = [],
    exclude: string[] = [],
  ) {
    return await this.model.findByPk(id, {
      attributes: { exclude: exclude },
      include: include,
      paranoid: false,
    });
  }

  async updateById(
    id: number,
    data: CreationAttributes<T>,
    transaction?: Transaction,
  ) {
    const ownTransaction = !transaction;
    const t = transaction || await this.model.sequelize!.transaction();

    try {
      const exclude = Object.keys(this.model.getAttributes())
        .filter((column) => column !== 'id');

      const register = await this.getById(id, [], exclude);

      if (!register) throw new NotFoundError('Register not found');

      await register.update(data, { transaction });

      if (ownTransaction) await t.commit();
    } catch (error) {
      if (ownTransaction) await t.rollback();
      throw error;
    }
  }

  async deleteById(id: number) {
    try {
      const register = await this.getById(id);
      
      if (!register) return false;
      
      await register.destroy();
      
      return true;
    } catch {
      return false;
    }
  }

  async restore(id: number) {
    const register = await this.model.findByPk(id, { paranoid: false });

    if (!register) return false;

    await register.restore();
    
    return true;
  }
}

export default Services;
