import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../configs/jwt';
import userService from '../services/userService';
import emailService from '../services/emailService';


class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    if (!user.tenantId) {
      return res.status(403).json({ error: 'Usuário sem tenant associado.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      JWT_SECRET,
      { expiresIn: '1d' },
    );

    const { password: _password, ...userSafe } = user.toJSON();
    return res.json({ token, user: userSafe });
  }

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório.' });
    }

    const genericMessage = 'Se o e-mail existir, enviaremos as instruções de redefinição.';

    try {
      const user = await userService.findByEmail(email);
      if (!user) {
        return res.status(200).json({ message: genericMessage });
      }

      const { resetCode } = await userService.generatePasswordResetCode(email);
      if (!resetCode) {
        return res.status(200).json({ message: genericMessage });
      }

      await emailService.sendPasswordResetEmail({
        to: user.email,
        userName: user.name,
        resetCode,
      });

      return res.status(200).json({ message: genericMessage });
    } catch {
      return res.status(500).json({ error: 'Não foi possível processar a solicitação de recuperação.' });
    }
  }

  async resetPassword(req: Request, res: Response) {
    const { email, code, newPassword } = req.body as {
      email?: string;
      code?: string;
      newPassword?: string;
    };

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, código e nova senha são obrigatórios.' });
    }

    try {
      const success = await userService.resetPasswordWithCode(email, code, newPassword);
      if (!success) {
        return res.status(400).json({ error: 'Código inválido ou expirado.' });
      }

      return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Não foi possível redefinir a senha.' });
    }
  }
}

export default new AuthController();
