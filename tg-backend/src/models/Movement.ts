import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import sequelize from '.';

class MovementModel extends Model<
  InferAttributes<MovementModel>,
  InferCreationAttributes<MovementModel>
> {
  declare id: CreationOptional<number>;
  declare tenantId: number | null;
  declare productId: number;
  declare movementType: 'entrada' | 'saida';
  declare quantity: number;
  declare notes: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

MovementModel.init({
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
  movementType: {
    field: 'movement_type',
    allowNull: false,
    type: DataTypes.ENUM('entrada', 'saida'),
  },
  quantity: {
    field: 'quantity',
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  notes: {
    field: 'notes',
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
  modelName: 'Movement',
  tableName: 'stock_movements',
  timestamps: true,
  paranoid: true,
});

export default MovementModel;
