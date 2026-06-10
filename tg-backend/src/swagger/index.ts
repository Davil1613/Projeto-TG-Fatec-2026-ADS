import {
  Express,
  NextFunction,
  Request,
  Response,
  static as expressStatic,
} from 'express';
import path from 'path';
import { readFileSync } from 'fs';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const packageJson = JSON.parse(
  readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
);

const getApiPaths = (): string[] => {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (isDevelopment) {
    return [
      path.resolve(__dirname, '../../src/routes/**/*.ts'),
      path.resolve(__dirname, '../../src/controllers/**/*.ts'),
      path.resolve(__dirname, '../../src/models/**/*.ts'),
    ];
  } else {
    return [
      path.resolve(__dirname, '../../dist/routes/**/*.js'),
      path.resolve(__dirname, '../../dist/controllers/**/*.js'),
      path.resolve(__dirname, '../../dist/models/**/*.js'),
    ];
  }
};

const createSwaggerSpec = (basePath: string) => {
  const options: swaggerJSDoc.Options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Stock Pro',
        version: packageJson.version,
        description: 'APIs de gerenciamento de estoque',
        contact: {
          name: 'Stock Pro',
        },
      },
      servers: [
        {
          url: basePath,
          description: 'API v1',
        },
      ],
      tags: [
        {
          name: 'Usuários',
          description: 'Gerenciamento de usuários',
        },
        {
          name: 'Categorias',
          description: 'Gerenciamento de categorias',
        },
        {
          name: 'Produtos',
          description: 'Gerenciamento de produtos',
        },
        {
          name: 'Movimentações',
          description: 'Gerenciamento de movimentações',
        }
      ],
    },
    apis: getApiPaths(),
  };

  return swaggerJSDoc(options);
};

export default (app: Express) => {
  app.use('/swagger-static', expressStatic(__dirname));

  app.use(
    '/api/v1/documentation',
    swaggerUi.serve,
    (req: Request, res: Response, next: NextFunction): void => {
      const basePath = (req as any).basePath || '/';
      const swaggerSpec = createSwaggerSpec(basePath);

      const setupOptions: swaggerUi.SwaggerUiOptions = {
        customCssUrl: `${basePath}swagger-static/swagger-custom.css`,
        customfavIcon: `${basePath}swagger-static/favicon.ico`,
        customSiteTitle: 'Stock Pro API Documentation',
      };
      swaggerUi.setup(swaggerSpec, setupOptions)(req, res, next);
    },
  );
};
