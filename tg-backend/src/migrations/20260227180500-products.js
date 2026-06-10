'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'categories', key: 'id' },
        onDelete: 'SET NULL',
      },
      name: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      sku: {
        type: Sequelize.STRING(40),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      sale_price: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
        defaultValue: 0,
      },
      cost_price: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
        defaultValue: 0,
      },
      current_stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      min_stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      image_url: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },
  async down (queryInterface, _Sequelize) {
    await queryInterface.dropTable('products');
  },
};
