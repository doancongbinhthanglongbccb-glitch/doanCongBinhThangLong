type ApiErrorLike = {
  response?: {
    data?: {
      message?: string;
      code?: string;
      details?: unknown;
    };
    status?: number;
  };
  message?: string;
};

export const getApiErrorMessage = (error: unknown, fallback = "Đã xảy ra lỗi") => {
  const apiError = error as ApiErrorLike;
  return apiError?.response?.data?.message || apiError?.message || fallback;
};
