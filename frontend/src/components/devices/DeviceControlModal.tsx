import { useEffect, useState } from "react";
import {
  getDeviceCategory,
  getDeviceIcon,
  parseDeviceState,
  type ParsedDeviceState,
} from "../../helper/device_helper";
import type { Device } from "../../type/device";

interface DeviceControlModalPorps {
  device: Device | null;
  onClose: () => void;
  onControl: (
    device: Device,
    command: string,
    value: number,
    nextState: ParsedDeviceState,
  ) => Promise<void>;
}

export const DeviceControlModal: React.FC<DeviceControlModalPorps> = ({
  device,
  onClose,
  onControl,
}) => {
  const [localState, setLocalState] = useState<ParsedDeviceState | null>(null);

  useEffect(() => {
    if (device) {
      setLocalState(parseDeviceState(device.state || null, device.type));
    }
  }, [device]);

  if (!device || !localState) return null;

  const isOffline = device.status.toLowerCase() === "offline";
  const category = getDeviceCategory(device.type);
  const DeviceIcon = getDeviceIcon(device.type);

  const dispatchCommand = async (
    command: string,
    value: number,
    updated: ParsedDeviceState,
  ) => {
    setLocalState(updated);
    await onControl(device, command, value, updated);
  };
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-slate-100"
      >
        <div className="flex justify-between items-start pb-4 mb-5 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl">
              <DeviceIcon
                className="h-7 w-7 text-amber-400"
                aria-hidden="true"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{device.name}</h2>
              <p className="text-xs text-slate-400 font-mono">
                {device.device_key}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 cursor-pointer h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {isOffline ? (
          <div className="py-10 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
            <p className="text-red-400 font-bold text-sm">
              Perangkat Sedang Offline
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Kontrol tidak tersedia hingga perangkat kembali terhubung.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {category === "sensor" || category === "hub" ? (
              <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-2xl text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {category === "hub" ? "Status Gateway" : "Pembacaan Sensor"}
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {category === "hub"
                    ? "Terhubung & Aktif"
                    : localState.reading}
                </p>
              </div>
            ) : category === "lock" ? (
              <button
                onClick={() => {
                  const nextLocked = !localState.locked;
                  dispatchCommand(
                    nextLocked ? "LOCK" : "UNLOCK",
                    nextLocked ? 1 : 0,
                    {
                      ...localState,
                      locked: nextLocked,
                      power: nextLocked ? "OFF" : "ON",
                    },
                  );
                }}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                  localState.locked
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/25"
                    : "bg-red-500 text-white shadow-lg shadow-red-500/25 hover:bg-red-400"
                }`}
              >
                {localState.locked
                  ? "🔒 Pintu Terkunci (Klik untuk Buka)"
                  : "🔓 Pintu Terbuka (Klik untuk Kunci)"}
              </button>
            ) : category === "cover" ? (
              <div className="grid grid-cols-3 gap-2.5">
                {(["OPEN", "STOP", "CLOSED"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() =>
                      dispatchCommand(
                        pos === "CLOSED" ? "CLOSE" : pos,
                        pos === "OPEN" ? 100 : pos === "STOP" ? 50 : 0,
                        { ...localState, position: pos },
                      )
                    }
                    className={`py-3.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      localState.position === pos
                        ? "bg-amber-400 text-slate-950 border-amber-400"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {pos === "OPEN"
                      ? "Buka"
                      : pos === "STOP"
                        ? "Stop"
                        : "Tutup"}
                  </button>
                ))}
              </div>
            ) : category === "trigger" ? (
              <button
                onClick={() =>
                  dispatchCommand("TRIGGER", 1, { ...localState, power: "ON" })
                }
                className="w-full py-4 cursor-pointer rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20"
              >
                ⚡ Jalankan Aksi / Pemicu Sekarang
              </button>
            ) : (
              <button
                onClick={() => {
                  const nextPower = localState.power === "ON" ? "OFF" : "ON";
                  dispatchCommand(
                    nextPower === "ON" ? "TURN_ON" : "TURN_OFF",
                    nextPower === "ON" ? 1 : 0,
                    { ...localState, power: nextPower },
                  );
                }}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                  localState.power === "ON"
                    ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/25 hover:bg-amber-300"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {localState.power === "ON"
                  ? "⚡ Perangkat MENYALA (Klik untuk Matikan)"
                  : "⏻ Perangkat MATI (Klik untuk Nyalakan)"}
              </button>
            )}

            {localState.power === "ON" && category === "lighting" && (
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-slate-400">
                    Tingkat Kecerahan
                  </span>
                  <span className="text-sm font-bold text-amber-400">
                    {localState.brightness}%
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={localState.brightness}
                  onChange={(e) =>
                    setLocalState({
                      ...localState,
                      brightness: Number(e.target.value),
                    })
                  }
                  onMouseUp={(e) => {
                    const val = Number((e.target as HTMLInputElement).value);
                    dispatchCommand("SET_BRIGHTNESS", val, {
                      ...localState,
                      brightness: val,
                    });
                  }}
                  onTouchEnd={(e) => {
                    const val = Number((e.target as HTMLInputElement).value);
                    dispatchCommand("SET_BRIGHTNESS", val, {
                      ...localState,
                      brightness: val,
                    });
                  }}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>
            )}

            {localState.power === "ON" && category === "climate" && (
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Pengaturan Suhu
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Rentang 16°C – 30°C
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const nextTemp = Math.max(16, localState.temp - 1);
                      dispatchCommand("SET_TEMP", nextTemp, {
                        ...localState,
                        temp: nextTemp,
                      });
                    }}
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-cyan-400 w-14 text-center">
                    {localState.temp}°C
                  </span>
                  <button
                    onClick={() => {
                      const nextTemp = Math.min(30, localState.temp + 1);
                      dispatchCommand("SET_TEMP", nextTemp, {
                        ...localState,
                        temp: nextTemp,
                      });
                    }}
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {localState.power === "ON" && category === "fan" && (
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <p className="text-xs font-medium text-slate-400 mb-2.5">
                  Kecepatan Kipas
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(["LOW", "MEDIUM", "HIGH"] as const).map((spd, idx) => (
                    <button
                      key={spd}
                      onClick={() =>
                        dispatchCommand("SET_SPEED", idx + 1, {
                          ...localState,
                          speed: spd,
                        })
                      }
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        localState.speed === spd
                          ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
