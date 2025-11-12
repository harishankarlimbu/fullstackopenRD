const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../util/db')

class Blog extends Model {}

Blog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  author: {
    type: DataTypes.TEXT,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: {
        msg: 'Year must be an integer'
      },
      customValidator(value) {
        if (value !== null && value !== undefined) {
          const currentYear = new Date().getFullYear();
          if (!Number.isInteger(value)) {
            throw new Error('Year must be an integer');
          }
          if (value < 1991) {
            throw new Error('Year must be at least 1991');
          }
          if (value > currentYear) {
            throw new Error(`Year cannot be greater than ${currentYear}`);
          }
        }
      }
    }
  }
}, {
  sequelize,
  underscored: true,
  timestamps: true,
  modelName: 'blog',
  tableName: 'blogs'
})

module.exports = Blog

