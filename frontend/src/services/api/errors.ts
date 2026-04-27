/**
 * API error helpers.
 *
 * Backend canonical error response (see `backend/src/middleware/error.middleware.js`):
 *   { error: { code, message, details? } }
 *
 * Older callers may still see flat `{ message, code, details }` while the
 * migration finishes; both shapes are handled here so that callers don't
 * have to special-case them.
 */

export type ApiErrorPayload = {
  code?: string;
  message?: string;
  details?: unknown;
};

export type ApiErrorBody =
  | { error?: ApiErrorPayload }
  | ApiErrorPayload
  | undefined;

type AxiosLikeError = {
  response?: {
    status?: number;
    data?: ApiErrorBody;
  };
  message?: string;
};

const extractPayload = (body: ApiErrorBody): ApiErrorPayload | undefined => {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  if ("error" in body && body.error && typeof body.error === "object") {
    return body.error;
  }

  return body as ApiErrorPayload;
};

export const getApiErrorPayload = (error: unknown): ApiErrorPayload | undefined => {
  const apiError = error as AxiosLikeError | undefined;
  return extractPayload(apiError?.response?.data);
};

export const getApiErrorCode = (error: unknown): string | undefined => {
  return getApiErrorPayload(error)?.code;
};

export const getApiErrorMessage = (error: unknown, fallback = "Đã xảy ra lỗi"): string => {
  const payload = getApiErrorPayload(error);
  if (payload?.message) {
    return payload.message;
  }

  const apiError = error as AxiosLikeError | undefined;
  return apiError?.message || fallback;
};

export const getApiErrorDetails = (error: unknown): unknown => {
  return getApiErrorPayload(error)?.details;
};
