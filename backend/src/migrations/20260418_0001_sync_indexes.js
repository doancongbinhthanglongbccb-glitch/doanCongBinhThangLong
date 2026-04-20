const User = require("../models/User");
const Post = require("../models/Post");
const RefreshToken = require("../models/RefreshToken");

module.exports = {
  id: "20260418_0001_sync_indexes",
  up: async () => {
    await Promise.all([User.syncIndexes(), Post.syncIndexes(), RefreshToken.syncIndexes()]);
  },
};