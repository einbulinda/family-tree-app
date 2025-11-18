import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logger } from "../utils/logger";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user } = useAuth();
  logger.debug("ProtectedRoute rendered", {
    isAuthenticated,
    user: !!user,
    requiredRole,
    userRole: user?.role,
  });

  if (!isAuthenticated) {
    logger.info("Redirecting to login - not authenticated");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    if (!user) {
      logger.warn("Redirecting to unauthorized - user is null", {
        requiredRole,
      });
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (user?.role !== requiredRole) {
    logger.warn("Redirecting to unauthorized - insufficient role", {
      userRole: user?.role,
      requiredRole,
    });
    return <Navigate to="/unauthorized" replace />;
  }

  logger.info("Access granted - user has required role", {
    userRole: user?.role,
    requiredRole,
  });

  return <>{children}</>;
};

export default ProtectedRoute;
