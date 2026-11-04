import ProductModel from '../models/Product';
import MovementModel from '../models/Movement';
import sequelize from '../models';
import BaseError from '../errors/BaseError';
import NotFoundError from '../errors/NotFoundError';

class MovementService {
  async create(tenantId: number, data: any) {
    const quantity = Number(data.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BaseError('A quantidade deve ser um número inteiro maior que zero.', 400);
    }

    if (data.movementType !== 'entrada' && data.movementType !== 'saida') {
      throw new BaseError('Tipo de movimentação inválido. Use entrada ou saida.', 400);
    }

    const transaction = await sequelize.transaction();

    try {
      // SELECT ... FOR UPDATE: baixas simultâneas do mesmo produto esperam a anterior confirmar (RN010)
      const product = await ProductModel.findOne({
        where: { id: data.productId, tenantId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!product) throw new NotFoundError('Produto não encontrado.');

      if (data.movementType === 'saida' && product.currentStock < quantity) {
        throw new BaseError(
          `Estoque insuficiente. Disponível: ${product.currentStock} unidade(s).`,
          409,
        );
      }

      const newStock = data.movementType === 'entrada'
        ? product.currentStock + quantity
        : product.currentStock - quantity;

      await product.update({ currentStock: newStock }, { transaction });

      const movement = await MovementModel.create(
        {
          productId: product.id,
          movementType: data.movementType,
          quantity,
          notes: data.notes ?? null,
          tenantId,
        },
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
}

export default new MovementService();
