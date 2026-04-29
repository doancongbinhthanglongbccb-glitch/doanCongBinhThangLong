const asyncHandler = require("../../../utils/asyncHandler");
const userService = require("../service/user.service");

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers({
    search: req.query.search,
    role: req.query.role,
    page: req.query.page,
    limit: req.query.limit,
    sort: req.query.sort,
  });

  return res.status(200).json(result);
});

const updateUserRole = asyncHandler(async (req, res) => {
  const updated = await userService.updateUserRole(req.params.id, req.body.role, {
    userId: req.user?.userId,
    requestId: req.requestId,
  });

  return res.status(200).json(updated);
});

module.exports = {
  listUsers,
  updateUserRole,
};

