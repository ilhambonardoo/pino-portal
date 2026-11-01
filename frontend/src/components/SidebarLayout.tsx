import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  MdDashboard,
  MdDevices,
  MdLogout,
  MdPeople,
  MdSmartToy,
} from "react-icons/md";
import type { IconType } from "react-icons";
import { useAuth } from "../context/AuthContext";

type IconName = "dashboard" | "device" | "pino" | "users";

const userNavigation: { label: string; to: string; icon: IconName }[] = [
  { label: "Dashboard", to: "/dashboard", icon: "dashboard" },
  { label: "Device", to: "/device", icon: "device" },
  { label: "Pino", to: "/pino", icon: "pino" },
];

const adminNavigation: { label: string; to: string; icon: IconName }[] = [
  { label: "Dashboard", to: "/admin/dashboard", icon: "dashboard" },
  { label: "Device", to: "/device", icon: "device" },
  { label: "Pino", to: "/pino", icon: "pino" },
  { label: "Manajemen User", to: "/admin/users", icon: "users" },
];

const navigationIcons: Record<IconName, IconType> = {
  dashboard: MdDashboard,
  device: MdDevices,
  pino: MdSmartToy,
  users: MdPeople,
};

export const SidebarLayout: React.FC = () => {
  const { logout, role } = useAuth();
  const navigation = role === "admin" ? adminNavigation : userNavigation;

  return (
    <div className="min-h-screen bg-neutral-950 text-white md:flex">
      <aside className="flex w-full flex-col border-b border-neutral-800 bg-neutral-900 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold shadow-lg shadow-blue-900/30">
            P
          </div>
          <div>
            <p className="text-base font-bold tracking-wide">Pino Portal</p>
            <p className="text-xs capitalize text-neutral-400">
              {role ?? "User"}
            </p>
          </div>
        </div>

        <nav aria-label="Navigasi utama" className="flex-1 px-3 pb-3 md:pt-4">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
            Menu
          </p>
          <div className="flex gap-2 overflow-x-auto md:block md:space-y-2">
            {navigation.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `flex min-w-max items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`
                }
                key={item.to}
                to={item.to}
              >
                {React.createElement(navigationIcons[item.icon], {
                  "aria-hidden": true,
                  className: "h-5 w-5 shrink-0",
                })}
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-neutral-800 p-3">
          <button
            className="flex cursor-pointer w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            onClick={logout}
            type="button"
          >
            <MdLogout aria-hidden="true" className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
};
