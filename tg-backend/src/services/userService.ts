import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { createHash, randomInt } from 'crypto';
import UserModel from '../models/User';
import TenantModel from '../models/Tenant';
import sequelize from '../models';
import { validatePasswordStrength } from '../utils/passwordValidation';

class UserService {
  async createAdminWithTenant(data: {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';
  }): Promise<UserModel> {
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    const transaction = await sequelize.transaction();

    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await UserModel.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'admin',
        tenantId: null,
      }, { transaction });

      const tenant = await TenantModel.create({
        ownerUserId: user.id,
        name: data.name,
        status: 'active',
      }, { transaction });

      await user.update({ tenantId: tenant.id }, { transaction });

      await transaction.commit();
      return user;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getAll(tenantId: number): Promise<UserModel[]> {
    return await UserModel.findAll({
      where: { tenantId },
      order: [['createdAt', 'DESC']],
    });
  }

  async getById(id: number, tenantId: number): Promise<UserModel | null> {
    return await UserModel.findOne({ where: { id, tenantId } });
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return await UserModel.findOne({ where: { email } });
  }

  async updateById(id: number, tenantId: number, data: Partial<UserModel>): Promise<UserModel | null> {
    const user = await UserModel.findOne({ where: { id, tenantId } });
    if (!user) return null;
    await user.update(data);
    return user;
  }

  async deleteById(id: number, tenantId: number): Promise<boolean> {
    const user = await UserModel.findOne({ where: { id, tenantId } });
    if (!user) return false;
    await user.destroy();
    return true;
  }

  async restore(id: number, tenantId: number): Promise<UserModel | null> {
    const user = await UserModel.findOne({ where: { id, tenantId }, paranoid: false });
    if (!user || !user.deletedAt) return null;
    await user.restore();
    return user;
  }

  async generatePasswordResetCode(email: string): Promise<{ resetCode: string | null }> {
    const user = await UserModel.findOne({ where: { email } });
    if (!user) return { resetCode: null };

    const resetCode = String(randomInt(0, 1000000)).padStart(6, '0');
    const tokenHash = createHash('sha256').update(resetCode).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await user.update({
      resetPasswordToken: tokenHash,
      resetPasswordExpiresAt: expiresAt,
    });

    return { resetCode };
  }

  async resetPasswordWithCode(email: string, resetCode: string, newPassword: string): Promise<boolean> {
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    const tokenHash = createHash('sha256').update(resetCode).digest('hex');

    const user = await UserModel.findOne({
      where: {
        email,
        resetPasswordToken: tokenHash,
        resetPasswordExpiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!user) return false;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
    });

    return true;
  }
}

export default new UserService();
