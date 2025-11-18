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
    //Check if user is logged in on app start
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      //TODO: validate token with API call
      setToken(storedToken);
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log(
            "AUTHCONTEXT: Restored user from localStorage:",
            parsedUser
          ); // 👈 ADD THIS FOR DEBUGGING
        } catch (e) {
          console.error("Error parsing stored user:", e);
          localStorage.removeItem("user");
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
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
        console.log("Logged in user:", response.data.user); // 👈 ADD THIS FOR DEBUGGING
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (email: string, name: string, password: string) => {
    try {
      const response = await api.post<RegisterResponse>("/auth/register", {
        email,
        name,
        password,
      });

      if (response.data.message) return; // Just return successfully - don't log the user in automatically
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Add this effect to debug when user changes
  useEffect(() => {
    console.log("🔄 User state changed:", user);
  }, [user]);

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

  console.log("AuthContext value:", { user, token, isAuthenticated: !!token }); // 👈 ADD THIS FOR DEBUGGING
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
