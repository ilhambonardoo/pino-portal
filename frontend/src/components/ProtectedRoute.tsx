import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  mode?: "protected" | "guest";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  mode = "protected",
}) => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated && mode === "guest") {
    return (
      <Navigate to={role === "admin" ? "/admin/dashboard" : "/dashboard"} />
    );
  }

  if (mode === "protected" && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    mode === "protected" &&
    allowedRoles &&
    role &&
    !allowedRoles.includes(role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
