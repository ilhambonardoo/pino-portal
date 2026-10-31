import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { getApiError } from "../helper/error_handler";
import AuthInput from "../components/AuthInput";
import { ErrorMessage, SuccessMessage } from "../components/HandleMessage";

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
      setErrorMsg(getApiError(err, "Terjadi kesalahan saat registrasi."));
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

        <ErrorMessage message={errorMsg} />
        <SuccessMessage message={successMsg} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthInput
            id="username"
            label="Username"
            type="text"
            onChange={setUsername}
            value={username}
            placeholder="Minimal 3 karakter"
          />

          <AuthInput
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Minimal 6 karakter"
          />

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
