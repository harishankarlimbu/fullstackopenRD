require("express-async-errors");
const express = require("express");
const app = express();

const { PORT } = require("./util/config");
const { connectToDatabase } = require("./util/db");
const errorHandler = require("./middleware/errorHandler");
const { Blog, User } = require("./models");

const blogsRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");

app.use(express.json());

app.use("/api/blogs", blogsRouter);
app.use("/api/users", usersRouter);

app.use(errorHandler);

const start = async () => {
  await connectToDatabase();
  // alter: true will add missing columns to existing tables
  await Blog.sync({ alter: true });
  try {
    await User.sync({ alter: true });
  } catch (error) {
    const errorMessage = error.original?.message || error.message || "";
    if (
      error.name === "SequelizeDatabaseError" &&
      errorMessage.includes("contains null values") &&
      (errorMessage.includes("password_hash") ||
        error.original?.column === "password_hash")
    ) {
      const [results] = await User.sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_hash'
      `);

      // If column doesn't exist
      if (results.length === 0) {
        await User.sequelize.query(`
          ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)
        `);
        await User.sequelize.query(`
          UPDATE users SET password_hash = '' WHERE password_hash IS NULL
        `);
        await User.sequelize.query(`
          ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL
        `);
        await User.sync({ alter: true });
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
