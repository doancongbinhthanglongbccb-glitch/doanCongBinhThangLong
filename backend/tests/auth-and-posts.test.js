process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret";
process.env.CORS_ORIGIN = "http://localhost:8080";
process.env.COOKIE_SECURE = "false";

const jwt = require("jsonwebtoken");
const request = require("supertest");
const { UnauthorizedError, BadRequestError } = require("../src/utils/errors");

jest.mock("../src/services/auth.service", () => ({
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
}));

jest.mock("../src/services/post.service", () => ({
  getPublishedPosts: jest.fn(),
  getCmsPosts: jest.fn(),
  getPublishedPostBySlug: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  publishPost: jest.fn(),
  deletePost: jest.fn(),
}));

const authService = require("../src/services/auth.service");
const postService = require("../src/services/post.service");
const { app } = require("../src/app");

const validPostPayload = {
  title: "This is a valid post title",
  content: "This is a sufficiently long post content for validation checks in tests.",
  thumbnail: "https://example.com/thumb.jpg",
};

describe("Auth and post flows", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("POST /api/auth/login returns access token and sets refresh cookie", async () => {
    authService.login.mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: { id: "u1", username: "admin", role: "admin" },
    });

    const response = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "secret123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: "access-token",
      user: { id: "u1", username: "admin", role: "admin" },
    });
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(authService.login).toHaveBeenCalledTimes(1);
  });

  test("POST /api/auth/refresh reads cookie and rotates refresh cookie", async () => {
    authService.refresh.mockResolvedValue({
      accessToken: "next-access-token",
      refreshToken: "next-refresh-token",
      user: { id: "u1", username: "admin", role: "admin" },
    });

    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", ["refreshToken=existing-refresh-token"])
      .send({});

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: "next-access-token",
      user: { id: "u1", username: "admin", role: "admin" },
    });
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(authService.refresh).toHaveBeenCalledWith(
      "existing-refresh-token",
      expect.objectContaining({ requestId: expect.any(String) }),
    );
  });

  test("POST /api/auth/refresh rejects invalid refresh token", async () => {
    authService.refresh.mockRejectedValue(new UnauthorizedError("Invalid or expired refresh token"));

    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", ["refreshToken=bad-token"])
      .send({});

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });

  test("POST /api/auth/logout clears refresh cookie", async () => {
    authService.logout.mockResolvedValue({ message: "Logged out successfully" });

    const response = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", ["refreshToken=existing-refresh-token"])
      .send({});

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]?.[0] || "").toContain("refreshToken=");
    expect(authService.logout).toHaveBeenCalledWith(
      "existing-refresh-token",
      expect.objectContaining({ requestId: expect.any(String) }),
    );
  });

  test("POST /api/posts blocks non-editor roles", async () => {
    const viewerToken = jwt.sign({ userId: "u2", role: "viewer" }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const response = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${viewerToken}`)
      .send(validPostPayload);

    expect(response.status).toBe(403);
    expect(postService.createPost).not.toHaveBeenCalled();
  });

  test("POST /api/posts rejects expired access token", async () => {
    const expiredToken = jwt.sign({ userId: "u5", role: "editor" }, process.env.JWT_SECRET, {
      expiresIn: -1,
    });

    const response = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${expiredToken}`)
      .send(validPostPayload);

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });

  test("POST /api/posts allows editor role", async () => {
    const editorToken = jwt.sign({ userId: "u3", role: "editor" }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    postService.createPost.mockResolvedValue({
      _id: "p1",
      title: validPostPayload.title,
      content: validPostPayload.content,
      status: "draft",
    });

    const response = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${editorToken}`)
      .send(validPostPayload);

    expect(response.status).toBe(201);
    expect(postService.createPost).toHaveBeenCalledTimes(1);
  });

  test("GET /api/posts returns data", async () => {
    postService.getPublishedPosts.mockResolvedValue({
      data: [{ _id: "p1", title: "Post 1", status: "published" }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const response = await request(app).get("/api/posts");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(postService.getPublishedPosts).toHaveBeenCalledWith(
      expect.objectContaining({
        page: undefined,
        limit: undefined,
        search: undefined,
        status: undefined,
        author: undefined,
        sort: undefined,
      }),
    );
  });

  test("GET /api/posts forwards status filter", async () => {
    postService.getPublishedPosts.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });

    const response = await request(app).get("/api/posts?status=published");

    expect(response.status).toBe(200);
    expect(postService.getPublishedPosts).toHaveBeenCalledWith(
      expect.objectContaining({ status: "published" }),
    );
  });

  test("GET /api/posts returns pagination payload", async () => {
    postService.getPublishedPosts.mockResolvedValue({
      data: [{ _id: "p1", title: "Post 1", status: "published" }],
      pagination: { page: 2, limit: 5, total: 11, totalPages: 3 },
    });

    const response = await request(app).get("/api/posts?page=2&limit=5");

    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({ page: 2, limit: 5, total: 11, totalPages: 3 });
    expect(postService.getPublishedPosts).toHaveBeenCalledWith(
      expect.objectContaining({ page: "2", limit: "5" }),
    );
  });

  test("GET /api/posts handles pagination overflow", async () => {
    postService.getPublishedPosts.mockResolvedValue({
      data: [],
      pagination: { page: 999, limit: 10, total: 25, totalPages: 3 },
    });

    const response = await request(app).get("/api/posts?page=999&limit=10");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.pagination).toEqual({ page: 999, limit: 10, total: 25, totalPages: 3 });
    expect(postService.getPublishedPosts).toHaveBeenCalledWith(
      expect.objectContaining({ page: "999", limit: "10" }),
    );
  });

  test("GET /api/posts forwards search filter", async () => {
    postService.getPublishedPosts.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });

    const response = await request(app).get("/api/posts?search=abc");

    expect(response.status).toBe(200);
    expect(postService.getPublishedPosts).toHaveBeenCalledWith(
      expect.objectContaining({ search: "abc" }),
    );
  });

  test("GET /api/posts forwards newest sort", async () => {
    postService.getPublishedPosts.mockResolvedValue({
      data: [{ _id: "p2" }, { _id: "p1" }],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });

    const response = await request(app).get("/api/posts?sort=newest");

    expect(response.status).toBe(200);
    expect(postService.getPublishedPosts).toHaveBeenCalledWith(
      expect.objectContaining({ sort: "newest" }),
    );
  });

  test("GET /api/posts forwards oldest sort", async () => {
    postService.getPublishedPosts.mockResolvedValue({
      data: [{ _id: "p1" }, { _id: "p2" }],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });

    const response = await request(app).get("/api/posts?sort=oldest");

    expect(response.status).toBe(200);
    expect(postService.getPublishedPosts).toHaveBeenCalledWith(
      expect.objectContaining({ sort: "oldest" }),
    );
  });

  test("GET /api/posts returns 400 when limit is greater than 100", async () => {
    postService.getPublishedPosts.mockRejectedValue(
      new BadRequestError("Limit must be less than or equal to 100"),
    );

    const response = await request(app).get("/api/posts?limit=101");

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("BAD_REQUEST");
    expect(postService.getPublishedPosts).toHaveBeenCalledWith(
      expect.objectContaining({ limit: "101" }),
    );
  });

  test("GET /api/posts/cms returns 401 when unauthorized", async () => {
    const response = await request(app).get("/api/posts/cms");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });

  test("PUT /api/config rejects invalid payloads with validation details", async () => {
    const adminToken = jwt.sign({ userId: "u4", role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const response = await request(app)
      .put("/api/config")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ header: { logo: 123 } });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
    expect(Array.isArray(response.body.details)).toBe(true);
  });
});
