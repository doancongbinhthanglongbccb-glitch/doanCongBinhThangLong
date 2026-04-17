const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Doan Cong Binh Thang Long API",
      version: "1.0.0",
      description: "Backend API documentation for auth, posts, and config modules.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        LoginRequest: {
          type: "object",
          required: ["password"],
          properties: {
            email: { type: "string", format: "email" },
            username: { type: "string" },
            password: { type: "string", minLength: 6 },
          },
        },
        RefreshRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string" },
          },
        },
        CreatePostRequest: {
          type: "object",
          required: ["title", "content"],
          properties: {
            title: { type: "string", minLength: 10 },
            content: { type: "string", minLength: 50 },
            thumbnail: { type: "string" },
            status: { type: "string", enum: ["draft", "published"] },
          },
        },
        UpdatePostRequest: {
          type: "object",
          properties: {
            title: { type: "string", minLength: 10 },
            content: { type: "string", minLength: 50 },
            thumbnail: { type: "string" },
            status: { type: "string", enum: ["draft", "published"] },
          },
        },
        ConfigRequest: {
          type: "object",
          properties: {
            header: { type: "object", additionalProperties: true },
            menu: {
              type: "array",
              items: { type: "object", additionalProperties: true },
            },
            footer: { type: "object", additionalProperties: true },
          },
        },
      },
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["System"],
          summary: "Health check",
          responses: {
            200: {
              description: "Service is healthy",
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            200: { description: "Login success" },
            400: { description: "Validation error" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RefreshRequest" },
              },
            },
          },
          responses: {
            200: { description: "Token refreshed" },
            401: { description: "Invalid refresh token" },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout and revoke refresh token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RefreshRequest" },
              },
            },
          },
          responses: {
            200: { description: "Logout success" },
            401: { description: "Invalid refresh token" },
          },
        },
      },
      "/api/posts": {
        get: {
          tags: ["Posts"],
          summary: "Get published posts",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
            { name: "search", in: "query", schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Published posts list" },
          },
        },
        post: {
          tags: ["Posts"],
          summary: "Create post",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreatePostRequest" },
              },
            },
          },
          responses: {
            201: { description: "Post created" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/api/posts/cms": {
        get: {
          tags: ["Posts"],
          summary: "Get CMS post list",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "CMS posts" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/posts/{id}": {
        put: {
          tags: ["Posts"],
          summary: "Update post",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdatePostRequest" },
              },
            },
          },
          responses: {
            200: { description: "Post updated" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
        delete: {
          tags: ["Posts"],
          summary: "Delete post",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Post deleted" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/api/posts/{id}/publish": {
        put: {
          tags: ["Posts"],
          summary: "Publish post",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Post published" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/api/posts/{slug}": {
        get: {
          tags: ["Posts"],
          summary: "Get published post by slug",
          parameters: [
            { name: "slug", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Published post" },
            404: { description: "Not found" },
          },
        },
      },
      "/api/config": {
        get: {
          tags: ["Config"],
          summary: "Get site config",
          responses: {
            200: { description: "Config payload" },
          },
        },
        put: {
          tags: ["Config"],
          summary: "Update site config",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ConfigRequest" },
              },
            },
          },
          responses: {
            200: { description: "Config updated" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};

module.exports = setupSwagger;
