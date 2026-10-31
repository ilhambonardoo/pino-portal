import type { CreateUserPayload, User } from "../type/auth";
import { api } from "./api";

export const userService = {
  getAll: async (): Promise<User[]> => {
    const res = await api.get<User[]>("/users");
    return res.data;
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const res = await api.post<User>("/users", payload);
    return res.data;
  },

  update: async (id: number, payload: CreateUserPayload): Promise<User> => {
    const res = await api.put<User>(`/users/${id}`, payload);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete<User>(`/users/${id}`);
  },
};
