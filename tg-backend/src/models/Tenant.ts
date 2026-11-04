import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import sequelize from '.';

export type SubscriptionStatus = 'trial' | 'pending' | 'active' | 'past_due' | 'canceled';

class TenantModel extends Model<
  InferAttributes<TenantModel>,
  InferCreationAttributes<TenantModel>
> {
  declare id: CreationOptional<number>;
  declare ownerUserId: number;
  declare name: string;
  declare status: 'active' | 'inactive';
  declare subscriptionStatus: CreationOptional<SubscriptionStatus>;
  declare trialEndsAt: Date | null;
  declare mpPreapprovalId: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

TenantModel.init({
  id: {
    field: 'id',
    allowNull: false,
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ownerUserId: {
    field: 'owner_user_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' },
  },
  name: {
    field: 'name',
    allowNull: false,
    type: DataTypes.STRING(80),
  },
  status: {
    field: 'status',
    allowNull: false,
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  subscriptionStatus: {
    field: 'subscription_status',
    allowNull: false,
    type: DataTypes.ENUM('trial', 'pending', 'active', 'past_due', 'canceled'),
    defaultValue: 'trial',
  },
  trialEndsAt: {
    field: 'trial_ends_at',
    allowNull: true,
    type: DataTypes.DATE,
  },
  mpPreapprovalId: {
    field: 'mp_preapproval_id',
    allowNull: true,
    type: DataTypes.STRING(64),
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
  modelName: 'Tenant',
  tableName: 'tenants',
  timestamps: true,
  paranoid: true,
});

export default TenantModel;
