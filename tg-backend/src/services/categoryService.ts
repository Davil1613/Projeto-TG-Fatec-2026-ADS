import CategoryModel from '../models/Category';

class CategoryService {
  async create(tenantId: number, data: { name: string; description?: string | null }) {
    return await CategoryModel.create({ ...data, tenantId });
  }

  async getAll(tenantId: number) {
    return await CategoryModel.findAll({
      where: { tenantId },
      order: [['createdAt', 'DESC']],
    });
  }

  async getById(id: number, tenantId: number) {
    return await CategoryModel.findOne({ where: { id, tenantId } });
  }

  async updateById(id: number, tenantId: number, data: Partial<CategoryModel>) {
    const category = await CategoryModel.findOne({ where: { id, tenantId } });
    if (!category) return null;
    await category.update(data);
    return category;
  }

  async deleteById(id: number, tenantId: number) {
    const category = await CategoryModel.findOne({ where: { id, tenantId } });
    if (!category) return false;
    await category.destroy();
    return true;
  }

  async restore(id: number, tenantId: number) {
    const category = await CategoryModel.findOne({
      where: { id, tenantId },
      paranoid: false,
    });
    if (!category || !category.deletedAt) return null;
    await category.restore();
    return category;
  }
}

export default new CategoryService();
