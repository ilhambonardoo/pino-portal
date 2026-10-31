import type React from "react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { type LoginResponse } from "../type/auth";
import { getApiError } from "../helper/error_handler";
import AuthInput from "../components/AuthInput";
import { ErrorMessage } from "../components/HandleMessage";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        username,
        password,
      });

      login(response.data);

      if (response.data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setErrorMsg(getApiError(err, "Terjadi kesalahan saat login."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Pino Portal</h1>
          <p className="text-slate-400 text-sm">
            Silahkan login telebih dahulu
          </p>
        </div>

        <ErrorMessage message={errorMsg} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthInput
            id="username"
            label="Username"
            type="text"
            onChange={setUsername}
            value={username}
            placeholder="Masukan username"
          />

          <AuthInput
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Masukkan password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-400">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-blue-400 hover:underline font-medium"
          >
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
