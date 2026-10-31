import React, { useState, useEffect } from "react";
import { type User, type CreateUserPayload } from "../type/auth";
import { ConfirmationModal } from "./ConfirmationModal";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserPayload) => Promise<void>;
  initialData?: User | null;
  loading: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "karyawan" | "user">("user");
  const [pendingPayload, setPendingPayload] =
    useState<CreateUserPayload | null>(null);

  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username);
      setRole(initialData.role);
      setPassword("");
    } else {
      setUsername("");
      setPassword("");
      setRole("user");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingPayload({ username, password, role });
  };

  const handleConfirmSubmit = async () => {
    if (!pendingPayload) return;
    await onSubmit(pendingPayload);
    setPendingPayload(null);
  };

  const handleClose = () => {
    setPendingPayload(null);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">
          {initialData ? "Edit User" : "Tambah User Baru"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password{" "}
              {initialData && (
                <span className="text-xs text-slate-400">
                  (Biarkan kosong jika tidak ingin merubah)
                </span>
              )}
            </label>
            <input
              type="password"
              required={!initialData}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder={
                initialData ? "••••••••" : "Password (min 6 karakter)"
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="user">User</option>
              <option value="karyawan">Karyawan</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-700 cursor-pointer hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 cursor-pointer bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Simpan..." : "Simpan"}
            </button>
          </div>
        </form>
        </div>
      </div>
      <ConfirmationModal
        isOpen={pendingPayload !== null}
        title={initialData ? "Simpan perubahan user?" : "Tambah user baru?"}
        message={
          initialData
            ? "Perubahan data user akan disimpan. Pastikan informasi yang dimasukkan sudah benar."
            : "User baru akan ditambahkan ke sistem. Pastikan username, password, dan role sudah benar."
        }
        confirmLabel="Ya, simpan"
        loading={loading}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setPendingPayload(null)}
      />
    </>
  );
};
