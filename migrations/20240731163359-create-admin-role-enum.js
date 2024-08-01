"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TYPE "public"."enum_admin_role" AS ENUM('super_admin', 'student_admin', 'course_admin');
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DROP TYPE "public"."enum_admin_role";
    `);
  },
};
