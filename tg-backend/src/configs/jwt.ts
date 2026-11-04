import 'dotenv/config';

const secret = process.env.JWT_SECRET;

if (!secret || secret === 'changeme' || secret.length < 32) {
  throw new Error('JWT_SECRET ausente ou fraco: defina no .env um segredo com pelo menos 32 caracteres.');
}

export const JWT_SECRET = secret;
