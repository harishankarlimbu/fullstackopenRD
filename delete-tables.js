require('dotenv').config()
const { sequelize } = require('./util/db')

const deleteTables = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connected to the database')

    // Delete all tables
    await sequelize.query('DROP TABLE IF EXISTS blogs CASCADE')
    console.log('Dropped blogs table')
    
    await sequelize.query('DROP TABLE IF EXISTS users CASCADE')
    console.log('Dropped users table')

    // Delete migrations table if it exists
    await sequelize.query('DROP TABLE IF EXISTS migrations CASCADE')
    console.log('Dropped migrations table')

    console.log('All tables deleted successfully')
    await sequelize.close()
  } catch (error) {
    console.error('Error deleting tables:', error)
    await sequelize.close()
    process.exit(1)
  }
}

deleteTables()

