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
