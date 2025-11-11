const errorHandler = (error, req, res, next) => {
  console.error(error)
  // Handle validation errors (from Sequelize)
  if (error.name === 'SequelizeValidationError') {
    const errorMessages = error.errors.map(e => e.message)
    return res.status(400).json({ error: errorMessages })
  }
// Handle database errors
  if (error.name === 'SequelizeDatabaseError') {
    return res.status(400).json({ error: error.message })
  }
  // Handle other errors
  res.status(400).json({ error: error.message })
}

module.exports = errorHandler

