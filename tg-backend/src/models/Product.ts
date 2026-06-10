import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import sequelize from '.';
import CategoryModel from './Category';

class ProductModel extends Model<
  InferAttributes<ProductModel>,
  InferCreationAttributes<ProductModel>
> {
  declare id: CreationOptional<number>;
  declare tenantId: number | null;
  declare categoryId: number;
  declare name: string;
  declare sku: string;
  declare description: string | null;
  declare salePrice: number;
  declare costPrice: number;
  declare currentStock: number;
  declare minStock: number;
  declare imageUrl: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

ProductModel.init({
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
  categoryId: {
    field: 'category_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: { model: 'categories', key: 'id' },
  },
  name: {
    field: 'name',
    allowNull: false,
    type: DataTypes.STRING(80),
  },
  sku: {
    field: 'sku',
    allowNull: false,
    type: DataTypes.STRING(40),
    unique: true,
  },
  description: {
    field: 'description',
    allowNull: true,
    type: DataTypes.STRING(255),
  },
  salePrice: {
    field: 'sale_price',
    allowNull: false,
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 0,
  },
  costPrice: {
    field: 'cost_price',
    allowNull: false,
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 0,
  },
  currentStock: {
    field: 'current_stock',
    allowNull: false,
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  minStock: {
    field: 'min_stock',
    allowNull: false,
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  imageUrl: {
    field: 'image_url',
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
  modelName: 'Product',
  tableName: 'products',
  timestamps: true,
  paranoid: true,
});

export default ProductModel;
