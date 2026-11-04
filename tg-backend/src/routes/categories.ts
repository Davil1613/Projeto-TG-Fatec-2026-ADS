import { Router } from 'express';
import CategoryController from '../controllers/categoryController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { requireActiveSubscription } from '../middlewares/subscription';

const categoryRouter = Router();
categoryRouter.use(authenticateToken, requireActiveSubscription);

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID da categoria
 *           example: 1
 *         name:
 *           type: string
 *           description: Nome da categoria
 *           example: "Alimentos"
 *         description:
 *           type: string
 *           description: Descrição da categoria
 *           example: "Produtos alimentícios"
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
 *         - name
 *     CategoryCreate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nome da categoria
 *           example: "Alimentos"
 *         description:
 *           type: string
 *           description: Descrição da categoria
 *           example: "Produtos alimentícios"
 *       required:
 *         - name
 */

/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: Gerenciamento de categorias
 */


categoryRouter
/**
   * @swagger
   * /api/v1/categories:
   *   post:
   *     tags:
   *       - Categorias
   *     summary: Cria um novo grupo de categorias
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CategoryCreate'
   *     responses:
   *       '201':
   *         description: Grupo de categorias criado com sucesso
   */
  .post('/', requireAdmin, (req, res, next) =>
    CategoryController.create(req, res, next))

  /**
   * @swagger
   * /api/v1/categories:
   *   get:
   *     tags:
   *       - Categorias
   *     summary: Obtém uma lista de categorias
   *     responses:
   *       '200':
   *         description: Lista de categorias obtida com sucesso
   */
  .get('/', (req, res, next) =>
    CategoryController.getAll(req, res, next))

  /**
   * @swagger
   * /api/v1/categories/{id}:
   *   get:
   *     tags:
   *       - Categorias
   *     summary: Obtém um grupo de categorias por ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do grupo de categorias
   *     responses:
   *       '200':
   *         description: Grupo de categorias obtido com sucesso
   *       '404':
   *         description: Grupo de categorias não encontrado
   */
  .get('/:id', (req, res, next) =>
    CategoryController.getById(req, res, next))

  /**
   * @swagger
   * /api/v1/categories/{id}:
   *   put:
   *     tags:
   *       - Categorias
   *     summary: Atualiza um grupo de categorias por ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do grupo de categorias
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CategoryCreate'
   *     responses:
   *       '200':
   *         description: Grupo de categorias atualizado com sucesso
   *       '404':
   *         description: Grupo de categorias não encontrado
   */
  .put('/:id', requireAdmin, (req, res, next) =>
    CategoryController.updateById(req, res, next))

  /**
   * @swagger
   * /api/v1/categories/{id}:
   *   delete:
   *     tags:
   *       - Categorias
   *     summary: Exclui um grupo de categorias por ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do grupo de categorias
   *     responses:
   *       '200':
   *         description: Grupo de categorias excluído com sucesso
   *       '404':
   *         description: Grupo de categorias não encontrado
   */
  .delete('/:id', requireAdmin, (req, res, next) =>
    CategoryController.deleteById(req, res, next))

export default categoryRouter;
