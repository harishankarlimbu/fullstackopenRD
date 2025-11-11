const jwt = require('jsonwebtoken')
const { User } = require('../models')
const { SECRET } = require('../util/config')

const authMiddleware = async (req, res, next) => {
  const authorization = req.get('authorization')
  
  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'token missing' })
  }
  
  const token = authorization.substring(7)
  
  try {
    const decodedToken = jwt.verify(token, SECRET)
    const user = await User.findByPk(decodedToken.id)
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ error: 'token invalid' })
  }
}

module.exports = authMiddleware