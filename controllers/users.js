const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User } = require('../models')
const { SECRET } = require('../util/config')

router.get('/', async (req, res) => {
  const users = await User.findAll()
  res.json(users)
})

router.post('/', async (req, res) => {
  const { username, name, password } = req.body
  
  if (!password || password.length < 3) {
    return res.status(400).json({ error: 'password must be at least 3 characters long' })
  }
  
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ username, name, passwordHash })
  res.json(user)
})

router.put('/:username', async (req, res) => {
  const user = await User.findOne({ where: { username: req.params.username } })
  if (user) {
    user.username = req.body.username
    await user.save()
    res.json(user)
  } else {
    res.status(404).end()
  }
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  // Find user
  const user = await User.findOne({ where: { username } })
  if (!user) {
    return res.status(401).json({ error: 'invalid username or password' })
  }

  // Verify password (using bcrypt)
  const passwordCorrect = await bcrypt.compare(password, user.passwordHash)
  if (!passwordCorrect) {
    return res.status(401).json({ error: 'invalid username or password' })
  }
  // Generate token
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET)
  res.json({ token, username: user.username, name: user.name })
})

module.exports = router

