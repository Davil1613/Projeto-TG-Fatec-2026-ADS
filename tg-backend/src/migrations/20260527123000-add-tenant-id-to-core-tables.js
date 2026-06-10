'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.describeTable('users');
    const categories = await queryInterface.describeTable('categories');
    const products = await queryInterface.describeTable('products');
    const movements = await queryInterface.describeTable('stock_movements');

    if (!users.tenant_id) {
      await queryInterface.addColumn('users', 'tenant_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'SET NULL',
      });
    }

    if (!categories.tenant_id) {
      await queryInterface.addColumn('categories', 'tenant_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'SET NULL',
      });
    }

    if (!products.tenant_id) {
      await queryInterface.addColumn('products', 'tenant_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'SET NULL',
      });
    }

    if (!movements.tenant_id) {
      await queryInterface.addColumn('stock_movements', 'tenant_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'SET NULL',
      });
    }

    await queryInterface.sequelize.query(`
      INSERT INTO tenants (owner_user_id, name, status, created_at, updated_at)
      SELECT u.id, u.name, 'active', NOW(), NOW()
      FROM users u
      LEFT JOIN tenants t ON t.owner_user_id = u.id
      WHERE u.role = 'admin' AND t.id IS NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE users u
      SET tenant_id = t.id
      FROM tenants t
      WHERE t.owner_user_id = u.id
      AND u.tenant_id IS NULL;
    `);

    await queryInterface.sequelize.query(`
      WITH first_tenant AS (
        SELECT MIN(id) AS id FROM tenants
      )
      UPDATE categories
      SET tenant_id = (SELECT id FROM first_tenant)
      WHERE tenant_id IS NULL;
    `);

    await queryInterface.sequelize.query(`
      WITH first_tenant AS (
        SELECT MIN(id) AS id FROM tenants
      )
      UPDATE products
      SET tenant_id = (SELECT id FROM first_tenant)
      WHERE tenant_id IS NULL;
    `);

    await queryInterface.sequelize.query(`
      WITH first_tenant AS (
        SELECT MIN(id) AS id FROM tenants
      )
      UPDATE stock_movements
      SET tenant_id = (SELECT id FROM first_tenant)
      WHERE tenant_id IS NULL;
    `);
  },

  async down(queryInterface) {
    const users = await queryInterface.describeTable('users');
    const categories = await queryInterface.describeTable('categories');
    const products = await queryInterface.describeTable('products');
    const movements = await queryInterface.describeTable('stock_movements');

    if (movements.tenant_id) {
      await queryInterface.removeColumn('stock_movements', 'tenant_id');
    }

    if (products.tenant_id) {
      await queryInterface.removeColumn('products', 'tenant_id');
    }

    if (categories.tenant_id) {
      await queryInterface.removeColumn('categories', 'tenant_id');
    }

    if (users.tenant_id) {
      await queryInterface.removeColumn('users', 'tenant_id');
    }
  },
};
