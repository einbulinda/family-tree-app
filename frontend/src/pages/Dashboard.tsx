import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { logger } from "../utils/logger";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  logger.debug("Dashboard rendered", {
    hasUser: !!user,
    userId: user?.id,
    userRole: user?.role,
    userName: user?.name,
  });

  const handleLogout = () => {
    logger.info("Logout initiated from dashboard");
    logout();
    navigate("/login");
  };

  const handleAdminClick = () => {
    logger.info("Admin panel clicked", { userRole: user?.role });
    navigate("/admin");
  };

  const handleCreateProfile = () => {
    logger.info("Create profile clicked");
    navigate("/create-profile");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Family Tree
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              {user?.role === "admin" && (
                <button
                  onClick={handleAdminClick}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Admin Panel
                </button>
              )}
              <button
                onClick={handleCreateProfile}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Create Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Your Family Tree
              </h2>
              <p className="text-gray-600 mb-4">
                Your dashboard is under construction
              </p>
              <div className="space-x-4">
                <button
                  onClick={handleCreateProfile}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Create New Profile
                </button>
                {user?.role === "admin" && (
                  <button
                    onClick={handleAdminClick}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                  >
                    Admin Panel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
