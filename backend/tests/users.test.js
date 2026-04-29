process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret";
process.env.CORS_ORIGIN = "http://localhost:8080";
process.env.COOKIE_SECURE = "false";

const jwt = require("jsonwebtoken");
const request = require("supertest");
jest.mock("../src/modules/user/service/user.service", () => ({
  listUsers: jest.fn(),
  updateUserRole: jest.fn(),
}));

const userService = require("../src/modules/user/service/user.service");
const { app } = require("../src/app");

const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET);

describe("User management", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/users requires admin", async () => {
    const editorToken = signToken({ userId: "u1", role: "editor" });
    const res = await request(app).get("/api/users").set("Authorization", `Bearer ${editorToken}`);
    expect(res.status).toBe(403);
  });

  test("GET /api/users returns paginated users for admin", async () => {
    userService.listUsers.mockResolvedValue({
      items: [{ id: "u1", username: "a@b.com", role: "admin" }],
      total: 1,
      page: 1,
      size: 20,
      pages: 1,
    });

    const adminToken = signToken({ userId: "u9", role: "admin" });
    const res = await request(app).get("/api/users?search=a").set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items?.length).toBe(1);
    expect(userService.listUsers).toHaveBeenCalledWith(
      expect.objectContaining({ search: "a" }),
    );
  });

  test("PATCH /api/users/:id/role updates role (admin only)", async () => {
    userService.updateUserRole.mockResolvedValue({
      id: "u2",
      username: "x@y.com",
      role: "editor",
    });

    const adminToken = signToken({ userId: "u9", role: "admin" });
    const res = await request(app)
      .patch("/api/users/u2/role")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "editor" });

    expect(res.status).toBe(200);
    expect(userService.updateUserRole).toHaveBeenCalledWith(
      "u2",
      "editor",
      expect.objectContaining({ userId: "u9" }),
    );
  });
});

