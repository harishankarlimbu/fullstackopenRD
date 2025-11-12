const Blog = require('./blog')
const User = require('./user')
const ReadingList = require('./readingList')

//associations
User.hasMany(Blog)
Blog.belongsTo(User)

// Many-to-many relationship through ReadingList
User.belongsToMany(Blog, { through: ReadingList, as: 'readings' })
Blog.belongsToMany(User, { through: ReadingList, as: 'users' })

module.exports = {
  Blog,
  User,
  ReadingList
}

