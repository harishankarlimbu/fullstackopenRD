const Blog = require('./blog')
const User = require('./user')

//associations
User.hasMany(Blog)
Blog.belongsTo(User)

module.exports = {
  Blog,
  User
}

