import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import sequelize from '.';

class ProductImageModel extends Model<
  InferAttributes<ProductImageModel>,
  InferCreationAttributes<ProductImageModel>
> {
  declare id: CreationOptional<number>;
  declare tenantId: number | null;
  declare productId: number;
  declare imageUrl: string;
  declare sortOrder: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

ProductImageModel.init({
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
  productId: {
    field: 'product_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: { model: 'products', key: 'id' },
  },
  imageUrl: {
    field: 'image_url',
    allowNull: false,
    type: DataTypes.STRING(500),
  },
  sortOrder: {
    field: 'sort_order',
    allowNull: false,
    type: DataTypes.INTEGER,
    defaultValue: 0,
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
  modelName: 'ProductImage',
  tableName: 'product_images',
  timestamps: true,
  paranoid: true,
});

export default ProductImageModel;
