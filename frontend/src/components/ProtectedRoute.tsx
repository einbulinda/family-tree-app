import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user } = useAuth();
  console.log(
    "ProtectedRoute - isAuthenticated:",
    isAuthenticated,
    "user:",
    user
  ); // 👈 ADD THIS FOR DEBUGGING

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    if (!user) {
      console.log("User is null or undefined"); // 👈 ADD THIS FOR DEBUGGING
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (user?.role !== requiredRole) {
    console.log("User role:", user?.role, "Required role:", requiredRole); // 👈 ADD THIS FOR DEBUGGING
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
