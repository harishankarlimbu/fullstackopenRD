const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const { Blog, User } = require('../models')

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    }
  })
  res.json(blogs)
})

router.post('/', authMiddleware, async (req, res) => {
  const blog = await Blog.create({
    ...req.body,
    userId: req.user.id 
  })
  res.json(blog)
})

router.get('/:id', async (req, res) => {
  const blog = await Blog.findByPk(req.params.id)
  if (blog) {
    res.json(blog)
  } else {
    res.status(404).end()
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  const blog = await Blog.findByPk(req.params.id)
  
  if (!blog) {
    return res.status(404).json({ error: 'blog not found' })
  }
  
  // Check if the blog belongs to the logged-in user
  if (blog.userId !== req.user.id) {
    return res.status(403).json({ error: 'only the creator can delete this blog' })
  }
  
  await blog.destroy()
  res.status(204).end()
})

router.put('/:id',async(req,res)=>{
    const blog = await Blog.findByPk(req.params.id)
    if (blog) {
        blog.likes = req.body.likes
        await blog.save()
        res.json(blog)
    } else {
        res.status(404).end()
    }   
})

module.exports = router

