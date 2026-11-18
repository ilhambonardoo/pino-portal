import type { IconType } from "react-icons";
import {
  FiAirplay,
  FiBell,
  FiDroplet,
  FiGrid,
  FiLock,
  FiRadio,
  FiShield,
  FiSun,
  FiThermometer,
  FiWind,
  FiWifi,
  FiZap,
} from "react-icons/fi";

export interface ParsedDeviceState {
  power: "ON" | "OFF";
  brightness: number;
  temp: number;
  speed: "LOW" | "MEDIUM" | "HIGH";
  position: "OPEN" | "CLOSED" | "STOP";
  locked: boolean;
  reading: string;
}

export type DeviceCategory =
  | "lighting"
  | "climate"
  | "fan"
  | "cover"
  | "lock"
  | "sensor"
  | "trigger"
  | "hub"
  | "switch";

export const getDeviceCategory = (type: string): DeviceCategory => {
  const t = type.toLowerCase();
  if (["light", "dimmer", "led_strip"].includes(t)) return "lighting";
  if (["ac", "thermostat"].includes(t)) return "climate";
  if (t === "fan") return "fan";
  if (["curtain", "roller_blind", "garage_door"].includes(t)) return "cover";
  if (t === "lock") return "lock";
  if (t.startsWith("sensor")) return "sensor";
  if (["siren", "scene_switch"].includes(t)) return "trigger";
  if (t === "gateway") return "hub";
  return "switch";
};

export const parseDeviceState = (
  rawState: string | null,
  type: string,
): ParsedDeviceState => {
  const defaults: ParsedDeviceState = {
    power: "OFF",
    brightness: 100,
    temp: 24,
    speed: "MEDIUM",
    position: "CLOSED",
    locked: true,
    reading: "Normal",
  };

  if (!rawState) return defaults;

  try {
    const parsed = JSON.parse(rawState);
    if (typeof parsed === "object" && parsed !== null) {
      return { ...defaults, ...parsed };
    }
  } catch {
    const upper = rawState.toUpperCase();
    if (upper === "ON") return { ...defaults, power: "ON" };
    if (upper === "OFF") return { ...defaults, power: "OFF" };
    if (upper === "UNLOCKED")
      return { ...defaults, locked: false, power: "ON" };
    if (upper === "LOCKED") return { ...defaults, locked: true, power: "OFF" };
    if (upper === "OPEN") return { ...defaults, position: "OPEN", power: "ON" };
    if (upper === "CLOSED")
      return { ...defaults, position: "CLOSED", power: "OFF" };
    if (getDeviceCategory(type) === "sensor")
      return { ...defaults, reading: rawState };
  }

  return defaults;
};

export const getDeviceIcon = (type: string): IconType => {
  const t = type.toLowerCase();
  if (["light", "dimmer", "led_strip"].includes(t)) return FiSun;
  if (["ac", "thermostat", "ir_blaster"].includes(t)) return FiThermometer;
  if (t === "fan") return FiWind;
  if (["curtain", "roller_blind", "garage_door"].includes(t)) return FiGrid;
  if (t === "lock") return FiLock;
  if (t === "siren") return FiBell;
  if (t === "valve") return FiDroplet;
  if (t === "gateway") return FiWifi;
  if (t === "scene_switch") return FiRadio;
  if (t === "sensor_temp") return FiThermometer;
  if (t === "sensor_motion") return FiShield;
  if (t === "sensor_door") return FiGrid;
  if (t === "sensor_water") return FiDroplet;
  if (t === "sensor_smoke") return FiBell;
  if (t === "sensor_air") return FiAirplay;
  return FiZap;
};

export const getStatusSummary = (
  rawState: string | null,
  type: string,
  isOffline: boolean,
): string => {
  if (isOffline) return "OFFLINE";
  const category = getDeviceCategory(type);
  const state = parseDeviceState(rawState, type);

  switch (category) {
    case "lighting":
      return state.power === "ON" ? `ON • ${state.brightness}%` : "OFF";
    case "climate":
      return state.power === "ON" ? `ON • ${state.temp}°C` : "OFF";
    case "fan":
      return state.power === "ON" ? `ON • ${state.speed}` : "OFF";
    case "lock":
      return state.locked ? "LOCKED" : "UNLOCKED";
    case "cover":
      return state.position;
    case "sensor":
      return state.reading;
    case "hub":
      return "HUB AKTIF";
    case "trigger":
      return "STANDBY";
    default:
      return state.power;
  }
};

export interface DeviceTypeOption {
  value: string;
  label: string;
}

export interface DeviceTypeGroup {
  group: string;
  options: DeviceTypeOption[];
}

export const DEVICE_TYPE_GROUPS: DeviceTypeGroup[] = [
  {
    group: "A. Pencahayaan (Smart Lighting)",
    options: [
      { value: "light", label: "Smart Bulb / Lampu" },
      { value: "led_strip", label: "Smart LED Strip" },
      { value: "dimmer", label: "Smart Dimmer Module" },
    ],
  },
  {
    group: "B. Saklar & Daya (Switches & Power)",
    options: [
      { value: "switch", label: "Smart Wall Switch" },
      { value: "smart_plug", label: "Smart Plug / Power Strip" },
      { value: "relay", label: "Smart Relay / Breaker" },
      { value: "valve", label: "Water / Gas Valve Controller" },
    ],
  },
  {
    group: "C. Iklim & HVAC (Climate)",
    options: [
      { value: "ac", label: "AC / Pendingin Ruangan" },
      { value: "thermostat", label: "Smart Thermostat / TRV" },
      { value: "fan", label: "Smart Fan / Air Purifier" },
      { value: "ir_blaster", label: "IR Blaster (Remote AC/TV)" },
    ],
  },
  {
    group: "D. Tirai & Penutup (Covers)",
    options: [
      { value: "curtain", label: "Smart Curtain (Gorden)" },
      { value: "roller_blind", label: "Roller / Venetian Blind" },
      { value: "garage_door", label: "Garage / Gate Controller" },
    ],
  },
  {
    group: "E. Akses & Keamanan (Security)",
    options: [
      { value: "lock", label: "Smart Door Lock" },
      { value: "siren", label: "Smart Siren / Alarm" },
    ],
  },
  {
    group: "F. Sensor Lingkungan (Monitoring)",
    options: [
      { value: "sensor_temp", label: "Temperature & Humidity Sensor" },
      {
        value: "sensor_motion",
        label: "Motion / Presence Sensor (PIR/mmWave)",
      },
      { value: "sensor_door", label: "Door / Window Contact Sensor" },
      { value: "sensor_water", label: "Water Leak Sensor" },
      { value: "sensor_smoke", label: "Smoke / Gas / CO Detector" },
      { value: "sensor_air", label: "Air Quality / Lux Sensor" },
    ],
  },
  {
    group: "G. Hub & Kontroler",
    options: [
      { value: "gateway", label: "Zigbee Hub / Gateway" },
      { value: "scene_switch", label: "Wireless Scene Switch / Knob" },
    ],
  },
];

export const ALL_PRESET_TYPES = DEVICE_TYPE_GROUPS.flatMap((g) =>
  g.options.map((opt) => opt.value),
);
