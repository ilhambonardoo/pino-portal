export interface Device {
  id: number;
  name: string;
  device_key: string;
  type: string;
  status: "online" | "offline";
  state?: string | null;
  is_private: boolean;
  owner_id?: number | null;
  last_active: string | null;
  created_at: string;
}

export interface CreateDeviceRequest {
  name: string;
  device_key: string;
  type: string;
  is_private: boolean;
  owner_id?: number | null;
}

export interface UpdateDeviceRequest {
  id: number;
  name: string;
  type: string;
  status: string;
  is_private: boolean;
  owner_id?: number | null;
}

export interface ControlDeviceRequest {
  command: string;
  value?: number;
}
