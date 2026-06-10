import {
  Includeable,
  Model,
  ModelStatic,
  Op,
  OrderItem,
  WhereOptions,
} from 'sequelize';
import { cloneDeep } from 'lodash';

export class FilterProcessor<T extends Model> {
  private modelAttributes;

  constructor(model: ModelStatic<T>) {
    this.modelAttributes = model.getAttributes();
  }

  private applyDateFilter(key: string, value: string): WhereOptions {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (datePattern.test(value)) {
      const startDate = new Date(`${value}T00:00:00.000Z`);
      const endDate = new Date(`${value}T23:59:59.999Z`);

      return { [key]: { [Op.gte]: startDate, [Op.lte]: endDate }};
    } else {
      throw new Error('Invalid date format. Use YYYY-MM-DD format.');
    }
  }

  private applyFilter(
    key: string,
    value: unknown,
    attrType: string,
    isExact: boolean,
    isNull: boolean,
    isNotNull: boolean,
    isIn: boolean,
  ): WhereOptions {
    const dateField = ['DATE', 'DATEONLY', 'DATETIME', 'TIMESTAMP'];
    const isDateField = dateField.includes(attrType);

    if (isDateField && typeof value === 'string' && !isExact) {
      return this.applyDateFilter(key, value);
    }

    if (isExact) {
      return { [key]: value };
    }

    if (isNull) {
      return { [key]: { [Op.is]: null } };
    }

    if (isNotNull) {
      return { [key]: { [Op.not]: null } };
    }

    if (isIn) {
      const arr = (typeof value === 'string')
        ? value.split(',').map(v => v.trim())
        : value;
      return { [key]: { [Op.in]: arr } };
    }

    if (!key.includes('.')) {
      return { [key]: { [Op.like]: `%${value}%` } };
    }

    return { [key]: value };
  }

  verifyQueryFilters(
    key: string,
    value: unknown,
    attributes: any,
  ): WhereOptions | void {
    const isExact = key.endsWith(':exact');
    const isNull = key.endsWith(':null');
    const isNotNull = key.endsWith(':notnull');
    const isRelationalFilter = key.includes('.');
    const isIn = key.endsWith(':in');

    const actualKey = key
      .replace(':exact', '')
      .replace(':null', '')
      .replace(':notnull', '')
      .replace(':in', '');

    const attributesKeys = Object.keys(attributes);

    if (isRelationalFilter || attributesKeys.includes(actualKey)) {
      const attrType = isRelationalFilter
        ? 'STRING'
        : attributes[actualKey].type.constructor.name;

      return this
        .applyFilter(
          actualKey,
          value,
          attrType,
          isExact,
          isNull,
          isNotNull,
          isIn,
        );
    }
  }

  processOrder(order: string[]): OrderItem[] {
    return order.map((item) => {
      const [key, direction] = item.split(':');
      return [key, direction?.toUpperCase() || 'ASC'];
    });
  }

  private applyRelationalFilter(
    include: Includeable[],
    path: string,
    value: unknown,
  ): void {
    const [association, key] = path.split('.');

    for (const i in include) {
      const inc = include[Number(i)];

      if (
        typeof inc === 'object'
        && 'association' in inc
        && inc.association === association
      ) {
        if (typeof inc === 'object' && 'model' in inc && inc.model) {
          const attributes = (inc.model as ModelStatic<Model>).getAttributes();

          const where = this.verifyQueryFilters(key, value, attributes);

          if (where) {
            inc.where = inc.where || {};
            Object.assign(inc.where, where);
          }
        }
      } else if (
        typeof inc === 'object'
        && 'include' in inc
        && inc.include
      ) {
        this.applyRelationalFilter(inc.include, path, value);
      }
    };
  }

  processFilters(
    include: Includeable[],
    where?: WhereOptions,
    order: string[] = ['id:ASC'],
  ): {
      processedInclude: Includeable[],
      mainWhere: WhereOptions,
      mainOrder: OrderItem[]
    } {
    const mainOrder = this.processOrder(order);

    if (!where) return { processedInclude: include, mainWhere: {}, mainOrder };

    const processedInclude = cloneDeep(include);
    const mainWhere: WhereOptions = {};

    Object.entries(where).forEach(([key, value]) => {
      if (!key.includes('.')) {
        const filterResult = this
          .verifyQueryFilters(key, value, this.modelAttributes);

        Object.assign(mainWhere, filterResult);
      } else {
        this.applyRelationalFilter(processedInclude, key, value);
      }
    });

    return { processedInclude, mainWhere, mainOrder};
  }
}
