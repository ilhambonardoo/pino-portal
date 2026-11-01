import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    title: "Dashboard Terpusat",
    description: "Pantau kondisi sistem dan aktivitas robot dari satu tempat.",
  },
  {
    title: "Manajemen Device",
    description: "Kelola perangkat yang terhubung dengan cepat dan praktis.",
  },
  {
    title: "Kontrol Pino",
    description: "Akses kontrol robot Pino dengan antarmuka yang sederhana.",
  },
];

export const LandingPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    return (
      <Navigate
        replace
        to={role === "admin" ? "/admin/dashboard" : "/dashboard"}
      />
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-neutral-950 text-white">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link className="flex items-center gap-3" to="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold shadow-lg shadow-blue-900/30">
            P
          </span>
          <span className="text-lg font-bold tracking-wide">Pino Portal</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:text-white"
            to="/login"
          >
            Login
          </Link>
          <Link
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            to="/register"
          >
            Register
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -right-32 top-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Smart robot platform
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
                Kelola dan kendalikan{" "}
                <span className="text-blue-400">Pino</span> dengan lebih mudah.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-neutral-400 sm:text-lg">
                Pino Portal membantu Anda memantau device, mengelola sistem, dan
                mengontrol robot dalam satu dashboard yang terintegrasi.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition-all hover:-translate-y-0.5 hover:bg-blue-500"
                  to="/login"
                >
                  Mulai Sekarang
                </Link>
                <Link
                  className="rounded-xl border border-neutral-700 bg-neutral-900/60 px-6 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:border-neutral-500 hover:bg-neutral-800"
                  to="/register"
                >
                  Buat Akun
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-4 rounded-[2rem] bg-blue-500/10 blur-2xl" />
              <div className="relative rounded-3xl border border-neutral-700 bg-neutral-900 p-5 shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
                  <div>
                    <p className="text-sm font-semibold">Pino Control Center</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Overview sistem
                    </p>
                  </div>
                  <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    Online
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-neutral-800 p-4">
                    <p className="text-xs text-neutral-500">Devices</p>
                    <p className="mt-2 text-2xl font-bold">12</p>
                    <p className="mt-1 text-xs text-emerald-400">+8.2%</p>
                  </div>
                  <div className="rounded-2xl bg-neutral-800 p-4">
                    <p className="text-xs text-neutral-500">Pino status</p>
                    <p className="mt-2 text-2xl font-bold text-blue-400">
                      Ready
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Last sync 2m ago
                    </p>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-5">
                  <p className="text-sm font-medium text-blue-100">
                    Quick control
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold">Pino Bot</span>
                    <span className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold">
                      Standby
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-800/80 bg-neutral-900/40">
          <div className="mx-auto grid max-w-7xl gap-4 px-6 py-14 md:grid-cols-3 lg:px-8">
            {features.map((feature) => (
              <div
                className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6"
                key={feature.title}
              >
                <div className="mb-5 h-2 w-12 rounded-full bg-blue-500" />
                <h2 className="text-base font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
