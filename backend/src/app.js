const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const configRoutes = require("./routes/config.routes");
const setupSwagger = require("./docs/swagger");
const errorMiddleware = require("./middleware/error.middleware");
const requestLogger = require("./middleware/request-logger.middleware");
const requestTimeoutMiddleware = require("./middleware/request-timeout.middleware");
const writeRateLimiter = require("./middleware/write-rate-limit.middleware");
const logger = require("./utils/logger");
const { env } = require("./config/env");

const getCorsAllowList = () => {
  const configuredOrigins = (env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return configuredOrigins;
};

const createCorsOptions = () => {
  const allowList = getCorsAllowList();

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowList.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  };
};

const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler(req, res) {
    logger.warn(
      {
        action: "RATE_LIMIT_EXCEEDED",
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
        requestId: req.id || req.requestId || null,
      },
      "API rate limit exceeded"
    );

    res.status(429).json({
      message: "Too many requests, please try again later",
      statusCode: 429,
    });
  },
});

const createApp = () => {
  const app = express();

  // Trust the first proxy hop (nginx) so req.ip is correct for rate limiting.
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(cors(createCorsOptions()));
  app.use(cookieParser());
  app.use(express.json({ limit: env.REQUEST_BODY_LIMIT }));
  app.use(requestLogger);
  app.use(requestTimeoutMiddleware);
  app.use("/api", apiRateLimiter);

  app.get("/api/health", (req, res) => {
    const mongoConnected = mongoose.connection.readyState === 1;
    const statusCode = mongoConnected ? 200 : 503;

    return res.status(statusCode).json({
      status: mongoConnected ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        connected: mongoConnected,
        state: ["disconnected", "connected", "connecting", "disconnecting"][
          mongoose.connection.readyState
        ],
      },
    });
  });

  app.use("/api/auth", authRoutes);

  // Apply write rate limiting to write operations
  app.post("/api/posts", writeRateLimiter);
  app.put("/api/posts/:id", writeRateLimiter);
  app.delete("/api/posts/:id", writeRateLimiter);

  app.use("/api/posts", postRoutes);
  app.use("/api/config", configRoutes);
  if (env.SWAGGER_ENABLED) {
    setupSwagger(app);
  }

  app.use((req, res) => {
    return res.status(404).json({ message: "Route not found" });
  });

  app.use(errorMiddleware);

  return app;
};

const app = createApp();

module.exports = {
  app,
  createApp,
};
