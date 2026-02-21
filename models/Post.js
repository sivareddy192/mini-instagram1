const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  caption: String,
  image: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  repostedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Post", postSchema);