const pino = require("pino");
const { sanitizeObject } = require("./sanitize-logger");

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  messageKey: "message",
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  base: undefined,
  formatters: {
    level: (label) => ({ level: label }),
    log: (object) => {
      const { requestId, ...context } = object || {};
      // Sanitize sensitive data before logging
      const sanitized = sanitizeObject(context);
      return {
        requestId: requestId || null,
        context: sanitized,
      };
    },
  },
});

module.exports = logger;
