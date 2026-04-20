/**
 * Sanitize sensitive data from objects before logging.
 * Removes tokens, passwords, and other confidential fields.
 */
const SENSITIVE_FIELDS = [
  "password",
  "accessToken",
  "refreshToken",
  "token",
  "secret",
  "apiKey",
  "authorization",
  "cookie",
  "sessionId",
  "creditCard",
];

const SENSITIVE_PATTERNS = [
  /bearer\s+[\w\-\.]+/i,
  /basic\s+[\w\-\.]+/i,
];

const sanitizeValue = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  // Check against sensitive patterns
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(value)) {
      return "[REDACTED]";
    }
  }

  return value;
};

const sanitizeObject = (obj, depth = 0) => {
  // Prevent deep recursion
  if (depth > 10 || obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== "object") {
    return sanitizeValue(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitiveField = SENSITIVE_FIELDS.some(
      (field) => lowerKey.includes(field) || field.includes(lowerKey)
    );

    if (isSensitiveField) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value, depth + 1);
    } else {
      sanitized[key] = sanitizeValue(value);
    }
  }

  return sanitized;
};

module.exports = {
  sanitizeObject,
  sanitizeValue,
};
