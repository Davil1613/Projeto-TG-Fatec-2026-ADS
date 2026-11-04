import { Router } from 'express';
import UserController from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { requireActiveSubscription } from '../middlewares/subscription';

const userRouter = Router();

/**
* @swagger
* components:
*   schemas:
*     User:
*       type: object
*       properties:
*         id:
*           type: integer
*           description: ID do usuário
*           example: 1
*         name:
*           type: string
*           description: Nome do usuário
*           example: "João Silva"
*         email:
*           type: string
*           description: Email do usuário
*           example: "joao@email.com"
*         password:
*           type: string
*           description: Senha do usuário (hash)
*           example: "$2b$10$..."
*         role:
*           type: string
*           enum: [admin, user]
*           description: Perfil do usuário
*           example: "user"
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
*         - email
*         - password
*         - role
*     UserCreate:
*       type: object
*       properties:
*         name:
*           type: string
*           description: Nome do usuário
*           example: "João Silva"
*         email:
*           type: string
*           description: Email do usuário
*           example: "joao@email.com"
*         password:
*           type: string
*           description: Senha do usuário (hash)
*           example: "$2b$10$..."
*         role:
*           type: string
*           enum: [admin, user]
*           description: Perfil do usuário
*           example: "user"
*       required:
*         - name
*         - email
*         - password
*         - role
*     UserUpdate:
*       type: object
*       properties:
*         name:
*           type: string
*           description: Nome do usuário
*           example: "João Silva"
*         email:
*           type: string
*           description: Email do usuário
*           example: "joao@email.com"
*         password:
*           type: string
*           description: Senha do usuário (hash)
*           example: "$2b$10$..."
*         role:
*           type: string
*           enum: [admin, user]
*           description: Perfil do usuário
*           example: "user"
*       required:
*         - name
*         - email
*         - password
*         - role
*/

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Gerenciamento de usuários
 */

userRouter
  /**
   * @swagger
   * /api/v1/users:
   *   post:
   *     tags:
   *       - Usuários
   *     summary: Cria um novo usuário
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserCreate'
   *     responses:
   *       201:
   *         description: Usuário criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Requisição inválida
   */
  .post('/', (req, res, next) => UserController.create(req, res, next))
  .use(authenticateToken, requireAdmin, requireActiveSubscription)

  /**
   * @swagger
   * /api/v1/users:
   *   get:
   *     tags:
   *       - Usuários
   *     summary: Lista todos os usuários
   *     responses:
   *       200:
   *         description: Lista de usuários
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   */
  .get('/', (req, res, next) => UserController.getAll(req, res, next))

  /**
   * @swagger
   * /api/v1/users/members:
   *   post:
   *     tags:
   *       - Usuários
   *     summary: Cria um usuário da equipe (perfil user) na empresa do administrador
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       201:
   *         description: Usuário criado com perfil de acesso limitado
   *       403:
   *         description: Acesso restrito a administradores
   */
  .post('/members', (req, res, next) => UserController.createMember(req, res, next))

  /**
   * @swagger
   * /api/v1/users/{id}:
   *   get:
   *     tags:
   *       - Usuários
   *     summary: Obtém um usuário por ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do usuário
   *     responses:
   *       200:
   *         description: Usuário encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       404:
   *         description: Usuário não encontrado
   */
  .get('/:id', (req, res, next) => UserController.getById(req, res, next))

  /**
   * @swagger
   * /api/v1/users/{id}:
   *   put:
   *     tags:
   *       - Usuários
   *     summary: Atualiza um usuário por ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do usuário
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserUpdate'
   *     responses:
   *       200:
   *         description: Usuário atualizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Requisição inválida
   *       404:
   *         description: Usuário não encontrado
   */
  .put('/:id', (req, res, next) => UserController.updateById(req, res, next))

  /**
   * @swagger
   * /api/v1/users/{id}:
   *   delete:
   *     tags:
   *       - Usuários
   *     summary: Exclui um usuário por ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do usuário
   *     responses:
   *       204:
   *         description: Usuário excluído com sucesso
   *       404:
   *         description: Usuário não encontrado
   */
  .delete('/:id', (req, res, next) => UserController.deleteById(req, res, next));

export default userRouter;
