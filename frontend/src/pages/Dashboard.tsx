import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export const UserDashboard: React.FC = () => {
  const { role } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const [robotAction, setRobotAction] = useState<string>("Standby");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleControl = (command: string) => {
    setRobotAction(command);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-neutral-800 p-6 rounded-2xl border border-neutral-700 shadow-lg">
          <div>
            <h1 className="text-2xl font-bold">Portal Kontrol Robot Pino</h1>
            <p className="text-neutral-400 text-sm">
              Sistem Manajemen IoT SV IPB | Role:{" "}
              <span className="text-blue-400 capitalize font-medium">
                {role}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-700 text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
              />
              <span className="text-neutral-300 font-medium">
                {isOnline ? "Terhubung (Online)" : "Mode Offline"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-neutral-800 p-6 rounded-2xl border border-neutral-700">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold">Kontrol Aksi Robot</h2>
              <span className="text-xs text-neutral-400">
                Aksi aktif:{" "}
                <span className="font-medium text-blue-400">{robotAction}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleControl("Maju")}
                className="p-4 bg-neutral-900 hover:bg-neutral-700 border border-neutral-700 rounded-xl font-medium text-sm text-center transition-colors"
              >
                ⬆️ Maju
              </button>
              <button
                onClick={() => handleControl("Mundur")}
                className="p-4 bg-neutral-900 hover:bg-neutral-700 border border-neutral-700 rounded-xl font-medium text-sm text-center transition-colors"
              >
                ⬇️ Mundur
              </button>
              <button
                onClick={() => handleControl("Belok Kiri")}
                className="p-4 bg-neutral-900 hover:bg-neutral-700 border border-neutral-700 rounded-xl font-medium text-sm text-center transition-colors"
              >
                ⬅️ Belok Kiri
              </button>
              <button
                onClick={() => handleControl("Belok Kanan")}
                className="p-4 bg-neutral-900 hover:bg-neutral-700 border border-neutral-700 rounded-xl font-medium text-sm text-center transition-colors"
              >
                ➡️ Belok Kanan
              </button>
              <button
                onClick={() => handleControl("Stop Emergency")}
                className="col-span-2 sm:col-span-1 p-4 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 rounded-xl font-bold text-sm text-center transition-colors"
              >
                🛑 STOP
              </button>
            </div>
          </div>

          <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold mb-2">PWA Offline Storage</h2>
              <p className="text-neutral-400 text-xs mb-4">
                Data kontrol dan telemetri akan tersimpan di penyimpanan lokal
                browser saat koneksi jaringan terputus.
              </p>
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-700/50 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Cache Status:</span>
                  <span className="text-emerald-400 font-mono">Aktif</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Pending Sync:</span>
                  <span className="text-neutral-200 font-mono">0 Data</span>
                </div>
              </div>
            </div>

            <button
              disabled={!isOnline}
              className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
            >
              Sinkronisasi Manual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
