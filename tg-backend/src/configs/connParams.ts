import 'dotenv/config';
import { Dialect, Options } from 'sequelize';

const params: Options = {
  dialect: process.env.DB_DIAL as Dialect,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

export = params;
