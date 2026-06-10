import CategoryModel from './Category';
import ProductModel from './Product';
import ProductImageModel from './ProductImage';
import AuditLogModel from './AuditLog';
import MovementModel from './Movement';
import TenantModel from './Tenant';
import UserModel from './User';

export const initializeAssociations = () => {
  TenantModel.hasMany(UserModel, {
    foreignKey: 'tenantId',
    as: 'users',
  });
  UserModel.belongsTo(TenantModel, {
    foreignKey: 'tenantId',
    as: 'tenant',
  });

  TenantModel.belongsTo(UserModel, {
    foreignKey: 'ownerUserId',
    as: 'owner',
  });

  TenantModel.hasMany(CategoryModel, {
    foreignKey: 'tenantId',
    as: 'categories',
  });
  CategoryModel.belongsTo(TenantModel, {
    foreignKey: 'tenantId',
    as: 'tenant',
  });

  TenantModel.hasMany(ProductModel, {
    foreignKey: 'tenantId',
    as: 'products',
  });
  ProductModel.belongsTo(TenantModel, {
    foreignKey: 'tenantId',
    as: 'tenant',
  });

  TenantModel.hasMany(MovementModel, {
    foreignKey: 'tenantId',
    as: 'movements',
  });
  MovementModel.belongsTo(TenantModel, {
    foreignKey: 'tenantId',
    as: 'tenant',
  });

  CategoryModel.hasMany(ProductModel, {
    foreignKey: 'categoryId',
    as: 'products',
  });
  ProductModel.belongsTo(CategoryModel, {
    foreignKey: 'categoryId',
    as: 'category',
  });

  ProductModel.hasMany(MovementModel, {
    foreignKey: 'productId',
    as: 'movements',
  });
  MovementModel.belongsTo(ProductModel, {
    foreignKey: 'productId',
    as: 'product',
  });

  ProductModel.hasMany(ProductImageModel, {
    foreignKey: 'productId',
    as: 'images',
  });
  ProductImageModel.belongsTo(ProductModel, {
    foreignKey: 'productId',
    as: 'product',
  });

  TenantModel.hasMany(ProductImageModel, {
    foreignKey: 'tenantId',
    as: 'productImages',
  });
  ProductImageModel.belongsTo(TenantModel, {
    foreignKey: 'tenantId',
    as: 'tenant',
  });

  TenantModel.hasMany(AuditLogModel, {
    foreignKey: 'tenantId',
    as: 'auditLogs',
  });
  AuditLogModel.belongsTo(TenantModel, {
    foreignKey: 'tenantId',
    as: 'tenant',
  });

  UserModel.hasMany(AuditLogModel, {
    foreignKey: 'userId',
    as: 'auditLogs',
  });
  AuditLogModel.belongsTo(UserModel, {
    foreignKey: 'userId',
    as: 'user',
  });
};
