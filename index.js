require('express-async-errors')
const express = require('express')
const app = express()

const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')
const errorHandler = require('./middleware/errorHandler')
const { Blog, User } = require('./models')

const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')

app.use(express.json())

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)

app.use(errorHandler)

const start = async () => {
  await connectToDatabase()
  // Sync models after database connection is established
  await Blog.sync()
  await User.sync()
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
