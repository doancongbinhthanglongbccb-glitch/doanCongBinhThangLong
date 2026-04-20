const postService = require("../services/post.service");
const asyncHandler = require("../utils/asyncHandler");

const getPosts = asyncHandler(async (req, res) => {
  const result = await postService.getPublishedPosts({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status,
    author: req.query.author,
    sort: req.query.sort,
  });

  return res.status(200).json(result);
});

const getCmsPosts = asyncHandler(async (req, res) => {
  if (Object.keys(req.query || {}).length === 0) {
    const posts = await postService.getAllCmsPosts();
    return res.status(200).json(posts);
  }

  const result = await postService.getCmsPosts({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status,
    author: req.query.author,
    sort: req.query.sort,
  });

  return res.status(200).json(result);
});

const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await postService.getPublishedPostBySlug(req.params.slug);
  return res.status(200).json(post);
});

const createPost = asyncHandler(async (req, res) => {
  const newPost = await postService.createPost(req.body, req.user, { endpoint: req.originalUrl });
  return res.status(201).json(newPost);
});

const updatePost = asyncHandler(async (req, res) => {
  const updatedPost = await postService.updatePost(req.params.id, req.body, req.user, { endpoint: req.originalUrl });
  return res.status(200).json(updatedPost);
});

const publishPost = asyncHandler(async (req, res) => {
  const publishedPost = await postService.publishPost(req.params.id, req.user, { endpoint: req.originalUrl });
  return res.status(200).json(publishedPost);
});

const deletePost = asyncHandler(async (req, res) => {
  await postService.deletePost(req.params.id, req.user, { endpoint: req.originalUrl });
  return res.status(200).json({ message: "Post deleted successfully" });
});

module.exports = {
  getPosts,
  getCmsPosts,
  getPostBySlug,
  createPost,
  updatePost,
  publishPost,
  deletePost,
};
