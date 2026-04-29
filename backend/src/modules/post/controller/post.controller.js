const postService = require("../service/post.service");
const asyncHandler = require("../../../utils/asyncHandler");

const getPosts = asyncHandler(async (req, res) => {
  const result = await postService.getPublishedPosts({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status,
    author: req.query.author,
    sort: req.query.sort,
    categoryId: req.query.categoryId,
    categorySlug: req.query.categorySlug,
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
    categoryId: req.query.categoryId,
    categorySlug: req.query.categorySlug,
  });

  return res.status(200).json(result);
});

const getCmsPostById = asyncHandler(async (req, res) => {
  const post = await postService.getCmsPostById(req.params.id, req.user);
  return res.status(200).json(post);
});

const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await postService.getPublishedPostBySlug(req.params.slug);
  return res.status(200).json(post);
});

const listRevisions = asyncHandler(async (req, res) => {
  const revisions = await postService.listRevisions(req.params.id, req.user);
  return res.status(200).json({ items: revisions });
});

const getRevisionDetail = asyncHandler(async (req, res) => {
  const revision = await postService.getRevisionDetail(req.params.id, req.params.revId, req.user);
  return res.status(200).json(revision);
});

const restoreRevision = asyncHandler(async (req, res) => {
  const restored = await postService.restoreRevision(req.params.id, req.params.revId, req.user, { endpoint: req.originalUrl });
  return res.status(200).json({ message: "Revision restored", restored });
});

const createPost = asyncHandler(async (req, res) => {
  const newPost = await postService.createPost(req.body, req.user, { endpoint: req.originalUrl });
  return res.status(201).json(newPost);
});

const updatePost = asyncHandler(async (req, res) => {
  const updatedPost = await postService.updatePost(req.params.id, req.body, req.user, { endpoint: req.originalUrl });
  return res.status(200).json(updatedPost);
});

const submitPost = asyncHandler(async (req, res) => {
  const post = await postService.submitPostForReview(req.params.id, req.user, { endpoint: req.originalUrl });
  return res.status(200).json(post);
});

const approvePost = asyncHandler(async (req, res) => {
  const post = await postService.approvePost(req.params.id, req.user, { endpoint: req.originalUrl });
  return res.status(200).json(post);
});

const rejectPost = asyncHandler(async (req, res) => {
  const post = await postService.rejectPost(req.params.id, req.body, req.user, { endpoint: req.originalUrl });
  return res.status(200).json(post);
});

const publishPost = asyncHandler(async (req, res) => {
  const publishedPost = await postService.publishPost(req.params.id, req.user, { endpoint: req.originalUrl });
  return res.status(200).json(publishedPost);
});

const unpublishPost = asyncHandler(async (req, res) => {
  const post = await postService.unpublishPost(req.params.id, req.user, { endpoint: req.originalUrl });
  return res.status(200).json(post);
});

const deletePost = asyncHandler(async (req, res) => {
  await postService.deletePost(req.params.id, req.user, { endpoint: req.originalUrl });
  return res.status(200).json({ message: "Post deleted successfully" });
});

module.exports = {
  getPosts,
  getCmsPosts,
  getCmsPostById,
  getPostBySlug,
  listRevisions,
  getRevisionDetail,
  restoreRevision,
  createPost,
  updatePost,
  submitPost,
  approvePost,
  rejectPost,
  publishPost,
  unpublishPost,
  deletePost,
};
