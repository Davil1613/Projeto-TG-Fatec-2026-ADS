import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import sequelize from './index';

class CategoryModel extends Model<
  InferAttributes<CategoryModel>,
  InferCreationAttributes<CategoryModel>
> {
  declare id: CreationOptional<number>;
  declare tenantId: number | null;
  declare name: string;
  declare description: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

CategoryModel.init({
  id: {
    field: 'id',
    allowNull: false,
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tenantId: {
    field: 'tenant_id',
    allowNull: true,
    type: DataTypes.INTEGER,
    references: { model: 'tenants', key: 'id' },
  },
  name: {
    field: 'name',
    allowNull: false,
    type: DataTypes.STRING(80),
    validate: {
      notNull: { msg: 'Category name is required' },
    },
  },
  description: {
    field: 'description',
    allowNull: true,
    type: DataTypes.STRING(255),
  },
  createdAt: {
    field: 'created_at',
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    field: 'updated_at',
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  deletedAt: {
    field: 'deleted_at',
    allowNull: true,
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  timestamps: true,
  paranoid: true,
});

export default CategoryModel;
