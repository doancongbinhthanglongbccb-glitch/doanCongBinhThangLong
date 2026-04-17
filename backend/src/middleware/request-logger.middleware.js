const logger = require("../utils/logger");
const { randomUUID } = require("crypto");

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = req.headers["x-request-id"] || randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  logger.info(
    {
      action: "INCOMING_REQUEST",
      endpoint: req.originalUrl,
      method: req.method,
      userId: req.user?.userId || null,
      requestId,
    },
    "Incoming request"
  );

  res.on("finish", () => {
    logger.info(
      {
        action: "REQUEST_COMPLETED",
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
        userId: req.user?.userId || null,
        requestId,
      },
      "Request completed"
    );
  });

  next();
};

module.exports = requestLogger;
