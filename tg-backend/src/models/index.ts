import { Sequelize } from 'sequelize';
import params from '../configs/connParams';

export default new Sequelize(params);
