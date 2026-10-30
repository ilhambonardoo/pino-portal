import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import axios from "axios";
import type { ApiError } from "../type/auth";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await api.post<{ message: string }>("/auth/register", {
        username,
        password,
      });

      setSuccessMsg(
        response.data.message ||
          "Registrasi berhasil! Mengalihkan ke halaman login...",
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const apiError = err.response.data as ApiError;
        setErrorMsg(apiError.error || "Terjadi kesalahan saat registrasi.");
      } else {
        setErrorMsg("Gagal terhubung ke server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Pino Portal</h1>
          <p className="text-slate-400 text-sm">Buat Akun Baru</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="Minimal 3 karakter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:underline font-medium"
          >
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
