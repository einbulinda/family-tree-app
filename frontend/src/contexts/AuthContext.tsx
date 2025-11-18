import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { LoginResponse, RegisterResponse, User } from "../types";
import api from "../services/api";
import { logger } from "../utils/logger";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>; // 👈 CHANGED: Return Promise<void> ::einbulinda 17/11/2025
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    logger.error("useAuth must be used within an AuthProvider");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    logger.info("AuthProvider initialized");

    //Check if user is logged in on app start
    const storedToken = localStorage.getItem("token");
    logger.debug("Checking for stored token", { hasToken: !!storedToken });

    if (storedToken) {
      //TODO: validate token with API call
      setToken(storedToken);
      const storedUser = localStorage.getItem("user");
      logger.debug("Checking for stored user", { hasUser: !!storedUser });

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          logger.info("User restored from localStorage", {
            userId: parsedUser.id,
            role: parsedUser.role,
            name: parsedUser.name,
          });
        } catch (e) {
          logger.error("Error parsing stored user:", { error: e });
          localStorage.removeItem("user");
        }
      }
    }
    setIsLoading(false);
    logger.info("AuthProvider initialization complete", {
      user: !!user,
      token: !!token,
      isAuthenticated: !!token,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    logger.info("Login attempt", { email });
    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      if (response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        logger.info("Login successful", {
          userId: response.data.user.id,
          role: response.data.user.role,
          name: response.data.user.name,
        });
      } else {
        logger.error("Login failed - no response data");
        throw new Error("Login failed");
      }
    } catch (error) {
      logger.error("Login error", { error, email });
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (email: string, name: string, password: string) => {
    logger.info("Registration attempt", { email, name });
    try {
      const response = await api.post<RegisterResponse>("/auth/register", {
        email,
        name,
        password,
      });

      if (response.data.message) {
        logger.info("Registration successful", {
          email,
          name,
          message: response.data.message,
        });
        return;
      } // Just return successfully - don't log the user in automatically
    } catch (error) {
      logger.error("Registration error", { error, email, name });
      throw error;
    }
  };

  const logout = () => {
    logger.info("Logout initiated", { userId: user?.id, userName: user?.name });
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    logger.info("User logged out successfully");
  };

  // Log User state changes
  useEffect(() => {
    logger.debug("User state changed", {
      user,
      userId: user?.id,
      userRole: user?.role,
      userName: user?.name,
    });
  }, [user]);

  // Log token state changes
  useEffect(() => {
    logger.debug("Token state changed", {
      hasToken: !!token,
      isAuthenticated: !!token,
    });
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      isLoading,
      isAuthenticated: !!token,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, token, isLoading]
  );

  logger.debug("AuthContext value updated", {
    hasUser: !!user,
    hasToken: !!token,
    isAuthenticated: !!token,
    userRole: user?.role,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
