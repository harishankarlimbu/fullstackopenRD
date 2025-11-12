const router = require("express").Router();
const authMiddleware = require("../middleware/auth");
const { Blog, User } = require("../models");
const { Op, Sequelize } = require("sequelize");

router.get("/", async (req, res) => {
  const where = {};

  if (req.query.search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${req.query.search}%` } },
      { author: { [Op.iLike]: `%${req.query.search}%` } },
    ];
  }

  const blogs = await Blog.findAll({
    where,
    order: [["likes", "DESC"]],
    attributes: { exclude: ["userId"] },
    include: {
      model: User,
      attributes: ["id", "name", "username"],
    },
  });
  res.json(blogs);
});

router.post("/", authMiddleware, async (req, res) => {
  const blog = await Blog.create({
    ...req.body,
    userId: req.user.id,
  });
  res.json(blog);
});

// Authors router for /api/authors endpoint
const authorsRouter = require("express").Router();

app.get("/api/authors", async (req, res, next) => {
  try {
    const authors = await Blog.findAll({
      attributes: [
        "author",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "blogs"],
        [Sequelize.fn("SUM", Sequelize.col("likes")), "likes"],
      ],
      group: ["author"],
      order: [[sequelize.fn("SUM", sequelize.col("likes")), "DESC"]],
      raw: true,
    });

    // format the response
    const formattedAuthors = authors.map((author) => ({
      author: author.author,
      blogs: String(author.blogs),
      likes: String(author.likes || "0"),
    }));

    res.json(formattedAuthors);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (blog) {
    res.json(blog);
  } else {
    res.status(404).end();
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);

  if (!blog) {
    return res.status(404).json({ error: "blog not found" });
  }

  // Check if the blog belongs to the logged-in user
  if (blog.userId !== req.user.id) {
    return res
      .status(403)
      .json({ error: "only the creator can delete this blog" });
  }

  await blog.destroy();
  res.status(204).end();
});

router.put("/:id", async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (blog) {
    blog.likes = req.body.likes;
    await blog.save();
    res.json(blog);
  } else {
    res.status(404).end();
  }
});

module.exports = router;
module.exports.authorsRouter = authorsRouter;
