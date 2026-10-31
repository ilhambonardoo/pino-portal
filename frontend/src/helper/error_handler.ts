import axios from "axios";
import type { ApiError } from "../type/auth";

export function getApiError(error: unknown, fallbackMessage: string): string {
  if (axios.isAxiosError(error) && error.response) {
    const apiError = error.response.data as ApiError;
    return apiError.error || fallbackMessage;
  }

  return "Gagal terhubung ke server";
}
