import React, { useState, useEffect } from "react";
import type {
  Device,
  CreateDeviceRequest,
  UpdateDeviceRequest,
} from "../../type/device";
import {
  ALL_PRESET_TYPES,
  DEVICE_TYPE_GROUPS,
} from "../../helper/device_helper";
import { ConfirmationModal } from "../ConfirmationModal";
import { ErrorMessage } from "../HandleMessage";
import { getApiError } from "../../helper/error_handler";

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDeviceRequest | UpdateDeviceRequest) => Promise<void>;
  initialData?: Device | null;
}

export const DeviceModal: React.FC<DeviceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState("");
  const [deviceKey, setDeviceKey] = useState("");
  const [selectedType, setSelectedType] = useState("light");
  const [customType, setCustomType] = useState("");
  const [status, setStatus] = useState("online");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pendingPayload, setPendingPayload] = useState<
    CreateDeviceRequest | UpdateDeviceRequest | null
  >(null);

  useEffect(() => {
    if (!isOpen) return;
    setSubmitError("");
    setPendingPayload(null);

    if (initialData) {
      setName(initialData.name);
      setDeviceKey(initialData.device_key);
      const lowerType = initialData.type.toLowerCase();

      if (ALL_PRESET_TYPES.includes(lowerType)) {
        setSelectedType(lowerType);
        setCustomType("");
      } else {
        setSelectedType("custom");
        setCustomType(initialData.type);
      }

      setStatus(initialData.status);
      setIsPrivate(initialData.is_private);
    } else {
      setName("");
      setDeviceKey("");
      setSelectedType("light");
      setCustomType("");
      setStatus("online");
      setIsPrivate(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const finalType =
    selectedType === "custom" ? customType.trim().toLowerCase() : selectedType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalType) {
      setSubmitError("Tipe perangkat wajib dipilih.");
      return;
    }

    setSubmitError("");

    if (initialData) {
      setPendingPayload({
        id: initialData.id,
        name: name.trim(),
        type: finalType,
        status,
        is_private: isPrivate,
        owner_id: initialData.owner_id,
      });
    } else {
      setPendingPayload({
        name: name.trim(),
        device_key: deviceKey.trim(),
        type: finalType,
        is_private: isPrivate,
      });
    }
  };

  const handleConfirmSubmit = async () => {
    if (!pendingPayload) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit(pendingPayload);
      setPendingPayload(null);
      onClose();
    } catch (error) {
      setSubmitError(
        getApiError(
          error,
          initialData
            ? "Gagal memperbarui perangkat."
            : "Gagal menambah perangkat.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Header Modal */}
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">
              {initialData ? "Edit Perangkat IoT" : "Tambah Perangkat Baru"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {initialData
                ? "Perbarui nama, tipe, atau status koneksi perangkat"
                : "Daftarkan perangkat Zigbee atau Smart Home baru"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && <ErrorMessage message={submitError} />}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Nama Perangkat
            </label>
            <input
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Lampu Ruang Rapat"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {!initialData && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Device Key / Entity ID
              </label>
              <input
                type="text"
                required
                value={deviceKey}
                onChange={(e) => setDeviceKey(e.target.value)}
                placeholder="Contoh: light.lampu_rapat_01"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div
            className={`grid ${initialData ? "grid-cols-2" : "grid-cols-1"} gap-3`}
          >
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Tipe Perangkat
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {DEVICE_TYPE_GROUPS.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <optgroup label="Lainnya">
                  <option value="custom">+ Tipe Custom...</option>
                </optgroup>
              </select>
            </div>

            {initialData && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Status Koneksi
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            )}
          </div>

          {selectedType === "custom" && (
            <div>
              <label className="block text-xs font-medium text-amber-400 mb-1.5">
                Nama Tipe Custom
              </label>
              <input
                type="text"
                required
                minLength={2}
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Contoh: projector, dispenser, irrigation"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <label className="flex items-center gap-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <div>
              <p className="text-sm font-medium text-slate-200">
                Perangkat Private
              </p>
              <p className="text-[11px] text-slate-500">
                Hanya dapat diakses oleh pemilik dan Admin
              </p>
            </div>
          </label>

          {/* Footer Action */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 rounded-xl text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              {isSubmitting
                ? "Menyimpan..."
                : initialData
                  ? "Simpan Perubahan"
                  : "Tambah Perangkat"}
            </button>
          </div>
        </form>
      </div>
      <ConfirmationModal
        isOpen={pendingPayload !== null}
        title={
          initialData ? "Simpan perubahan perangkat?" : "Tambah perangkat baru?"
        }
        message={
          initialData
            ? "Perubahan metadata perangkat akan disimpan ke sistem."
            : "Perangkat baru akan ditambahkan ke sistem. Pastikan nama dan Device Key sudah benar."
        }
        confirmLabel="Ya, simpan"
        loading={isSubmitting}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setPendingPayload(null)}
      />
    </div>
  );
};

export default DeviceModal;
