import React, { useEffect, useState } from "react";
import { userService } from "../services/userService";
import { UserModal } from "../components/UserModal";
import { ConfirmationModal } from "../components/ConfirmationModal";
import axios from "axios";
import type { CreateUserPayload, User } from "../type/auth";

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data || []);
    } catch (err: any) {
      setErrorMsg("Gagal mengambil data user.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (payload: CreateUserPayload) => {
    try {
      setLoading(true);
      if (editingUser) {
        await userService.update(editingUser.id, payload);
      } else {
        await userService.create(payload);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error
        : "Gagal menyimpan user.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    try {
      setDeleteLoading(true);
      await userService.delete(deletingUser.id);
      setDeletingUser(null);
      fetchUsers();
    } catch (err: any) {
      alert("Gagal menghapus user.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Manajemen User</h1>
            <p className="text-slate-400 text-sm">
              Kelola hak akses dan akun sistem Pino Portal
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 cursor-pointer bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
          >
            + Tambah User
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {/* User Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4">ID</th>
                <th className="p-4">Username</th>
                <th className="p-4">Role</th>
                <th className="p-4">Tanggal Dibuat</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-sm">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400">
                    Belum ada data user.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="p-4 font-mono text-slate-400">#{u.id}</td>
                    <td className="p-4 font-medium text-white">{u.username}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : u.role === "karyawan"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="px-3 py-1 bg-amber-600/20 cursor-pointer hover:bg-amber-600/40 text-amber-400 border border-amber-500/30 rounded text-xs transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingUser(u)}
                        className="px-3 py-1 bg-red-600/20 cursor-pointer hover:bg-red-600/40 text-red-400 border border-red-500/30 rounded text-xs transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Reusable */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        initialData={editingUser}
        loading={loading}
      />
      <ConfirmationModal
        isOpen={deletingUser !== null}
        title="Hapus user?"
        message={
          deletingUser
            ? `User "${deletingUser.username}" akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.`
            : ""
        }
        confirmLabel="Ya, hapus"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingUser(null)}
      />
    </div>
  );
};
