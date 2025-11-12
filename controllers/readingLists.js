const router = require('express').Router()
const { ReadingList, User, Blog } = require('../models')

router.post('/', async (req, res) => {
  const { blogId, userId } = req.body

  if (!blogId || !userId) {
    return res.status(400).json({ error: 'blogId and userId are required' })
  }

  // Verify user exists
  const user = await User.findByPk(userId)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  // Verify blog exists
  const blog = await Blog.findByPk(blogId)
  if (!blog) {
    return res.status(404).json({ error: 'Blog not found' })
  }

  // Check if already in reading list
  const existing = await ReadingList.findOne({
    where: { userId, blogId }
  })

  if (existing) {
    return res.status(400).json({ error: 'Blog already in reading list' })
  }

  // Add to reading list (read defaults to false)
  const readingListItem = await ReadingList.create({
    userId,
    blogId,
    read: false
  })

  res.json(readingListItem)
})

module.exports = router

