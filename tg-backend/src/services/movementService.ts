import ProductModel from '../models/Product';
import MovementModel from '../models/Movement';
import sequelize from '../models';

class MovementService {
  async create(tenantId: number, data: any) {
    const transaction = await sequelize.transaction();

    try {
      const product = await ProductModel.findOne({
        where: { id: data.productId, tenantId },
        transaction,
      });
      if (!product) throw new Error('Product not found');

      const quantity = Number(data.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error('Invalid quantity');
      }

      if (data.movementType === 'saida' && product.currentStock < quantity) {
        throw new Error('Insufficient stock');
      }

      const newStock = data.movementType === 'entrada'
        ? product.currentStock + quantity
        : product.currentStock - quantity;

      await product.update({ currentStock: newStock }, { transaction });

      const movement = await MovementModel.create(
        { ...data, tenantId },
        { transaction },
      );

      await transaction.commit();
      return movement;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getAll(tenantId: number) {
    return await MovementModel.findAll({
      where: { tenantId },
      include: [{ model: ProductModel, as: 'product' }],
      order: [['createdAt', 'DESC']],
    });
  }

  async getById(id: number, tenantId: number) {
    return await MovementModel.findOne({
      where: { id, tenantId },
      include: [{ model: ProductModel, as: 'product' }],
    });
  }

  async updateById(id: number, tenantId: number, data: any) {
    const movement = await MovementModel.findOne({ where: { id, tenantId } });
    if (!movement) return null;
    await movement.update(data);
    return movement;
  }

  async deleteById(id: number, tenantId: number) {
    const movement = await MovementModel.findOne({ where: { id, tenantId } });
    if (!movement) return false;
    await movement.destroy();
    return true;
  }
}

export default new MovementService();
