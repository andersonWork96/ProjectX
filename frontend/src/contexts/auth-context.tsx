"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { AuthResponse } from "@/lib/types";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  permission: number;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, type: string) => Promise<void>;
  logout: () => void;
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
    const authUser: AuthUser = { id: data.id, name: data.name, email: data.email, permission: data.permission };
    setToken(data.token);
    setUser(authUser);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(authUser));
  };

  const register = async (name: string, email: string, password: string, type: string) => {
    const data = await api.post<AuthResponse>("/auth/register", { name, email, password, type });
    const authUser: AuthUser = { id: data.id, name: data.name, email: data.email, permission: data.permission };
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

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
