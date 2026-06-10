import { Router } from 'express';
import ProductController from '../controllers/productController';
import { authenticateToken } from '../middlewares/auth';

const productRouter = Router();
productRouter.use(authenticateToken);

/**
* @swagger
* components:
*   schemas:
*     Product:
*       type: object
*       properties:
*         id:
*           type: integer
*           description: ID do produto
*           example: 1
*         categoryId:
*           type: integer
*           description: ID da categoria
*           example: 2
*         name:
*           type: string
*           description: Nome do produto
*           example: "Camisa Polo"
*         sku:
*           type: string
*           description: Código SKU do produto
*           example: "SKU12345"
*         description:
*           type: string
*           description: Descrição do produto
*           example: "Camisa de algodão"
*         salePrice:
*           type: number
*           format: float
*           description: Preço de venda
*           example: 49.99
*         costPrice:
*           type: number
*           format: float
*           description: Preço de custo
*           example: 30.00
*         currentStock:
*           type: integer
*           description: Estoque atual
*           example: 100
*         minStock:
*           type: integer
*           description: Estoque mínimo
*           example: 10
*         imageUrl:
*           type: string
*           description: URL da imagem
*           example: "https://site.com/imagem.jpg"
*         createdAt:
*           type: string
*           format: date-time
*           description: Data de criação
*         updatedAt:
*           type: string
*           format: date-time
*           description: Data de atualização
*         deletedAt:
*           type: string
*           format: date-time
*           nullable: true
*           description: Data de exclusão
*       required:
*         - id
*         - categoryId
*         - name
*         - sku
*         - salePrice
*         - costPrice
*         - currentStock
*         - minStock
*     ProductCreate:
*       type: object
*       properties:
*         categoryId:
*           type: integer
*           description: ID da categoria
*           example: 2
*         name:
*           type: string
*           description: Nome do produto
*           example: "Camisa Polo"
*         sku:
*           type: string
*           description: Código SKU do produto
*           example: "SKU12345"
*         description:
*           type: string
*           description: Descrição do produto
*           example: "Camisa de algodão"
*         salePrice:
*           type: number
*           format: float
*           description: Preço de venda
*           example: 49.99
*         costPrice:
*           type: number
*           format: float
*           description: Preço de custo
*           example: 30.00
*         currentStock:
*           type: integer
*           description: Estoque atual
*           example: 100
*         minStock:
*           type: integer
*           description: Estoque mínimo
*           example: 10
*         imageUrl:
*           type: string
*           description: URL da imagem
*           example: "https://site.com/imagem.jpg"
*       required:
*         - categoryId
*         - name
*         - sku
*         - salePrice
*         - costPrice
*         - currentStock
*         - minStock
*     ProductUpdate:
*       type: object
*       properties:
*         categoryId:
*           type: integer
*           description: ID da categoria
*           example: 2
*         name:
*           type: string
*           description: Nome do produto
*           example: "Camisa Polo"
*         sku:
*           type: string
*           description: Código SKU do produto
*           example: "SKU12345"
*         description:
*           type: string
*           description: Descrição do produto
*           example: "Camisa de algodão"
*         salePrice:
*           type: number
*           format: float
*           description: Preço de venda
*           example: 49.99
*         costPrice:
*           type: number
*           format: float
*           description: Preço de custo
*           example: 30.00
*         currentStock:
*           type: integer
*           description: Estoque atual
*           example: 100
*         minStock:
*           type: integer
*           description: Estoque mínimo
*           example: 10
*         imageUrl:
*           type: string
*           description: URL da imagem
*           example: "https://site.com/imagem.jpg"
*       required:
*         - categoryId
*         - name
*         - sku
*         - salePrice
*         - costPrice
*         - currentStock
*         - minStock
 */

/**
 * @swagger
 * tags:
 *   name: Produtos
 *   description: Gerenciamento de produtos
 */


productRouter
/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     tags:
 *       - Produtos
 *     summary: Cria um novo produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Requisição inválida
 */
  .post('/', (req, res, next) =>
    ProductController.create(req, res, next))

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     tags:
 *       - Produtos
 *     summary: Lista todos os produtos
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
  .get('/', (req, res, next) =>
    ProductController.getAll(req, res, next))

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     tags:
 *       - Produtos
 *     summary: Obtém um produto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produto não encontrado
 */
  .get('/:id', (req, res, next) =>
    ProductController.getById(req, res, next))

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     tags:
 *       - Produtos
 *     summary: Atualiza um produto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdate'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Requisição inválida
 *       404:
 *         description: Produto não encontrado
 */
  .put('/:id', (req, res, next) =>
    ProductController.updateById(req, res, next))

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     tags:
 *       - Produtos
 *     summary: Exclui um produto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       204:
 *         description: Produto excluído com sucesso
 *       404:
 *         description: Produto não encontrado
 */
  .delete('/:id', (req, res, next) =>
    ProductController.deleteById(req, res, next))

export default productRouter;
