import CategoryModel from '../models/Category';
import ProductModel from '../models/Product';
import ProductImageModel from '../models/ProductImage';
import NotFoundError from '../errors/NotFoundError';

function normalizeImageUrls(data: any) {
  const urls = Array.isArray(data.imageUrls)
    ? data.imageUrls
    : Array.isArray(data.images)
      ? data.images.map((image: any) => image?.imageUrl || image?.url)
      : [];

  return [...urls, data.imageUrl]
    .filter((url) => typeof url === 'string' && url.trim())
    .map((url) => url.trim())
    .filter((url, index, all) => all.indexOf(url) === index);
}

function getProductPayload(data: any) {
  const { imageUrls: _imageUrls, images: _images, ...productData } = data;
  return productData;
}

class ProductService {
  private include = [
    { model: CategoryModel, as: 'category' },
    { model: ProductImageModel, as: 'images' },
  ];

  private async syncImages(productId: number, tenantId: number, imageUrls: string[]) {
    await ProductImageModel.destroy({ where: { productId, tenantId } });

    if (!imageUrls.length) return;

    await ProductImageModel.bulkCreate(
      imageUrls.map((imageUrl, index) => ({
        productId,
        tenantId,
        imageUrl,
        sortOrder: index,
      })),
    );
  }

  async getAll(tenantId: number) {
    return await ProductModel.findAll({
      where: { tenantId },
      include: this.include,
      order: [
        ['createdAt', 'DESC'],
        [{ model: ProductImageModel, as: 'images' }, 'sortOrder', 'ASC'],
      ],
    });
  }

  async getById(id: number, tenantId: number) {
    return await ProductModel.findOne({
      where: { id, tenantId },
      include: this.include,
      order: [[{ model: ProductImageModel, as: 'images' }, 'sortOrder', 'ASC']],
    });
  }

  async create(tenantId: number, data: any) {
    const category = await CategoryModel.findOne({
      where: { id: data.categoryId, tenantId },
    });
    if (!category) throw new NotFoundError('Categoria não encontrada.');

    const imageUrls = normalizeImageUrls(data);
    const product = await ProductModel.create({
      ...getProductPayload(data),
      imageUrl: imageUrls[0] || null,
      tenantId,
    });

    await this.syncImages(product.id, tenantId, imageUrls);
    return await this.getById(product.id, tenantId);
  }

  async updateById(id: number, tenantId: number, data: any) {
    const product = await ProductModel.findOne({ where: { id, tenantId } });
    if (!product) return null;

    if (data.categoryId) {
      const category = await CategoryModel.findOne({
        where: { id: data.categoryId, tenantId },
      });
      if (!category) throw new NotFoundError('Categoria não encontrada.');
    }

    const imageUrls = normalizeImageUrls(data);
    await product.update({
      ...getProductPayload(data),
      imageUrl: imageUrls[0] || null,
    });
    await this.syncImages(product.id, tenantId, imageUrls);

    return await this.getById(product.id, tenantId);
  }

  async deleteById(id: number, tenantId: number) {
    const product = await ProductModel.findOne({ where: { id, tenantId } });
    if (!product) return false;
    await product.destroy();
    return true;
  }

  async restore(id: number, tenantId: number) {
    const product = await ProductModel.findOne({
      where: { id, tenantId },
      paranoid: false,
    });
    if (!product || !product.deletedAt) return null;
    await product.restore();
    return product;
  }
}

export default new ProductService();
