// lib/utils/errorHandling.ts

import { AxiosError } from "axios";

export class ApiError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500);
  }

  if (typeof error === "string") {
    return new ApiError(error, 500);
  }

  // Handle unknown error types
  return new ApiError("An unknown error occurred", 500);
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isAxiosError(error: unknown): error is AxiosError {
  return error instanceof AxiosError;
}

export function logErrorResponse(error: unknown): void {
  if (isAxiosError(error)) {
    console.error("Axios Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
      },
    });
  } else if (error instanceof Error) {
    console.error("Error:", error.message, error.stack);
  } else {
    console.error("Unknown error:", error);
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unknown error occurred";
}

export function getErrorStatus(error: unknown): number {
  if (error instanceof ApiError) {
    return error.status;
  }

  if (isAxiosError(error)) {
    return error.response?.status || 500;
  }

  return 500;
}
