const router = require('express').Router()
const { ReadingList, User, Blog } = require('../models')
const authMiddleware = require('../middleware/auth')

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

  // Add to reading list
  const readingListItem = await ReadingList.create({
    userId,
    blogId,
    read: false
  })

  res.json(readingListItem)
})

router.put('/:id', authMiddleware, async (req, res) => {
  const { read } = req.body
  const readingListItem = await ReadingList.findByPk(req.params.id)

  if (!readingListItem) {
    return res.status(404).json({ error: 'Reading list item not found' })
  }
  // Checking
  if (readingListItem.userId !== req.user.id) {
    return res.status(403).json({ error: 'You can only mark your own reading list items as read' })
  }
  readingListItem.read = read
  await readingListItem.save()

  res.json(readingListItem)
})

module.exports = router

