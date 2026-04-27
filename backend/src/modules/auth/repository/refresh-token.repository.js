const RefreshToken = require("../../../models/RefreshToken");
const { hashToken } = require("../../../utils/token");

const create = async ({ userId, refreshToken, expiresAt }) => {
  const hashedToken = hashToken(refreshToken);

  return RefreshToken.create({
    userId,
    token: hashedToken,
    expiresAt,
  });
};

const findOne = async (hashedToken) => {
  return RefreshToken.findOne({ token: hashedToken });
};

const deleteOne = async (hashedToken) => {
  return RefreshToken.deleteOne({ token: hashedToken });
};

const revokeAllForUser = async (userId) => {
  return RefreshToken.deleteMany({ userId });
};

module.exports = {
  create,
  findOne,
  deleteOne,
  revokeAllForUser,
};
