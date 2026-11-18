import type {
  ControlDeviceRequest,
  CreateDeviceRequest,
  Device,
  UpdateDeviceRequest,
} from "../type/device";
import { api } from "./api";

export const deviceService = {
  getAll: async (): Promise<Device[]> => {
    const response = await api.get("/devices");
    if (Array.isArray(response.data)) {
      return response.data;
    }

    return Array.isArray(response.data?.data) ? response.data.data : [];
  },
  create: async (payload: CreateDeviceRequest): Promise<Device> => {
    const response = await api.post("/devices", payload);
    return response.data.data || response.data;
  },
  update: async (id: number, payload: UpdateDeviceRequest): Promise<Device> => {
    const response = await api.put(`/devices/${id}`, payload);
    return response.data.data || response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/devices/${id}`);
  },
  control: async (id: number, payload: ControlDeviceRequest) => {
    const response = await api.post(`/devices/${id}/control`, payload);
    return response.data;
  },
};
