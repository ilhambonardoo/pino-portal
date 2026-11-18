import React from "react";
import type { Device } from "../../type/device";
import {
  getDeviceCategory,
  getDeviceIcon,
  getStatusSummary,
  parseDeviceState,
} from "../../helper/device_helper";
import { BiEdit, BiTrash } from "react-icons/bi";

interface DeviceCardProps {
  device: Device;
  onSelect: (device: Device) => void;
  onEdit: (device: Device) => void;
  onDelete: (id: number) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onDelete,
  onEdit,
  onSelect,
}) => {
  const isOffline = device.status.toLowerCase() === "offline";
  const category = getDeviceCategory(device.type);
  const state = parseDeviceState(device.state || null, device.type);
  const DeviceIcon = getDeviceIcon(device.type);

  const isActive =
    !isOffline && category === "lock"
      ? !state.locked
      : category === "cover"
        ? state.position === "OPEN"
        : category === "sensor" || category === "hub"
          ? true
          : state.power === "ON";

  const statusText = getStatusSummary(
    device.state || null,
    device.type,
    isOffline,
  );
  return (
    <div
      onClick={() => onSelect(device)}
      className={`group cursor-pointer bg-slate-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all hover:-translate-y-0.5 ${
        isActive
          ? "border-amber-500/40 hover:border-amber-400"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-colors ${
            isActive
              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          <DeviceIcon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div
          className="flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(device)}
            className="p-1.5 text-slate-400 hover:bg-white bg-slate-800/70  rounded-lg text-xs cursor-pointer"
            title="Edit Perangkat"
          >
            <BiEdit size={25} />
          </button>
          <button
            onClick={() => onDelete(device.id)}
            className="p-1.5 text-slate-400 hover:bg-red-400 bg-slate-800/70 rounded-lg text-xs cursor-pointer"
            title="Hapus Perangkat"
          >
            <BiTrash size={25} />
          </button>
        </div>
      </div>
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
              isOffline
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            {device.status}
          </span>

          {device.is_private && (
            <span className="text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              Private
            </span>
          )}
        </div>

        <h2
          className="text-base font-bold text-white truncate"
          title={device.name}
        >
          {device.name}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 font-mono truncate">
          {device.device_key}
        </p>
      </div>
      <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate max-w-27.5">
          {device.type.replace("_", " ")}
        </span>

        <span
          className={`px-3 py-1 rounded-lg text-xs font-bold ${
            isOffline
              ? "bg-slate-800 text-slate-500"
              : isActive
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "bg-slate-800 text-slate-400"
          }`}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
};
