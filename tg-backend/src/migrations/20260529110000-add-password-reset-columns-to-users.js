'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.describeTable('users');

    if (!users.reset_password_token) {
      await queryInterface.addColumn('users', 'reset_password_token', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }

    if (!users.reset_password_expires_at) {
      await queryInterface.addColumn('users', 'reset_password_expires_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const users = await queryInterface.describeTable('users');

    if (users.reset_password_expires_at) {
      await queryInterface.removeColumn('users', 'reset_password_expires_at');
    }

    if (users.reset_password_token) {
      await queryInterface.removeColumn('users', 'reset_password_token');
    }
  },
};
