const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User, Blog } = require('../models')
const { SECRET } = require('../util/config')

router.get('/', async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['passwordHash'] },
    include: {
      model: Blog,
      attributes: ['id', 'title', 'author', 'url', 'likes']
    }
  })
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

router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['passwordHash'] },
    include: {
      model: Blog,
      as: 'readings',
      attributes: ['id', 'url', 'title', 'author', 'likes', 'year'],
      through: {
        attributes: ['id', 'read']
      }
    }
  })

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  // Transform to match expected format
  let readings = (user.readings || []).map(blog => {
    const blogData = blog.toJSON()
    return {
      id: blogData.id,
      url: blogData.url,
      title: blogData.title,
      author: blogData.author,
      likes: blogData.likes,
      year: blogData.year,
      readinglists: blogData.readingList ? [{
        id: blogData.readingList.id,
        read: blogData.readingList.read
      }] : []
    }
  })

  // Filter by read status
  if (req.query.read !== undefined) {
    const readFilter = req.query.read === 'true'
    readings = readings.filter(blog => {
      return blog.readinglists.length > 0 && blog.readinglists[0].read === readFilter
    })
  }

  res.json({
    name: user.name,
    username: user.username,
    readings: readings
  })
})

module.exports = router

