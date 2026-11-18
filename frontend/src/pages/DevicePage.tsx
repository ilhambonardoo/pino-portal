import { useEffect, useState } from "react";
import type {
  CreateDeviceRequest,
  Device,
  UpdateDeviceRequest,
} from "../type/device";
import { deviceService } from "../services/deviceService";
import type { ParsedDeviceState } from "../helper/device_helper";
import { DeviceControlModal } from "../components/devices/DeviceControlModal";
import { DeviceCard } from "../components/devices/DeviceCard";
import DeviceModal from "../components/devices/DeviceModal";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { ErrorMessage } from "../components/HandleMessage";
import { getApiError } from "../helper/error_handler";

export const DevicePage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCrudModalOpen, setIsCrudModalOpen] = useState<boolean>(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [controllingDevice, setControllingDevice] = useState<Device | null>(
    null,
  );
  const [deletingDevice, setDeletingDevice] = useState<Device | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDevices = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await deviceService.getAll();
      setDevices(data || []);
    } catch (error) {
      setErrorMessage(getApiError(error, "Gagal mengambil data perangkat."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deletingDevice) return;

    try {
      setIsDeleting(true);
      setErrorMessage(null);
      await deviceService.delete(deletingDevice.id);
      setDevices((prev) => prev.filter((d) => d.id !== deletingDevice.id));
      setDeletingDevice(null);
    } catch (error) {
      setErrorMessage(getApiError(error, "Gagal menghapus perangkat."));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleControlDevice = async (
    device: Device,
    command: string,
    value: number,
    nextParsedState: ParsedDeviceState,
  ) => {
    const previousRawState = device.state;
    const optimisticRawState = JSON.stringify(nextParsedState);

    setDevices((prev) =>
      prev.map((item) =>
        item.id === device.id ? { ...item, state: optimisticRawState } : item,
      ),
    );

    setControllingDevice((prev) =>
      prev && prev.id ? { ...prev, state: optimisticRawState } : prev,
    );

    try {
      await deviceService.control(device.id, { command, value });
    } catch (error) {
      setDevices((prev) =>
        prev.map((item) =>
          item.id === device.id ? { ...item, state: previousRawState } : item,
        ),
      );
      setErrorMessage(
        getApiError(error, "Gagal mengirim perintah ke perangkat."),
      );
    }
  };
  const deviceTypes = Array.from(
    new Set(devices.map((d) => d.type.toLowerCase())),
  );

  const filteredDevices = devices.filter(
    (d) => selectedType === "all" || d.type.toLowerCase() === selectedType,
  );

  async function handleSaveDevice(
    data: CreateDeviceRequest | UpdateDeviceRequest,
  ): Promise<void> {
    setErrorMessage(null);
    try {
      if ("id" in data) {
        const updated = await deviceService.update(data.id, data);
        setDevices((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        const created = await deviceService.create(data);
        setDevices((prev) => [created, ...prev]);
      }
    } catch (error) {
      const message = getApiError(
        error,
        editingDevice
          ? "Gagal memperbarui perangkat."
          : "Gagal menambah perangkat.",
      );
      setErrorMessage(message);
      throw new Error(message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Manajemen Perangkat IoT
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Klik kartu perangkat untuk membuka panel kontrol detail
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={loadDevices}
            disabled={isLoading}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>

          <button
            onClick={() => {
              setEditingDevice(null);
              setIsCrudModalOpen(true);
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            + Tambah Device
          </button>
        </div>
      </div>

      <ErrorMessage message={errorMessage ?? ""} />

      {/* Filter Tabs */}
      {devices.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
              selectedType === "all"
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            Semua ({devices.length})
          </button>

          {deviceTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase whitespace-nowrap transition-all cursor-pointer ${
                selectedType === type
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>
      )}

      {/* Grid Cards */}
      {isLoading && devices.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          Memuat data perangkat...
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 border-dashed rounded-2xl p-12 text-center">
          <p className="text-slate-300 font-semibold text-base">
            Belum ada perangkat terdaftar
          </p>
          <p className="text-slate-500 text-xs mt-1 mb-5">
            Klik tombol di bawah untuk menambahkan perangkat IoT pertama Anda.
          </p>
          <button
            onClick={() => {
              setEditingDevice(null);
              setIsCrudModalOpen(true);
            }}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            + Tambah Device Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onSelect={(dev) => setControllingDevice(dev)}
              onEdit={(dev) => {
                setEditingDevice(dev);
                setIsCrudModalOpen(true);
              }}
              onDelete={(id) => {
                const device = devices.find((item) => item.id === id);
                if (device) setDeletingDevice(device);
              }}
            />
          ))}
        </div>
      )}

      {/* Modal Kontrol Perangkat (Muncul saat Card diklik) */}
      <DeviceControlModal
        device={controllingDevice}
        onClose={() => setControllingDevice(null)}
        onControl={handleControlDevice}
      />

      {/* Modal Tambah / Edit Metadata Perangkat */}
      <DeviceModal
        isOpen={isCrudModalOpen}
        onClose={() => setIsCrudModalOpen(false)}
        onSubmit={handleSaveDevice}
        initialData={editingDevice}
      />
      <ConfirmationModal
        isOpen={deletingDevice !== null}
        title="Hapus perangkat?"
        message={
          deletingDevice
            ? `Perangkat "${deletingDevice.name}" akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.`
            : ""
        }
        confirmLabel="Ya, hapus"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingDevice(null)}
      />
    </div>
  );
};
