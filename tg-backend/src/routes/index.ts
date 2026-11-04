import { Express } from 'express';

import productsRoutes from './products';
import categoriesRoutes from './categories';
import movementsRoutes from './movements';
import usersRoutes from './users';
import authRoutes from './auth';
import uploadsRoutes from './uploads';
import auditLogsRoutes from './auditLogs';
import billingRoutes from './billing';


const routes = (app: Express) => {
    app.use('/api/v1/products', productsRoutes);
    app.use('/api/v1/categories', categoriesRoutes);
    app.use('/api/v1/movements', movementsRoutes);
    app.use('/api/v1/users', usersRoutes);
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/uploads', uploadsRoutes);
    app.use('/api/v1/audit-logs', auditLogsRoutes);
    app.use('/api/v1/billing', billingRoutes);

  app.get('/', (req, res) => {
    res.send('TG Backend API running');
  });
};

export default routes;
