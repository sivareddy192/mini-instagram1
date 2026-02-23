const express = require("express");
const Post = require("../models/Post");
const upload = require("../config/multer");
const router = express.Router();

function isAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect("/login");
  }
  next();
}

router.get("/feed", isAuth, async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    const limit = 4;

    if (page < 1) page = 1;

    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    if (page > totalPages && totalPages > 0) {
      page = totalPages;
    }

    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate("user")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.render("feed", {
      posts,
      userId: req.session.userId,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.post("/create", isAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      req.flash("error_msg", "Please upload an image!");
      return res.redirect("/feed");
    }

    await Post.create({
      image: "/uploads/" + req.file.filename,
      caption: req.body.caption || "",
      user: req.session.userId,
    });

    req.flash("success_msg", "Post created successfully!");
    res.redirect("/feed");
  } catch (err) {
    req.flash("error_msg", err.message);
    res.redirect("/feed");
  }
});

router.get("/edit/:id", isAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.redirect("/feed");

    if (post.user.toString() !== req.session.userId) {
      return res.redirect("/feed");
    }

    res.render("edit", { post });
  } catch (err) {
    console.error(err);
    res.redirect("/feed");
  }
});

router.post("/update/:id", isAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.redirect("/feed");

    if (post.user.toString() !== req.session.userId) {
      return res.redirect("/feed");
    }

    post.caption = req.body.caption;
    await post.save();

    res.redirect("/feed");
  } catch (err) {
    console.error(err);
    res.redirect("/feed");
  }
});

router.get("/delete/:id", isAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.redirect("/feed");

    if (post.user.toString() !== req.session.userId) {
      return res.redirect("/feed");
    }

    await post.deleteOne();
    res.redirect("/feed");
  } catch (err) {
    console.error(err);
    res.redirect("/feed");
  }
});

module.exports = router;