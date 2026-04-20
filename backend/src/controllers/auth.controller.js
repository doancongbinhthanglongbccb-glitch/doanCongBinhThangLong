const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const {
  REFRESH_COOKIE_NAME,
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} = require("../utils/cookies");

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, {
    ip: req.ip,
    requestId: req.requestId,
  });

  setRefreshTokenCookie(res, result.refreshToken);

  return res.status(200).json({
    accessToken: result.accessToken,
    user: result.user,
  });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  const result = await authService.refresh(refreshToken, {
    ip: req.ip,
    requestId: req.requestId,
  });

  setRefreshTokenCookie(res, result.refreshToken);

  return res.status(200).json({
    accessToken: result.accessToken,
    user: result.user,
  });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  const result = await authService.logout(refreshToken, {
    ip: req.ip,
    requestId: req.requestId,
  });

  clearRefreshTokenCookie(res);

  return res.status(200).json(result);
});

module.exports = {
  login,
  refresh,
  logout,
};
