import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import sequelize from '.';

class AuditLogModel extends Model<
  InferAttributes<AuditLogModel>,
  InferCreationAttributes<AuditLogModel>
> {
  declare id: CreationOptional<number>;
  declare tenantId: number | null;
  declare userId: number | null;
  declare action: string;
  declare entity: string;
  declare entityId: number | null;
  declare description: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AuditLogModel.init({
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
  userId: {
    field: 'user_id',
    allowNull: true,
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' },
  },
  action: {
    field: 'action',
    allowNull: false,
    type: DataTypes.STRING(40),
  },
  entity: {
    field: 'entity',
    allowNull: false,
    type: DataTypes.STRING(40),
  },
  entityId: {
    field: 'entity_id',
    allowNull: true,
    type: DataTypes.INTEGER,
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
}, {
  sequelize,
  modelName: 'AuditLog',
  tableName: 'audit_logs',
  timestamps: true,
});

export default AuditLogModel;
