'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const currentYear = new Date().getFullYear();
    
    await queryInterface.addColumn('blogs', 'year', {
      type: Sequelize.INTEGER,
      allowNull: true // Allow null for existing records
    });

    // Add check constraint at database level
    await queryInterface.sequelize.query(`
      ALTER TABLE blogs 
      ADD CONSTRAINT check_year_range 
      CHECK (year IS NULL OR (year >= 1991 AND year <= ${currentYear}))
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove constraint first
    await queryInterface.sequelize.query(`
      ALTER TABLE blogs 
      DROP CONSTRAINT IF EXISTS check_year_range
    `);
    
    await queryInterface.removeColumn('blogs', 'year');
  }
};

