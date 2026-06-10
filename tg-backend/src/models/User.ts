import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import sequelize from '.';

class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  declare id: CreationOptional<number>;
  declare tenantId: number | null;
  declare name: string;
  declare email: string;
  declare password: string;
  declare resetPasswordToken: string | null;
  declare resetPasswordExpiresAt: Date | null;
  declare role: 'admin' | 'user';
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

UserModel.init({
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
  },
  email: {
    field: 'email',
    allowNull: false,
    type: DataTypes.STRING(120),
    unique: true,
  },
  password: {
    field: 'password',
    allowNull: false,
    type: DataTypes.STRING(255),
  },
  resetPasswordToken: {
    field: 'reset_password_token',
    allowNull: true,
    type: DataTypes.STRING(255),
  },
  resetPasswordExpiresAt: {
    field: 'reset_password_expires_at',
    allowNull: true,
    type: DataTypes.DATE,
  },
  role: {
    field: 'role',
    allowNull: false,
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user',
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
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  paranoid: true,
});

export default UserModel;
