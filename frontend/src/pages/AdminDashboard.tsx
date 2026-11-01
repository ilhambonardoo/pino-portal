import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const AdminDashboard: React.FC = () => {
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { role } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get<{ message: string }>("/admin/dashboard");
        setMessage(response.data.message);
      } catch (err: any) {
        setErrorMsg("Gagal memuat data admin atau akses ditolak.");
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen  text-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-neutral-200 pb-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-neutral-400 text-sm">
              Role Anda:{" "}
              <span className="font-semibold text-blue-400">{role}</span>
            </p>
          </div>
        </div>

        {errorMsg ? (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {errorMsg}
          </div>
        ) : (
          <div className="p-6 bg-neutral-500 border border-neutral-700 rounded-xl">
            <h2 className="text-lg font-semibold mb-2">
              Respon Server Backend:
            </h2>
            <p className="text-green-400 font-mono">{message || "Memuat..."}</p>
          </div>
        )}
      </div>
    </div>
  );
};
