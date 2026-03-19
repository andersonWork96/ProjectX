"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { AuthResponse } from "@/lib/types";

interface AuthUser {
  id: number;
  name: string;
  username: string;
  email: string;
  isCreator: boolean;
  permission: number;
  platformPlan: string;
  isAdmin: boolean;
  hasLocation: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string, isCreator: boolean) => Promise<void>;
  logout: () => void;
  updateUserField: (field: string, value: unknown) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<AuthResponse>("/auth/login", { email, password });
    const authUser: AuthUser = {
      id: data.id, name: data.name, username: data.username, email: data.email,
      isCreator: data.isCreator, permission: data.permission,
      platformPlan: data.platformPlan, isAdmin: data.permission === 1,
      hasLocation: data.hasLocation
    };
    setToken(data.token);
    setUser(authUser);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(authUser));
  };

  const register = async (name: string, username: string, email: string, password: string, isCreator: boolean) => {
    const data = await api.post<AuthResponse>("/auth/register", { name, username, email, password, isCreator });
    const authUser: AuthUser = {
      id: data.id, name: data.name, username: data.username, email: data.email,
      isCreator: data.isCreator, permission: data.permission,
      platformPlan: data.platformPlan, isAdmin: data.permission === 1,
      hasLocation: data.hasLocation
    };
    setToken(data.token);
    setUser(authUser);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(authUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUserField = (field: string, value: unknown) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserField }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
