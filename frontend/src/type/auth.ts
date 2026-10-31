export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: "admin" | "karyawan" | "user";
}

export interface ApiError {
  error: string;
}

export interface User {
  id: number;
  username: string;
  role: "admin" | "karyawan" | "user";
  created_at: string;
}

export interface CreateUserPayload {
  username: string;
  password?: string;
  role: "admin" | "karyawan" | "user";
}

export interface UpdateUserPayload extends CreateUserPayload {
  id: number;
}
