"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";
import { apiClient } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        // Only verify token if one exists
        const token = localStorage.getItem("auth_token");
        if (!token) {
          // No token, user is anonymous
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await apiClient.verifyToken();
        setUser(response.user);
      } catch (error) {
        // Token is invalid or expired - silently clear it
        console.log("Token verification failed, clearing auth state");
        apiClient.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await apiClient.register(name, email, password);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
