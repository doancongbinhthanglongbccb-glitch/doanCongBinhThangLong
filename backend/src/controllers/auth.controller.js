const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, {
    ip: req.ip,
    requestId: req.requestId,
  });
  return res.status(200).json(result);
});

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body?.refreshToken, {
    ip: req.ip,
    requestId: req.requestId,
  });
  return res.status(200).json(result);
});

const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.body?.refreshToken, {
    ip: req.ip,
    requestId: req.requestId,
  });
  return res.status(200).json(result);
});

module.exports = {
  login,
  refresh,
  logout,
};
