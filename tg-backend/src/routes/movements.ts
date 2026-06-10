import { Router } from 'express';
import MovementController from '../controllers/movementController';
import { authenticateToken } from '../middlewares/auth';

const movementRouter = Router();
movementRouter.use(authenticateToken);

/**
* @swagger
* components:
*   schemas:
*     Movement:
*       type: object
*       properties:
*         id:
*           type: integer
*           description: ID da movimentação
*           example: 1
*         productId:
*           type: integer
*           description: ID do produto
*           example: 2
*         movementType:
*           type: string
*           enum: [entrada, saida]
*           description: Tipo de movimentação
*           example: "entrada"
*         quantity:
*           type: integer
*           description: Quantidade movimentada
*           example: 10
*         notes:
*           type: string
*           description: Observações
*           example: "Compra de fornecedor"
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
*         - productId
*         - movementType
*         - quantity
*     MovementCreate:
*       type: object
*       properties:
*         productId:
*           type: integer
*           description: ID do produto
*           example: 2
*         movementType:
*           type: string
*           enum: [entrada, saida]
*           description: Tipo de movimentação
*           example: "entrada"
*         quantity:
*           type: integer
*           description: Quantidade movimentada
*           example: 10
*         notes:
*           type: string
*           description: Observações
*           example: "Compra de fornecedor"
*       required:
*         - productId
*         - movementType
*         - quantity
*     MovementUpdate:
*       type: object
*       properties:
*         productId:
*           type: integer
*           description: ID do produto
*           example: 2
*         movementType:
*           type: string
*           enum: [entrada, saida]
*           description: Tipo de movimentação
*           example: "entrada"
*         quantity:
*           type: integer
*           description: Quantidade movimentada
*           example: 10
*         notes:
*           type: string
*           description: Observações
*           example: "Compra de fornecedor"
*       required:
*         - productId
*         - movementType
*         - quantity
*/

/**
 * @swagger
 * tags:
 *   name: Movimentações
 *   description: Gerenciamento de movimentações de estoque
 */

movementRouter
  /**
   * @swagger
   * /api/v1/movements:
   *   post:
   *     tags:
   *       - Movimentações
   *     summary: Cria uma nova movimentação
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/MovementCreate'
   *     responses:
   *       201:
   *         description: Movimentação criada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Movement'
   *       400:
   *         description: Requisição inválida
   */
  .post('/', (req, res, next) => MovementController.create(req, res, next))

  /**
   * @swagger
   * /api/v1/movements:
   *   get:
   *     tags:
   *       - Movimentações
   *     summary: Lista todas as movimentações
   *     responses:
   *       200:
   *         description: Lista de movimentações
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Movement'
   */
  .get('/', (req, res, next) => MovementController.getAll(req, res, next))

  /**
   * @swagger
   * /api/v1/movements/{id}:
   *   get:
   *     tags:
   *       - Movimentações
   *     summary: Obtém uma movimentação por ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da movimentação
   *     responses:
   *       200:
   *         description: Movimentação encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Movement'
   *       404:
   *         description: Movimentação não encontrada
   */
  .get('/:id', (req, res, next) => MovementController.getById(req, res, next))

  /**
   * @swagger
   * /api/v1/movements/{id}:
   *   put:
   *     tags:
   *       - Movimentações
   *     summary: Atualiza uma movimentação por ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da movimentação
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/MovementUpdate'
   *     responses:
   *       204:
   *         description: Movimentação atualizada com sucesso
   *       400:
   *         description: Requisição inválida
   *       404:
   *         description: Movimentação não encontrada
   */
  .put('/:id', (req, res, next) => MovementController.updateById(req, res, next))

  /**
   * @swagger
   * /api/v1/movements/{id}:
   *   delete:
   *     tags:
   *       - Movimentações
   *     summary: Exclui uma movimentação por ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da movimentação
   *     responses:
   *       204:
   *         description: Movimentação excluída com sucesso
   *       404:
   *         description: Movimentação não encontrada
   */
  .delete('/:id', (req, res, next) => MovementController.deleteById(req, res, next));

export default movementRouter;
