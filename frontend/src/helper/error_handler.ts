import axios from "axios";
import type { ApiError } from "../type/auth";
import { getFriendlyApiError } from "./api_error_message";

export function getApiError(error: unknown, fallbackMessage: string): string {
  if (axios.isAxiosError(error) && error.response) {
    const apiError = error.response.data as ApiError;
    return getFriendlyApiError(
      apiError.error,
      error.response.status,
      fallbackMessage,
    );
  }

  if (axios.isAxiosError(error)) {
    return "Gagal terhubung ke server";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
