import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminDashboard } from "./pages/AdminDashboard";
import RegisterPage from "./pages/RegisterPage";
import { UserManagementPage } from "./pages/UserMangamentPage";
import { UserDashboard } from "./pages/Dashboard";
import { SidebarLayout } from "./components/SidebarLayout";
import { DevicePage } from "./pages/DevicePage";
import { PinoPage } from "./pages/PinoPage";
import { LandingPage } from "./pages/LandingPage";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route element={<ProtectedRoute mode="guest" />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route element={<SidebarLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
              </Route>
            </Route>

            <Route
              element={
                <ProtectedRoute allowedRoles={["user", "karyawan", "admin"]} />
              }
            >
              <Route element={<SidebarLayout />}>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/device" element={<DevicePage />} />
                <Route path="/pino" element={<PinoPage />} />
              </Route>
            </Route>

            <Route
              path="/unauthorized"
              element={
                <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
                  <h1 className="text-xl font-bold text-red-400">
                    403 - Akses Ditolak
                  </h1>
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
