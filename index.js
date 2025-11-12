require("express-async-errors");
const express = require("express");
const app = express();

const { PORT } = require("./util/config");
const { connectToDatabase } = require("./util/db");
const errorHandler = require("./middleware/errorHandler");
const { Blog, User } = require("./models");

const blogsRouter = require("./controllers/blogs");
const { authorsRouter } = require("./controllers/blogs");
const usersRouter = require("./controllers/users");

app.use(express.json());
app.use("/api/authors", authorsRouter);
app.use("/api/blogs", blogsRouter);
app.use("/api/users", usersRouter);

app.use(errorHandler);

const { sequelize } = require("./util/db");
const { Sequelize } = require("sequelize");
const { Umzug, SequelizeStorage } = require("umzug");
const path = require("path");

const runMigrations = async () => {
  const migrator = new Umzug({
    migrations: {
      glob: path.join(__dirname, "migrations", "*.js"),
      resolve: ({ name, path: migrationPath, context }) => {
        const migration = require(migrationPath);
        return {
          name,
          up: async () => {
            if (typeof migration.up === 'function') {
              return migration.up(context, Sequelize);
            }
            throw new Error(`Migration ${name} does not export an 'up' function`);
          },
          down: async () => {
            if (typeof migration.down === 'function') {
              return migration.down(context, Sequelize);
            }
            throw new Error(`Migration ${name} does not export a 'down' function`);
          },
        };
      },
    },
    storage: new SequelizeStorage({ sequelize, tableName: "migrations" }),
    context: sequelize.getQueryInterface(),
    logger: console,
  });

  await migrator.up();
};

const start = async () => {
  await connectToDatabase();
  await runMigrations();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
