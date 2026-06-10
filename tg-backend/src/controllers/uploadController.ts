import { Request, Response } from 'express';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function buildBaseUrl(req: Request) {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/+$/, '');
  }
  return `${req.protocol}://${req.get('host')}`;
}

class UploadController {
  async uploadProductImage(req: Request, res: Response) {
    const tenantId = req.user?.tenantId;
    const { fileData } = req.body as { fileData?: string };

    if (!tenantId) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    if (!fileData || typeof fileData !== 'string') {
      return res.status(400).json({ error: 'Arquivo não informado.' });
    }

    const dataUrlMatch = fileData.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!dataUrlMatch) {
      return res.status(400).json({ error: 'Formato inválido de imagem.' });
    }

    const mimeType = dataUrlMatch[1].toLowerCase();
    const base64Content = dataUrlMatch[2];
    const extension = MIME_EXTENSION_MAP[mimeType];

    if (!extension) {
      return res.status(400).json({ error: 'Formato de imagem não suportado. Use JPG, PNG ou WEBP.' });
    }

    const imageBuffer = Buffer.from(base64Content, 'base64');
    if (!imageBuffer.length) {
      return res.status(400).json({ error: 'Imagem inválida.' });
    }

    if (imageBuffer.length > MAX_IMAGE_SIZE_BYTES) {
      return res.status(413).json({ error: 'Imagem muito grande. Limite de 5MB.' });
    }

    const tenantFolder = path.resolve(
      process.cwd(),
      'uploads',
      'tenants',
      String(tenantId),
      'products',
    );

    await mkdir(tenantFolder, { recursive: true });

    const storedFileName = `${Date.now()}-${randomUUID()}.${extension}`;
    const storedFilePath = path.resolve(tenantFolder, storedFileName);
    await writeFile(storedFilePath, imageBuffer);

    const relativeUrl = `/uploads/tenants/${tenantId}/products/${storedFileName}`;
    const imageUrl = `${buildBaseUrl(req)}${relativeUrl}`;

    return res.status(201).json({ imageUrl });
  }
}

export default new UploadController();
