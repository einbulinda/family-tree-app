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
  const { isAuthenticated, user, isLoading } = useAuth();
  logger.debug("ProtectedRoute rendered", {
    isAuthenticated,
    user: !!user,
    isLoading,
    requiredRole,
    userRole: user?.role,
  });

  //Show loading state while auth is being determined
  if (isLoading) {
    logger.debug("ProtectedRoute loading ...");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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

    logger.info("Access granted - user has required role", {
      userRole: user?.role,
      requiredRole,
    });
  }

  return <>{children}</>;
};

export default ProtectedRoute;
