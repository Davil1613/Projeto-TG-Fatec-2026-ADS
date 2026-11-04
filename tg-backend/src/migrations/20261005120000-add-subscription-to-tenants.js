'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('tenants');

    if (!columns.subscription_status) {
      await queryInterface.addColumn('tenants', 'subscription_status', {
        type: Sequelize.ENUM('trial', 'pending', 'active', 'past_due', 'canceled'),
        allowNull: false,
        defaultValue: 'trial',
      });
    }

    if (!columns.trial_ends_at) {
      await queryInterface.addColumn('tenants', 'trial_ends_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
      await queryInterface.sequelize.query(
        "UPDATE tenants SET trial_ends_at = NOW() + INTERVAL '7 days' WHERE trial_ends_at IS NULL",
      );
    }

    if (!columns.mp_preapproval_id) {
      await queryInterface.addColumn('tenants', 'mp_preapproval_id', {
        type: Sequelize.STRING(64),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tenants', 'mp_preapproval_id');
    await queryInterface.removeColumn('tenants', 'trial_ends_at');
    await queryInterface.removeColumn('tenants', 'subscription_status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tenants_subscription_status"');
  },
};
